from __future__ import annotations

import re
from datetime import date, datetime
from typing import Iterable

from app.schemas.canonical import (
    CanonicalCredential,
    CanonicalEducation,
    CanonicalEvidence,
    CanonicalExperience,
    CanonicalResume,
    CanonicalWorkSample,
)
from app.schemas.resume import (
    CategorizedSkills,
    ParsedResumeV2,
)


# =========================================================
# NORMALIZATION CONSTANTS
# =========================================================

SKILL_FIELDS_AS_COMPETENCIES = {
    "concepts",
    "soft_skills",
    "other",
}

SKILL_FIELDS_AS_TOOLS = {
    "programming_languages",
    "frameworks",
    "libraries",
    "databases",
    "cloud",
    "devops",
    "developer_tools",
    "ai_ml",
    "data",
    "mobile",
    "web",
}

COMPETENCY_SECTION_HINTS = (
    "skills",
    "skill",
    "competencies",
    "competency",
    "expertise",
    "strengths",
    "core skills",
    "core competencies",
    "professional skills",
    "technical skills",
    "functional skills",
    "areas of expertise",
)

NON_SKILL_PREFIXES = (
    "email",
    "phone",
    "mobile",
    "linkedin",
    "github",
    "portfolio",
    "address",
    "location",
)

MONTH_LOOKUP = {
    "jan": 1,
    "january": 1,
    "feb": 2,
    "february": 2,
    "mar": 3,
    "march": 3,
    "apr": 4,
    "april": 4,
    "may": 5,
    "jun": 6,
    "june": 6,
    "jul": 7,
    "july": 7,
    "aug": 8,
    "august": 8,
    "sep": 9,
    "sept": 9,
    "september": 9,
    "oct": 10,
    "october": 10,
    "nov": 11,
    "november": 11,
    "dec": 12,
    "december": 12,
}


# =========================================================
# BASIC HELPERS
# =========================================================

def _clean(value: str | None) -> str:
    if not value:
        return ""

    return re.sub(
        r"\s+",
        " ",
        str(value),
    ).strip(" \t\r\n•*-–—:;,")


def _dedupe(
    values: Iterable[str],
) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()

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


def _stringify_link(
    link: object,
) -> str | None:
    value = getattr(
        link,
        "url",
        None,
    )

    if value:
        return str(value)

    if isinstance(
        link,
        str,
    ):
        return link

    return None


# =========================================================
# DATE / DURATION
# =========================================================

def _parse_resume_date(
    value: str | None,
) -> tuple[int, int] | None:
    """
    Parse common resume date formats conservatively.

    Supported examples:
      2025
      May 2026
      May 2026 - Jun 2026 (individual endpoint only)
      05/2026
      Present / Current
    """

    clean = _clean(value)

    if not clean:
        return None

    lower = clean.lower()

    if lower in {
        "present",
        "current",
        "ongoing",
        "now",
    }:
        today = date.today()

        return (
            today.year,
            today.month,
        )

    numeric = re.search(
        r"\b(0?[1-9]|1[0-2])[/.-](20\d{2}|19\d{2})\b",
        lower,
    )

    if numeric:
        return (
            int(
                numeric.group(2)
            ),
            int(
                numeric.group(1)
            ),
        )

    month_year = re.search(
        r"\b("
        + "|".join(
            re.escape(
                month
            )
            for month
            in MONTH_LOOKUP
        )
        + r")\.?\s+(20\d{2}|19\d{2})\b",
        lower,
    )

    if month_year:
        return (
            int(
                month_year.group(2)
            ),
            MONTH_LOOKUP[
                month_year.group(1)
            ],
        )

    year_only = re.search(
        r"\b(20\d{2}|19\d{2})\b",
        lower,
    )

    if year_only:
        return (
            int(
                year_only.group(1)
            ),
            1,
        )

    return None


def _duration_months(
    start_date: str | None,
    end_date: str | None,
    is_current: bool,
) -> int | None:
    start = _parse_resume_date(
        start_date
    )

    if not start:
        return None

    end = (
        _parse_resume_date(
            "present"
        )
        if is_current
        else _parse_resume_date(
            end_date
        )
    )

    if not end:
        return None

    months = (
        (end[0] - start[0]) * 12
        + end[1]
        - start[1]
        + 1
    )

    if months <= 0:
        return None

    return months


# =========================================================
# SKILLS + EVIDENCE
# =========================================================

def _all_skill_items(
    skills: CategorizedSkills,
) -> list[
    tuple[str, object]
]:
    result: list[
        tuple[str, object]
    ] = []

    for field_name in (
        CategorizedSkills.model_fields
    ):
        values = getattr(
            skills,
            field_name,
            [],
        )

        for item in values:
            result.append(
                (
                    field_name,
                    item,
                )
            )

    return result


