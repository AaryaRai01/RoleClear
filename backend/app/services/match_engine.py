from __future__ import annotations

import math
import re
from dataclasses import dataclass, field
from datetime import date
from typing import Iterable

from app.schemas.canonical import (
    CanonicalJob,
    CanonicalRequirement,
    CanonicalResume,
)


# =========================================================
# RESULT MODELS
# =========================================================

@dataclass
class RequirementMatch:
    requirement: str
    level: str
    category: str
    score: float
    matched: bool
    evidence: list[str] = field(default_factory=list)


@dataclass
class ExperienceMatch:
    index: int
    title: str | None
    organization: str | None
    score: float
    matched_terms: list[str] = field(default_factory=list)
    reasons: list[str] = field(default_factory=list)


@dataclass
class WorkSampleMatch:
    index: int
    name: str | None
    sample_type: str
    score: float
    matched_terms: list[str] = field(default_factory=list)
    reasons: list[str] = field(default_factory=list)


@dataclass
class MatchBreakdown:
    capabilities: float
    experience: float
    responsibilities: float
    eligibility: float
    preferred: float


@dataclass
class CanonicalMatchResult:
    score: float
    verdict: str
    breakdown: MatchBreakdown
    requirement_matches: list[RequirementMatch]
    experience_matches: list[ExperienceMatch]
    work_sample_matches: list[WorkSampleMatch]
    matched_required: list[str]
    missing_required: list[str]
    matched_preferred: list[str]
    explanation: list[str]


# =========================================================
# GENERIC LANGUAGE / CONCEPT LAYER
# =========================================================

STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "been", "being",
    "by", "for", "from", "has", "have", "having", "in", "into",
    "is", "it", "its", "of", "on", "or", "our", "that", "the",
    "their", "this", "to", "using", "with", "will", "you", "your",
    "we", "they", "them", "role", "job", "candidate", "required",
    "preferred", "minimum", "qualification", "qualifications",
    "responsibility", "responsibilities", "ability", "knowledge",
    "proficiency", "experience", "years", "year", "months", "month",
    "must", "have", "currently", "following", "completion", "including",
    "related", "field", "environment", "appropriate", "new", "current",
}

ACTION_ROOTS = {
    "analyze", "architect", "build", "collaborate", "communicate",
    "configure", "coordinate", "create", "deliver", "deploy", "design",
    "develop", "evaluate", "implement", "improve", "lead", "maintain",
    "manage", "monitor", "optimize", "prepare", "research", "review",
    "solve", "support", "test", "track", "validate",
}

CONCEPTS: dict[str, set[str]] = {
    "software engineering": {
        "software engineering", "software development", "software engineer",
        "software developer", "application development", "full-stack",
        "full stack", "backend", "frontend", "api", "apis",
    },
    "programming": {
        "programming", "coding", "python", "java", "javascript",
        "typescript", "c++", "c#", "golang", "ruby", "kotlin", "swift",
    },
    "object oriented programming": {
        "object oriented programming", "object-oriented programming",
        "oop", "java", "c++", "c#", "kotlin",
    },
    "computer science fundamentals": {
        "computer science fundamentals", "cs fundamentals", "data structures",
        "algorithms", "dsa", "daa", "operating systems", "dbms",
        "computer networks", "object-oriented programming", "oop",
    },
    "data structures and algorithms": {
        "data structures and algorithms", "data structures & algorithms",
        "data structures", "algorithms", "dsa", "daa",
    },
    "data analysis": {
        "data analysis", "data analytics", "analytics", "analyze data",
        "analyzing data", "dataset analysis", "data insights", "pandas",
    },
    "sql analysis": {
        "sql", "sql queries", "postgresql", "mysql", "relational database",
        "database querying",
    },
    "reporting and dashboards": {
        "reporting", "dashboard", "dashboards", "business intelligence",
        "data visualization", "visualization", "report generation",
    },
    "spreadsheet analysis": {
        "excel", "microsoft excel", "spreadsheet", "spreadsheets",
        "google sheets", "spreadsheet analysis",
    },
    "backend systems": {
        "backend", "backend services", "rest api", "rest apis", "api",
        "apis", "serverless", "microservices", "services",
    },
    "cloud systems": {
        "cloud", "cloud-native", "aws", "gcp", "azure", "deployment",
        "infrastructure", "serverless",
    },
    "reliability": {
        "reliability", "availability", "observability", "monitoring",
        "fault-tolerant", "fault tolerant", "performance", "efficiency",
        "scalable", "scalability",
    },
    "problem solving": {
        "problem solving", "problem-solving", "solve complex problems",
        "troubleshooting", "debugging",
    },
    "collaboration": {
        "collaboration", "collaborate", "teamwork", "cooperative team",
        "cross-functional", "stakeholder", "stakeholder management",
    },
    "time management": {
        "time management", "prioritization", "planning", "deadline",
        "delivery", "execution",
    },
    "financial analysis": {
        "financial analysis", "financial modeling", "variance analysis",
        "forecasting", "budgeting",
    },
    "accounting": {
        "accounting", "gaap", "ledger", "reconciliation", "audit",
    },
    "digital marketing": {
        "digital marketing", "performance marketing", "paid marketing",
        "growth marketing",
    },
    "campaign management": {
        "campaign management", "campaign planning", "campaign execution",
        "marketing campaign", "marketing campaigns",
    },
    "content strategy": {
        "content strategy", "content marketing", "copywriting",
        "content creation",
    },
    "brand marketing": {
        "brand marketing", "branding", "brand campaign", "brand campaigns",
        "brand strategy",
    },
    "marketing analytics": {
        "marketing analytics", "campaign analytics", "audience analytics",
        "google analytics", "campaign performance", "audience metrics",
    },
    "seo": {
        "seo", "search engine optimization",
    },
    "sales": {
        "sales", "business development", "lead generation",
        "account management", "crm", "negotiation",
    },
    "human resources": {
        "human resources", "hr", "recruitment", "recruiting",
        "talent acquisition", "onboarding", "hris",
    },
    "operations": {
        "operations", "process improvement", "vendor management",
        "procurement", "logistics", "supply chain",
    },
    "customer service": {
        "customer service", "customer support", "client service",
        "issue resolution",
    },
    "project management": {
        "project management", "project planning", "delivery management",
        "risk management", "stakeholder management",
    },
}

ROLE_TERMS = {
    "engineering": {
        "software", "engineering", "developer", "development", "backend",
        "frontend", "full-stack", "api", "apis", "system", "platform",
        "application", "cloud", "deployment", "infrastructure", "technical",
        "r&d", "research", "architecture", "serverless", "database",
    },
    "data": {
        "data", "analytics", "analysis", "sql", "business intelligence",
        "research", "model", "forecasting",
    },
    "finance": {
        "finance", "financial", "accounting", "audit", "forecasting",
        "budgeting", "valuation", "reconciliation",
    },
    "marketing": {
        "marketing", "campaign", "seo", "content", "brand", "growth",
        "audience", "conversion",
    },
    "sales": {
        "sales", "account", "business development", "client", "crm",
        "revenue", "lead",
    },
    "human_resources": {
        "human resources", "hr", "recruitment", "talent", "people",
        "onboarding",
    },
    "operations": {
        "operations", "process", "vendor", "procurement", "logistics",
        "supply chain", "workflow",
    },
    "design": {
        "design", "designer", "ux", "ui", "prototype", "visual",
    },
    "healthcare": {
        "clinical", "patient", "medical", "healthcare", "nursing",
        "care",
    },
    "legal": {
        "legal", "law", "contract", "compliance", "counsel",
        "regulatory",
    },
    "product": {
        "product", "roadmap", "stakeholder", "requirements", "feature",
    },
}


