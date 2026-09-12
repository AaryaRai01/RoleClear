from __future__ import annotations

import re
from dataclasses import dataclass, field

from app.schemas.smart_apply import ExtractedJob
from app.services.job_extractor import extract_skills


@dataclass
class ParsedJobRequirements:
    required_skills: list[str] = field(default_factory=list)
    preferred_skills: list[str] = field(default_factory=list)
    context_skills: list[str] = field(default_factory=list)

    required_qualifications: list[str] = field(default_factory=list)
    preferred_qualifications: list[str] = field(default_factory=list)

    responsibilities: list[str] = field(default_factory=list)
    experience_requirements: list[str] = field(default_factory=list)
    education_requirements: list[str] = field(default_factory=list)


GENERIC_CAPABILITY_PATTERNS = [
    r"\bexperience\s+(?:with|in|using|of)\s+(.+)",
    r"\bknowledge\s+of\s+(.+)",
    r"\bproficien(?:cy|t)\s+(?:in|with)\s+(.+)",
    r"\bfamiliarity\s+with\s+(.+)",
    r"\bskills?\s+in\s+(.+)",
    r"\bexpertise\s+in\s+(.+)",
    r"\bbackground\s+in\s+(.+)",
    r"\bability\s+to\s+(.+)",
]

NOISE_PREFIXES = (
    "a ",
    "an ",
    "the ",
    "and ",
    "or ",
)

NOISE_ENDINGS = (
    "is required",
    "required",
    "preferred",
    "is preferred",
    "would be preferred",
)

GENERIC_STOP_CAPABILITIES = {
    "industry setting",
    "related field",
    "related fields",
    "equivalent practical experience",
    "practical experience",
    "computer science",
    "business",
}

CANONICAL_EQUIVALENTS = {
    "agents": "AI Agents",
    "ai agents": "AI Agents",
    "agentic ai": "AI Agents",
    "artificial intelligence": "Artificial Intelligence",
    "ai": "Artificial Intelligence",
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "software engineering": "Software Development",
    "software development": "Software Development",
    "platform engineering": "Platform Development",
    "platform development": "Platform Development",
    "data structures and algorithms": "Data Structures & Algorithms",
    "data structures & algorithms": "Data Structures & Algorithms",
    "distributed computing": "Distributed Systems",
    "distributed systems": "Distributed Systems",
}


def _clean(value: str | None) -> str:
    if not value:
        return ""
    value = re.sub(r"\s+", " ", value).strip(" \t\r\n,.;:-")
    return value


def _canonical(value: str) -> str:
    clean = _clean(value)
    lower = clean.lower()

    if lower in CANONICAL_EQUIVALENTS:
        return CANONICAL_EQUIVALENTS[lower]

    # Preserve acronyms such as SEO, GAAP, CRM, SQL.
    if clean.isupper() and len(clean) <= 8:
        return clean

    return clean


def _dedupe(values: list[str]) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()

    for value in values:
        clean = _canonical(value)

        if not clean:
            continue

        key = clean.lower()

        if key in seen:
            continue

        seen.add(key)
        result.append(clean)

    return result


def _split_capability_list(value: str) -> list[str]:
    """
    Split requirement phrases without assuming a technical domain.

    Examples:
      "financial analysis and forecasting"
      -> ["financial analysis", "forecasting"]

      "SEO, content strategy, and Google Analytics"
      -> ["SEO", "content strategy", "Google Analytics"]
    """
    value = _clean(value)

    # Preserve well-known compound capabilities that should not be split on
    # conjunctions. This is domain-neutral behavior for canonical phrases.
    canonical_whole = CANONICAL_EQUIVALENTS.get(
        value.lower()
    )
    if canonical_whole:
        return [canonical_whole]

    for ending in NOISE_ENDINGS:
        if value.lower().endswith(ending):
            value = _clean(
                value[: -len(ending)]
            )

    # Stop before common sentence continuations.
    value = re.split(
        r"\b(?:to|while|including|such as|for the purpose of)\b",
        value,
        maxsplit=1,
        flags=re.IGNORECASE,
    )[0].strip()

    parts = re.split(
        r"\s*,\s*|\s*;\s*|\s+(?:and|or)\s+",
        value,
        flags=re.IGNORECASE,
    )

    cleaned: list[str] = []

    for part in parts:
        item = _clean(part)

        for prefix in NOISE_PREFIXES:
            if item.lower().startswith(prefix):
                item = _clean(item[len(prefix):])

        if (
            not item
            or len(item) < 2
            or item.lower() in GENERIC_STOP_CAPABILITIES
            or len(item.split()) > 8
        ):
            continue

        cleaned.append(item)

    return _dedupe(cleaned)


