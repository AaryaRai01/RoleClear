from __future__ import annotations

import os
import re

from fastapi import (
    APIRouter,
    HTTPException,
    status,
)

from app.schemas.canonical import CanonicalJob
from app.schemas.smart_apply import (
    AnalyzeJobRequest,
    CanonicalMatchBreakdown,
    ExperienceMatchResponse,
    ExtractJobRequest,
    ExtractedJob,
    JobAnalysisResponse,
    MatchBreakdown,
    RequirementMatchResponse,
    WorkSampleMatchResponse,
)

from app.schemas.tailoring import (
    TailorResumeRequest,
    TailorResumeResponse,
)

from app.services.job_extractor import (
    JobExtractionError,
    extract_job_from_url,
)
from app.services.job_normalizer import normalize_job
from app.services.match_engine import match_resume_to_job
from app.services.ml_evidence_ranker import (
    rank_resume_for_requirements,
)
from app.services.resume_tailor import tailor_resume_for_job
from app.services.resume_normalizer import normalize_resume


ENABLE_SEMANTIC_RANKER = (
    os.getenv("ENABLE_SEMANTIC_RANKER", "true").lower()
    == "true"
)


router = APIRouter(
    prefix="/api/v1/smart-apply",
    tags=["smart-apply"],
)


# =========================================================
# EXTRACT
# =========================================================

@router.post(
    "/extract",
    response_model=ExtractedJob,
)
async def extract_job(
    payload: ExtractJobRequest,
):
    """
    Fetch and validate a public job-posting URL.

    Authentication pages, unavailable jobs, generic careers pages and
    unreliable extraction results are rejected before matching.
    """

    try:
        result = await extract_job_from_url(
            str(payload.url),
        )

    except JobExtractionError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    if (
        not result.description
        or len(result.description.strip()) < 80
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Could not reliably extract this page. "
                "Paste the job description instead."
            ),
        )

    return result


# =========================================================
# HELPERS
# =========================================================

def _dedupe(
    values: list[str],
) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()

    for value in values:
        clean = " ".join(
            str(value).split()
        ).strip(
            " ,.;:-"
        )

        if not clean:
            continue

        key = clean.lower()

        if key in seen:
            continue

        seen.add(key)
        result.append(clean)

    return result


def _requirement_key(
    value: str,
) -> str:
    """
    Normalize requirement text so deterministic matcher requirements
    and MiniLM requirement keys can be joined reliably.

    This handles:
    - trailing punctuation
    - smart quotes
    - inconsistent whitespace
    - capitalization differences
    - dash variants
    """

    value = str(value).lower().strip()

    value = (
        value
        .replace("’", "'")
        .replace("‘", "'")
        .replace("“", '"')
        .replace("”", '"')
        .replace("–", "-")
        .replace("—", "-")
    )

    value = re.sub(
        r"[^a-z0-9+#.&/-]+",
        " ",
        value,
    )

    value = value.strip(
        " .,:;!?-"
    )

    return " ".join(
        value.split()
    )


def _ghost_risk_from_job(
    job: ExtractedJob,
    canonical_job: CanonicalJob,
) -> tuple[
    str,
    list[str],
]:
    """
    Temporary rule-based ghost-risk signal.

    Important:
    - Uses canonical normalized requirements/responsibilities.
    - Does NOT penalize a job merely because JSON-LD lacked structured
      fields when the normalizer successfully recovered them.
    - Remains independent from Resume Fit.
    """

    reasons: list[str] = []
    score = 0

    if not job.company:
        score += 2
        reasons.append(
            "Company name could not be verified from the posting."
        )

    if not job.title:
        score += 2
        reasons.append(
            "Role title could not be verified from the posting."
        )

    if len(job.description.strip()) < 250:
        score += 1
        reasons.append(
            "The extracted job description is unusually short."
        )

    if not canonical_job.responsibilities:
        score += 1
        reasons.append(
            "No usable responsibilities could be recovered from the posting."
        )

    if not canonical_job.requirements:
        score += 1
        reasons.append(
            "No usable candidate requirements could be recovered from the posting."
        )

    if not job.date_posted:
        score += 1
        reasons.append(
            "Posting date was not available from the source."
        )

    if score >= 5:
        return "high", reasons

    if score >= 2:
        return "medium", reasons

    return "low", reasons


