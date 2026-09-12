from __future__ import annotations

from io import BytesIO
from urllib.parse import quote

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse

from app.schemas.tailoring import TailorResumeRequest
from app.services.resume_docx import (
    build_resume_docx,
    resume_docx_filename,
)
from app.services.resume_tailor import tailor_resume_for_job


router = APIRouter(
    prefix="/api/v1/resume-export",
    tags=["resume-export"],
)


@router.post("/tailored-docx")
async def export_tailored_docx(
    payload: TailorResumeRequest,
):
    """
    Generate a truth-preserving targeted resume and return it as an
    editable ATS-friendly Word document.
    """
    try:
        result = tailor_resume_for_job(
            job=payload.job,
            resume=payload.resume,
            max_experience_bullets=payload.max_experience_bullets,
            max_project_bullets=payload.max_project_bullets,
            max_projects=payload.max_projects,
        )

        if not result.claim_validation.passed:
            raise ValueError(
                "Claim validation failed."
            )

        content = build_resume_docx(
            result.tailored_resume
        )

        filename = resume_docx_filename(
            result.tailored_resume,
            company=result.company,
            job_title=result.job_title,
        )

        headers = {
            "Content-Disposition": (
                "attachment; filename*=UTF-8''"
                + quote(filename)
            ),
            "X-RoleClear-Version-Id": result.version_id,
            "X-RoleClear-Claim-Validation": "passed",
        }

        return StreamingResponse(
            BytesIO(content),
            media_type=(
                "application/vnd.openxmlformats-officedocument."
                "wordprocessingml.document"
            ),
            headers=headers,
        )

    except Exception as exc:
        print(
            "[ROLECLEAR DOCX EXPORT ERROR]",
            type(exc).__name__,
            str(exc),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "The tailored Word resume could not be generated safely."
            ),
        ) from exc