def _extract_generic_capabilities(text: str) -> list[str]:
    found: list[str] = []

    for pattern in GENERIC_CAPABILITY_PATTERNS:
        for match in re.finditer(
            pattern,
            text,
            flags=re.IGNORECASE,
        ):
            phrase = match.group(1)

            # Limit to one sentence/qualification clause.
            phrase = re.split(
                r"[.!?]",
                phrase,
                maxsplit=1,
            )[0]

            found.extend(
                _split_capability_list(
                    phrase
                )
            )

    # Strong/excellent X skills is common outside engineering.
    for match in re.finditer(
        r"\b(?:strong|excellent|advanced)\s+(.{2,80}?)\s+skills?\b",
        text,
        flags=re.IGNORECASE,
    ):
        found.extend(
            _split_capability_list(
                match.group(1)
            )
        )

    return _dedupe(found)


def _extract_all_capabilities(
    text: str,
) -> list[str]:
    # Existing extractor contributes concrete known skills but is no longer
    # the only source. Generic phrases make this usable for all sectors.
    concrete = extract_skills(text)

    generic = _extract_generic_capabilities(
        text
    )

    return _dedupe([
        *concrete,
        *generic,
    ])


def _experience_requirements(
    qualifications: list[str],
) -> list[str]:
    return _dedupe([
        qualification
        for qualification in qualifications
        if (
            "experience" in qualification.lower()
            or re.search(
                r"\b\d+\+?\s+years?\b",
                qualification,
                flags=re.IGNORECASE,
            )
        )
    ])


def _education_requirements(
    qualifications: list[str],
) -> list[str]:
    markers = (
        "bachelor",
        "master",
        "phd",
        "doctorate",
        "degree",
        "diploma",
        "certification",
        "license",
        "licence",
        "equivalent practical experience",
    )

    return _dedupe([
        qualification
        for qualification in qualifications
        if any(
            marker in qualification.lower()
            for marker in markers
        )
    ])



BULLET_SPLIT_RE = re.compile(
    r"\s*[•●▪◦]\s*"
)

SECTION_LABEL_RE = re.compile(
    r"\b("
    r"responsibilit(?:y|ies)(?:\s+includes?\s+but\s+not\s+limited\s+to)?"
    r"|eligibility\s+criteria"
    r"|required\s+skills?"
    r"|minimum\s+qualifications?"
    r"|basic\s+qualifications?"
    r"|desired\s+skills?"
    r"|preferred\s+skills?"
    r"|preferred\s+qualifications?"
    r")\s*:\s*",
    re.IGNORECASE,
)

MARKETING_NOISE_PATTERNS = (
    r"\bmaximum\s+of\s+\d+\s+roles?\b",
    r"\bduplicating\s+efforts?\b",
    r"\bbest\s+candidate\s+experience\b",
    r"\babout\s+futureforce\b",
    r"\buniversity\s+recruiting\b",
    r"\bworld'?s\s+most\s+innovative\s+companies\b",
    r"\bfortune'?s?\s+['\"]?100\s+best\s+companies\b",
    r"\bapply\s+today\b",
    r"\bjob\s+category\b",
    r"\bjob\s+details\b",
    r"\bequal(?:ity| opportunity)\b",
    r"\bworkplace\s+that'?s\s+inclusive\b",
)