def _work_sample_aggregate(
    scores: list[float],
) -> int:
    """
    Legacy-only project aggregate for the old frontend breakdown.

    The canonical matcher intentionally does not have a universal
    "projects" bucket because work samples are optional across
    many professions.
    """

    if not scores:
        return 0

    ranked = sorted(
        scores,
        reverse=True,
    )[:3]

    weights = [
        0.50,
        0.30,
        0.20,
    ][:len(ranked)]

    return round(
        sum(
            score * weight
            for score, weight
            in zip(ranked, weights)
        )
        / sum(weights)
    )


def _semantic_requirement_evidence(
    *,
    requirement: str,
    ml_evidence: dict,
    category: str | None = None,
) -> list[str]:
    """
    Convert MiniLM-ranked evidence into frontend-safe strings while
    filtering evidence by requirement type.

    ML is used only to rank existing resume evidence.
    It does not create, infer or fabricate new candidate claims.

    Evidence policy:
    - Education / degree requirements -> education evidence only.
    - Quantified experience requirements -> experience evidence only.
    - General capability requirements -> skills, experience, projects,
      summary, achievements, publications and certifications.
    """

    normalized_requirement = _requirement_key(
        requirement
    )

    matches = ml_evidence.get(
        normalized_requirement,
        [],
    )

    requirement_lower = requirement.lower()

    if (
        category in {
            "education",
            "eligibility",
        }
        or any(
            marker in requirement_lower
            for marker in (
                "bachelor",
                "master",
                "phd",
                "degree",
                "undergraduate",
            )
        )
    ):
        allowed_sections = {
            "education",
        }

    elif (
        category == "experience"
        or re.search(
            r"\b\d+\+?\s+years?\b",
            requirement_lower,
        )
        or re.search(
            r"\b\d+\+?\s+months?\b",
            requirement_lower,
        )
    ):
        allowed_sections = {
            "experience",
        }

    else:
        allowed_sections = {
            "skills",
            "experience",
            "project",
            "projects",
            "summary",
            "achievement",
            "achievements",
            "publication",
            "publications",
            "certification",
            "certifications",
        }

    evidence: list[str] = []

    for match in matches:
        section = str(
            match.section
        ).lower().strip()

        if section not in allowed_sections:
            continue

        text = " ".join(
            str(match.evidence).split()
        ).strip()

        if not text:
            continue

        evidence.append(
            (
                f"{text} "
                f"[{match.section}, "
                f"semantic={match.similarity:.2f}]"
            )
        )

    return evidence


# =========================================================
# ANALYZE
# =========================================================

