from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


# =========================================================
# SHARED
# =========================================================

class ResumeLink(BaseModel):
    label: str | None = None
    url: str
    type: Literal[
        "linkedin",
        "github",
        "portfolio",
        "website",
        "other",
    ] = "other"


class PersonalInfo(BaseModel):
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    linkedin: str | None = None
    github: str | None = None
    portfolio: str | None = None
    links: list[ResumeLink] = Field(default_factory=list)


# =========================================================
# SKILLS
# =========================================================

class SkillItem(BaseModel):
    name: str
    normalized_name: str | None = None
    aliases_found: list[str] = Field(default_factory=list)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)

    # Provenance is additive and backward compatible. Old clients can ignore
    # these fields while Smart Apply can use them for evidence-aware scoring.
    provenance: Literal[
        "explicit",
        "demonstrated",
        "mentioned",
        "unknown",
    ] = "unknown"

    sources: list[Literal[
        "skills",
        "experience",
        "project",
        "summary",
        "education",
        "certification",
        "publication",
        "research",
        "achievement",
        "coursework",
        "other",
    ]] = Field(default_factory=list)

    explicit: bool = False
    demonstrated: bool = False
    mentioned: bool = False

    # Short snippets/labels explaining why the skill received its provenance.
    evidence: list[str] = Field(default_factory=list)


class CategorizedSkills(BaseModel):
    programming_languages: list[SkillItem] = Field(default_factory=list)
    frameworks: list[SkillItem] = Field(default_factory=list)
    libraries: list[SkillItem] = Field(default_factory=list)
    databases: list[SkillItem] = Field(default_factory=list)
    cloud: list[SkillItem] = Field(default_factory=list)
    devops: list[SkillItem] = Field(default_factory=list)
    developer_tools: list[SkillItem] = Field(default_factory=list)
    ai_ml: list[SkillItem] = Field(default_factory=list)
    data: list[SkillItem] = Field(default_factory=list)
    mobile: list[SkillItem] = Field(default_factory=list)
    web: list[SkillItem] = Field(default_factory=list)
    concepts: list[SkillItem] = Field(default_factory=list)
    soft_skills: list[SkillItem] = Field(default_factory=list)
    other: list[SkillItem] = Field(default_factory=list)


# =========================================================
# EXPERIENCE
# =========================================================

class ResumeExperience(BaseModel):
    company: str | None = None
    title: str | None = None
    location: str | None = None
    work_mode: Literal[
        "remote",
        "hybrid",
        "onsite",
        "unknown",
    ] = "unknown"
    employment_type: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    is_current: bool = False
    bullets: list[str] = Field(default_factory=list)
    technologies: list[str] = Field(default_factory=list)
    raw_header: str | None = None
    raw_text: str | None = None
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)


# =========================================================
# PROJECTS
# =========================================================

class ResumeProject(BaseModel):
    name: str | None = None
    subtitle: str | None = None
    description: str | None = None
    bullets: list[str] = Field(default_factory=list)
    technologies: list[str] = Field(default_factory=list)
    links: list[ResumeLink] = Field(default_factory=list)
    raw_header: str | None = None
    raw_text: str | None = None
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)


# =========================================================
# EDUCATION
# =========================================================

class ResumeEducation(BaseModel):
    institution: str | None = None
    degree: str | None = None
    field_of_study: str | None = None
    location: str | None = None
    grade: str | None = None
    grade_type: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    raw_text: str | None = None
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)


# =========================================================
# CERTIFICATIONS / PUBLICATIONS / RESEARCH
# =========================================================

class ResumeCertification(BaseModel):
    name: str | None = None
    issuer: str | None = None
    issue_date: str | None = None
    expiry_date: str | None = None
    credential_id: str | None = None
    credential_url: str | None = None
    raw_text: str | None = None


class ResumePublication(BaseModel):
    title: str | None = None
    venue: str | None = None
    year: int | None = None
    authors: list[str] = Field(default_factory=list)
    description: str | None = None
    url: str | None = None
    raw_text: str | None = None


class ResumeResearch(BaseModel):
    title: str | None = None
    organization: str | None = None
    description: str | None = None
    bullets: list[str] = Field(default_factory=list)
    technologies: list[str] = Field(default_factory=list)
    start_date: str | None = None
    end_date: str | None = None
    raw_text: str | None = None