RESPONSIBILITY_STARTERS = (
    "operate ",
    "collaborate ",
    "design ",
    "develop ",
    "build ",
    "create ",
    "contribute ",
    "engage ",
    "support ",
    "maintain ",
    "implement ",
    "test ",
    "deploy ",
    "monitor ",
    "improve ",
)


def _is_marketing_noise(value: str) -> bool:
    clean = _clean(value)
    if not clean:
        return True

    lower = clean.lower()

    return any(
        re.search(pattern, lower, flags=re.IGNORECASE)
        for pattern in MARKETING_NOISE_PATTERNS
    )


def _clean_requirement_clause(value: str) -> str:
    clean = _clean(value)

    clean = re.sub(
        r"\b(?:Eligibility Criteria|Required Skills|Desired Skills|"
        r"Minimum Qualifications|Preferred Qualifications)\b\s*:?\s*$",
        "",
        clean,
        flags=re.IGNORECASE,
    )

    return _clean(clean)


def _split_requirement_blob(
    value: str,
) -> list[tuple[str, str]]:
    """
    Split a large Workday/ATS qualification blob into typed clauses.

    Returns:
        ("required", text)
        ("preferred", text)
        ("responsibility", text)

    Section labels change the current mode for the bullets that follow them.
    """
    clean = _clean(value)

    if not clean:
        return []

    # Put explicit section labels on their own token boundary.
    labelled = SECTION_LABEL_RE.sub(
        lambda match: f" ||SECTION:{match.group(1)}|| ",
        clean,
    )

    tokens = [
        token.strip()
        for token in re.split(
            r"\|\|SECTION:([^|]+)\|\|",
            labelled,
        )
        if token and token.strip()
    ]

    mode = "required"
    result: list[tuple[str, str]] = []

    i = 0
    while i < len(tokens):
        token = tokens[i]
        normalized = token.lower().strip()

        if re.fullmatch(
            r"responsibilit(?:y|ies)(?:\s+includes?\s+but\s+not\s+limited\s+to)?",
            normalized,
            flags=re.IGNORECASE,
        ):
            mode = "responsibility"
            i += 1
            continue

        if normalized in {
            "eligibility criteria",
            "required skill",
            "required skills",
            "minimum qualification",
            "minimum qualifications",
            "basic qualification",
            "basic qualifications",
        }:
            mode = "required"
            i += 1
            continue

        if normalized in {
            "desired skill",
            "desired skills",
            "preferred skill",
            "preferred skills",
            "preferred qualification",
            "preferred qualifications",
        }:
            mode = "preferred"
            i += 1
            continue

        clauses = [
            _clean_requirement_clause(part)
            for part in BULLET_SPLIT_RE.split(token)
        ]

        for clause in clauses:
            if not clause:
                continue

            if _is_marketing_noise(clause):
                continue

            # Remove known trailing company/about blocks.
            clause = re.split(
                r"\b(?:About Futureforce|About Salesforce|"
                r"FutureForce is for|Salesforce is the)\b",
                clause,
                maxsplit=1,
                flags=re.IGNORECASE,
            )[0]

            clause = _clean_requirement_clause(clause)

            if not clause:
                continue

            result.append(
                (
                    mode,
                    clause,
                )
            )

        i += 1

    return result


