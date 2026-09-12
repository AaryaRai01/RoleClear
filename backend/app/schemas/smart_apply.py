from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, HttpUrl

from app.schemas.resume import ParsedResumeV2


class ExtractJobRequest(BaseModel):
    url: HttpUrl


class ExtractedJob(BaseModel):
    url: str
    source: str
    title: str | None = None
    company: str | None = None
    location: str | None = None
    description: str

    employment_type: str | None = None
    date_posted: str | None = None
    valid_through: str | None = None

    # Backward-compatible combined list.
    qualifications: list[str] = Field(default_factory=list)

    # Structured qualification buckets.
    minimum_qualifications: list[str] = Field(default_factory=list)
    preferred_qualifications: list[str] = Field(default_factory=list)

    responsibilities: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)

    extraction_method: str


class AnalyzeJobRequest(BaseModel):
    job: ExtractedJob
    resume: ParsedResumeV2


# =========================================================
# CANONICAL MATCH RESPONSE TYPES
# =========================================================

class CanonicalMatchBreakdown(BaseModel):
    capabilities: int = Field(ge=0, le=100)
    experience: int = Field(ge=0, le=100)
    responsibilities: int = Field(ge=0, le=100)
    eligibility: int = Field(ge=0, le=100)
    preferred: int = Field(ge=0, le=100)


class RequirementMatchResponse(BaseModel):
    requirement: str
    level: Literal["required", "preferred", "context"] | str
    category: str
    score: int = Field(ge=0, le=100)
    matched: bool
    evidence: list[str] = Field(default_factory=list)


class ExperienceMatchResponse(BaseModel):
    index: int
    title: str | None = None
    organization: str | None = None
    score: int = Field(ge=0, le=100)
    matched_terms: list[str] = Field(default_factory=list)
    reasons: list[str] = Field(default_factory=list)


class WorkSampleMatchResponse(BaseModel):
    index: int
    name: str | None = None
    sample_type: str
    score: int = Field(ge=0, le=100)
    matched_terms: list[str] = Field(default_factory=list)
    reasons: list[str] = Field(default_factory=list)


# =========================================================
# LEGACY FRONTEND BREAKDOWN
# =========================================================
#
# Keep this temporarily so the existing frontend does not break while
# Smart Apply UI is migrated to canonical_breakdown.
#
class MatchBreakdown(BaseModel):
    skills: int = Field(ge=0, le=100)
    keywords: int = Field(ge=0, le=100)
    experience: int = Field(ge=0, le=100)
    projects: int = Field(ge=0, le=100)


class JobAnalysisResponse(BaseModel):
    resume_fit: int = Field(ge=0, le=100)

    ghost_risk: Literal["low", "medium", "high"]
    ghost_risk_reasons: list[str] = Field(default_factory=list)

    # -----------------------------------------------------------------
    # Backward-compatible names currently consumed by the frontend.
    # They now contain canonical requirement labels rather than only
    # literal technology skills.
    # -----------------------------------------------------------------
    required_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)
    matched_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)

    verdict: str
    explanation: str

    # Legacy frontend breakdown.
    breakdown: MatchBreakdown

    # -----------------------------------------------------------------
    # Canonical V1 response. New frontend components should use these.
    # -----------------------------------------------------------------
    canonical_breakdown: CanonicalMatchBreakdown

    required_requirements: list[str] = Field(default_factory=list)
    preferred_requirements: list[str] = Field(default_factory=list)
    matched_required: list[str] = Field(default_factory=list)
    missing_required: list[str] = Field(default_factory=list)
    matched_preferred: list[str] = Field(default_factory=list)

    requirement_matches: list[RequirementMatchResponse] = Field(
        default_factory=list
    )

    experience_matches: list[ExperienceMatchResponse] = Field(
        default_factory=list
    )

    work_sample_matches: list[WorkSampleMatchResponse] = Field(
        default_factory=list
    )

    role_family: str | None = None
    extraction_quality: str | None = None
    normalization_warnings: list[str] = Field(default_factory=list)