# =========================================================
# ACHIEVEMENTS / LANGUAGES / COURSEWORK
# =========================================================

class ResumeAchievement(BaseModel):
    title: str | None = None
    description: str
    organization: str | None = None
    date: str | None = None
    raw_text: str | None = None


class ResumeLanguage(BaseModel):
    language: str
    proficiency: str | None = None


class ResumeCoursework(BaseModel):
    name: str


# =========================================================
# UNKNOWN / RAW SECTIONS
# =========================================================

class OtherSection(BaseModel):
    original_heading: str
    normalized_heading: str | None = None
    content: list[str] = Field(default_factory=list)
    raw_text: str | None = None


class RawSection(BaseModel):
    heading: str
    normalized_heading: str | None = None
    lines: list[str] = Field(default_factory=list)
    page_numbers: list[int] = Field(default_factory=list)


# =========================================================
# PARSING METADATA
# =========================================================

class ParsingWarning(BaseModel):
    code: str
    message: str
    section: str | None = None
    severity: Literal[
        "info",
        "warning",
        "error",
    ] = "warning"


class ParsingMetadata(BaseModel):
    parser_version: str
    extraction_method: Literal["pdf", "docx", "txt"]
    file_name: str
    file_size_bytes: int | None = None
    page_count: int | None = None
    character_count: int
    section_count: int
    overall_confidence: float = Field(ge=0.0, le=1.0)
    warnings: list[ParsingWarning] = Field(default_factory=list)


# =========================================================
# CANONICAL V2 MODEL
# =========================================================

class ParsedResumeV2(BaseModel):
    personal_info: PersonalInfo = Field(default_factory=PersonalInfo)
    summary: str | None = None
    skills: CategorizedSkills = Field(default_factory=CategorizedSkills)
    experience: list[ResumeExperience] = Field(default_factory=list)
    projects: list[ResumeProject] = Field(default_factory=list)
    education: list[ResumeEducation] = Field(default_factory=list)
    certifications: list[ResumeCertification] = Field(default_factory=list)
    publications: list[ResumePublication] = Field(default_factory=list)
    research: list[ResumeResearch] = Field(default_factory=list)
    achievements: list[ResumeAchievement] = Field(default_factory=list)
    languages: list[ResumeLanguage] = Field(default_factory=list)
    coursework: list[ResumeCoursework] = Field(default_factory=list)
    other_sections: list[OtherSection] = Field(default_factory=list)
    raw_sections: dict[str, RawSection] = Field(default_factory=dict)
    raw_text: str
    parsing_metadata: ParsingMetadata


# =========================================================
# LEGACY / V1 COMPATIBILITY MODELS
# =========================================================

class LegacyResumeExperience(BaseModel):
    title: str | None = None
    company: str | None = None
    description: str


class LegacyResumeProject(BaseModel):
    name: str | None = None
    description: str
    technologies: list[str] = Field(default_factory=list)


class ParsedResumeLegacy(BaseModel):
    file_name: str
    raw_text: str
    skills: list[str] = Field(default_factory=list)
    experience: list[LegacyResumeExperience] = Field(default_factory=list)
    projects: list[LegacyResumeProject] = Field(default_factory=list)
    education: list[str] = Field(default_factory=list)
    extraction_method: str


class ParsedResumeCompatResponse(ParsedResumeLegacy):
    """
    Backward-compatible V1 response.

    Existing V1 fields remain intact while V2 fields are added.
    """

    personal_info: PersonalInfo = Field(default_factory=PersonalInfo)
    summary: str | None = None
    categorized_skills: CategorizedSkills = Field(
        default_factory=CategorizedSkills
    )
    structured_experience: list[ResumeExperience] = Field(default_factory=list)
    structured_projects: list[ResumeProject] = Field(default_factory=list)
    structured_education: list[ResumeEducation] = Field(default_factory=list)
    certifications: list[ResumeCertification] = Field(default_factory=list)
    publications: list[ResumePublication] = Field(default_factory=list)
    research: list[ResumeResearch] = Field(default_factory=list)
    achievements: list[ResumeAchievement] = Field(default_factory=list)
    languages: list[ResumeLanguage] = Field(default_factory=list)
    coursework: list[ResumeCoursework] = Field(default_factory=list)
    other_sections: list[OtherSection] = Field(default_factory=list)
    raw_sections: dict[str, RawSection] = Field(default_factory=dict)
    parsing_metadata: ParsingMetadata