def _evidence_strength(
    skill: object,
) -> str:
    provenance = getattr(
        skill,
        "provenance",
        None,
    )

    if provenance in {
        "explicit",
        "demonstrated",
        "mentioned",
    }:
        return provenance

    if getattr(
        skill,
        "demonstrated",
        False,
    ):
        return "demonstrated"

    if getattr(
        skill,
        "explicit",
        False,
    ):
        return "explicit"

    if getattr(
        skill,
        "mentioned",
        False,
    ):
        return "mentioned"

    confidence = float(
        getattr(
            skill,
            "confidence",
            0.0,
        )
        or 0.0
    )

    if confidence >= 0.90:
        return "explicit"

    if confidence >= 0.65:
        return "mentioned"

    return "inferred"


def _skill_source_text(
    skill: object,
) -> str:
    evidence = getattr(
        skill,
        "evidence",
        [],
    )

    if evidence:
        return " | ".join(
            _dedupe(
                str(item)
                for item in evidence
            )
        )

    aliases = getattr(
        skill,
        "aliases_found",
        [],
    )

    if aliases:
        return (
            "Skill evidence: "
            + ", ".join(
                _dedupe(
                    str(item)
                    for item in aliases
                )
            )
        )

    return (
        "Skill detected: "
        + _clean(
            getattr(
                skill,
                "name",
                "",
            )
        )
    )


def _skill_sources(
    skill: object,
) -> list[str]:
    return _dedupe(
        str(item)
        for item in (
            getattr(
                skill,
                "sources",
                [],
            )
            or []
        )
    )


def _skills_and_evidence(
    resume: ParsedResumeV2,
) -> tuple[
    list[str],
    list[str],
    list[CanonicalEvidence],
]:
    competencies: list[str] = []
    tools: list[str] = []
    evidence: list[
        CanonicalEvidence
    ] = []

    for field_name, skill in _all_skill_items(
        resume.skills
    ):
        name = _clean(
            getattr(
                skill,
                "normalized_name",
                None,
            )
            or getattr(
                skill,
                "name",
                "",
            )
        )

        if not name:
            continue

        # Every recognized skill is a capability.
        competencies.append(
            name
        )

        # Concrete technology/tool buckets are also retained separately.
        if (
            field_name
            in SKILL_FIELDS_AS_TOOLS
        ):
            tools.append(
                name
            )

        sources = _skill_sources(
            skill
        )

        evidence.append(
            CanonicalEvidence(
                label=name,
                normalized_label=name,
                strength=_evidence_strength(
                    skill
                ),
                source_section=(
                    sources[0]
                    if sources
                    else (
                        "skills"
                        if field_name
                        not in SKILL_FIELDS_AS_COMPETENCIES
                        else "competencies"
                    )
                ),
                source_text=
                    _skill_source_text(
                        skill
                    ),
                source_index=None,
            )
        )

    return (
        _dedupe(
            competencies
        ),
        _dedupe(
            tools
        ),
        evidence,
    )


# =========================================================
# GENERIC / CROSS-SECTOR COMPETENCY RECOVERY
# =========================================================

def _split_competency_line(
    line: str,
) -> list[str]:
    clean = _clean(
        line
    )

    if not clean:
        return []

    lower = clean.lower()

    if any(
        lower.startswith(
            prefix + ":"
        )
        for prefix
        in NON_SKILL_PREFIXES
    ):
        return []

    # Drop category label before colon:
    # "Core Competencies: Forecasting, Budgeting, Excel"
    if ":" in clean:
        left, right = clean.split(
            ":",
            1,
        )

        if (
            len(
                left.split()
            )
            <= 5
            and right.strip()
        ):
            clean = right.strip()

    parts = re.split(
        r"\s*[|;,]\s*",
        clean,
    )

    result: list[str] = []

    for part in parts:
        item = _clean(
            part
        )

        if (
            not item
            or len(item) < 2
            or len(
                item.split()
            ) > 8
        ):
            continue

        # Ignore sentences. Explicit competency sections typically
        # contain compact phrases rather than full prose.
        if (
            len(item) > 80
            or item.endswith(".")
        ):
            continue

        result.append(
            item
        )

    return _dedupe(
        result
    )


