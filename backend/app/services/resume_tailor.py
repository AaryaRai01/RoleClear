from __future__ import annotations

from copy import deepcopy
import os
from typing import TYPE_CHECKING
from uuid import uuid4

from app.schemas.resume import ParsedResumeV2
from app.schemas.smart_apply import ExtractedJob
from app.schemas.tailoring import (
    ClaimValidationResult,
    TailorResumeResponse,
    TailoringChange,
    TailoringEvidence,
)
from app.services.job_normalizer import normalize_job
if TYPE_CHECKING:
    from app.services.ml_evidence_ranker import RankedEvidence


ENABLE_SEMANTIC_RANKER = (
    os.getenv("ENABLE_SEMANTIC_RANKER", "true").lower()
    == "true"
)


def _clean(value: str | None) -> str:
    if not value:
        return ""
    return " ".join(str(value).split()).strip()


def _norm(value: str | None) -> str:
    return _clean(value).lower()


def _dedupe(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        clean = _clean(value)
        if not clean:
            continue
        key = clean.lower()
        if key in seen:
            continue
        seen.add(key)
        result.append(clean)
    return result


def _requirements(job: ExtractedJob) -> list[str]:
    canonical = normalize_job(job)
    ordered = sorted(
        canonical.requirements,
        key=lambda item: 0 if item.level == "required" else 1 if item.level == "preferred" else 2,
    )
    return _dedupe([item.name for item in ordered])


def _rank(job: ExtractedJob, resume: ParsedResumeV2):
    requirements = _requirements(job)
    if not requirements:
        return [], {}

    if not ENABLE_SEMANTIC_RANKER:
        return requirements, {}

    from app.services.ml_evidence_ranker import (
        rank_resume_for_requirements,
    )

    ranked = rank_resume_for_requirements(
        requirements,
        resume,
        top_k=8,
        minimum_similarity=0.20,
    )
    return requirements, ranked


def _best_source_scores(
    ranked: dict[str, list[RankedEvidence]],
    prefixes: tuple[str, ...],
) -> dict[int, float]:
    scores: dict[int, float] = {}
    for matches in ranked.values():
        for match in matches:
            if match.source_index is None:
                continue
            section = _norm(match.section)
            if not any(section.startswith(prefix) for prefix in prefixes):
                continue
            scores[match.source_index] = max(
                scores.get(match.source_index, 0.0),
                float(match.similarity),
            )
    return scores


def _exact_evidence_score(
    text: str,
    ranked: dict[str, list[RankedEvidence]],
    prefixes: tuple[str, ...],
    source_index: int,
) -> float:
    target = _norm(text)
    best = 0.0
    if not target:
        return best

    for matches in ranked.values():
        for match in matches:
            if match.source_index != source_index:
                continue
            if not any(_norm(match.section).startswith(prefix) for prefix in prefixes):
                continue
            if _norm(match.evidence) == target:
                best = max(best, float(match.similarity))
    return best


def _tailor_skills(resume: ParsedResumeV2, ranked):
    skills = deepcopy(resume.skills)
    scores: dict[str, float] = {}

    for matches in ranked.values():
        for match in matches:
            if _norm(match.section) != "skills":
                continue
            key = _norm(match.evidence)
            if key:
                scores[key] = max(scores.get(key, 0.0), float(match.similarity))

    changed = False
    for field_name in skills.__class__.model_fields:
        values = list(getattr(skills, field_name, []) or [])
        if not values:
            continue
        before = [getattr(item, "name", "") for item in values]
        values.sort(
            key=lambda item: scores.get(_norm(getattr(item, "name", "")), 0.0),
            reverse=True,
        )
        setattr(skills, field_name, values)
        after = [getattr(item, "name", "") for item in values]
        changed = changed or before != after

    changes = []
    if changed:
        changes.append(TailoringChange(
            section="skills",
            action="reordered_skills",
            detail="Existing skills were reordered inside their original categories by JD relevance. No skill was added.",
        ))
    return skills, changes


def _tailor_experience(
    resume: ParsedResumeV2,
    ranked,
    max_bullets: int,
):
    source_scores = _best_source_scores(ranked, ("experience",))
    indexed = list(enumerate(resume.experience))
    indexed.sort(
        key=lambda pair: (
            source_scores.get(pair[0], 0.0),
            1 if pair[1].is_current else 0,
            -pair[0],
        ),
        reverse=True,
    )

    tailored = []
    changes = []

    for source_index, source_item in indexed:
        item = deepcopy(source_item)
        original = list(item.bullets)
        scored = [
            (
                bullet,
                _exact_evidence_score(
                    bullet,
                    ranked,
                    ("experience",),
                    source_index,
                ),
                i,
            )
            for i, bullet in enumerate(original)
        ]
        scored.sort(key=lambda row: (row[1], -row[2]), reverse=True)

        if scored:
            item.bullets = [row[0] for row in scored[:max_bullets]]

        tailored.append(item)

        if original and item.bullets != original:
            changes.append(TailoringChange(
                section="experience",
                action="reordered_or_trimmed_bullets",
                detail=f"{_clean(item.title) or 'Experience'}: kept {len(item.bullets)} of {len(original)} existing bullets.",
            ))

    if [index for index, _ in indexed] != list(range(len(resume.experience))):
        changes.append(TailoringChange(
            section="experience",
            action="reordered_entries",
            detail="Experience entries were reordered by JD relevance. No factual content was rewritten.",
        ))

    return tailored, changes


def _tailor_projects(
    resume: ParsedResumeV2,
    ranked,
    max_projects: int,
    max_bullets: int,
):
    if max_projects == 0:
        return [], [TailoringChange(
            section="projects",
            action="hidden_by_request",
            detail="Project count was set to zero by the caller.",
        )]

    source_scores = _best_source_scores(ranked, ("project",))
    indexed = list(enumerate(resume.projects))
    indexed.sort(
        key=lambda pair: (
            source_scores.get(pair[0], 0.0),
            -pair[0],
        ),
        reverse=True,
    )
    selected = indexed[:max_projects]

    tailored = []
    changes = []

    for source_index, source_item in selected:
        item = deepcopy(source_item)
        original = list(item.bullets)
        scored = [
            (
                bullet,
                _exact_evidence_score(
                    bullet,
                    ranked,
                    ("project",),
                    source_index,
                ),
                i,
            )
            for i, bullet in enumerate(original)
        ]
        scored.sort(key=lambda row: (row[1], -row[2]), reverse=True)

        if scored:
            item.bullets = [row[0] for row in scored[:max_bullets]]

        tailored.append(item)

        if original and item.bullets != original:
            changes.append(TailoringChange(
                section="projects",
                action="reordered_or_trimmed_bullets",
                detail=f"{_clean(item.name) or 'Project'}: kept {len(item.bullets)} of {len(original)} existing bullets.",
            ))

    if [index for index, _ in selected] != list(range(min(max_projects, len(resume.projects)))):
        changes.append(TailoringChange(
            section="projects",
            action="reordered_or_selected_projects",
            detail=f"Selected up to {max_projects} projects by JD relevance. Project content was not rewritten.",
        ))

    return tailored, changes


def _selected_evidence(requirements, ranked):
    result = []
    for requirement in requirements:
        for match in ranked.get(requirement, [])[:3]:
            result.append(TailoringEvidence(
                requirement=requirement,
                section=match.section,
                source_index=match.source_index,
                evidence=match.evidence,
                similarity=float(match.similarity),
            ))
    return result


def _validate(source: ParsedResumeV2, tailored: ParsedResumeV2) -> ClaimValidationResult:
    unsupported: list[str] = []
    checked = 0

    source_exp_headers = {
        (_norm(x.company), _norm(x.title), _norm(x.start_date), _norm(x.end_date))
        for x in source.experience
    }
    source_exp_bullets = {_norm(b) for x in source.experience for b in x.bullets if _norm(b)}
    source_exp_tech = {_norm(t) for x in source.experience for t in x.technologies if _norm(t)}

    for x in tailored.experience:
        checked += 1
        if (_norm(x.company), _norm(x.title), _norm(x.start_date), _norm(x.end_date)) not in source_exp_headers:
            unsupported.append(f"Unsupported experience entry: {_clean(x.title)} @ {_clean(x.company)}")
        for b in x.bullets:
            checked += 1
            if _norm(b) not in source_exp_bullets:
                unsupported.append(f"Unsupported experience claim: {b}")
        for t in x.technologies:
            checked += 1
            if _norm(t) not in source_exp_tech:
                unsupported.append(f"Unsupported experience technology: {t}")

    source_project_names = {_norm(x.name) for x in source.projects if _norm(x.name)}
    source_project_desc = {_norm(x.description) for x in source.projects if _norm(x.description)}
    source_project_bullets = {_norm(b) for x in source.projects for b in x.bullets if _norm(b)}
    source_project_tech = {_norm(t) for x in source.projects for t in x.technologies if _norm(t)}

    for x in tailored.projects:
        if x.name:
            checked += 1
            if _norm(x.name) not in source_project_names:
                unsupported.append(f"Unsupported project: {x.name}")
        if x.description:
            checked += 1
            if _norm(x.description) not in source_project_desc:
                unsupported.append(f"Unsupported project description: {x.description}")
        for b in x.bullets:
            checked += 1
            if _norm(b) not in source_project_bullets:
                unsupported.append(f"Unsupported project claim: {b}")
        for t in x.technologies:
            checked += 1
            if _norm(t) not in source_project_tech:
                unsupported.append(f"Unsupported project technology: {t}")

    source_skills = {
        _norm(item.name)
        for field_name in source.skills.__class__.model_fields
        for item in (getattr(source.skills, field_name, []) or [])
        if _norm(getattr(item, "name", ""))
    }

    for field_name in tailored.skills.__class__.model_fields:
        for item in (getattr(tailored.skills, field_name, []) or []):
            name = _norm(getattr(item, "name", ""))
            if not name:
                continue
            checked += 1
            if name not in source_skills:
                unsupported.append(f"Unsupported skill: {getattr(item, 'name', '')}")

    return ClaimValidationResult(
        passed=not unsupported,
        checked_claims=checked,
        unsupported_claims=unsupported,
    )


def tailor_resume_for_job(
    *,
    job: ExtractedJob,
    resume: ParsedResumeV2,
    max_experience_bullets: int = 4,
    max_project_bullets: int = 3,
    max_projects: int = 3,
) -> TailorResumeResponse:
    requirements, ranked = _rank(job, resume)

    tailored = deepcopy(resume)
    changes = []

    tailored.skills, skill_changes = _tailor_skills(resume, ranked)
    changes.extend(skill_changes)

    tailored.experience, exp_changes = _tailor_experience(
        resume,
        ranked,
        max_bullets=max_experience_bullets,
    )
    changes.extend(exp_changes)

    tailored.projects, project_changes = _tailor_projects(
        resume,
        ranked,
        max_projects=max_projects,
        max_bullets=max_project_bullets,
    )
    changes.extend(project_changes)

    validation = _validate(resume, tailored)

    if not validation.passed:
        raise ValueError(
            "Tailored resume failed claim validation: "
            + " | ".join(validation.unsupported_claims[:5])
        )

    return TailorResumeResponse(
        version_id=str(uuid4()),
        job_title=job.title,
        company=job.company,
        tailored_resume=tailored,
        selected_evidence=_selected_evidence(requirements, ranked),
        changes=changes,
        claim_validation=validation,
    )
