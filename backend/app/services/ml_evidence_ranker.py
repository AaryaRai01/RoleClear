from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache

import numpy as np
from sentence_transformers import SentenceTransformer

from app.schemas.resume import ParsedResumeV2


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


@dataclass
class ResumeEvidenceUnit:
    text: str
    section: str
    source_index: int | None = None


@dataclass
class RankedEvidence:
    requirement: str
    evidence: str
    section: str
    similarity: float
    source_index: int | None = None


# ============================================================
# MODEL
# ============================================================

@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    """
    Load RoleClear ML V1 once per backend process.

    Production model selected after comparison against the
    experimental LambdaMART reranker.
    """
    return SentenceTransformer(
        MODEL_NAME,
        device="cpu",
    )


# ============================================================
# HELPERS
# ============================================================

def _clean(value: str | None) -> str:
    if not value:
        return ""

    return " ".join(
        str(value).split()
    ).strip()


def _dedupe_evidence(
    evidence: list[ResumeEvidenceUnit],
) -> list[ResumeEvidenceUnit]:

    seen: set[str] = set()
    result: list[ResumeEvidenceUnit] = []

    for item in evidence:
        text = _clean(item.text)

        if len(text) < 3:
            continue

        key = text.lower()

        if key in seen:
            continue

        seen.add(key)

        result.append(
            ResumeEvidenceUnit(
                text=text,
                section=item.section,
                source_index=item.source_index,
            )
        )

    return result


# ============================================================
# RESUME → ATOMIC EVIDENCE
# ============================================================

def extract_resume_evidence(
    resume: ParsedResumeV2,
) -> list[ResumeEvidenceUnit]:
    """
    Convert the structured RoleClear resume into atomic evidence
    units suitable for semantic requirement-to-evidence ranking.

    We intentionally rank real resume content only.

    No new claims are generated here.
    """

    evidence: list[ResumeEvidenceUnit] = []

    # --------------------------------------------------------
    # SUMMARY
    # --------------------------------------------------------

    summary = _clean(
        getattr(
            resume,
            "summary",
            "",
        )
    )

    if summary:
        evidence.append(
            ResumeEvidenceUnit(
                text=summary,
                section="summary",
            )
        )

    # --------------------------------------------------------
    # SKILLS
    # --------------------------------------------------------

    skills = getattr(
        resume,
        "skills",
        None,
    )

    if skills is not None:

        for field_name in skills.__class__.model_fields:

            values = getattr(
                skills,
                field_name,
                [],
            ) or []

            for skill in values:

                name = _clean(
                    getattr(
                        skill,
                        "name",
                        "",
                    )
                )

                if name:
                    evidence.append(
                        ResumeEvidenceUnit(
                            text=name,
                            section="skills",
                        )
                    )

                for item in (
                    getattr(
                        skill,
                        "evidence",
                        [],
                    )
                    or []
                ):

                    clean = _clean(item)

                    if clean:
                        evidence.append(
                            ResumeEvidenceUnit(
                                text=clean,
                                section="skills",
                            )
                        )

    # --------------------------------------------------------
    # EXPERIENCE
    # --------------------------------------------------------

    for index, experience in enumerate(
        getattr(
            resume,
            "experience",
            [],
        )
        or []
    ):

        title = _clean(
            getattr(
                experience,
                "title",
                "",
            )
        )

        company = _clean(
            getattr(
                experience,
                "company",
                "",
            )
        )

        if title:

            role_line = title

            if company:
                role_line += f" at {company}"

            evidence.append(
                ResumeEvidenceUnit(
                    text=role_line,
                    section="experience",
                    source_index=index,
                )
            )

        for bullet in (
            getattr(
                experience,
                "bullets",
                [],
            )
            or []
        ):

            clean = _clean(bullet)

            if clean:
                evidence.append(
                    ResumeEvidenceUnit(
                        text=clean,
                        section="experience",
                        source_index=index,
                    )
                )

        for technology in (
            getattr(
                experience,
                "technologies",
                [],
            )
            or []
        ):

            clean = _clean(technology)

            if clean:
                evidence.append(
                    ResumeEvidenceUnit(
                        text=clean,
                        section="experience_technology",
                        source_index=index,
                    )
                )

    # --------------------------------------------------------
    # PROJECTS
    # --------------------------------------------------------

    for index, project in enumerate(
        getattr(
            resume,
            "projects",
            [],
        )
        or []
    ):

        name = _clean(
            getattr(
                project,
                "name",
                "",
            )
        )

        description = _clean(
            getattr(
                project,
                "description",
                "",
            )
        )

        if name:
            evidence.append(
                ResumeEvidenceUnit(
                    text=name,
                    section="project",
                    source_index=index,
                )
            )

        if description:
            evidence.append(
                ResumeEvidenceUnit(
                    text=description,
                    section="project",
                    source_index=index,
                )
            )

        for bullet in (
            getattr(
                project,
                "bullets",
                [],
            )
            or []
        ):

            clean = _clean(bullet)

            if clean:
                evidence.append(
                    ResumeEvidenceUnit(
                        text=clean,
                        section="project",
                        source_index=index,
                    )
                )

        for technology in (
            getattr(
                project,
                "technologies",
                [],
            )
            or []
        ):

            clean = _clean(technology)

            if clean:
                evidence.append(
                    ResumeEvidenceUnit(
                        text=clean,
                        section="project_technology",
                        source_index=index,
                    )
                )

    # --------------------------------------------------------
    # EDUCATION
    # --------------------------------------------------------

    for index, education in enumerate(
        getattr(
            resume,
            "education",
            [],
        )
        or []
    ):

        parts: list[str] = []

        for field in (
            "degree",
            "field",
            "institution",
        ):

            value = _clean(
                getattr(
                    education,
                    field,
                    "",
                )
            )

            if value:
                parts.append(value)

        if parts:
            evidence.append(
                ResumeEvidenceUnit(
                    text=" | ".join(parts),
                    section="education",
                    source_index=index,
                )
            )

    return _dedupe_evidence(
        evidence
    )