def _normalize_qualification_lists(
    job: ExtractedJob,
) -> tuple[list[str], list[str], list[str]]:
    """
    Build clean required/preferred/responsibility lists from extractor output.

    Explicit minimum/preferred arrays still take precedence. The blob parser
    is mainly for Workday-style pages where several sections are packed into
    one or two qualification strings.
    """
    explicit_required = list(
        getattr(
            job,
            "minimum_qualifications",
            [],
        )
        or []
    )

    explicit_preferred = list(
        getattr(
            job,
            "preferred_qualifications",
            [],
        )
        or []
    )

    required: list[str] = []
    preferred: list[str] = []
    responsibilities: list[str] = []

    source_values: list[tuple[str, str]] = []

    source_values.extend(
        ("required", value)
        for value in explicit_required
    )

    source_values.extend(
        ("preferred", value)
        for value in explicit_preferred
    )

    if not explicit_required and not explicit_preferred:
        source_values.extend(
            ("unknown", value)
            for value in (
                list(
                    getattr(
                        job,
                        "qualifications",
                        [],
                    )
                    or []
                )
            )
        )

    for default_mode, value in source_values:
        parsed = _split_requirement_blob(value)

        if not parsed:
            clause = _clean_requirement_clause(value)

            if not clause or _is_marketing_noise(clause):
                continue

            lower = clause.lower()

            if default_mode == "preferred" or any(
                marker in lower
                for marker in (
                    "preferred",
                    "nice to have",
                    "nice-to-have",
                    "bonus",
                    "desirable",
                    "is a plus",
                )
            ):
                preferred.append(clause)
            else:
                required.append(clause)

            continue

        for parsed_mode, clause in parsed:
            mode = parsed_mode

            # Explicit extractor buckets override the default only when
            # the blob itself did not contain a stronger section label.
            if default_mode == "preferred" and mode == "required":
                mode = "preferred"

            if mode == "responsibility":
                responsibilities.append(clause)
            elif mode == "preferred":
                preferred.append(clause)
            else:
                required.append(clause)

    # If the extractor already produced useful responsibilities, merge only
    # job-like action statements and discard corporate/about text.
    for item in list(job.responsibilities or []):
        clean = _clean(item)

        if not clean or _is_marketing_noise(clean):
            continue

        lower = clean.lower()

        if (
            lower.startswith(RESPONSIBILITY_STARTERS)
            or any(
                marker in lower
                for marker in (
                    "design",
                    "develop",
                    "test",
                    "deploy",
                    "build",
                    "contribute",
                    "support",
                    "monitor",
                    "collaborate",
                )
            )
        ):
            responsibilities.append(clean)

    return (
        _dedupe(required),
        _dedupe(preferred),
        _dedupe(responsibilities),
    )


def parse_job_requirements(
    job: ExtractedJob,
) -> ParsedJobRequirements:
    (
        required_qualifications,
        preferred_qualifications,
        cleaned_responsibilities,
    ) = _normalize_qualification_lists(
        job
    )

    required_skills = _dedupe([
        capability
        for qualification in required_qualifications
        for capability in _extract_all_capabilities(
            qualification
        )
    ])

    preferred_skills = _dedupe([
        capability
        for qualification in preferred_qualifications
        for capability in _extract_all_capabilities(
            qualification
        )
    ])

    required_keys = {
        item.lower()
        for item in required_skills
    }

    preferred_skills = [
        item
        for item in preferred_skills
        if item.lower() not in required_keys
    ]

    preferred_keys = {
        item.lower()
        for item in preferred_skills
    }

    # Description-derived skills are context only. They never become required
    # qualifications merely because they appear in employer marketing copy.
    context_skills = [
        item
        for item in _extract_all_capabilities(
            job.description or ""
        )
        if item.lower() not in required_keys
        and item.lower() not in preferred_keys
    ]

    all_qualifications = [
        *required_qualifications,
        *preferred_qualifications,
    ]

    return ParsedJobRequirements(
        required_skills=
            _dedupe(required_skills),

        preferred_skills=
            _dedupe(preferred_skills),

        context_skills=
            _dedupe(context_skills),

        required_qualifications=
            required_qualifications,

        preferred_qualifications=
            preferred_qualifications,

        responsibilities=
            cleaned_responsibilities,

        experience_requirements=
            _experience_requirements(
                all_qualifications
            ),

        education_requirements=
            _education_requirements(
                all_qualifications
            ),
    )

