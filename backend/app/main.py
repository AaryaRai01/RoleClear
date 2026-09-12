from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.smart_apply import (
    router as smart_apply_router,
)

from app.api.routes.resumes import (
    router as resumes_router,
)

from app.api.routes.email import (
    router as email_router,
)

from app.api.routes.resume_export import (
    router as resume_export_router,
)

from app.core.config import get_settings


settings = get_settings()


app = FastAPI(
    title="RoleClear API",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    smart_apply_router,
)

app.include_router(
    resumes_router,
)

app.include_router(
    email_router,
)

app.include_router(
    resume_export_router,
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "RoleClear API",
    }