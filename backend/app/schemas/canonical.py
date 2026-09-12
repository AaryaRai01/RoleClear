from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


RequirementLevel = Literal["required", "preferred", "context"]

RequirementCategory = Literal[
    "competency",
    "technical_skill",
    "domain_skill",
    "tool",
    "soft_skill",
    "experience",
    "education",
    "certification",
    "license",
    "language",
    "eligibility",
    "other",
]

EvidenceStrength = Literal[
    "explicit",
    "demonstrated",
    "mentioned",
    "inferred",
]


class CanonicalEvidence(BaseModel):
    label: str
    normalized_label: str | None = None
    strength: EvidenceStrength = "mentioned"
    source_section: str
    source_text: str
    source_index: int | None = None


class CanonicalExperience(BaseModel):
    title: str | None = None
    organization: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    is_current: bool = False
    duration_months: int | None = None
    description: str = ""
    responsibilities: list[str] = Field(default_factory=list)
    competencies: list[str] = Field(default_factory=list)
    tools: list[str] = Field(default_factory=list)
    achievements: list[str] = Field(default_factory=list)


class CanonicalEducation(BaseModel):
    qualification: str | None = None
    field: str | None = None
    institution: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    is_current: bool = False


class CanonicalCredential(BaseModel):
    name: str
    issuer: str | None = None
    credential_type: Literal[
        "certification",
        "license",
        "credential",
    ] = "credential"
    expiry_date: str | None = None


class CanonicalWorkSample(BaseModel):
    name: str | None = None
    sample_type: str = "work_sample"
    description: str = ""
    competencies: list[str] = Field(default_factory=list)
    tools: list[str] = Field(default_factory=list)
    outcomes: list[str] = Field(default_factory=list)
    links: list[str] = Field(default_factory=list)


class CanonicalResume(BaseModel):
    candidate_name: str | None = None
    headline: str | None = None
    summary: str | None = None
    competencies: list[str] = Field(default_factory=list)
    tools: list[str] = Field(default_factory=list)
    experience: list[CanonicalExperience] = Field(default_factory=list)
    education: list[CanonicalEducation] = Field(default_factory=list)
    credentials: list[CanonicalCredential] = Field(default_factory=list)
    work_samples: list[CanonicalWorkSample] = Field(default_factory=list)
    achievements: list[str] = Field(default_factory=list)
    publications: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
    evidence: list[CanonicalEvidence] = Field(default_factory=list)
    raw_text: str = ""


class CanonicalRequirement(BaseModel):
    name: str
    normalized_name: str | None = None
    level: RequirementLevel
    category: RequirementCategory = "competency"
    source_text: str = ""
    source_section: str = ""
    importance: float = Field(default=1.0, ge=0.0, le=2.0)


class CanonicalJob(BaseModel):
    title: str | None = None
    company: str | None = None
    location: str | None = None
    role_family: str | None = None
    responsibilities: list[str] = Field(default_factory=list)
    requirements: list[CanonicalRequirement] = Field(default_factory=list)
    minimum_experience_months: int | None = None
    experience_text: list[str] = Field(default_factory=list)
    education_requirements: list[str] = Field(default_factory=list)
    certification_requirements: list[str] = Field(default_factory=list)
    license_requirements: list[str] = Field(default_factory=list)
    language_requirements: list[str] = Field(default_factory=list)
    eligibility_requirements: list[str] = Field(default_factory=list)
    raw_description: str = ""
    extraction_quality: Literal[
        "structured",
        "partial",
        "description_only",
    ] = "partial"
    normalization_warnings: list[str] = Field(default_factory=list)