# =========================================================
# BASIC HELPERS
# =========================================================

def _clean(value: str | None) -> str:
    if not value:
        return ""

    value = value.lower()
    value = value.replace("–", "-").replace("—", "-")
    value = re.sub(r"\s+", " ", value)

    return value.strip()


def _stem(token: str) -> str:
    """
    Tiny dependency-free stemmer for matching resume/JD action wording.
    It intentionally stays conservative.
    """
    token = token.lower().strip()

    irregular = {
        "built": "build",
        "led": "lead",
        "made": "make",
        "ran": "run",
        "written": "write",
        "wrote": "write",
    }

    if token in irregular:
        return irregular[token]

    for suffix in ("ing", "ed", "es", "s"):
        if (
            token.endswith(suffix)
            and len(token) - len(suffix) >= 4
        ):
            base = token[:-len(suffix)]

            # configured -> configure, managed -> manage
            if suffix == "ed" and base.endswith("at"):
                return base + "e"

            return base

    return token


def _tokens(text: str) -> set[str]:
    result: set[str] = set()

    for token in re.findall(
        r"[a-zA-Z][a-zA-Z0-9+#.&/-]{1,}",
        _clean(text),
    ):
        if token in STOPWORDS or len(token) <= 2:
            continue

        result.add(
            _stem(token)
        )

    return result


def _dedupe(values: Iterable[str]) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()

    for value in values:
        clean = value.strip()

        if not clean:
            continue

        key = _clean(clean)

        if key in seen:
            continue

        seen.add(key)
        result.append(clean)

    return result


def _contains_phrase(
    text: str,
    phrase: str,
) -> bool:
    text = _clean(text)
    phrase = _clean(phrase)

    if not phrase:
        return False

    if len(phrase) <= 4:
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


def _action_roots(text: str) -> set[str]:
    stems = _tokens(text)

    return {
        action
        for action in ACTION_ROOTS
        if action in stems
    }


def _concepts_in_text(
    text: str,
) -> dict[str, list[str]]:
    found: dict[
        str,
        list[str],
    ] = {}

    for concept, aliases in CONCEPTS.items():
        hits = sorted(
            alias
            for alias in aliases
            if _contains_phrase(
                text,
                alias,
            )
        )

        if hits:
            found[concept] = hits

    return found


def _target_concepts(
    text: str,
) -> set[str]:
    return set(
        _concepts_in_text(
            text
        )
    )


# =========================================================
# TEXT SIMILARITY
# =========================================================

def _continuous_similarity(
    target: str,
    evidence: str,
) -> tuple[
    float,
    list[str],
]:
    """
    Explainable continuous similarity:
      45% concept coverage
      35% target-token recall
      15% action overlap
       5% direct phrase bonus

    Unlike v1-v3 there are no 24/78/88 floors or buckets.
    """
    target_clean = _clean(
        target
    )

    evidence_clean = _clean(
        evidence
    )

    if (
        not target_clean
        or not evidence_clean
    ):
        return 0.0, []

    target_tokens = _tokens(
        target_clean
    )

    evidence_tokens = _tokens(
        evidence_clean
    )

    token_hits = sorted(
        target_tokens
        & evidence_tokens
    )

    token_recall = (
        len(token_hits)
        / len(target_tokens)
        if target_tokens
        else 0.0
    )

    target_concepts = _target_concepts(
        target_clean
    )

    evidence_concepts = set(
        _concepts_in_text(
            evidence_clean
        )
    )

    concept_hits = sorted(
        target_concepts
        & evidence_concepts
    )

    concept_coverage = (
        len(concept_hits)
        / len(target_concepts)
        if target_concepts
        else 0.0
    )

    target_actions = _action_roots(
        target_clean
    )

    evidence_actions = _action_roots(
        evidence_clean
    )

    action_hits = sorted(
        target_actions
        & evidence_actions
    )

    action_coverage = (
        len(action_hits)
        / len(target_actions)
        if target_actions
        else 0.0
    )

    direct = (
        1.0
        if _contains_phrase(
            evidence_clean,
            target_clean,
        )
        else 0.0
    )

    # If the target has no concepts/actions, lexical evidence gets more weight.
    if not target_concepts and not target_actions:
        score = (
            token_recall * 0.90
            + direct * 0.10
        )

    elif not target_concepts:
        score = (
            token_recall * 0.65
            + action_coverage * 0.25
            + direct * 0.10
        )

    else:
        score = (
            concept_coverage * 0.45
            + token_recall * 0.35
            + action_coverage * 0.15
            + direct * 0.05
        )

    # Small accidental overlaps should stay small.
    if (
        concept_coverage == 0
        and action_coverage == 0
        and token_recall < 0.25
    ):
        score *= 0.45

    hits = _dedupe([
        *concept_hits,
        *action_hits,
        *token_hits,
    ])

    return (
        min(
            max(
                score,
                0.0,
            ),
            1.0,
        ),
        hits[:12],
    )


def _best_unit_similarity(
    target: str,
    evidence_units: list[str],
) -> tuple[
    float,
    list[str],
]:
    best_score = 0.0
    best_hits: list[str] = []

    for unit in evidence_units:
        score, hits = (
            _continuous_similarity(
                target,
                unit,
            )
        )

        if score > best_score:
            best_score = score
            best_hits = hits

    return best_score, best_hits


# =========================================================
# RESUME EVIDENCE BUILDERS
# =========================================================

def _resume_full_text(
    resume: CanonicalResume,
) -> str:
    parts: list[str] = [
        resume.summary or "",
        *resume.competencies,
        *resume.tools,
        *resume.achievements,
        *resume.publications,
        *resume.languages,
    ]

    for item in resume.experience:
        parts.extend(
            _experience_units(
                item
            )
        )

    for item in resume.education:
        parts.extend([
            item.qualification or "",
            item.field or "",
            item.institution or "",
            item.start_date or "",
            item.end_date or "",
        ])

    for item in resume.credentials:
        parts.extend([
            item.name,
            item.issuer or "",
        ])

    for item in resume.work_samples:
        parts.extend(
            _work_sample_units(
                item
            )
        )

    parts.extend(
        evidence.source_text
        for evidence
        in resume.evidence
    )

    # Raw text is fallback evidence, not the sole source.
    parts.append(
        resume.raw_text
    )

    return " ".join(
        part
        for part in parts
        if part
    )