# ============================================================
# COSINE RANKING
# ============================================================

def _cosine_scores(
    requirement_embedding: np.ndarray,
    evidence_embeddings: np.ndarray,
) -> np.ndarray:
    """
    SentenceTransformer embeddings are normalized during encode,
    therefore dot product equals cosine similarity.
    """

    return np.dot(
        evidence_embeddings,
        requirement_embedding,
    )


def rank_requirement_evidence(
    requirement: str,
    resume: ParsedResumeV2,
    *,
    top_k: int = 5,
    minimum_similarity: float = 0.20,
) -> list[RankedEvidence]:

    requirement = _clean(
        requirement
    )

    if not requirement:
        return []

    evidence_units = extract_resume_evidence(
        resume
    )

    if not evidence_units:
        return []

    model = get_embedding_model()

    evidence_texts = [
        item.text
        for item in evidence_units
    ]

    requirement_embedding = model.encode(
        requirement,
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=False,
    )

    evidence_embeddings = model.encode(
        evidence_texts,
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=False,
        batch_size=32,
    )

    scores = _cosine_scores(
        requirement_embedding,
        evidence_embeddings,
    )

    ranking = np.argsort(
        scores
    )[::-1]

    results: list[RankedEvidence] = []

    for index in ranking:

        similarity = float(
            scores[index]
        )

        if similarity < minimum_similarity:
            continue

        unit = evidence_units[
            int(index)
        ]

        results.append(
            RankedEvidence(
                requirement=requirement,
                evidence=unit.text,
                section=unit.section,
                similarity=round(
                    similarity,
                    4,
                ),
                source_index=unit.source_index,
            )
        )

        if len(results) >= top_k:
            break

    return results


# ============================================================
# MULTIPLE REQUIREMENTS
# ============================================================

def rank_resume_for_requirements(
    requirements: list[str],
    resume: ParsedResumeV2,
    *,
    top_k: int = 5,
    minimum_similarity: float = 0.20,
) -> dict[str, list[RankedEvidence]]:
    """
    Efficient batch implementation used by Smart Apply.

    Embeds resume evidence once, then evaluates all JD requirements.
    """

    cleaned_requirements: list[str] = []
    seen: set[str] = set()

    for requirement in requirements:

        clean = _clean(
            requirement
        )

        if not clean:
            continue

        key = clean.lower()

        if key in seen:
            continue

        seen.add(key)
        cleaned_requirements.append(
            clean
        )

    if not cleaned_requirements:
        return {}

    evidence_units = extract_resume_evidence(
        resume
    )

    if not evidence_units:
        return {
            requirement: []
            for requirement
            in cleaned_requirements
        }

    model = get_embedding_model()

    evidence_texts = [
        item.text
        for item
        in evidence_units
    ]

    requirement_embeddings = model.encode(
        cleaned_requirements,
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=False,
        batch_size=32,
    )

    evidence_embeddings = model.encode(
        evidence_texts,
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=False,
        batch_size=32,
    )

    score_matrix = np.matmul(
        requirement_embeddings,
        evidence_embeddings.T,
    )

    output: dict[
        str,
        list[RankedEvidence],
    ] = {}

    for requirement_index, requirement in enumerate(
        cleaned_requirements
    ):

        scores = score_matrix[
            requirement_index
        ]

        ranking = np.argsort(
            scores
        )[::-1]

        ranked: list[
            RankedEvidence
        ] = []

        for evidence_index in ranking:

            similarity = float(
                scores[evidence_index]
            )

            if similarity < minimum_similarity:
                continue

            unit = evidence_units[
                int(evidence_index)
            ]

            ranked.append(
                RankedEvidence(
                    requirement=requirement,
                    evidence=unit.text,
                    section=unit.section,
                    similarity=round(
                        similarity,
                        4,
                    ),
                    source_index=unit.source_index,
                )
            )

            if len(ranked) >= top_k:
                break

        output[
            requirement
        ] = ranked

    return output