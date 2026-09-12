from __future__ import annotations

import re

from app.schemas.relevance import (
    ExperienceRelevance,
    JobRelevanceProfile,
    ProjectRelevance,
    ResumeRelevanceBreakdown,
    ResumeRelevanceResult,
    SkillMatchEvidence,
)
from app.schemas.resume import (
    CategorizedSkills,
    ParsedResumeV2,
    SkillItem,
)


PROVENANCE_MULTIPLIER = {
    "explicit": 1.00,
    "demonstrated": 0.95,
    "mentioned": 0.55,
    "unknown": 0.35,
}


GENERIC_STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for",
    "from", "in", "into", "is", "it", "of", "on", "or", "our",
    "that", "the", "their", "this", "to", "using", "with", "will",
    "you", "your", "we", "they", "work", "working", "role", "job",
    "team", "teams", "candidate", "required", "preferred", "minimum",
    "qualification", "qualifications", "responsibilities",
    "responsibility", "experience", "years", "year", "ability",
    "knowledge", "proficiency", "strong", "excellent",
}


CANONICAL_ALIASES: dict[str, set[str]] = {
    "aws": {"aws", "amazon web services"},
    "gcp": {"gcp", "google cloud", "google cloud platform"},
    "postgresql": {"postgresql", "postgres"},
    "node.js": {"node.js", "nodejs", "node js"},
    "next.js": {"next.js", "nextjs", "next js"},
    "javascript": {"javascript", "js"},
    "typescript": {"typescript", "ts"},
    "machine learning": {"machine learning", "ml"},
    "artificial intelligence": {"artificial intelligence", "ai"},
    "generative ai": {"generative ai", "genai", "gen ai"},
    "ai agents": {"ai agents", "agentic ai", "agents", "agent platform"},
    "customer relationship management": {"crm", "customer relationship management"},
    "search engine optimization": {"seo", "search engine optimization"},
    "google analytics": {"google analytics", "ga4"},
    "financial planning & analysis": {
        "fp&a",
        "fpa",
        "financial planning and analysis",
        "financial planning & analysis",
    },
}


CONCEPT_EVIDENCE: dict[str, set[str]] = {
    "software development": {
        "software development", "software engineering", "software engineer",
        "backend", "frontend", "full-stack", "api", "application development",
    },
    "platform development": {
        "platform development", "platform engineering",
        "developer platform", "apis", "sdk", "integrations",
    },
    "artificial intelligence": {
        "artificial intelligence", "ai", "machine learning", "ml",
        "generative ai", "computer vision", "nlp", "llm", "gemini",
    },
    "machine learning": {
        "machine learning", "ml", "predictive modeling",
        "classification", "regression", "deep learning",
    },
    "ai agents": {
        "ai agents", "agentic ai", "agents", "agent platform",
        "generative ai agents",
    },
    "data structures & algorithms": {
        "data structures", "algorithms", "dsa",
    },
    "distributed systems": {
        "distributed systems", "distributed computing",
        "serverless", "event-driven",
    },
    "financial analysis": {
        "financial analysis", "financial modeling", "variance analysis",
        "forecasting", "budgeting", "financial reporting",
    },
    "marketing analytics": {
        "marketing analytics", "campaign analytics", "google analytics",
        "conversion", "attribution", "roi", "performance marketing",
    },
    "project management": {
        "project management", "project planning", "stakeholder management",
        "risk management", "delivery management",
    },
    "customer service": {
        "customer service", "customer support", "client service",
        "customer satisfaction", "issue resolution",
    },
}


def _normalize(value: str) -> str:
    value = value.lower().strip()
    value = value.replace("–", "-").replace("—", "-")
    value = re.sub(r"\s+", " ", value)

    for canonical, aliases in CANONICAL_ALIASES.items():
        normalized_aliases = {
            re.sub(r"\s+", " ", alias.lower()).strip()
            for alias in aliases
        }

        if value == canonical or value in normalized_aliases:
            return canonical

    return value