def _experience_units(item) -> list[str]:
    units = [
        " ".join(
            part
            for part in [
                item.title or "",
                item.organization or "",
            ]
            if part
        ),
        *item.responsibilities,
        *item.achievements,
    ]

    if item.description:
        units.append(
            item.description
        )

    if item.tools:
        units.append(
            " ".join(
                item.tools
            )
        )

    if item.competencies:
        units.append(
            " ".join(
                item.competencies
            )
        )

    return _dedupe([
        unit
        for unit in units
        if unit
    ])


def _work_sample_units(item) -> list[str]:
    units = [
        item.name or "",
        item.description,
        *item.outcomes,
    ]

    if item.tools:
        units.append(
            " ".join(
                item.tools
            )
        )

    if item.competencies:
        units.append(
            " ".join(
                item.competencies
            )
        )

    return _dedupe([
        unit
        for unit in units
        if unit
    ])


# =========================================================
# DURATION WITHOUT DOUBLE-COUNTING OVERLAPS
# =========================================================

MONTHS = {
    "jan": 1, "january": 1,
    "feb": 2, "february": 2,
    "mar": 3, "march": 3,
    "apr": 4, "april": 4,
    "may": 5,
    "jun": 6, "june": 6,
    "jul": 7, "july": 7,
    "aug": 8, "august": 8,
    "sep": 9, "sept": 9, "september": 9,
    "oct": 10, "october": 10,
    "nov": 11, "november": 11,
    "dec": 12, "december": 12,
}


def _parse_month(
    value: str | None,
) -> tuple[int, int] | None:
    if not value:
        return None

    clean = _clean(
        value
    )

    if clean in {
        "present",
        "current",
        "ongoing",
        "now",
    }:
        today = date.today()
        return today.year, today.month

    numeric = re.search(
        r"\b(0?[1-9]|1[0-2])[/.-](19\d{2}|20\d{2})\b",
        clean,
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
            in MONTHS
        )
        + r")\.?\s+(19\d{2}|20\d{2})\b",
        clean,
    )

    if month_year:
        return (
            int(
                month_year.group(2)
            ),
            MONTHS[
                month_year.group(1)
            ],
        )

    year_only = re.search(
        r"\b(19\d{2}|20\d{2})\b",
        clean,
    )

    if year_only:
        return (
            int(
                year_only.group(1)
            ),
            1,
        )

    return None


def _month_index(
    year: int,
    month: int,
) -> int:
    return year * 12 + month


def _unique_experience_months(
    resume: CanonicalResume,
    *,
    relevant_to: str | None = None,
) -> int:
    """
    Count unique calendar months so overlapping internships are not added twice.
    """
    months: set[int] = set()

    for item in resume.experience:
        units = _experience_units(
            item
        )

        if relevant_to:
            relevance, _ = (
                _best_unit_similarity(
                    relevant_to,
                    units,
                )
            )

            family_signal = (
                _role_family_density(
                    "engineering",
                    " ".join(
                        units
                    ),
                )[0]
                if (
                    "programming"
                    in _clean(
                        relevant_to
                    )
                    or "software"
                    in _clean(
                        relevant_to
                    )
                )
                else 0.0
            )

            if (
                relevance < 0.20
                and family_signal < 0.25
            ):
                continue

        start = _parse_month(
            item.start_date
        )

        end = _parse_month(
            "present"
            if item.is_current
            else item.end_date
        )

        if not start or not end:
            continue

        start_index = _month_index(
            *start
        )

        end_index = _month_index(
            *end
        )

        if end_index < start_index:
            continue

        for value in range(
            start_index,
            end_index + 1,
        ):
            months.add(
                value
            )

    return len(
        months
    )


# =========================================================
# REQUIREMENT MATCHING
# =========================================================

NUMBER_WORDS = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
}


def _education_match(
    requirement: str,
    resume: CanonicalResume,
) -> tuple[
    float,
    list[str],
]:
    """
    Match education using two independent signals:

    1. Degree level
       Bachelor's / Master's / PhD / unrestricted degree.

    2. Required discipline
       CS/Engineering, Finance, Marketing, Business, etc.

    A candidate must not receive near-full credit merely for having the
    correct degree level when the JD explicitly requires another discipline.
    """

    req = _clean(
        requirement
    )

    best_score = 0.0
    best_evidence: list[str] = []

    # =====================================================
    # DEGREE LEVEL
    # =====================================================

    requires_bachelor = bool(
        re.search(
            r"\b("
            r"bachelor(?:'s)?"
            r"|b\.?\s*tech"
            r"|btech"
            r"|b\.?\s*e\.?"
            r"|undergraduate"
            r")\b",
            req,
        )
    )

    requires_master = bool(
        re.search(
            r"\b("
            r"master(?:'s)?"
            r"|m\.?\s*tech"
            r"|mtech"
            r"|mba"
            r"|msc"
            r"|m\.sc"
            r")\b",
            req,
        )
    )

    requires_phd = bool(
        re.search(
            r"\b("
            r"phd"
            r"|ph\.?d\.?"
            r"|doctorate"
            r")\b",
            req,
        )
    )

    # =====================================================
    # DISCIPLINE GROUPS
    # =====================================================

    FIELD_GROUPS = {
        "computer_science": {
            "computer science",
            "computer engineering",
            "software engineering",
            "information technology",
            "information systems",
            "computing",
            "artificial intelligence",
            "data science",
        },

        "engineering": {
            "engineering",
            "computer engineering",
            "electrical engineering",
            "electronics engineering",
            "mechanical engineering",
            "civil engineering",
        },

        "finance": {
            "finance",
            "financial",
            "accounting",
            "economics",
            "commerce",
        },

        "business": {
            "business",
            "business administration",
            "management",
            "commerce",
        },

        "marketing": {
            "marketing",
            "advertising",
            "branding",
            "communications",
        },

        "design": {
            "design",
            "product design",
            "interaction design",
            "visual design",
            "user experience",
        },

        "healthcare": {
            "medicine",
            "medical",
            "nursing",
            "pharmacy",
            "healthcare",
            "health sciences",
        },

        "legal": {
            "law",
            "legal studies",
            "juris doctor",
            "llb",
            "llm",
        },
    }

    required_groups: set[str] = set()

    for group, aliases in FIELD_GROUPS.items():
        if any(
            alias in req
            for alias in aliases
        ):
            required_groups.add(
                group
            )

    # =====================================================
    # SCORE EACH EDUCATION ENTRY
    # =====================================================

    for item in resume.education:
        qualification = _clean(
            item.qualification
        )

        field = _clean(
            item.field
        )

        combined = (
            qualification
            + " "
            + field
        ).strip()

        # ---------------------------------------------
        # Degree-level score
        # ---------------------------------------------

        candidate_bachelor = bool(
            re.search(
                r"\b("
                r"bachelor"
                r"|b\.?\s*tech"
                r"|btech"
                r"|b\.?\s*e\.?"
                r")\b",
                combined,
            )
        )

        candidate_master = bool(
            re.search(
                r"\b("
                r"master"
                r"|m\.?\s*tech"
                r"|mtech"
                r"|mba"
                r"|msc"
                r"|m\.sc"
                r")\b",
                combined,
            )
        )

        candidate_phd = bool(
            re.search(
                r"\b("
                r"phd"
                r"|ph\.?d\.?"
                r"|doctorate"
                r")\b",
                combined,
            )
        )

        if requires_phd:
            if candidate_phd:
                degree_score = 1.0
            elif candidate_master:
                degree_score = 0.20
            elif candidate_bachelor:
                degree_score = 0.10
            else:
                degree_score = 0.0

        elif requires_master:
            if (
                candidate_master
                or candidate_phd
            ):
                degree_score = 1.0
            elif candidate_bachelor:
                degree_score = 0.20
            else:
                degree_score = 0.0

        elif requires_bachelor:
            if (
                candidate_bachelor
                or candidate_master
                or candidate_phd
            ):
                degree_score = 1.0
            else:
                degree_score = 0.0

        else:
            # Requirement says only "degree" or has no strict level.
            degree_score = (
                1.0
                if (
                    candidate_bachelor
                    or candidate_master
                    or candidate_phd
                )
                else 0.50
            )

        # ---------------------------------------------
        # Discipline score
        # ---------------------------------------------

        if not required_groups:
            # Example:
            # "Bachelor's degree or equivalent practical experience."
            field_score = 1.0

        else:
            candidate_groups: set[str] = set()

            for group, aliases in FIELD_GROUPS.items():
                if any(
                    alias in combined
                    for alias in aliases
                ):
                    candidate_groups.add(
                        group
                    )

            exact_field_match = bool(
                required_groups
                & candidate_groups
            )

            related_engineering_match = (
                (
                    "engineering"
                    in required_groups
                    and "computer_science"
                    in candidate_groups
                )
                or (
                    "computer_science"
                    in required_groups
                    and "engineering"
                    in candidate_groups
                )
            )

            if exact_field_match:
                field_score = 1.0

            elif related_engineering_match:
                field_score = 0.90

            else:
                # Correct level, unrelated discipline.
                field_score = 0.10

        # =================================================
        # FINAL EDUCATION SCORE
        # =================================================

        if required_groups:
            # When the JD explicitly specifies a discipline, field fit is
            # dominant. Merely having the right degree LEVEL must not make a
            # CS candidate look eligible for Finance/Accounting, Nursing, Law,
            # etc.
            score = (
                degree_score * 0.25
                + field_score * 0.75
            )

        else:
            score = degree_score

        if score > best_score:
            best_score = score

            best_evidence = [
                " | ".join(
                    value
                    for value in [
                        item.qualification or "",
                        item.field or "",
                        item.institution or "",
                        item.end_date or "",
                    ]
                    if value
                )
            ]

    return (
        min(
            best_score,
            1.0,
        ),
        best_evidence,
    )

