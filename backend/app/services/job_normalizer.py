from __future__ import annotations

import re
from collections.abc import Iterable

from app.schemas.canonical import (
    CanonicalJob,
    CanonicalRequirement,
)
from app.schemas.smart_apply import ExtractedJob


# =========================================================
# LANGUAGE SIGNALS
# =========================================================

REQUIRED_MARKERS = (
    "required",
    "must have",
    "must be",
    "minimum qualification",
    "minimum qualifications",
    "basic qualification",
    "basic qualifications",
    "we require",
)

PREFERRED_MARKERS = (
    "preferred",
    "nice to have",
    "nice-to-have",
    "bonus",
    "desirable",
    "advantage",
)

EDUCATION_MARKERS = (
    "bachelor",
    "master",
    "phd",
    "doctorate",
    "degree",
    "diploma",
    "graduate",
    "undergraduate",
    "postgraduate",
    "currently pursuing",
    "enrolled in",
)

CERTIFICATION_MARKERS = (
    "certification",
    "certified",
    "certificate",
)

LICENSE_MARKERS = (
    "license",
    "licence",
    "licensed",
    "registration",
    "registered nurse",
    "bar admission",
)

LANGUAGE_MARKERS = (
    "language proficiency",
    "fluency",
    "fluent",
    "english proficiency",
)

ELIGIBILITY_MARKERS = (
    "must be eligible",
    "eligibility",
    "work authorization",
    "authorized to work",
    "visa",
    "semester remaining",
    "term remaining",
    "currently pursuing",
    "must reside",
    "must be located",
)

REQUIREMENT_PHRASES = (
    "experience with",
    "experience in",
    "experience using",
    "experience of",
    "programming experience",
    "knowledge of",
    "proficiency in",
    "proficiency with",
    "proficient in",
    "proficient with",
    "familiarity with",
    "expertise in",
    "ability to demonstrate",
    "ability to",
    "skills in",
    "understanding of",
)

RESPONSIBILITY_STARTS = (
    "apply ",
    "build ",
    "develop ",
    "design ",
    "manage ",
    "lead ",
    "create ",
    "analyze ",
    "analyse ",
    "prepare ",
    "support ",
    "coordinate ",
    "collaborate ",
    "review ",
    "maintain ",
    "implement ",
    "deliver ",
    "execute ",
    "drive ",
    "monitor ",
    "evaluate ",
    "conduct ",
    "provide ",
    "assist ",
    "work with ",
    "partner with ",
    "communicate ",
    "research ",
    "seek ",
    "demonstrate ",
)

SOFT_SKILL_TERMS = {
    "communication",
    "collaboration",
    "teamwork",
    "leadership",
    "problem solving",
    "problem-solving",
    "time management",
    "stakeholder management",
    "negotiation",
    "presentation",
    "critical thinking",
    "analytical thinking",
    "attention to detail",
    "adaptability",
    "organization",
    "organisational skills",
    "interpersonal skills",
    "customer service",
}


ROLE_FAMILY_TITLE_RULES: dict[str, tuple[str, ...]] = {
    "engineering": (
        "software engineering",
        "software engineer",
        "software developer",
        "developer",
        "frontend",
        "backend",
        "full stack",
        "full-stack",
        "devops",
        "cloud engineer",
        "data engineer",
        "machine learning engineer",
        "ai engineer",
        "engineering intern",
    ),
    "data": (
        "data analyst",
        "data scientist",
        "business intelligence",
        "bi analyst",
        "analytics intern",
    ),
    "finance": (
        "financial analyst",
        "finance",
        "accountant",
        "accounting",
        "fp&a",
        "auditor",
        "treasury",
    ),
    "marketing": (
        "marketing",
        "seo",
        "content strategist",
        "brand",
        "growth",
    ),
    "sales": (
        "sales",
        "account executive",
        "business development",
        "relationship manager",
    ),
    "human_resources": (
        "human resources",
        "recruiter",
        "talent acquisition",
        "people operations",
    ),
    "operations": (
        "operations manager",
        "operations analyst",
        "operations intern",
        "supply chain",
        "procurement",
        "logistics",
    ),
    "design": (
        "designer",
        "ux designer",
        "ui designer",
        "product designer",
        "visual designer",
    ),
    "healthcare": (
        "nurse",
        "clinical",
        "physician",
        "pharmacist",
        "medical",
    ),
    "legal": (
        "lawyer",
        "attorney",
        "counsel",
        "paralegal",
        "legal",
    ),
    "product": (
        "product manager",
        "product owner",
        "product management",
    ),
}