def _tokens(text: str) -> set[str]:
    values = re.findall(
        r"[a-zA-Z][a-zA-Z0-9+#.&/-]{1,}",
        _normalize(text),
    )

    return {
        token
        for token in values
        if token not in GENERIC_STOPWORDS
        and len(token) > 2
    }


def _phrase_in_text(
    phrase: str,
    text: str,
) -> bool:
    phrase = _normalize(phrase)
    text = _normalize(text)

    if not phrase:
        return False

    if len(phrase) == 1:
        return bool(
            re.search(
                rf"(?<![a-zA-Z0-9+#.])"
                rf"{re.escape(phrase)}"
                rf"(?![a-zA-Z0-9+#.])",
                text,
                flags=re.IGNORECASE,
            )
        )

    if re.fullmatch(
        r"[a-z0-9+#./&]{2,6}",
        phrase,
    ):
        return bool(
            re.search(
                rf"(?<![a-z0-9])"
                rf"{re.escape(phrase)}"
                rf"(?![a-z0-9])",
                text,
                flags=re.IGNORECASE,
            )
        )

    return phrase in text


def _skill_items(
    skills: CategorizedSkills,
) -> list[SkillItem]:
    result: list[SkillItem] = []

    for field_name in CategorizedSkills.model_fields:
        result.extend(
            getattr(skills, field_name)
        )

    return result


def _skill_aliases(
    skill: SkillItem,
) -> set[str]:
    values = {
        _normalize(value)
        for value in [
            skill.name,
            skill.normalized_name or "",
            *skill.aliases_found,
        ]
        if value
    }

    expanded = set(values)

    for value in list(values):
        expanded.update(
            _normalize(alias)
            for alias in CANONICAL_ALIASES.get(
                value,
                set(),
            )
        )

    return expanded


def _resume_skill_index(
    resume: ParsedResumeV2,
) -> dict[str, SkillItem]:
    index: dict[str, SkillItem] = {}

    for item in _skill_items(resume.skills):
        for alias in _skill_aliases(item):
            existing = index.get(alias)

            if existing is None:
                index[alias] = item
                continue

            old_score = PROVENANCE_MULTIPLIER.get(
                existing.provenance,
                0.35,
            )
            new_score = PROVENANCE_MULTIPLIER.get(
                item.provenance,
                0.35,
            )

            if new_score > old_score:
                index[alias] = item

    return index


def _resume_evidence_text(
    resume: ParsedResumeV2,
) -> str:
    parts: list[str] = []

    if getattr(resume, "summary", None):
        parts.append(resume.summary)

    for item in _skill_items(resume.skills):
        parts.extend([
            item.name,
            item.normalized_name or "",
            *item.aliases_found,
            *item.evidence,
        ])

    for experience in resume.experience:
        parts.extend([
            experience.title or "",
            experience.company or "",
            *experience.bullets,
            *experience.technologies,
        ])

    for project in resume.projects:
        parts.extend([
            project.name or "",
            project.subtitle or "",
            project.description or "",
            *project.bullets,
            *project.technologies,
        ])

    return " ".join(
        part
        for part in parts
        if part
    )


def _find_resume_skill(
    requirement: str,
    index: dict[str, SkillItem],
) -> SkillItem | None:
    target = _normalize(requirement)

    if target in index:
        return index[target]

    target_aliases = {
        target,
        *(
            _normalize(alias)
            for alias in CANONICAL_ALIASES.get(
                target,
                set(),
            )
        ),
    }

    for alias in target_aliases:
        if alias in index:
            return index[alias]

    return None