def _semester_remaining_match(
    requirement: str,
    resume: CanonicalResume,
) -> tuple[
    float,
    list[str],
]:
    lower = _clean(
        requirement
    )

    if (
        "semester remaining"
        not in lower
        and "term remaining"
        not in lower
    ):
        return 0.0, []

    today = date.today()

    for item in resume.education:
        end = _parse_month(
            item.end_date
        )

        if item.is_current:
            return (
                0.98,
                [
                    "Current education: "
                    + " | ".join(
                        value
                        for value in [
                            item.qualification or "",
                            item.field or "",
                            item.institution or "",
                            item.end_date or "",
                        ]
                        if value
                    )
                ],
            )

        if end:
            end_index = _month_index(
                *end
            )

            current_index = _month_index(
                today.year,
                today.month,
            )

            # More than ~4 months remaining is safely at least one term.
            if (
                end_index
                - current_index
                >= 4
            ):
                return (
                    0.98,
                    [
                        "Education end date supports remaining-term eligibility: "
                        + (
                            item.end_date
                            or ""
                        )
                    ],
                )

    return (
        0.35,
        [
            "Could not verify that at least one academic term remains."
        ],
    )


def _experience_requirement_match(
    requirement: str,
    resume: CanonicalResume,
) -> tuple[
    float,
    list[str],
]:
    req = _clean(
        requirement
    )

    required_months: int | None = None

    years_match = re.search(
        r"\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)"
        r"\+?\s+years?\b",
        req,
    )

    months_match = re.search(
        r"\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)"
        r"\+?\s+months?\b",
        req,
    )

    if years_match:
        raw = years_match.group(
            1
        )

        years = (
            int(raw)
            if raw.isdigit()
            else NUMBER_WORDS.get(
                raw,
                0,
            )
        )

        required_months = (
            years * 12
        )

    elif months_match:
        raw = months_match.group(
            1
        )

        required_months = (
            int(raw)
            if raw.isdigit()
            else NUMBER_WORDS.get(
                raw,
                0,
            )
        )

    relevant_months = (
        _unique_experience_months(
            resume,
            relevant_to=
                requirement,
        )
    )

    # For requirements without an explicit duration, having structured
    # experience should receive meaningful credit. The old 0.70 baseline was
    # too conservative for internship/new-grad matching.
    duration_score = (
        0.82
        if resume.experience
        else 0.0
    )

    if required_months:
        duration_score = min(
            relevant_months
            / required_months,
            1.0,
        )

    structural_score = 0.0
    structural_evidence: list[str] = []

    generic_experience_markers = (
        "internship",
        "internships",
        "multi-person",
        "team project",
        "team projects",
        "open source",
        "professional experience",
        "previous experience",
    )

    if any(
        marker in req
        for marker in generic_experience_markers
    ):
        if resume.experience:
            structural_score = max(
                structural_score,
                0.90,
            )
            structural_evidence.append(
                f"Structured resume contains {len(resume.experience)} experience entr"
                + ("y." if len(resume.experience) == 1 else "ies.")
            )

        if resume.work_samples:
            structural_score = max(
                structural_score,
                0.78,
            )
            structural_evidence.append(
                f"Structured resume contains {len(resume.work_samples)} project/work sample"
                + (". " if len(resume.work_samples) == 1 else "s.")
            )

    semantic_score, hits = (
        _continuous_similarity(
            requirement,
            _resume_full_text(
                resume
            ),
        )
    )

    # Do not claim full years when dates overlap. For generic internship /
    # project requirements, structured experience is itself strong evidence.
    if structural_score > 0:
        score = max(
            (
                duration_score * 0.25
                + semantic_score * 0.45
                + structural_score * 0.30
            ),
            structural_score * 0.52,
        )
    else:
        score = (
            duration_score * 0.40
            + semantic_score * 0.60
        )

    evidence = [
        (
            "Unique relevant structured experience: "
            f"{relevant_months} months."
        ),
        *structural_evidence,
    ]

    if hits:
        evidence.append(
            "Matched concepts: "
            + ", ".join(
                hits[:8]
            )
        )

    return (
        min(
            score,
            1.0,
        ),
        evidence,
    )