NUMBER_WORDS = {
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "ten": 10,
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


def _dedupe(values: Iterable[str]) -> list[str]:
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


def _contains_any(
    text: str,
    markers: Iterable[str],
) -> bool:
    lower = text.lower()

    return any(
        marker in lower
        for marker in markers
    )



# =========================================================
# REQUIREMENT QUALITY GATE
# =========================================================

BOILERPLATE_MARKERS = (
    "equal opportunity",
    "affirmative action",
    "privacy policy",
    "candidate privacy",
    "applicant privacy",
    "workplace discrimination",
    "accommodation",
    "recruitment agencies",
    "agency resumes",
    "unsolicited resumes",
    "equity is granted",
    "alphabet inc.",
    "follow life at google",
    "more about us",
    "how we hire",
    "belonging at google",
)

CORPORATE_MARKETING_MARKERS = (
    "accelerates every organization",
    "digitally transform its business",
    "our mission is",
    "we are proud to",
    "committed to building a workforce",
    "representative of the users we serve",
    "culture of belonging",
)

COMPENSATION_MARKERS = (
    "salary",
    "compensation",
    "bonus target",
    "bonus",
    "equity",
    "benefits",
    "base pay",
    "pay range",
    "compensation range",
    "usd",
    "inr",
    "eur",
    "gbp",
)


def _is_requirement_noise(text: str) -> bool:
    """
    Reject corporate marketing, legal/privacy/EEO and recruiting boilerplate
    before it becomes a candidate requirement.
    """
    lower = _clean(text).lower()

    if not lower:
        return True

    if any(
        marker in lower
        for marker in BOILERPLATE_MARKERS
    ):
        return True

    if any(
        marker in lower
        for marker in CORPORATE_MARKETING_MARKERS
    ):
        return True

    # Compensation/benefits text is employer metadata, never a candidate
    # requirement. Currency patterns catch variants not covered by markers.
    if any(
        marker in lower
        for marker in COMPENSATION_MARKERS
    ):
        if (
            re.search(r"[$€£₹]\s?\d", text)
            or re.search(r"\b\d{2,3}[,\d]*\s*(?:usd|inr|eur|gbp)\b", lower)
            or "benefit" in lower
            or "bonus" in lower
            or "equity" in lower
            or "salary" in lower
            or "compensation" in lower
        ):
            return True

    if _is_extra_noise(text):
        return True

    return False


def _filter_requirement_candidates(
    values: Iterable[str],
) -> list[str]:
    return _dedupe(
        value
        for value in values
        if not _is_requirement_noise(
            value
        )
    )

# =========================================================
# SENTENCE / CLAUSE RECOVERY
# =========================================================

def _inject_missing_boundaries(
    text: str,
) -> str:
    """
    Career pages frequently flatten bullets into one paragraph and lose
    punctuation. Insert boundaries before strong qualification cues.
    """

    cues = (
        "Currently pursuing ",
        "Must have ",
        "Must be ",
        "One year ",
        "Two years ",
        "Three years ",
        "Four years ",
        "Five years ",
        "Ability to ",
        "Knowledge of ",
        "Proficiency in ",
        "Proficiency with ",
        "Preferred qualifications",
        "Minimum qualifications",
        "Basic qualifications",
    )

    result = text

    for cue in cues:
        result = re.sub(
            rf"(?<!^)(?<![.!?\n])\s+(?={re.escape(cue)})",
            ". ",
            result,
            flags=re.IGNORECASE,
        )

    return result


def _sentences(text: str) -> list[str]:
    if not text:
        return []

    normalized = (
        text
        .replace("\r", "\n")
        .replace("•", "\n")
        .replace("●", "\n")
        .replace("▪", "\n")
        .replace("◦", "\n")
    )

    normalized = _inject_missing_boundaries(
        normalized
    )

    chunks = re.split(
        r"\n+|(?<=[.!?])\s+(?=[A-Z0-9])",
        normalized,
    )

    return _dedupe(
        chunk
        for chunk in chunks
        if len(_clean(chunk)) >= 3
    )


# =========================================================
# ROLE FAMILY
# =========================================================

def _detect_role_family(
    title: str | None,
    description: str,
) -> str | None:
    """
    Job title wins. Description is only a fallback.

    This prevents phrases such as "monitoring and operations at scale"
    from turning a Software Engineering Intern into an operations role.
    """

    title_text = _clean(title).lower()

    if title_text:
        for family, terms in ROLE_FAMILY_TITLE_RULES.items():
            if any(
                term in title_text
                for term in terms
            ):
                return family

    description_head = (
        description[:1800]
        .lower()
    )

    scores: list[
        tuple[int, str]
    ] = []

    for family, terms in ROLE_FAMILY_TITLE_RULES.items():
        score = sum(
            1
            for term in terms
            if term in description_head
        )

        if score:
            scores.append(
                (score, family)
            )

    if not scores:
        return None

    scores.sort(
        key=lambda item: item[0],
        reverse=True,
    )

    return scores[0][1]


# =========================================================
# REQUIREMENT / RESPONSIBILITY DETECTION
# =========================================================

def _looks_like_requirement(
    sentence: str,
) -> bool:
    lower = sentence.lower()

    # Avoid false positive from ordinary responsibility language such as:
    # "determine user requirements for a feature".
    if (
        "user requirements" in lower
        or "business requirements" in lower
        or "product requirements" in lower
    ):
        return False

    if _contains_any(
        sentence,
        REQUIRED_MARKERS,
    ):
        return True

    if _contains_any(
        sentence,
        PREFERRED_MARKERS,
    ):
        return True

    if _contains_any(
        sentence,
        EDUCATION_MARKERS,
    ):
        return True

    if _contains_any(
        sentence,
        CERTIFICATION_MARKERS,
    ):
        return True

    if _contains_any(
        sentence,
        LICENSE_MARKERS,
    ):
        return True

    if _contains_any(
        sentence,
        ELIGIBILITY_MARKERS,
    ):
        return True

    if any(
        phrase in lower
        for phrase in REQUIREMENT_PHRASES
    ):
        return True

    if re.search(
        r"\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)"
        r"\+?\s+(?:years?|months?)\b",
        lower,
    ):
        return True

    return False


def _looks_like_responsibility(
    sentence: str,
) -> bool:
    lower = sentence.lower()

    if _looks_like_requirement(
        sentence
    ):
        return False

    return lower.startswith(
        RESPONSIBILITY_STARTS
    )


def _requirement_level(
    text: str,
) -> str:
    if _contains_any(
        text,
        PREFERRED_MARKERS,
    ):
        return "preferred"

    # Requirement-like sentences recovered from a qualifications-style cue
    # are treated as required unless explicitly preferred.
    return "required"


def _category_for_requirement(
    text: str,
) -> str:
    lower = text.lower()

    if _contains_any(
        text,
        LICENSE_MARKERS,
    ):
        return "license"

    if _contains_any(
        text,
        CERTIFICATION_MARKERS,
    ):
        return "certification"

    if _contains_any(
        text,
        LANGUAGE_MARKERS,
    ):
        return "language"

    # Internship/student-state constraints are eligibility rules even when
    # they also mention education.
    if _contains_any(
        text,
        ELIGIBILITY_MARKERS,
    ):
        return "eligibility"

    has_education = _contains_any(
        text,
        EDUCATION_MARKERS,
    )

    has_experience = (
        "experience" in lower
        or re.search(
            r"\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)"
            r"\+?\s+(?:years?|months?)\b",
            lower,
        )
        is not None
    )

    has_quantified_experience = (
        re.search(
            r"\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)"
            r"\+?\s+(?:years?|months?)\b",
            lower,
        )
        is not None
    )

    # "Bachelor's degree or equivalent practical experience" is fundamentally
    # a degree/education gate. Do not let the word "experience" steal it.
    starts_with_degree = bool(
        re.match(
            r"^\s*(?:a\s+)?(?:bachelor|master|phd|doctorate|degree|diploma)",
            lower,
        )
    )

    equivalent_practical = (
        "equivalent practical experience"
        in lower
    )

    if (
        has_education
        and (
            starts_with_degree
            or equivalent_practical
            or not has_quantified_experience
        )
    ):
        return "education"

    if has_experience:
        return "experience"

    if has_education:
        return "education"

    if any(
        term in lower
        for term in SOFT_SKILL_TERMS
    ):
        return "soft_skill"

    return "competency"

def _compact_requirement_name(
    text: str,
) -> str:
    clean = _clean(text)

    patterns = (
        r"^experience\s+(?:with|in|using|of)\s+",
        r"^proficiency\s+(?:with|in)\s+",
        r"^proficient\s+(?:with|in)\s+",
        r"^knowledge\s+of\s+",
        r"^familiarity\s+with\s+",
        r"^expertise\s+in\s+",
        r"^ability\s+to\s+",
        r"^strong\s+",
        r"^excellent\s+",
    )

    shortened = clean

    for pattern in patterns:
        shortened = re.sub(
            pattern,
            "",
            shortened,
            flags=re.IGNORECASE,
        )

    shortened = _clean(
        shortened
    )

    if len(shortened) <= 140:
        return shortened

    return _clean(
        re.split(
            r";|\bwhile\b|\bwith the ability\b",
            shortened,
            maxsplit=1,
            flags=re.IGNORECASE,
        )[0]
    )[:140]


def _requirement_from_text(
    text: str,
    *,
    level: str,
    source_section: str,
) -> CanonicalRequirement:
    return CanonicalRequirement(
        name=_compact_requirement_name(
            text
        ),
        normalized_name=None,
        level=level,
        category=_category_for_requirement(
            text
        ),
        source_text=_clean(
            text
        ),
        source_section=source_section,
        importance=(
            1.25
            if level == "required"
            else (
                0.75
                if level == "preferred"
                else 0.35
            )
        ),
    )


# =========================================================
# EXPERIENCE
# =========================================================

def _parse_number(
    value: str,
) -> int | None:
    value = value.lower().strip()

    if value.isdigit():
        return int(value)

    return NUMBER_WORDS.get(
        value
    )


def _extract_minimum_experience_months(
    texts: Iterable[str],
) -> int | None:
    candidates: list[int] = []

    pattern = re.compile(
        r"\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)"
        r"\+?\s+(years?|months?)\b",
        flags=re.IGNORECASE,
    )

    for text in texts:
        lower = text.lower()

        if "experience" not in lower:
            continue

        # Do not convert an academic-duration requirement into a work-
        # experience requirement. Example:
        # "At least 1 year of university education, or equivalent work
        # experience." The "1 year" modifies education, not employment.
        academic_duration_markers = (
            "year of university education",
            "years of university education",
            "year of college education",
            "years of college education",
            "year of academic study",
            "years of academic study",
        )

        if any(
            marker in lower
            for marker in academic_duration_markers
        ):
            continue

        for match in pattern.finditer(
            text
        ):
            value = _parse_number(
                match.group(1)
            )

            if value is None:
                continue

            unit = match.group(2).lower()

            candidates.append(
                value
                if unit.startswith("month")
                else value * 12
            )

    if not candidates:
        return None

    return min(
        candidates
    )


# =========================================================
# ATS / WORKDAY STRUCTURED-BLOB RECOVERY
# =========================================================

_ATS_SECTION_RE = re.compile(
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
    flags=re.IGNORECASE,
)
_ATS_BULLET_RE = re.compile(r"\s*[•●▪◦]\s*")
_EXTRA_NOISE_MARKERS = (
    "best candidate experience","maximum of 3 roles","maximum of three roles",
    "duplicating efforts","futureforce university recruiting",
    "our interns and new graduates work on real projects",
    "with offices all over the world","job shadowing","mentorship programs",
    "talent development courses","job category","job details about",
    "salesforce is the #1 ai crm","ready to level-up your career","apply today",
    "world's most innovative companies","100 best companies to work for",
)
_TRAILING_ABOUT_RE = re.compile(
    r"\b(?:About Futureforce|About Salesforce|FutureForce is for|Salesforce is the #1 AI CRM)\b",
    flags=re.IGNORECASE,
)

def _is_extra_noise(text: str) -> bool:
    lower = _clean(text).lower()
    return (not lower) or any(marker in lower for marker in _EXTRA_NOISE_MARKERS)

def _strip_inline_section_tail(text: str) -> str:
    value = _clean(text)
    value = re.sub(
        r"\s+\b(?:Eligibility Criteria|Required Skills?|Desired Skills?|"
        r"Minimum Qualifications?|Preferred Qualifications?|Basic Qualifications?)\b\s*$",
        "", value, flags=re.IGNORECASE,
    )
    return _clean(value)

def _strip_leading_section_label(text: str) -> str:
    """
    Remove section-heading text accidentally attached to the first
    requirement, e.g.:
        "Minimum requirements A strong fundamental understanding..."
        "Preferred qualifications At least 1 year..."
    """
    value = _clean(text)

    value = re.sub(
        r"^(?:minimum\s+requirements?"
        r"|minimum\s+qualifications?"
        r"|basic\s+qualifications?"
        r"|required\s+skills?"
        r"|eligibility\s+criteria"
        r"|preferred\s+qualifications?"
        r"|preferred\s+skills?"
        r"|desired\s+skills?)"
        r"\s*[:\\-–—]?\\s+",
        "",
        value,
        flags=re.IGNORECASE,
    )

    return _clean(value)


def _split_ats_blob(
    text: str, *, default_level: str = "required"
) -> tuple[list[tuple[str, str, str]], list[str]]:
    value = _clean(text)
    if not value:
        return [], []
    marked = _ATS_SECTION_RE.sub(lambda m: f" ||SECTION:{m.group(1)}|| ", value)
    parts = [p.strip() for p in re.split(r"\|\|SECTION:([^|]+)\|\|", marked) if p and p.strip()]
    mode = default_level
    source_section = "qualifications"
    requirements=[]
    responsibilities=[]
    for part in parts:
        lower=part.lower().strip()
        if re.fullmatch(r"responsibilit(?:y|ies)(?:\s+includes?\s+but\s+not\s+limited\s+to)?", lower, flags=re.I):
            mode="responsibility"; source_section="responsibilities"; continue
        if lower in {"eligibility criteria","required skill","required skills","minimum qualification","minimum qualifications","basic qualification","basic qualifications"}:
            mode="required"; source_section="eligibility" if "eligibility" in lower else "minimum_qualifications"; continue
        if lower in {"desired skill","desired skills","preferred skill","preferred skills","preferred qualification","preferred qualifications"}:
            mode="preferred"; source_section="preferred_qualifications"; continue
        bullets=[_clean(x) for x in _ATS_BULLET_RE.split(part) if _clean(x)]
        for item in bullets:
            item=_TRAILING_ABOUT_RE.split(item, maxsplit=1)[0]
            item=_strip_inline_section_tail(item)
            item=_strip_leading_section_label(item)
            if not item or _is_requirement_noise(item) or _is_extra_noise(item):
                continue
            if mode=="responsibility":
                responsibilities.append(item)
            else:
                requirements.append((mode, source_section, item))
    return requirements, responsibilities

def _normalized_structured_inputs(job: ExtractedJob) -> tuple[list[tuple[str,str,str]], list[str]]:
    rows=[]
    resp=[]
    minimum=list(getattr(job,"minimum_qualifications",[]) or [])
    preferred=list(getattr(job,"preferred_qualifications",[]) or [])
    combined=list(getattr(job,"qualifications",[]) or [])
    for default_level, source, values in [
        ("required","minimum_qualifications",minimum),
        ("preferred","preferred_qualifications",preferred),
    ]:
        for value in values:
            clean_value = _strip_leading_section_label(
                _strip_inline_section_tail(
                    value
                )
            )

            if (
                not clean_value
                or _is_requirement_noise(
                    clean_value
                )
                or _is_extra_noise(
                    clean_value
                )
            ):
                continue

            # Explicit extractor arrays already define the level. Do not let
            # stray text such as "Preferred qualifications ..." inside an
            # item reclassify a minimum/preferred row.
            rows.append(
                (
                    default_level,
                    source,
                    clean_value,
                )
            )
    # `job.qualifications` is commonly just minimum + preferred combined.
    # Only use it as a backward-compatibility fallback when the extractor
    # did not provide explicit minimum/preferred arrays.
    if not minimum and not preferred:
        for value in combined:
            parsed,recovered=_split_ats_blob(
                value,
                default_level=_requirement_level(value),
            )
            rows.extend(parsed)
            resp.extend(recovered)
    for value in list(job.responsibilities or []):
        clean=_clean(value)
        if clean and not _is_requirement_noise(clean) and not _is_extra_noise(clean) and _looks_like_responsibility(clean):
            resp.append(clean)
    out=[]; seen=set()
    for level,source,item in rows:
        clean=_clean(item); key=(level,clean.lower())
        if clean and key not in seen:
            seen.add(key); out.append((level,source,clean))
    return out,_dedupe(resp)

_INCOMPLETE_REQUIREMENT_EXACT = {
    "academic or professional/internship",
    "academic or professional internship",
    "academic or internship",
    "professional/internship",
}

def _requirement_dedupe_key(text: str) -> str:
    """
    Normalize punctuation/spacing variants so the same requirement cannot
    appear twice because of PDF/HTML sentence extraction differences.
    """
    value = _clean(text).lower()

    value = re.sub(
        r"\bthe\s*\.\s*ability\b",
        "the ability",
        value,
    )

    value = re.sub(
        r"[^a-z0-9+#]+",
        " ",
        value,
    )

    return re.sub(
        r"\s+",
        " ",
        value,
    ).strip()


def _is_incomplete_requirement(text: str) -> bool:
    """
    Reject extractor fragments that do not express an actionable candidate
    requirement on their own.
    """
    clean = _clean(text)
    lower = clean.lower()

    if lower in _INCOMPLETE_REQUIREMENT_EXACT:
        return True

    # "Academic or professional/internship" is a common Workday truncation of
    # a longer experience requirement. Do not score an incomplete fragment.
    if (
        lower.startswith("academic or professional")
        and len(clean.split()) <= 5
    ):
        return True

    return False

# =========================================================
# MAIN NORMALIZER
# =========================================================

def normalize_job(
    job: ExtractedJob,
) -> CanonicalJob:
    structured_rows, structured_responsibilities = _normalized_structured_inputs(job)

    requirements: list[CanonicalRequirement] = [
        _requirement_from_text(text, level=level, source_section=source)
        for level, source, text in structured_rows
    ]

    description_sentences = _sentences(job.description or "")
    recovered_responsibilities: list[str] = []
    seen_requirement_text = {item.source_text.lower() for item in requirements}

    has_structured_requirement_rows = bool(structured_rows)

    for sentence in description_sentences:
        if _is_requirement_noise(sentence) or _is_extra_noise(sentence):
            continue

        clean_sentence = _strip_inline_section_tail(sentence)
        clean_sentence = _strip_leading_section_label(clean_sentence)

        if not clean_sentence:
            continue

        lower = clean_sentence.lower()

        # Structured minimum/preferred data is authoritative. Description
        # scanning is a fallback only; otherwise the same JD clauses are
        # duplicated and can be assigned the wrong requirement level.
        if (
            not has_structured_requirement_rows
            and _looks_like_requirement(clean_sentence)
            and lower not in seen_requirement_text
        ):
            requirements.append(
                _requirement_from_text(
                    clean_sentence,
                    level=_requirement_level(clean_sentence),
                    source_section="description_fallback",
                )
            )
            seen_requirement_text.add(lower)

        elif _looks_like_responsibility(clean_sentence):
            recovered_responsibilities.append(clean_sentence)

    responsibilities = _dedupe([
        *structured_responsibilities,
        *recovered_responsibilities,
    ])

    filtered=[]
    seen=set()
    for item in requirements:
        if (
            _is_requirement_noise(item.source_text)
            or _is_extra_noise(item.source_text)
            or _is_incomplete_requirement(item.source_text)
        ):
            continue

        clean_source=_strip_inline_section_tail(item.source_text)
        clean_source=_strip_leading_section_label(clean_source)

        if not clean_source:
            continue

        if clean_source != item.source_text:
            item=_requirement_from_text(
                clean_source,
                level=item.level,
                source_section=item.source_section,
            )

        key=(
            item.level,
            _requirement_dedupe_key(
                item.source_text
            ),
        )

        if key not in seen:
            seen.add(key)
            filtered.append(item)

    requirements=filtered

    if not requirements and job.title:
        requirements.append(
            CanonicalRequirement(
                name=_clean(job.title),
                normalized_name=None,
                level="context",
                category="other",
                source_text=_clean(job.title),
                source_section="title",
                importance=0.25,
            )
        )

    source_requirement_texts=[item.source_text for item in requirements]

    required_experience_texts=[
        item.source_text
        for item in requirements
        if (
            item.level=="required"
            and item.category=="experience"
        )
    ]

    education_requirements=_dedupe(
        item.source_text for item in requirements
        if item.category=="education" or _contains_any(item.source_text,EDUCATION_MARKERS)
    )
    certification_requirements=_dedupe(item.source_text for item in requirements if item.category=="certification")
    license_requirements=_dedupe(item.source_text for item in requirements if item.category=="license")
    language_requirements=_dedupe(item.source_text for item in requirements if item.category=="language")
    eligibility_requirements=_dedupe(
        item.source_text for item in requirements
        if item.category=="eligibility" or _contains_any(item.source_text,ELIGIBILITY_MARKERS)
    )
    experience_text=_dedupe(
        item.source_text for item in requirements
        if item.category=="experience" or "experience" in item.source_text.lower()
    )

    has_structured_requirements=bool(structured_rows)
    has_structured_responsibilities=bool(structured_responsibilities)

    if has_structured_requirements and has_structured_responsibilities:
        extraction_quality="structured"
    elif requirements or responsibilities:
        extraction_quality="partial"
    else:
        extraction_quality="description_only"

    warnings=[]
    if not has_structured_requirements:
        warnings.append("Structured qualifications were unavailable; requirements were recovered from the full description.")
    if not has_structured_responsibilities:
        warnings.append("Structured responsibilities were unavailable; responsibilities were recovered from the full description.")

    return CanonicalJob(
        title=job.title,
        company=job.company,
        location=job.location,
        role_family=_detect_role_family(job.title, job.description or ""),
        responsibilities=responsibilities,
        requirements=requirements,
        minimum_experience_months=_extract_minimum_experience_months(required_experience_texts),
        experience_text=experience_text,
        education_requirements=education_requirements,
        certification_requirements=certification_requirements,
        license_requirements=license_requirements,
        language_requirements=language_requirements,
        eligibility_requirements=eligibility_requirements,
        raw_description=job.description or "",
        extraction_quality=extraction_quality,
        normalization_warnings=warnings,
    )