def _generic_text_similarity(
    requirement: str,
    evidence_text: str,
) -> float:
    """
    Lightweight sector-independent semantic proxy.

    It intentionally does not pretend to be an embedding model.
    It rewards phrase containment and meaningful token overlap.
    """
    requirement = _normalize(requirement)
    evidence_text = _normalize(evidence_text)

    if not requirement:
        return 0.0

    if _phrase_in_text(
        requirement,
        evidence_text,
    ):
        return 0.90

    aliases = CANONICAL_ALIASES.get(
        requirement,
        set(),
    )

    if any(
        _phrase_in_text(
            alias,
            evidence_text,
        )
        for alias in aliases
    ):
        return 0.90

    concept_terms = CONCEPT_EVIDENCE.get(
        requirement,
        set(),
    )

    hits = [
        term
        for term in concept_terms
        if _phrase_in_text(
            term,
            evidence_text,
        )
    ]

    if len(hits) >= 3:
        return 0.88

    if len(hits) == 2:
        return 0.80

    if len(hits) == 1:
        return 0.68

    req_tokens = _tokens(requirement)
    evidence_tokens = _tokens(evidence_text)

    if not req_tokens:
        return 0.0

    overlap = len(
        req_tokens
        & evidence_tokens
    ) / len(req_tokens)

    if (
        len(req_tokens) >= 2
        and overlap >= 0.75
    ):
        return 0.72

    if (
        len(req_tokens) >= 2
        and overlap >= 0.50
    ):
        return 0.55

    return 0.0


def _dedupe(
    values: list[str],
) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()

    for value in values:
        clean = value.strip()
        if not clean:
            continue

        key = _normalize(clean)

        if key in seen:
            continue

        seen.add(key)
        result.append(clean)

    return result


def _score_skills(
    resume: ParsedResumeV2,
    job: JobRelevanceProfile,
) -> tuple[
    float,
    list[SkillMatchEvidence],
    list[str],
    list[str],
    list[str],
]:
    index = _resume_skill_index(resume)
    resume_text = _resume_evidence_text(resume)

    required = _dedupe(job.required_skills)
    preferred = _dedupe(job.preferred_skills)

    requirements = [
        (skill, "required", 2.0)
        for skill in required
    ] + [
        (skill, "preferred", 1.0)
        for skill in preferred
    ]

    if not requirements:
        return 0.0, [], [], [], []

    possible = sum(
        weight
        for _, _, weight
        in requirements
    )
    earned = 0.0

    rows: list[SkillMatchEvidence] = []
    matched_required: list[str] = []
    missing_required: list[str] = []
    matched_preferred: list[str] = []

    for skill_name, level, weight in requirements:
        item = _find_resume_skill(
            skill_name,
            index,
        )

        if item is not None:
            contribution = PROVENANCE_MULTIPLIER.get(
                item.provenance,
                0.35,
            )

            if item.explicit and item.demonstrated:
                contribution = 1.0

            provenance = item.provenance
            sources = list(item.sources)
            evidence = list(item.evidence)

        else:
            contribution = _generic_text_similarity(
                skill_name,
                resume_text,
            )

            provenance = (
                "demonstrated"
                if contribution >= 0.68
                else (
                    "mentioned"
                    if contribution >= 0.50
                    else "missing"
                )
            )

            sources = (
                ["resume_evidence"]
                if contribution > 0
                else []
            )

            evidence = (
                [
                    (
                        "Requirement supported by resume "
                        "experience/project/skills evidence."
                    )
                ]
                if contribution > 0
                else []
            )

        matched = contribution >= 0.50

        if not matched:
            contribution = 0.0

        earned += weight * contribution

        rows.append(
            SkillMatchEvidence(
                skill=skill_name,
                requirement_level=level,
                matched=matched,
                resume_provenance=provenance,
                sources=sources,
                evidence=evidence,
                contribution=round(
                    contribution,
                    3,
                ),
            )
        )

        if level == "required":
            if matched:
                matched_required.append(skill_name)
            else:
                missing_required.append(skill_name)
        elif matched:
            matched_preferred.append(skill_name)

    return (
        round(
            100.0 * earned / possible,
            2,
        ),
        rows,
        matched_required,
        missing_required,
        matched_preferred,
    )