def _competency_requirement_match(
    requirement: str,
    resume: CanonicalResume,
) -> tuple[
    float,
    list[str],
]:
    resume_text = _resume_full_text(
        resume
    )

    target_concepts = _target_concepts(
        requirement
    )

    resume_concepts = set(
        _concepts_in_text(
            resume_text
        )
    )

    concept_hits = sorted(
        target_concepts
        & resume_concepts
    )

    concept_coverage = (
        len(
            concept_hits
        )
        / len(
            target_concepts
        )
        if target_concepts
        else 0.0
    )

    similarity, hits = (
        _continuous_similarity(
            requirement,
            resume_text,
        )
    )

    # Explicit canonical competencies get an additional evidence signal.
    explicit_text = " ".join(
        resume.competencies
    )

    explicit_similarity, explicit_hits = (
        _continuous_similarity(
            requirement,
            explicit_text,
        )
    )

    score = max(
        similarity,
        (
            concept_coverage * 0.70
            + explicit_similarity * 0.30
        ),
    )

    # Broad technology-family synonym support for AI-tool requirements.
    # This is intentionally generic (not company-specific).
    requirement_clean = _clean(
        requirement
    )
    resume_clean = _clean(
        resume_text
    )

    ai_requirement_markers = (
        "ai",
        "artificial intelligence",
        "generative ai",
        "genai",
        "llm",
        "large language model",
    )

    ai_resume_markers = (
        "ai",
        "artificial intelligence",
        "generative ai",
        "genai",
        "llm",
        "gemini",
        "openai",
        "machine learning",
        "language model",
    )

    if (
        any(
            _contains_phrase(
                requirement_clean,
                marker,
            )
            for marker
            in ai_requirement_markers
        )
        and any(
            _contains_phrase(
                resume_clean,
                marker,
            )
            for marker
            in ai_resume_markers
        )
    ):
        score = max(
            score,
            0.60,
        )

    evidence: list[str] = []

    if concept_hits:
        evidence.append(
            "Matched concepts: "
            + ", ".join(
                concept_hits
            )
        )

    if explicit_hits:
        evidence.append(
            "Explicit competency evidence: "
            + ", ".join(
                explicit_hits[:8]
            )
        )

    for item in resume.evidence:
        local_score, _ = (
            _continuous_similarity(
                requirement,
                item.source_text,
            )
        )

        if local_score >= 0.50:
            evidence.append(
                item.source_text
            )

    return (
        min(
            score,
            1.0,
        ),
        _dedupe(
            evidence
        )[:6],
    )


def _match_requirement(
    requirement: CanonicalRequirement,
    resume: CanonicalResume,
) -> RequirementMatch:
    text = (
        requirement.source_text
        or requirement.name
    )

    semester_score, semester_evidence = (
        _semester_remaining_match(
            text,
            resume,
        )
    )

    if semester_score > 0:
        score = semester_score
        evidence = semester_evidence

    elif (
        requirement.category
        == "education"
    ):
        score, evidence = (
            _education_match(
                text,
                resume,
            )
        )

    elif (
        requirement.category
        == "eligibility"
        and any(
            marker in _clean(
                text
            )
            for marker in (
                "bachelor",
                "master",
                "degree",
                "currently pursuing",
            )
        )
    ):
        score, evidence = (
            _education_match(
                text,
                resume,
            )
        )

    elif (
        requirement.category
        == "experience"
    ):
        score, evidence = (
            _experience_requirement_match(
                text,
                resume,
            )
        )

    else:
        score, evidence = (
            _competency_requirement_match(
                text,
                resume,
            )
        )

    # Consumer-facing matching should not require research-grade evidence
    # confidence before giving credit. Strong evidence is still exposed in
    # explanations, but moderate semantic/keyword alignment counts toward fit.
    threshold = (
        0.42
        if requirement.level
        == "required"
        else 0.38
    )

    return RequirementMatch(
        requirement=(
            requirement.source_text
            or requirement.name
        ),
        level=
            requirement.level,
        category=
            requirement.category,
        score=round(
            score * 100,
            2,
        ),
        matched=
            score >= threshold,
        evidence=
            evidence,
    )


# =========================================================
# ROLE / ENTRY RELEVANCE
# =========================================================

def _role_family_density(
    role_family: str | None,
    text: str,
) -> tuple[
    float,
    list[str],
]:
    terms = ROLE_TERMS.get(
        role_family or "",
        set(),
    )

    if not terms:
        return 0.0, []

    hits = sorted(
        term
        for term in terms
        if _contains_phrase(
            text,
            term,
        )
    )

    # Smooth, continuous saturation.
    score = (
        1.0
        - math.exp(
            -0.34
            * len(
                hits
            )
        )
    )

    return (
        min(
            score,
            1.0,
        ),
        hits[:12],
    )


def _job_evidence_targets(
    job: CanonicalJob,
) -> list[str]:
    """
    Atomic evidence targets used for experiences/work samples.
    Qualification-only constraints are excluded here.
    """
    targets: list[str] = []

    for requirement in job.requirements:
        if requirement.category in {
            "education",
            "eligibility",
            "license",
            "certification",
            "language",
        }:
            continue

        targets.append(
            requirement.source_text
            or requirement.name
        )

    targets.extend(
        job.responsibilities
    )

    return _dedupe(
        targets
    )


def _top_target_alignment(
    targets: list[str],
    evidence_units: list[str],
    *,
    limit: int = 4,
) -> tuple[
    float,
    list[str],
]:
    scored: list[
        tuple[float, str, list[str]]
    ] = []

    for target in targets:
        score, hits = (
            _best_unit_similarity(
                target,
                evidence_units,
            )
        )

        scored.append(
            (
                score,
                target,
                hits,
            )
        )

    ranked = sorted(
        scored,
        key=lambda item: item[0],
        reverse=True,
    )[:limit]

    if not ranked:
        return 0.0, []

    # Weighted top-k avoids punishing one entry for not covering the whole JD.
    weights = [
        1.00,
        0.82,
        0.68,
        0.56,
    ][:len(
        ranked
    )]

    score = (
        sum(
            item[0] * weight
            for item, weight
            in zip(
                ranked,
                weights,
            )
        )
        / sum(
            weights
        )
    )

    hits: list[str] = []

    for value, target, local_hits in ranked:
        if value >= 0.20:
            hits.append(
                target
            )
            hits.extend(
                local_hits
            )

    return (
        score,
        _dedupe(
            hits
        )[:14],
    )


def _action_alignment(
    job: CanonicalJob,
    evidence_text: str,
) -> tuple[
    float,
    list[str],
]:
    job_actions = _action_roots(
        " ".join(
            job.responsibilities
        )
    )

    evidence_actions = (
        _action_roots(
            evidence_text
        )
    )

    if not job_actions:
        return 0.0, []

    hits = sorted(
        job_actions
        & evidence_actions
    )

    score = (
        len(
            hits
        )
        / len(
            job_actions
        )
    )

    return (
        min(
            score,
            1.0,
        ),
        hits,
    )