def _recover_explicit_competencies(
    resume: ParsedResumeV2,
) -> list[str]:
    """
    Recover cross-sector competencies from section content.

    This is important because the existing parser taxonomy grew from
    technical resumes. A marketing/finance/legal/healthcare resume may
    contain valid explicit skills that are not in that taxonomy.
    """

    recovered: list[str] = []

    for key, section in (
        resume.raw_sections
        or {}
    ).items():
        heading = _clean(
            getattr(
                section,
                "normalized_heading",
                None,
            )
            or getattr(
                section,
                "heading",
                None,
            )
            or key
        ).lower()

        if not any(
            hint in heading
            for hint
            in COMPETENCY_SECTION_HINTS
        ):
            continue

        for line in (
            getattr(
                section,
                "lines",
                [],
            )
            or []
        ):
            recovered.extend(
                _split_competency_line(
                    str(line)
                )
            )

    for section in (
        resume.other_sections
        or []
    ):
        heading = _clean(
            getattr(
                section,
                "normalized_heading",
                None,
            )
            or getattr(
                section,
                "original_heading",
                None,
            )
        ).lower()

        if not any(
            hint in heading
            for hint
            in COMPETENCY_SECTION_HINTS
        ):
            continue

        for line in (
            getattr(
                section,
                "content",
                [],
            )
            or []
        ):
            recovered.extend(
                _split_competency_line(
                    str(line)
                )
            )

    return _dedupe(
        recovered
    )


# =========================================================
# EXPERIENCE
# =========================================================

def _normalize_experience(
    resume: ParsedResumeV2,
) -> tuple[
    list[CanonicalExperience],
    list[CanonicalEvidence],
]:
    result: list[
        CanonicalExperience
    ] = []

    evidence: list[
        CanonicalEvidence
    ] = []

    for index, item in enumerate(
        resume.experience
    ):
        responsibilities = _dedupe(
            item.bullets
            or []
        )

        description = _clean(
            item.raw_text
        )

        technologies = _dedupe(
            item.technologies
            or []
        )

        result.append(
            CanonicalExperience(
                title=item.title,
                organization=item.company,
                start_date=item.start_date,
                end_date=item.end_date,
                is_current=item.is_current,
                duration_months=
                    _duration_months(
                        item.start_date,
                        item.end_date,
                        item.is_current,
                    ),
                description=description,
                responsibilities=
                    responsibilities,
                competencies=[],
                tools=technologies,
                achievements=[],
            )
        )

        for bullet in responsibilities:
            evidence.append(
                CanonicalEvidence(
                    label=(
                        item.title
                        or item.company
                        or "Experience"
                    ),
                    normalized_label=None,
                    strength="demonstrated",
                    source_section=
                        "experience",
                    source_text=bullet,
                    source_index=index,
                )
            )

    return (
        result,
        evidence,
    )


# =========================================================
# EDUCATION
# =========================================================

def _normalize_education(
    resume: ParsedResumeV2,
) -> list[
    CanonicalEducation
]:
    result: list[
        CanonicalEducation
    ] = []

    for item in resume.education:
        result.append(
            CanonicalEducation(
                qualification=
                    item.degree,
                field=
                    item.field_of_study,
                institution=
                    item.institution,
                start_date=
                    item.start_date,
                end_date=
                    item.end_date,
                is_current=(
                    _clean(
                        item.end_date
                    ).lower()
                    in {
                        "present",
                        "current",
                        "ongoing",
                    }
                ),
            )
        )

    return result


# =========================================================
# CREDENTIALS
# =========================================================

def _normalize_credentials(
    resume: ParsedResumeV2,
) -> list[
    CanonicalCredential
]:
    result: list[
        CanonicalCredential
    ] = []

    for item in resume.certifications:
        name = _clean(
            item.name
            or item.raw_text
        )

        if not name:
            continue

        result.append(
            CanonicalCredential(
                name=name,
                issuer=item.issuer,
                credential_type=
                    "certification",
                expiry_date=
                    item.expiry_date,
            )
        )

    return result


# =========================================================
# WORK SAMPLES
# =========================================================

def _normalize_projects(
    resume: ParsedResumeV2,
) -> tuple[
    list[CanonicalWorkSample],
    list[CanonicalEvidence],
]:
    result: list[
        CanonicalWorkSample
    ] = []

    evidence: list[
        CanonicalEvidence
    ] = []

    for index, item in enumerate(
        resume.projects
    ):
        description_parts = _dedupe([
            item.description or "",
            *(
                item.bullets
                or []
            ),
        ])

        result.append(
            CanonicalWorkSample(
                name=item.name,
                sample_type="project",
                description=" ".join(
                    description_parts
                ),
                competencies=[],
                tools=_dedupe(
                    item.technologies
                    or []
                ),
                outcomes=_dedupe(
                    item.bullets
                    or []
                ),
                links=_dedupe(
                    link
                    for link in (
                        _stringify_link(
                            value
                        )
                        for value
                        in (
                            item.links
                            or []
                        )
                    )
                    if link
                ),
            )
        )

        for bullet in (
            item.bullets
            or []
        ):
            evidence.append(
                CanonicalEvidence(
                    label=(
                        item.name
                        or "Project"
                    ),
                    normalized_label=None,
                    strength="demonstrated",
                    source_section=
                        "work_sample",
                    source_text=_clean(
                        bullet
                    ),
                    source_index=index,
                )
            )

    return (
        result,
        evidence,
    )


