from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class JobRelevanceProfile(BaseModel):
    title: str | None = None
    description: str = ""

    required_skills: list[str] = Field(
        default_factory=list,
    )

    preferred_skills: list[str] = Field(
        default_factory=list,
    )

    responsibilities: list[str] = Field(
        default_factory=list,
    )

    qualifications: list[str] = Field(
        default_factory=list,
    )


class SkillMatchEvidence(BaseModel):
    skill: str

    requirement_level: Literal[
        "required",
        "preferred",
        "inferred",
    ]

    matched: bool

    resume_provenance: Literal[
        "explicit",
        "demonstrated",
        "mentioned",
        "unknown",
        "missing",
    ] = "missing"

    sources: list[str] = Field(
        default_factory=list,
    )

    evidence: list[str] = Field(
        default_factory=list,
    )

    contribution: float = Field(
        ge=0.0,
        le=1.0,
    )


class ExperienceRelevance(BaseModel):
    index: int
    company: str | None = None
    title: str | None = None

    score: float = Field(
        ge=0.0,
        le=100.0,
    )

    matched_skills: list[str] = Field(
        default_factory=list,
    )

    matched_terms: list[str] = Field(
        default_factory=list,
    )

    reasons: list[str] = Field(
        default_factory=list,
    )


class ProjectRelevance(BaseModel):
    index: int
    name: str | None = None

    score: float = Field(
        ge=0.0,
        le=100.0,
    )

    matched_skills: list[str] = Field(
        default_factory=list,
    )

    matched_terms: list[str] = Field(
        default_factory=list,
    )

    reasons: list[str] = Field(
        default_factory=list,
    )


class ResumeRelevanceBreakdown(BaseModel):
    skills: float = Field(
        ge=0.0,
        le=100.0,
    )

    experience: float = Field(
        ge=0.0,
        le=100.0,
    )

    projects: float = Field(
        ge=0.0,
        le=100.0,
    )


class ResumeRelevanceResult(BaseModel):
    score: float = Field(
        ge=0.0,
        le=100.0,
    )

    breakdown: ResumeRelevanceBreakdown

    skill_matches: list[SkillMatchEvidence] = Field(
        default_factory=list,
    )

    experience_matches: list[ExperienceRelevance] = Field(
        default_factory=list,
    )

    project_matches: list[ProjectRelevance] = Field(
        default_factory=list,
    )

    matched_required_skills: list[str] = Field(
        default_factory=list,
    )

    missing_required_skills: list[str] = Field(
        default_factory=list,
    )

    matched_preferred_skills: list[str] = Field(
        default_factory=list,
    )

    explanation: list[str] = Field(
        default_factory=list,
    )