def _score_experience_entries(
    job: CanonicalJob,
    resume: CanonicalResume,
) -> tuple[
    float,
    list[ExperienceMatch],
]:
    if not resume.experience:
        return 0.0, []

    targets = _job_evidence_targets(
        job
    )

    entries: list[
        ExperienceMatch
    ] = []

    for index, item in enumerate(
        resume.experience
    ):
        units = _experience_units(
            item
        )

        full_text = " ".join(
            units
        )

        family_score, family_hits = (
            _role_family_density(
                job.role_family,
                full_text,
            )
        )

        target_score, target_hits = (
            _top_target_alignment(
                targets,
                units,
                limit=4,
            )
        )

        title_score, title_hits = (
            _continuous_similarity(
                job.title or "",
                item.title or "",
            )
        )

        action_score, action_hits = (
            _action_alignment(
                job,
                full_text,
            )
        )

        raw = (
            family_score * 0.35
            + target_score * 0.35
            + title_score * 0.15
            + action_score * 0.15
        )

        reasons: list[str] = []

        if family_score >= 0.35:
            reasons.append(
                "Strong role-family evidence."
            )
        elif family_score >= 0.18:
            reasons.append(
                "Transferable role-family evidence."
            )

        if target_score >= 0.35:
            reasons.append(
                "Demonstrates multiple target requirements/duties."
            )
        elif target_score >= 0.20:
            reasons.append(
                "Demonstrates some target requirements/duties."
            )

        if title_score >= 0.35:
            reasons.append(
                "Title aligns with the target role."
            )

        if action_score >= 0.30:
            reasons.append(
                "Work actions align with the target role."
            )

        entries.append(
            ExperienceMatch(
                index=index,
                title=item.title,
                organization=
                    item.organization,
                score=round(
                    min(
                        raw,
                        1.0,
                    ) * 100,
                    2,
                ),
                matched_terms=
                    _dedupe([
                        *family_hits,
                        *target_hits,
                        *title_hits,
                        *action_hits,
                    ])[:14],
                reasons=
                    reasons,
            )
        )

    ranked = sorted(
        (
            entry.score
            for entry
            in entries
        ),
        reverse=True,
    )

    top = ranked[:3]

    weights = [
        0.50,
        0.30,
        0.20,
    ][:len(
        top
    )]

    aggregate = (
        sum(
            score * weight
            for score, weight
            in zip(
                top,
                weights,
            )
        )
        / sum(
            weights
        )
    )

    return (
        round(
            aggregate,
            2,
        ),
        entries,
    )


def _score_work_samples(
    job: CanonicalJob,
    resume: CanonicalResume,
) -> tuple[
    float,
    list[WorkSampleMatch],
]:
    if not resume.work_samples:
        return 0.0, []

    targets = _job_evidence_targets(
        job
    )

    entries: list[
        WorkSampleMatch
    ] = []

    for index, item in enumerate(
        resume.work_samples
    ):
        units = _work_sample_units(
            item
        )

        full_text = " ".join(
            units
        )

        family_score, family_hits = (
            _role_family_density(
                job.role_family,
                full_text,
            )
        )

        target_score, target_hits = (
            _top_target_alignment(
                targets,
                units,
                limit=4,
            )
        )

        action_score, action_hits = (
            _action_alignment(
                job,
                full_text,
            )
        )

        raw = (
            family_score * 0.42
            + target_score * 0.43
            + action_score * 0.15
        )

        reasons: list[str] = []

        if family_score >= 0.35:
            reasons.append(
                "Strong role-family work evidence."
            )
        elif family_score >= 0.18:
            reasons.append(
                "Transferable role-family work evidence."
            )

        if target_score >= 0.35:
            reasons.append(
                "Demonstrates multiple target requirements/duties."
            )
        elif target_score >= 0.20:
            reasons.append(
                "Demonstrates some target requirements/duties."
            )

        if action_score >= 0.30:
            reasons.append(
                "Project/work actions align with target duties."
            )

        entries.append(
            WorkSampleMatch(
                index=index,
                name=item.name,
                sample_type=
                    item.sample_type,
                score=round(
                    min(
                        raw,
                        1.0,
                    ) * 100,
                    2,
                ),
                matched_terms=
                    _dedupe([
                        *family_hits,
                        *target_hits,
                        *action_hits,
                    ])[:14],
                reasons=
                    reasons,
            )
        )

    ranked = sorted(
        (
            entry.score
            for entry
            in entries
        ),
        reverse=True,
    )

    top = ranked[:3]

    weights = [
        0.50,
        0.30,
        0.20,
    ][:len(
        top
    )]

    aggregate = (
        sum(
            score * weight
            for score, weight
            in zip(
                top,
                weights,
            )
        )
        / sum(
            weights
        )
    )

    return (
        round(
            aggregate,
            2,
        ),
        entries,
    )


# =========================================================
# GLOBAL RESPONSIBILITY ALIGNMENT
# =========================================================

def _score_responsibilities(
    job: CanonicalJob,
    resume: CanonicalResume,
) -> float:
    if not job.responsibilities:
        return 0.0

    evidence_units: list[str] = []

    for item in resume.experience:
        evidence_units.extend(
            _experience_units(
                item
            )
        )

    for item in resume.work_samples:
        evidence_units.extend(
            _work_sample_units(
                item
            )
        )

    if not evidence_units:
        return 0.0

    scores: list[float] = []

    for responsibility in (
        job.responsibilities
    ):
        best, _ = (
            _best_unit_similarity(
                responsibility,
                evidence_units,
            )
        )

        scores.append(
            best * 100
        )

    ranked = sorted(
        scores,
        reverse=True,
    )[:5]

    if not ranked:
        return 0.0

    weights = [
        1.00,
        0.88,
        0.76,
        0.66,
        0.58,
    ][:len(
        ranked
    )]

    return round(
        sum(
            score * weight
            for score, weight
            in zip(
                ranked,
                weights,
            )
        )
        / sum(
            weights
        ),
        2,
    )


# =========================================================
# ELIGIBILITY
# =========================================================

def _score_eligibility(
    job: CanonicalJob,
    resume: CanonicalResume,
) -> float:
    rows = [
        requirement
        for requirement
        in job.requirements
        if requirement.category
        in {
            "education",
            "eligibility",
            "certification",
            "license",
            "language",
        }
    ]

    if not rows:
        return 0.0

    scores = [
        _match_requirement(
            requirement,
            resume,
        ).score
        for requirement
        in rows
    ]

    return round(
        sum(
            scores
        )
        / len(
            scores
        ),
        2,
    )


# =========================================================
# SEMANTIC REQUIREMENT VIEWS
# =========================================================

NON_CAPABILITY_CATEGORIES = {
    "education",
    "eligibility",
    "certification",
    "license",
    "language",
}


def _capability_signal_score(
    requirement: CanonicalRequirement,
    resume: CanonicalResume,
) -> float:
    """
    Score the capability content of a requirement independently from
    experience duration.

    Example:
      "2 years of experience with software development"
    contains:
      - duration/seniority evidence
      - software-development capability evidence

    The old engine forced the sentence into one category and lost the
    capability signal completely.
    """
    text = (
        requirement.source_text
        or requirement.name
    )

    if requirement.category in NON_CAPABILITY_CATEGORIES:
        return 0.0

    # For experience requirements, remove leading duration boilerplate so
    # the capability matcher focuses on what the experience must be IN.
    capability_text = re.sub(
        r"^\\s*(?:\\d+|one|two|three|four|five|six|seven|eight|nine|ten)"
        r"\\+?\\s+(?:years?|months?)\\s+of\\s+experience\\s+(?:with|in|using|of)?\\s*",
        "",
        text,
        flags=re.IGNORECASE,
    )

    capability_text = re.sub(
        r"^\\s*experience\\s+(?:with|in|using|of)?\\s*",
        "",
        capability_text,
        flags=re.IGNORECASE,
    ).strip()

    if not capability_text:
        capability_text = text

    score, _ = _competency_requirement_match(
        capability_text,
        resume,
    )

    return round(
        score * 100,
        2,
    )


def _required_capability_score(
    job: CanonicalJob,
    resume: CanonicalResume,
) -> float:
    rows = [
        requirement
        for requirement in job.requirements
        if (
            requirement.level == "required"
            and requirement.category
            not in NON_CAPABILITY_CATEGORIES
        )
    ]

    if not rows:
        return 0.0

    scores = [
        _capability_signal_score(
            requirement,
            resume,
        )
        for requirement in rows
    ]

    return round(
        sum(scores) / len(scores),
        2,
    )


def _preferred_score(
    job: CanonicalJob,
    resume: CanonicalResume,
) -> float:
    """
    Preferred qualifications are scored as their own optional bucket,
    regardless of whether they are education, experience, or competency.
    """
    rows = [
        requirement
        for requirement in job.requirements
        if requirement.level == "preferred"
    ]

    if not rows:
        return 0.0

    scores = [
        _match_requirement(
            requirement,
            resume,
        ).score
        for requirement in rows
    ]

    return round(
        sum(scores) / len(scores),
        2,
    )


def _required_eligibility_score(
    job: CanonicalJob,
    resume: CanonicalResume,
) -> float:
    """
    Only REQUIRED gates affect eligibility.

    A preferred Master's/PhD must never reduce eligibility for a role whose
    minimum requirement is a Bachelor's degree.
    """
    rows = [
        requirement
        for requirement in job.requirements
        if (
            requirement.level == "required"
            and requirement.category
            in {
                "education",
                "eligibility",
                "certification",
                "license",
                "language",
            }
        )
    ]

    if not rows:
        return 0.0

    scores = [
        _match_requirement(
            requirement,
            resume,
        ).score
        for requirement in rows
    ]

    return round(
        sum(scores) / len(scores),
        2,
    )


# =========================================================
# MARKET-STYLE HYBRID FIT
# =========================================================

def _soft_requirement_score(
    raw_score: float,
) -> float:
    """
    Convert the internal 0..1 evidence score into a consumer-facing
    requirement-alignment score.

    Internal evidence ranking is intentionally conservative. Resume-match
    products generally give partial credit for related skills, projects and
    adjacent experience rather than turning every non-exact match into zero.
    """
    raw_value = float(raw_score)

    # RequirementMatch.score is exposed as 0..100. Normalize here so this
    # calibration function operates on 0..1 and does not saturate every
    # non-zero requirement at 100.
    if raw_value > 1.0:
        raw_value /= 100.0

    raw = max(
        0.0,
        min(
            raw_value,
            1.0,
        ),
    )

    if raw < 0.08:
        return 5.0

    if raw < 0.20:
        return 25.0 + raw * 80.0

    # 0.20 -> 48, 0.40 -> 64, 0.60 -> 80, 0.80 -> 96
    return min(
        100.0,
        32.0 + raw * 80.0,
    )


def _required_alignment_score(
    requirement_matches: list[RequirementMatch],
) -> float:
    rows = [
        row
        for row in requirement_matches
        if row.level == "required"
    ]

    if not rows:
        return 0.0

    return round(
        sum(
            _soft_requirement_score(
                row.score
            )
            for row in rows
        )
        / len(rows),
        2,
    )


def _preferred_alignment_score(
    requirement_matches: list[RequirementMatch],
) -> float:
    rows = [
        row
        for row in requirement_matches
        if row.level == "preferred"
    ]

    if not rows:
        return 0.0

    return round(
        sum(
            _soft_requirement_score(
                row.score
            )
            for row in rows
        )
        / len(rows),
        2,
    )


def _concept_coverage_score(
    job: CanonicalJob,
    resume: CanonicalResume,
) -> float:
    """
    ATS-style keyword/concept coverage.

    This deliberately uses normalized concepts rather than requiring an
    exact sentence-level evidence match.
    """
    target_parts = [
        job.title or "",
        *[
            requirement.source_text
            or requirement.name
            for requirement
            in job.requirements
        ],
        *job.responsibilities,
    ]

    target_concepts = set(
        _concepts_in_text(
            " ".join(
                target_parts
            )
        )
    )

    resume_concepts = set(
        _concepts_in_text(
            _resume_full_text(
                resume
            )
        )
    )

    if not target_concepts:
        return 0.0

    overlap = (
        target_concepts
        & resume_concepts
    )

    return round(
        min(
            100.0,
            (
                len(overlap)
                / len(target_concepts)
            )
            * 100.0,
        ),
        2,
    )


def _consumer_experience_score(
    raw_score: float,
    *,
    has_experience: bool,
) -> float:
    if not has_experience:
        return 0.0

    # Give useful partial credit for internships/projects that are clearly
    # related even when the wording is not identical to the JD.
    return round(
        min(
            100.0,
            18.0
            + max(
                0.0,
                raw_score,
            )
            * 1.05,
        ),
        2,
    )


def _consumer_responsibility_score(
    raw_score: float,
    *,
    has_responsibilities: bool,
) -> float:
    if not has_responsibilities:
        return 0.0

    return round(
        min(
            100.0,
            15.0
            + max(
                0.0,
                raw_score,
            )
            * 1.10,
        ),
        2,
    )


def _hybrid_fit_score(
    *,
    concept_score: float,
    required_alignment: float,
    capability_score: float,
    experience_score: float,
    responsibility_score: float,
    eligibility_score: float,
    preferred_score: float,
    has_experience: bool,
    has_responsibilities: bool,
    has_eligibility: bool,
    has_preferred: bool,
) -> tuple[float, dict[str, float]]:
    """
    Candidate-facing Resume Fit V2.

    Main score is intentionally broader than the strict evidence ranker:
      - 30% normalized keyword/concept coverage
      - 25% required requirement alignment
      - 15% experience alignment
      - 10% responsibility alignment
      - 10% eligibility
      - 5% preferred qualifications
      - 5% strict semantic capability signal

    Missing buckets are re-normalized rather than scored as zero.
    """
    components = {
        "concepts": (
            concept_score,
            0.30,
            True,
        ),
        "required": (
            required_alignment,
            0.30,
            True,
        ),
        "experience": (
            experience_score,
            0.17,
            has_experience,
        ),
        "responsibilities": (
            responsibility_score,
            0.05,
            has_responsibilities,
        ),
        "eligibility": (
            eligibility_score,
            0.10,
            has_eligibility,
        ),
        "preferred": (
            preferred_score,
            0.05,
            has_preferred,
        ),
        "semantic": (
            capability_score,
            0.05,
            True,
        ),
    }

    active_weight = sum(
        weight
        for _, weight, active
        in components.values()
        if active
    )

    if active_weight <= 0:
        return 0.0, {}

    weighted = sum(
        score * weight
        for score, weight, active
        in components.values()
        if active
    ) / active_weight

    debug = {
        key: round(
            value[0],
            2,
        )
        for key, value
        in components.items()
        if value[2]
    }

    return (
        round(
            max(
                0.0,
                min(
                    weighted,
                    100.0,
                ),
            ),
            2,
        ),
        debug,
    )