@router.post(
    "/analyze",
    response_model=JobAnalysisResponse,
)
async def analyze_job(
    payload: AnalyzeJobRequest,
):
    """
    RoleClear Smart Apply pipeline:

        ExtractedJob
            -> CanonicalJob

        ParsedResumeV2
            -> CanonicalResume

        CanonicalJob + CanonicalResume
            -> deterministic canonical matcher

        JD requirements + ParsedResumeV2
            -> MiniLM semantic evidence ranker

    The deterministic matcher remains responsible for:
    - Resume Fit
    - matched / missing requirements
    - eligibility
    - experience validation

    MiniLM is supplementary. It ranks the candidate's existing
    resume evidence against each job requirement.

    MiniLM does not alter deterministic eligibility decisions and
    does not create unsupported resume claims.
    """

    if (
        not payload.job.description
        or len(payload.job.description.strip()) < 80
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Job description is missing or too short "
                "for reliable analysis."
            ),
        )

    # -----------------------------------------------------
    # NORMALIZE JOB
    # -----------------------------------------------------

    try:
        canonical_job = normalize_job(
            payload.job
        )

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "The job posting could not be normalized "
                "for reliable matching."
            ),
        ) from exc

    if (
        not canonical_job.requirements
        and not canonical_job.responsibilities
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "The job posting does not contain enough "
                "candidate requirements or responsibilities "
                "for reliable analysis."
            ),
        )

    # -----------------------------------------------------
    # NORMALIZE RESUME
    # -----------------------------------------------------

    try:
        canonical_resume = normalize_resume(
            payload.resume
        )

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "The parsed resume could not be normalized "
                "for reliable matching."
            ),
        ) from exc

    if (
        not canonical_resume.competencies
        and not canonical_resume.experience
        and not canonical_resume.work_samples
        and not canonical_resume.education
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "The parsed resume does not contain enough "
                "structured candidate evidence."
            ),
        )

    # -----------------------------------------------------
    # DETERMINISTIC CANONICAL MATCH
    # -----------------------------------------------------

    result = match_resume_to_job(
        canonical_resume,
        canonical_job,
    )

    # -----------------------------------------------------
    # ROLECLEAR ML V1
    # REQUIREMENT -> RESUME EVIDENCE SEMANTIC RANKING
    # -----------------------------------------------------

    ml_requirements = _dedupe([
        requirement.name
        for requirement
        in canonical_job.requirements
    ])

    if ENABLE_SEMANTIC_RANKER:
        try:
            raw_ml_evidence = rank_resume_for_requirements(
                ml_requirements,
                payload.resume,
                top_k=3,
                minimum_similarity=0.25,
            )

            # Normalize ML dictionary keys so punctuation differences
            # between canonical requirements and matcher output do not
            # prevent evidence from being attached.
            ml_evidence = {
                _requirement_key(
                    requirement
                ): matches
                for requirement, matches
                in raw_ml_evidence.items()
            }

        except Exception as exc:
            # Smart Apply must continue using deterministic matching
            # if semantic ranking fails.
            print(
                "\n[ROLECLEAR ML ERROR]",
                type(exc).__name__,
                str(exc),
                "\n",
            )

            ml_evidence = {}
    else:
        print(
            "[ROLECLEAR ML] Semantic ranker disabled "
            "for this deployment."
        )
        ml_evidence = {}

    # -----------------------------------------------------
    # REQUIREMENT VIEWS
    # -----------------------------------------------------

    required_requirements = _dedupe([
        requirement.name
        for requirement
        in canonical_job.requirements
        if requirement.level == "required"
    ])

    preferred_requirements = _dedupe([
        requirement.name
        for requirement
        in canonical_job.requirements
        if requirement.level == "preferred"
    ])

    matched_required = _dedupe(
        list(
            result.matched_required
        )
    )

    missing_required = _dedupe(
        list(
            result.missing_required
        )
    )

    matched_preferred = _dedupe(
        list(
            result.matched_preferred
        )
    )

    # -----------------------------------------------------
    # GHOST RISK
    # -----------------------------------------------------

    ghost_risk, ghost_reasons = (
        _ghost_risk_from_job(
            payload.job,
            canonical_job,
        )
    )

    # -----------------------------------------------------
    # EXPLANATION
    # -----------------------------------------------------

    explanation = " ".join(
        item.strip()
        for item
        in result.explanation
        if item.strip()
    )

    if not explanation:
        explanation = (
            "The score is based on required capability evidence, "
            "experience relevance, responsibility alignment, "
            "eligibility, and preferred qualifications."
        )

    # -----------------------------------------------------
    # REQUIREMENT MATCHES
    # -----------------------------------------------------

    requirement_matches: list[
        RequirementMatchResponse
    ] = []

    for item in result.requirement_matches:
        deterministic_evidence = list(
            item.evidence
        )

        semantic_evidence = (
            _semantic_requirement_evidence(
                requirement=item.requirement,
                ml_evidence=ml_evidence,
                category=item.category,
            )
        )

        combined_evidence = _dedupe([
            *deterministic_evidence,
            *semantic_evidence,
        ])

        requirement_matches.append(
            RequirementMatchResponse(
                requirement=item.requirement,
                level=item.level,
                category=item.category,
                score=round(
                    item.score
                ),
                matched=item.matched,
                evidence=combined_evidence[:5],
            )
        )

    # -----------------------------------------------------
    # EXPERIENCE MATCHES
    # -----------------------------------------------------

    experience_matches = [
        ExperienceMatchResponse(
            index=item.index,
            title=item.title,
            organization=item.organization,
            score=round(
                item.score
            ),
            matched_terms=list(
                item.matched_terms
            ),
            reasons=list(
                item.reasons
            ),
        )
        for item
        in result.experience_matches
    ]

    # -----------------------------------------------------
    # WORK SAMPLE MATCHES
    # -----------------------------------------------------

    work_sample_matches = [
        WorkSampleMatchResponse(
            index=item.index,
            name=item.name,
            sample_type=item.sample_type,
            score=round(
                item.score
            ),
            matched_terms=list(
                item.matched_terms
            ),
            reasons=list(
                item.reasons
            ),
        )
        for item
        in result.work_sample_matches
    ]

    # -----------------------------------------------------
    # LEGACY FRONTEND PROJECT BREAKDOWN
    # -----------------------------------------------------

    legacy_projects = _work_sample_aggregate([
        item.score
        for item
        in result.work_sample_matches
    ])

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return JobAnalysisResponse(

        resume_fit=round(
            result.score
        ),

        ghost_risk=ghost_risk,

        ghost_risk_reasons=
            ghost_reasons,

        # -------------------------------------------------
        # BACKWARD-COMPATIBLE FIELDS
        # -------------------------------------------------

        required_skills=
            required_requirements,

        preferred_skills=
            preferred_requirements,

        matched_skills=
            matched_required,

        missing_skills=
            missing_required,

        verdict=
            result.verdict,

        explanation=
            explanation,

        # -------------------------------------------------
        # OLD FRONTEND BREAKDOWN
        # -------------------------------------------------

        breakdown=MatchBreakdown(

            skills=round(
                result.breakdown.capabilities
            ),

            keywords=round(
                result.breakdown.responsibilities
            ),

            experience=round(
                result.breakdown.experience
            ),

            projects=
                legacy_projects,
        ),

        # -------------------------------------------------
        # CANONICAL BREAKDOWN
        # -------------------------------------------------

        canonical_breakdown=
            CanonicalMatchBreakdown(

                capabilities=round(
                    result.breakdown.capabilities
                ),

                experience=round(
                    result.breakdown.experience
                ),

                responsibilities=round(
                    result.breakdown.responsibilities
                ),

                eligibility=round(
                    result.breakdown.eligibility
                ),

                preferred=round(
                    result.breakdown.preferred
                ),
            ),

        # -------------------------------------------------
        # CANONICAL REQUIREMENT VIEWS
        # -------------------------------------------------

        required_requirements=
            required_requirements,

        preferred_requirements=
            preferred_requirements,

        matched_required=
            matched_required,

        missing_required=
            missing_required,

        matched_preferred=
            matched_preferred,

        # -------------------------------------------------
        # DETAILED EVIDENCE
        # -------------------------------------------------

        requirement_matches=
            requirement_matches,

        experience_matches=
            experience_matches,

        work_sample_matches=
            work_sample_matches,

        # -------------------------------------------------
        # NORMALIZATION METADATA
        # -------------------------------------------------

        role_family=
            canonical_job.role_family,

        extraction_quality=
            canonical_job.extraction_quality,

        normalization_warnings=list(
            canonical_job.normalization_warnings
        ),
    )

# =========================================================
# TAILOR RESUME - SMART APPLY STEP 4
# =========================================================

@router.post(
    "/tailor",
    response_model=TailorResumeResponse,
)
async def tailor_resume(
    payload: TailorResumeRequest,
):
    """
    Build a job-specific resume copy from the parsed Master Resume.

    V1 is intentionally safe:
    - MiniLM ranks existing evidence against JD requirements.
    - Existing skills, experience bullets and projects may be reordered.
    - Less relevant project/bullet content may be omitted from the copy.
    - The Master Resume is never mutated.
    - No new factual claim is generated.
    - A claim validator fails closed if unsupported content appears.
    """

    if (
        not payload.job.description
        or len(payload.job.description.strip()) < 80
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Job description is missing or too short "
                "for reliable resume tailoring."
            ),
        )

    try:
        return tailor_resume_for_job(
            job=payload.job,
            resume=payload.resume,
            max_experience_bullets=payload.max_experience_bullets,
            max_project_bullets=payload.max_project_bullets,
            max_projects=payload.max_projects,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        print(
            "\n[ROLECLEAR TAILOR ERROR]",
            type(exc).__name__,
            str(exc),
            "\n",
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "The tailored resume could not be generated safely."
            ),
        ) from exc
