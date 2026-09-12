from app.schemas.resume import (
    LegacyResumeExperience,
    LegacyResumeProject,
    ParsedResumeCompatResponse,
    ParsedResumeV2,
)


def flatten_skills(
    parsed: ParsedResumeV2,
) -> list[str]:

    categories = parsed.skills.model_dump()

    result: list[str] = []
    seen: set[str] = set()

    for items in categories.values():
        for item in items:

            if isinstance(item, dict):
                name = (
                    item.get("normalized_name")
                    or item.get("name")
                )
            else:
                name = (
                    getattr(
                        item,
                        "normalized_name",
                        None,
                    )
                    or getattr(
                        item,
                        "name",
                        None,
                    )
                )

            if not name:
                continue

            key = name.lower()

            if key in seen:
                continue

            seen.add(key)
            result.append(name)

    return result


def to_compat_response(
    parsed: ParsedResumeV2,
) -> ParsedResumeCompatResponse:

    legacy_experience = []

    for experience in parsed.experience:

        description = " ".join(
            experience.bullets,
        ).strip()

        if not description:
            description = (
                experience.raw_text
                or ""
            )

        legacy_experience.append(
            LegacyResumeExperience(
                title=experience.title,
                company=experience.company,
                description=description,
            )
        )

    legacy_projects = []

    for project in parsed.projects:

        description = " ".join(
            project.bullets,
        ).strip()

        if not description:
            description = (
                project.description
                or project.raw_text
                or ""
            )

        legacy_projects.append(
            LegacyResumeProject(
                name=project.name,
                description=description,
                technologies=
                    project.technologies,
            )
        )

    legacy_education = []

    for education in parsed.education:

        parts = [
            education.institution,
            education.degree,
            education.field_of_study,
            education.grade,
        ]

        text = " | ".join(
            part
            for part in parts
            if part
        )

        if text:
            legacy_education.append(text)

    return ParsedResumeCompatResponse(
        file_name=
            parsed.parsing_metadata.file_name,

        raw_text=
            parsed.raw_text,

        skills=
            flatten_skills(parsed),

        experience=
            legacy_experience,

        projects=
            legacy_projects,

        education=
            legacy_education,

        extraction_method=
            parsed.parsing_metadata.extraction_method,

        personal_info=
            parsed.personal_info,

        summary=
            parsed.summary,

        categorized_skills=
            parsed.skills,

        structured_experience=
            parsed.experience,

        structured_projects=
            parsed.projects,

        structured_education=
            parsed.education,

        certifications=
            parsed.certifications,

        publications=
            parsed.publications,

        research=
            parsed.research,

        achievements=
            parsed.achievements,

        languages=
            parsed.languages,

        coursework=
            parsed.coursework,

        other_sections=
            parsed.other_sections,

        raw_sections=
            parsed.raw_sections,

        parsing_metadata=
            parsed.parsing_metadata,
    )