# =========================================================
# MAIN ENGINE
# =========================================================

def match_resume_to_job(
    resume: CanonicalResume,
    job: CanonicalJob,
) -> CanonicalMatchResult:
    requirement_matches = [
        _match_requirement(
            requirement,
            resume,
        )
        for requirement
        in job.requirements
    ]

    required_capability_requirements = [
        requirement
        for requirement in job.requirements
        if (
            requirement.level == "required"
            and requirement.category
            not in NON_CAPABILITY_CATEGORIES
        )
    ]

    preferred_requirements = [
        requirement
        for requirement in job.requirements
        if requirement.level == "preferred"
    ]

    capability_score = (
        _required_capability_score(
            job,
            resume,
        )
    )

    preferred_score = (
        _preferred_score(
            job,
            resume,
        )
    )

    (
        experience_score,
        experience_matches,
    ) = _score_experience_entries(
        job,
        resume,
    )

    (
        work_sample_score,
        work_sample_matches,
    ) = _score_work_samples(
        job,
        resume,
    )

    responsibility_score = (
        _score_responsibilities(
            job,
            resume,
        )
    )

    # Work samples are optional supporting evidence. They can strengthen
    # responsibility alignment in work-sample-heavy fields but never become
    # a universal required bucket.
    if (
        work_sample_score > 0
        and job.role_family
        in {
            "engineering",
            "data",
            "design",
            "marketing",
            "product",
            "research",
        }
    ):
        responsibility_score = min(
            100.0,
            responsibility_score * 0.80
            + work_sample_score * 0.20,
        )

    eligibility_score = (
        _required_eligibility_score(
            job,
            resume,
        )
    )

    has_eligibility = any(
        (
            requirement.level == "required"
            and requirement.category
            in {
                "education",
                "eligibility",
                "certification",
                "license",
                "language",
            }
        )
        for requirement
        in job.requirements
    )

    # -----------------------------------------------------
    # Resume Fit V2
    # -----------------------------------------------------
    # Keep the strict evidence matcher for explanations, but use a broader
    # ATS-style hybrid score for the headline percentage.
    concept_score = _concept_coverage_score(
        job,
        resume,
    )

    required_alignment = (
        _required_alignment_score(
            requirement_matches
        )
    )

    preferred_alignment = (
        _preferred_alignment_score(
            requirement_matches
        )
        if preferred_requirements
        else 0.0
    )

    market_experience_score = (
        _consumer_experience_score(
            experience_score,
            has_experience=bool(
                resume.experience
            ),
        )
    )

    market_responsibility_score = (
        _consumer_responsibility_score(
            responsibility_score,
            has_responsibilities=bool(
                job.responsibilities
            ),
        )
    )

    # Preferred score from the old helper is still retained for backward
    # compatibility, but the headline fit uses the softened requirement view.
    market_preferred_score = (
        preferred_alignment
        if preferred_requirements
        else 0.0
    )

    total, _fit_components = (
        _hybrid_fit_score(
            concept_score=
                concept_score,
            required_alignment=
                required_alignment,
            capability_score=
                capability_score,
            experience_score=
                market_experience_score,
            responsibility_score=
                market_responsibility_score,
            eligibility_score=
                eligibility_score,
            preferred_score=
                market_preferred_score,
            has_experience=bool(
                resume.experience
            ),
            has_responsibilities=bool(
                job.responsibilities
            ),
            has_eligibility=
                has_eligibility,
            has_preferred=bool(
                preferred_requirements
            ),
        )
    )

    # Consumer-facing breakdown should use the same scale as the headline
    # score. Keep the categories the frontend already expects.
    capability_score = round(
        (
            concept_score * 0.45
            + required_alignment * 0.40
            + capability_score * 0.15
        ),
        2,
    )
    experience_score = (
        market_experience_score
    )
    responsibility_score = (
        market_responsibility_score
    )
    preferred_score = (
        market_preferred_score
    )

    matched_required = [
        row.requirement
        for row
        in requirement_matches
        if (
            row.level
            == "required"
            and row.matched
        )
    ]

    missing_required = [
        row.requirement
        for row
        in requirement_matches
        if (
            row.level
            == "required"
            and not row.matched
        )
    ]

    matched_preferred = [
        row.requirement
        for row
        in requirement_matches
        if (
            row.level
            == "preferred"
            and row.matched
        )
    ]

    if total >= 80:
        verdict = "Strong match"
    elif total >= 65:
        verdict = "Good match"
    elif total >= 50:
        verdict = "Moderate match"
    elif total >= 35:
        verdict = "Partial match"
    else:
        verdict = "Weak match"

    explanation: list[str] = []

    if matched_required:
        explanation.append(
            "Matched required evidence: "
            + ", ".join(
                matched_required[:5]
            )
        )

    if missing_required:
        explanation.append(
            "Missing or weak evidence for: "
            + ", ".join(
                missing_required[:5]
            )
        )

    if (
        job.minimum_experience_months
        is not None
    ):
        relevant_months = (
            _unique_experience_months(
                resume,
                relevant_to=(
                    next(
                        (
                            requirement.source_text
                            for requirement
                            in job.requirements
                            if requirement.category
                            == "experience"
                        ),
                        None,
                    )
                ),
            )
        )

        explanation.append(
            "Detected experience requirement: "
            f"{job.minimum_experience_months} months; "
            f"unique relevant structured experience: "
            f"{relevant_months} months."
        )

    if has_eligibility:
        explanation.append(
            "Eligibility alignment: "
            f"{round(eligibility_score)}%."
        )

    return CanonicalMatchResult(
        score=round(
            total,
            2,
        ),
        verdict=
            verdict,
        breakdown=MatchBreakdown(
            capabilities=round(
                capability_score,
                2,
            ),
            experience=round(
                experience_score,
                2,
            ),
            responsibilities=round(
                responsibility_score,
                2,
            ),
            eligibility=round(
                eligibility_score,
                2,
            ),
            preferred=round(
                preferred_score,
                2,
            ),
        ),
        requirement_matches=
            requirement_matches,
        experience_matches=
            experience_matches,
        work_sample_matches=
            work_sample_matches,
        matched_required=
            matched_required,
        missing_required=
            missing_required,
        matched_preferred=
            matched_preferred,
        explanation=
            explanation,
    )
