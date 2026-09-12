from fastapi import (
    APIRouter,
    File,
    HTTPException,
    UploadFile,
)

from app.schemas.resume import (
    ParsedResumeCompatResponse,
    ParsedResumeV2,
)

from app.services.resume_compat import (
    to_compat_response,
)

from app.services.resume_parser import (
    ResumeParsingError,
    parse_resume,
)


router = APIRouter(
    tags=["resumes"],
)

MAX_FILE_SIZE = 10 * 1024 * 1024


async def read_resume_upload(
    file: UploadFile,
) -> tuple[str, bytes]:

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Resume filename is missing.",
        )

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Resume file is empty.",
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Resume file exceeds 10MB.",
        )

    return file.filename, content


@router.post(
    "/api/v1/resumes/parse",
    response_model=ParsedResumeCompatResponse,
)
async def parse_resume_v1(
    file: UploadFile = File(...),
):

    file_name, content = await read_resume_upload(
        file,
    )

    try:
        parsed = parse_resume(
            file_name,
            content,
        )

        return to_compat_response(
            parsed,
        )

    except ResumeParsingError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc


@router.post(
    "/api/v2/resumes/parse",
    response_model=ParsedResumeV2,
)
async def parse_resume_v2(
    file: UploadFile = File(...),
):

    file_name, content = await read_resume_upload(
        file,
    )

    try:
        return parse_resume(
            file_name,
            content,
        )

    except ResumeParsingError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc