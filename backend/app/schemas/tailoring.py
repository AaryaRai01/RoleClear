from __future__ import annotations

from pydantic import BaseModel, Field

from app.schemas.resume import ParsedResumeV2
from app.schemas.smart_apply import ExtractedJob


class TailorResumeRequest(BaseModel):
    job: ExtractedJob
    resume: ParsedResumeV2
    max_experience_bullets: int = Field(default=4, ge=1, le=8)
    max_project_bullets: int = Field(default=3, ge=1, le=6)
    max_projects: int = Field(default=3, ge=0, le=6)


class TailoringEvidence(BaseModel):
    requirement: str
    section: str
    source_index: int | None = None
    evidence: str
    similarity: float = Field(ge=-1.0, le=1.0)


class TailoringChange(BaseModel):
    section: str
    action: str
    detail: str


class ClaimValidationResult(BaseModel):
    passed: bool
    checked_claims: int = 0
    unsupported_claims: list[str] = Field(default_factory=list)


class TailorResumeResponse(BaseModel):
    version_id: str
    job_title: str | None = None
    company: str | None = None
    tailored_resume: ParsedResumeV2
    selected_evidence: list[TailoringEvidence] = Field(default_factory=list)
    changes: list[TailoringChange] = Field(default_factory=list)
    claim_validation: ClaimValidationResult
    tailoring_mode: str = "selection_reordering_v1"
    note: str = (
        "This V1 tailoring pass only selects and reorders claims already "
        "present in the Master Resume. It does not invent new experience, "
        "skills, metrics, employers, projects, degrees, or certifications."
    )