def _term_overlap(
    candidate_text: str,
    job_text: str,
) -> tuple[float, list[str]]:
    candidate_tokens = _tokens(candidate_text)
    job_tokens = _tokens(job_text)

    if not candidate_tokens or not job_tokens:
        return 0.0, []

    matches = sorted(
        candidate_tokens
        & job_tokens
    )

    denominator = min(
        max(len(job_tokens), 1),
        50,
    )

    score = min(
        1.0,
        len(matches)
        / max(
            denominator * 0.25,
            1.0,
        ),
    )

    return score, matches[:15]


def _requirement_coverage(
    candidate_text: str,
    requirements: list[str],
) -> tuple[float, list[str]]:
    if not requirements:
        return 0.0, []

    matched: list[str] = []

    for requirement in requirements:
        similarity = _generic_text_similarity(
            requirement,
            candidate_text,
        )

        if similarity >= 0.50:
            matched.append(requirement)

    return (
        len(matched) / len(requirements),
        _dedupe(matched),
    )


def _score_experience(
    resume: ParsedResumeV2,
    job: JobRelevanceProfile,
    job_requirements: list[str],
) -> tuple[
    float,
    list[ExperienceRelevance],
]:
    job_text = " ".join([
        job.title or "",
        job.description,
        *job.responsibilities,
        *job.qualifications,
    ])

    entries: list[ExperienceRelevance] = []

    for index, experience in enumerate(
        resume.experience
    ):
        entry_text = " ".join([
            experience.title or "",
            experience.company or "",
            *experience.bullets,
            *experience.technologies,
        ])

        coverage, matched = _requirement_coverage(
            entry_text,
            job_requirements,
        )

        overlap, matched_terms = _term_overlap(
            entry_text,
            job_text,
        )

        title_overlap, _ = _term_overlap(
            experience.title or "",
            job.title or "",
        )

        raw_score = (
            coverage * 0.50
            + title_overlap * 0.20
            + overlap * 0.30
        )

        if experience.is_current:
            raw_score *= 1.02

        raw_score = min(
            raw_score,
            1.0,
        )

        reasons: list[str] = []

        if matched:
            reasons.append(
                "Relevant requirements evidenced: "
                + ", ".join(
                    matched[:6]
                )
            )

        if title_overlap > 0:
            reasons.append(
                "Role title overlaps with target role."
            )

        if matched_terms:
            reasons.append(
                "Responsibilities overlap with job language."
            )

        entries.append(
            ExperienceRelevance(
                index=index,
                company=experience.company,
                title=experience.title,
                score=round(
                    raw_score * 100,
                    2,
                ),
                matched_skills=matched,
                matched_terms=matched_terms,
                reasons=reasons,
            )
        )

    if not entries:
        return 0.0, []

    ranked = sorted(
        entries,
        key=lambda item: item.score,
        reverse=True,
    )

    top = [
        item.score
        for item in ranked[:3]
    ]

    weights = [0.55, 0.30, 0.15]
    applied = weights[:len(top)]

    aggregate = (
        sum(
            score * weight
            for score, weight
            in zip(top, applied)
        )
        / sum(applied)
    )

    return round(
        aggregate,
        2,
    ), entries


def _score_projects(
    resume: ParsedResumeV2,
    job: JobRelevanceProfile,
    job_requirements: list[str],
) -> tuple[
    float,
    list[ProjectRelevance],
]:
    if not resume.projects:
        return 0.0, []

    job_text = " ".join([
        job.title or "",
        job.description,
        *job.responsibilities,
        *job.qualifications,
    ])

    entries: list[ProjectRelevance] = []

    for index, project in enumerate(
        resume.projects
    ):
        project_text = " ".join([
            project.name or "",
            project.subtitle or "",
            project.description or "",
            *project.bullets,
            *project.technologies,
        ])

        coverage, matched = _requirement_coverage(
            project_text,
            job_requirements,
        )

        overlap, matched_terms = _term_overlap(
            project_text,
            job_text,
        )

        raw_score = (
            coverage * 0.65
            + overlap * 0.35
        )

        if project.links and raw_score > 0:
            raw_score += 0.02

        raw_score = min(
            raw_score,
            1.0,
        )

        reasons: list[str] = []

        if matched:
            reasons.append(
                "Relevant requirements evidenced: "
                + ", ".join(
                    matched[:6]
                )
            )

        if matched_terms:
            reasons.append(
                "Project content overlaps with job responsibilities."
            )

        if project.links:
            reasons.append(
                "Project has verifiable links."
            )

        entries.append(
            ProjectRelevance(
                index=index,
                name=project.name,
                score=round(
                    raw_score * 100,
                    2,
                ),
                matched_skills=matched,
                matched_terms=matched_terms,
                reasons=reasons,
            )
        )

    ranked = sorted(
        entries,
        key=lambda item: item.score,
        reverse=True,
    )

    top = [
        item.score
        for item in ranked[:3]
    ]

    weights = [0.55, 0.30, 0.15]
    applied = weights[:len(top)]

    aggregate = (
        sum(
            score * weight
            for score, weight
            in zip(top, applied)
        )
        / sum(applied)
    )

    return round(
        aggregate,
        2,
    ), entries


def _adaptive_weights(
    *,
    has_experience: bool,
    has_projects: bool,
) -> tuple[float, float, float]:
    """
    Sector-neutral weighting.

    Project portfolios are common in engineering/design but not universal.
    Their absence must not punish finance, operations, sales, healthcare, etc.
    """
    if has_experience and has_projects:
        return 0.45, 0.35, 0.20

    if has_experience and not has_projects:
        return 0.48, 0.52, 0.00

    if not has_experience and has_projects:
        return 0.55, 0.00, 0.45

    return 1.00, 0.00, 0.00


def score_resume_relevance(
    resume: ParsedResumeV2,
    job: JobRelevanceProfile,
) -> ResumeRelevanceResult:
    (
        skill_score,
        skill_matches,
        matched_required,
        missing_required,
        matched_preferred,
    ) = _score_skills(
        resume,
        job,
    )

    actual_requirements = _dedupe([
        *job.required_skills,
        *job.preferred_skills,
    ])

    experience_score, experience_matches = (
        _score_experience(
            resume,
            job,
            actual_requirements,
        )
    )

    project_score, project_matches = (
        _score_projects(
            resume,
            job,
            actual_requirements,
        )
    )

    skill_weight, exp_weight, project_weight = (
        _adaptive_weights(
            has_experience=bool(
                resume.experience
            ),
            has_projects=bool(
                resume.projects
            ),
        )
    )

    total = (
        skill_score * skill_weight
        + experience_score * exp_weight
        + project_score * project_weight
    )

    explanations: list[str] = []

    if missing_required:
        explanations.append(
            "Missing required capabilities: "
            + ", ".join(
                missing_required
            )
        )

    strong = [
        row.skill
        for row in skill_matches
        if (
            row.matched
            and row.requirement_level
            in {
                "required",
                "preferred",
            }
            and row.contribution >= 0.68
        )
    ]

    if strong:
        explanations.append(
            "Strong resume evidence for: "
            + ", ".join(
                strong[:8]
            )
        )

    best_experience = max(
        experience_matches,
        key=lambda item: item.score,
        default=None,
    )

    if (
        best_experience
        and best_experience.score >= 45
    ):
        explanations.append(
            "Most relevant experience: "
            + (
                best_experience.title
                or best_experience.company
                or "experience"
            )
        )

    best_project = max(
        project_matches,
        key=lambda item: item.score,
        default=None,
    )

    if (
        best_project
        and best_project.score >= 45
    ):
        explanations.append(
            "Most relevant project: "
            + (
                best_project.name
                or "project"
            )
        )

    return ResumeRelevanceResult(
        score=round(
            total,
            2,
        ),
        breakdown=ResumeRelevanceBreakdown(
            skills=skill_score,
            experience=experience_score,
            projects=project_score,
        ),
        skill_matches=skill_matches,
        experience_matches=experience_matches,
        project_matches=project_matches,
        matched_required_skills=matched_required,
        missing_required_skills=missing_required,
        matched_preferred_skills=matched_preferred,
        explanation=explanations,
    )