def _normalize_research(
    resume: ParsedResumeV2,
) -> tuple[
    list[CanonicalWorkSample],
    list[CanonicalEvidence],
]:
    result: list[
        CanonicalWorkSample
    ] = []

    evidence: list[
        CanonicalEvidence
    ] = []

    for index, item in enumerate(
        resume.research
    ):
        text_parts = _dedupe([
            item.description or "",
            *(
                item.bullets
                or []
            ),
        ])

        result.append(
            CanonicalWorkSample(
                name=item.title,
                sample_type="research",
                description=" ".join(
                    text_parts
                ),
                competencies=[],
                tools=_dedupe(
                    item.technologies
                    or []
                ),
                outcomes=_dedupe(
                    item.bullets
                    or []
                ),
                links=[],
            )
        )

        for text in text_parts:
            evidence.append(
                CanonicalEvidence(
                    label=(
                        item.title
                        or "Research"
                    ),
                    normalized_label=None,
                    strength="demonstrated",
                    source_section=
                        "research",
                    source_text=text,
                    source_index=index,
                )
            )

    return (
        result,
        evidence,
    )


# =========================================================
# OTHER CONTENT
# =========================================================

def _normalize_achievements(
    resume: ParsedResumeV2,
) -> list[str]:
    return _dedupe(
        " — ".join(
            value
            for value in (
                item.title,
                item.description,
            )
            if _clean(
                value
            )
        )
        for item in resume.achievements
    )


def _normalize_publications(
    resume: ParsedResumeV2,
) -> list[str]:
    values: list[str] = []

    for item in resume.publications:
        parts = [
            item.title,
            item.venue,
            (
                str(
                    item.year
                )
                if item.year
                else None
            ),
            item.description,
        ]

        text = " — ".join(
            _clean(
                value
            )
            for value in parts
            if _clean(
                value
            )
        )

        if text:
            values.append(
                text
            )

    return _dedupe(
        values
    )


def _normalize_languages(
    resume: ParsedResumeV2,
) -> list[str]:
    values: list[str] = []

    for item in resume.languages:
        value = _clean(
            item.language
        )

        proficiency = _clean(
            item.proficiency
        )

        if (
            value
            and proficiency
        ):
            values.append(
                f"{value} ({proficiency})"
            )
        elif value:
            values.append(
                value
            )

    return _dedupe(
        values
    )


# =========================================================
# MAIN NORMALIZER
# =========================================================

def normalize_resume(
    resume: ParsedResumeV2,
) -> CanonicalResume:
    """
    Convert ParsedResumeV2 into a sector-neutral CanonicalResume.

    Important design rule:
    the existing parser remains an extraction adapter. This normalizer
    does not assume that every candidate is an engineer or that every
    strong resume contains projects/GitHub/technical tools.
    """

    (
        taxonomy_competencies,
        tools,
        skill_evidence,
    ) = _skills_and_evidence(
        resume
    )

    recovered_competencies = (
        _recover_explicit_competencies(
            resume
        )
    )

    experience, experience_evidence = (
        _normalize_experience(
            resume
        )
    )

    projects, project_evidence = (
        _normalize_projects(
            resume
        )
    )

    research, research_evidence = (
        _normalize_research(
            resume
        )
    )

    # Explicit competencies recovered from raw/custom skill sections
    # are evidence even when the old technical taxonomy did not know them.
    recovered_evidence = [
        CanonicalEvidence(
            label=item,
            normalized_label=item,
            strength="explicit",
            source_section="skills",
            source_text=(
                "Explicitly listed competency: "
                + item
            ),
            source_index=None,
        )
        for item in recovered_competencies
        if item.lower()
        not in {
            value.lower()
            for value
            in taxonomy_competencies
        }
    ]

    personal_info = resume.personal_info

    candidate_name = _clean(
        personal_info.full_name
    ) or None

    return CanonicalResume(
        candidate_name=
            candidate_name,
        headline=None,
        summary=
            resume.summary,
        competencies=
            _dedupe([
                *taxonomy_competencies,
                *recovered_competencies,
            ]),
        tools=
            tools,
        experience=
            experience,
        education=
            _normalize_education(
                resume
            ),
        credentials=
            _normalize_credentials(
                resume
            ),
        work_samples=[
            *projects,
            *research,
        ],
        achievements=
            _normalize_achievements(
                resume
            ),
        publications=
            _normalize_publications(
                resume
            ),
        languages=
            _normalize_languages(
                resume
            ),
        evidence=[
            *skill_evidence,
            *recovered_evidence,
            *experience_evidence,
            *project_evidence,
            *research_evidence,
        ],
        raw_text=
            resume.raw_text,
    )
