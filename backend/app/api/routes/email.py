from __future__ import annotations

from html import escape

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
)
from fastapi.responses import (
    HTMLResponse,
)
from pydantic import (
    BaseModel,
    Field,
)

from app.services.gmail_service import (
    GmailAuthError,
    GmailConfigError,
    create_authorization_url,
    disconnect,
    exchange_code,
    get_connection_status,
    sync_career_messages,
    validate_state,
)


router = APIRouter(
    prefix="/api/v1/email",
    tags=["email"],
)


class GmailAuthorizeResponse(
    BaseModel,
):
    authorization_url: str


class GmailStatusResponse(
    BaseModel,
):
    connected: bool
    email: str | None = None


class GmailMessageResponse(
    BaseModel,
):
    id: str
    thread_id: str
    subject: str
    sender: str
    date: str
    snippet: str
    body_text: str


class GmailSyncResponse(
    BaseModel,
):
    messages: list[
        GmailMessageResponse
    ] = Field(
        default_factory=list
    )
    count: int


@router.get(
    "/gmail/authorize",
    response_model=GmailAuthorizeResponse,
)
async def gmail_authorize():
    try:
        return {
            "authorization_url":
                create_authorization_url(),
        }

    except GmailConfigError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc


@router.get(
    "/gmail/callback",
    response_class=HTMLResponse,
)
async def gmail_callback(
    code: str = Query(...),
    state: str = Query(...),
):
    try:
        validate_state(state)

        await exchange_code(
            code
        )

        status = (
            await get_connection_status()
        )

        email = escape(
            str(
                status.get(
                    "email"
                )
                or "Gmail"
            )
        )

        return HTMLResponse(
            content=f"""
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>RoleClear Gmail Connected</title>
  </head>
  <body style="font-family:Arial,sans-serif;padding:32px">
    <h2>Gmail connected</h2>
    <p>{email} is now connected to RoleClear Career Inbox.</p>
    <p>You can close this window.</p>
    <script>
      if (window.opener) {{
        window.opener.postMessage(
          {{
            type: "roleclear:gmail-connected",
            email: {email!r}
          }},
          window.location.origin
        );
      }}
      setTimeout(() => window.close(), 900);
    </script>
  </body>
</html>
            """,
        )

    except (
        GmailAuthError,
        GmailConfigError,
    ) as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc


@router.get(
    "/gmail/status",
    response_model=GmailStatusResponse,
)
async def gmail_status():
    return await get_connection_status()


@router.post(
    "/gmail/sync",
    response_model=GmailSyncResponse,
)
async def gmail_sync(
    max_results: int = Query(
        default=50,
        ge=1,
        le=100,
    ),
):
    try:
        messages = await sync_career_messages(
            max_results=max_results,
        )

        return {
            "messages":
                messages,
            "count":
                len(messages),
        }

    except GmailAuthError as exc:
        raise HTTPException(
            status_code=401,
            detail=str(exc),
        ) from exc


@router.delete(
    "/gmail/disconnect",
)
async def gmail_disconnect():
    disconnect()

    return {
        "disconnected": True,
    }
