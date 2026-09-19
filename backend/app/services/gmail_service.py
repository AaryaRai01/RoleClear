from __future__ import annotations

import base64
import json
import secrets
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.parse import urlencode

import httpx

from app.core.config import get_settings


settings = get_settings()

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1"

# Least-privilege scope for this V1: read Gmail only.
GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
]

BACKEND_ROOT = Path(__file__).resolve().parents[2]

_configured_token_path = Path(
    settings.gmail_token_path
).expanduser()

TOKEN_PATH = (
    _configured_token_path
    if _configured_token_path.is_absolute()
    else BACKEND_ROOT / _configured_token_path
).resolve()

# Local-development state store. For production/multi-user deployment,
# move OAuth state and tokens into the authenticated user's database row.
_PENDING_STATES: dict[str, float] = {}
STATE_TTL_SECONDS = 10 * 60


class GmailConfigError(RuntimeError):
    pass


class GmailAuthError(RuntimeError):
    pass


def _require_config() -> None:
    if not settings.google_client_id:
        raise GmailConfigError(
            "GOOGLE_CLIENT_ID is not configured."
        )

    if not settings.google_client_secret:
        raise GmailConfigError(
            "GOOGLE_CLIENT_SECRET is not configured."
        )

    if not settings.google_redirect_uri:
        raise GmailConfigError(
            "GOOGLE_REDIRECT_URI is not configured."
        )


def _cleanup_states() -> None:
    now = time.time()

    expired = [
        state
        for state, created_at
        in _PENDING_STATES.items()
        if now - created_at > STATE_TTL_SECONDS
    ]

    for state in expired:
        _PENDING_STATES.pop(state, None)


def create_authorization_url() -> str:
    _require_config()
    _cleanup_states()

    state = secrets.token_urlsafe(32)
    _PENDING_STATES[state] = time.time()

    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": " ".join(GMAIL_SCOPES),
        "access_type": "offline",
        "include_granted_scopes": "true",
        # Needed in local development so reconnecting can return a refresh token.
        "prompt": "consent",
        "state": state,
    }

    return f"{GOOGLE_AUTH_URL}?{urlencode(params)}"


def validate_state(state: str) -> None:
    _cleanup_states()

    created_at = _PENDING_STATES.pop(
        state,
        None,
    )

    if created_at is None:
        raise GmailAuthError(
            "Invalid or expired OAuth state."
        )


def _read_tokens() -> dict[str, Any] | None:
    if not TOKEN_PATH.exists():
        return None

    try:
        return json.loads(
            TOKEN_PATH.read_text(
                encoding="utf-8",
            )
        )
    except (
        OSError,
        json.JSONDecodeError,
    ):
        return None


def _write_tokens(
    payload: dict[str, Any],
) -> None:
    TOKEN_PATH.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    TOKEN_PATH.write_text(
        json.dumps(
            payload,
            indent=2,
        ),
        encoding="utf-8",
    )


def disconnect() -> None:
    if TOKEN_PATH.exists():
        TOKEN_PATH.unlink()


async def exchange_code(
    code: str,
) -> dict[str, Any]:
    _require_config()

    async with httpx.AsyncClient(
        timeout=20.0,
    ) as client:
        response = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id":
                    settings.google_client_id,
                "client_secret":
                    settings.google_client_secret,
                "redirect_uri":
                    settings.google_redirect_uri,
                "grant_type":
                    "authorization_code",
            },
        )

    if response.status_code >= 400:
        try:
            error_payload = response.json()
        except Exception:
            error_payload = {}

        error = str(
            error_payload.get(
                "error",
                "oauth_error",
            )
        )
        description = str(
            error_payload.get(
                "error_description",
                "Google rejected the OAuth code exchange.",
            )
        )

        print(
            "[GMAIL OAUTH] token exchange failed: "
            f"{response.status_code} | {error} | {description}"
        )

        raise GmailAuthError(
            f"Google OAuth failed: {error} — {description}"
        )

    token = response.json()
    previous = _read_tokens() or {}

    # Google may omit refresh_token on repeat consent grants.
    # Preserve the previously saved refresh token so the Gmail connection
    # survives backend/frontend restarts and access-token expiry.
    if (
        not token.get("refresh_token")
        and previous.get("refresh_token")
    ):
        token["refresh_token"] = (
            previous["refresh_token"]
        )

    token["obtained_at"] = int(
        time.time()
    )

    _write_tokens(token)

    return token


async def _refresh_access_token(
    token: dict[str, Any],
) -> dict[str, Any]:
    refresh_token = token.get(
        "refresh_token"
    )

    if not refresh_token:
        disconnect()
        raise GmailAuthError(
            "Gmail access expired and no refresh token is available. Reconnect Gmail."
        )

    async with httpx.AsyncClient(
        timeout=20.0,
    ) as client:
        response = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "client_id":
                    settings.google_client_id,
                "client_secret":
                    settings.google_client_secret,
                "refresh_token":
                    refresh_token,
                "grant_type":
                    "refresh_token",
            },
        )

    if response.status_code >= 400:
        # A rejected refresh token is not recoverable locally.
        disconnect()

        detail = ""
        try:
            payload = response.json()
            detail = str(
                payload.get(
                    "error_description"
                )
                or payload.get("error")
                or ""
            )
        except Exception:
            detail = ""

        suffix = (
            f" Google said: {detail}"
            if detail
            else ""
        )

        raise GmailAuthError(
            "Could not refresh Gmail access. Reconnect Gmail."
            + suffix
        )

    refreshed = response.json()

    token.update(refreshed)
    token["refresh_token"] = (
        refresh_token
    )
    token["obtained_at"] = int(
        time.time()
    )

    _write_tokens(token)

    return token


async def get_access_token() -> str:
    token = _read_tokens()

    if not token:
        raise GmailAuthError(
            "Gmail is not connected."
        )

    access_token = token.get(
        "access_token"
    )
    expires_in = int(
        token.get(
            "expires_in",
            3600,
        )
    )
    obtained_at = int(
        token.get(
            "obtained_at",
            0,
        )
    )

    if (
        not access_token
        or time.time()
        >= obtained_at
        + expires_in
        - 60
    ):
        token = await _refresh_access_token(
            token
        )
        access_token = token.get(
            "access_token"
        )

    if not access_token:
        raise GmailAuthError(
            "No Gmail access token is available."
        )

    return str(access_token)


async def _gmail_get(
    path: str,
    *,
    params: dict[str, Any] | None = None,
    _retry_after_refresh: bool = True,
) -> dict[str, Any]:
    access_token = await get_access_token()

    async with httpx.AsyncClient(
        timeout=20.0,
    ) as client:
        response = await client.get(
            f"{GMAIL_API_BASE}{path}",
            params=params,
            headers={
                "Authorization":
                    f"Bearer {access_token}",
            },
        )

    if (
        response.status_code == 401
        and _retry_after_refresh
    ):
        token = _read_tokens()

        if token:
            await _refresh_access_token(
                token
            )

            # Retry exactly once. The previous recursive implementation could
            # keep refreshing/retrying for a long time on a persistently bad
            # token, which is why sync appeared to hang for 1–2 minutes.
            return await _gmail_get(
                path,
                params=params,
                _retry_after_refresh=False,
            )

    if response.status_code == 401:
        disconnect()
        raise GmailAuthError(
            "Google rejected the Gmail access token after refresh. Reconnect Gmail and approve Gmail read access again."
        )

    if response.status_code >= 400:
        detail = ""
        try:
            payload = response.json()
            error = payload.get(
                "error",
                {}
            )

            if isinstance(
                error,
                dict,
            ):
                detail = str(
                    error.get(
                        "message"
                    )
                    or ""
                )
        except Exception:
            detail = ""

        suffix = (
            f" Google said: {detail}"
            if detail
            else ""
        )

        raise GmailAuthError(
            f"Gmail API request failed with HTTP {response.status_code}."
            + suffix
        )

    return response.json()


async def get_connection_status() -> dict[str, Any]:
    if not _read_tokens():
        return {
            "connected": False,
            "email": None,
        }

    try:
        profile = await _gmail_get(
            "/users/me/profile"
        )

        return {
            "connected": True,
            "email":
                profile.get(
                    "emailAddress"
                ),
        }

    except GmailAuthError:
        return {
            "connected": False,
            "email": None,
        }


def _decode_base64url(
    value: str,
) -> str:
    if not value:
        return ""

    padded = value + "=" * (
        -len(value) % 4
    )

    try:
        return base64.urlsafe_b64decode(
            padded.encode("ascii")
        ).decode(
            "utf-8",
            errors="replace",
        )
    except Exception:
        return ""


def _plain_text_from_payload(
    payload: dict[str, Any],
) -> str:
    mime_type = str(
        payload.get(
            "mimeType",
            "",
        )
    ).lower()

    body_data = (
        payload.get("body", {})
        or {}
    ).get(
        "data",
        "",
    )

    if (
        mime_type == "text/plain"
        and body_data
    ):
        return _decode_base64url(
            body_data
        )

    parts = payload.get(
        "parts",
        []
    ) or []

    for part in parts:
        text = _plain_text_from_payload(
            part
        )

        if text.strip():
            return text

    # HTML-only email fallback. Keep this conservative because
    # the frontend mainly needs enough text for status classification.
    if (
        mime_type == "text/html"
        and body_data
    ):
        html = _decode_base64url(
            body_data
        )

        # Minimal tag removal without another dependency.
        import re

        return re.sub(
            r"<[^>]+>",
            " ",
            html,
        )

    return ""


def _header(
    headers: list[dict[str, Any]],
    name: str,
) -> str:
    target = name.lower()

    for item in headers:
        if (
            str(
                item.get(
                    "name",
                    "",
                )
            ).lower()
            == target
        ):
            return str(
                item.get(
                    "value",
                    "",
                )
            )

    return ""


@dataclass
class GmailMessage:
    id: str
    thread_id: str
    subject: str
    sender: str
    date: str
    snippet: str
    body_text: str

    def to_dict(
        self,
    ) -> dict[str, Any]:
        return {
            "id": self.id,
            "thread_id":
                self.thread_id,
            "subject":
                self.subject,
            "sender":
                self.sender,
            "date": self.date,
            "snippet":
                self.snippet,
            "body_text":
                self.body_text,
        }



# ------------------------------------------------------------
# High-precision Career Inbox filter
# ------------------------------------------------------------

# Strong transactional phrases: these normally mean the user has
# actually applied or the employer is progressing an existing application.
_STRONG_APPLICATION_SIGNALS = (
    "thank you for applying",
    "thanks for applying",
    "application received",
    "application submitted",
    "application successfully submitted",
    "successfully submitted your application",
    "we received your application",
    "we have received your application",
    "we've received your application",
    "your application has been received",
    "your application was received",
    "your application for",
    "application status",
    "update on your application",
    "regarding your application",
    "in reference to your application",
    "following up on your application",
    "next step in your application",
    "next steps in your application",
    "moving forward with your application",
    "progressing your application",
    "shortlisted",
    "you have been shortlisted",
    "invite you to interview",
    "invitation to interview",
    "interview invitation",
    "schedule an interview",
    "technical interview",
    "phone interview",
    "virtual interview",
    "onsite interview",
    "next round",
    "technical round",
    "coding round",
    "assessment invitation",
    "online assessment",
    "coding assessment",
    "complete the assessment",
    "hiring assessment",
    "candidate assessment",
    "pleased to offer",
    "offer letter",
    "employment offer",
    "job offer",
    "unfortunately",
    "not moving forward",
    "will not be moving forward",
    "decided not to move forward",
    "other candidates",
    "position has been filled",
)

# Signals that are useful when paired with an application-specific phrase,
# company/role terms, or recruiter/hiring context.
_SUPPORTING_SIGNALS = (
    "application",
    "applied",
    "candidate",
    "candidacy",
    "recruiting",
    "recruiter",
    "talent acquisition",
    "hiring team",
    "hiring manager",
    "interview",
    "assessment",
    "screening",
    "offer",
    "rejection",
    "position",
    "role",
)

# Messages that commonly produce false positives in a career inbox.
_NEWSLETTER_ALERT_SIGNALS = (
    "job alert",
    "jobs for you",
    "recommended jobs",
    "recommended roles",
    "recommended opportunities",
    "new jobs for you",
    "new opportunities for you",
    "opportunities for you",
    "jobs you may like",
    "roles you may like",
    "similar jobs",
    "similar roles",
    "weekly jobs",
    "weekly digest",
    "daily digest",
    "career digest",
    "career newsletter",
    "job recommendations",
    "personalized jobs",
    "based on your profile",
    "based on your preferences",
    "handpicked jobs",
    "top jobs",
    "latest jobs",
    "browse jobs",
    "explore jobs",
    "view all jobs",
    "subscribe",
)

# Known platform/community language that is usually discovery content,
# not an employer update on an application already submitted.
_DISCOVERY_PLATFORM_SIGNALS = (
    "propeers",
    "job board",
    "career community",
    "job recommendations",
    "recommended for you",
)


def _normalise_message_text(*values: str) -> str:
    import re

    text = " ".join(
        value or ""
        for value in values
    ).lower()

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


def _contains_any(
    text: str,
    phrases: tuple[str, ...],
) -> bool:
    return any(
        phrase in text
        for phrase in phrases
    )



# Career platforms, communities and newsletter-style senders that should not
# appear in Career Inbox unless the message is an unmistakable transactional
# application update from a real employer/ATS flow.
_BLOCKED_SOURCE_TERMS = (
    "unstop",
    "internshala",
    "club itc",
    "propeers",
    "naukri",
    "indeed",
    "linkedin jobs",
    "foundit",
    "monster",
    "cutshort",
    "hirist",
    "wellfound",
    "angel list",
    "angel.co",
    "glassdoor",
    "freshersworld",
    "apna",
    "shine.com",
    "jobhai",
    "timesjobs",
    "careerjet",
    "simplyhired",
    "placementindia",
    "intern theory",
    "youth4work",
    "prosple",
)

_BLOCKED_DOMAIN_TERMS = (
    "unstop.com",
    "internshala.com",
    "propeers.in",
    "naukri.com",
    "indeed.com",
    "linkedin.com",
    "foundit.in",
    "monsterindia.com",
    "cutshort.io",
    "hirist.tech",
    "wellfound.com",
    "glassdoor.com",
    "freshersworld.com",
    "apna.co",
    "shine.com",
    "jobhai.com",
    "timesjobs.com",
    "careerjet.co.in",
    "simplyhired.co.in",
    "placementindia.com",
    "prosple.com",
)

def _is_blocked_source(
    *,
    sender: str,
    subject: str,
    snippet: str,
    body_text: str,
) -> bool:
    sender_text = _normalise_message_text(sender)
    all_text = _normalise_message_text(
        sender,
        subject,
        snippet,
        body_text,
    )

    if any(
        term in sender_text
        for term in _BLOCKED_SOURCE_TERMS
    ):
        return True

    if any(
        domain in sender_text
        for domain in _BLOCKED_DOMAIN_TERMS
    ):
        return True

    # Some newsletters put their brand primarily in the body/footer rather
    # than the From header.
    if any(
        term in all_text
        for term in (
            "unsubscribe from job alerts",
            "manage job alerts",
            "recommended jobs for you",
            "job recommendations",
            "career newsletter",
            "weekly opportunity digest",
        )
    ):
        return True

    return False


def _has_unmistakable_transactional_signal(
    text: str,
) -> bool:
    """
    These phrases are strong enough to override a platform/source block if
    the same platform actually forwards a real application event.
    """
    transactional = (
        "thank you for applying",
        "application successfully submitted",
        "successfully submitted your application",
        "we received your application",
        "we have received your application",
        "your application has been received",
        "interview invitation",
        "invite you to interview",
        "schedule an interview",
        "online assessment",
        "complete the assessment",
        "technical interview",
        "next round",
        "offer letter",
        "pleased to offer",
        "not moving forward",
        "will not be moving forward",
        "regret to inform",
    )

    return any(
        phrase in text
        for phrase in transactional
    )


def _career_message_score(
    *,
    subject: str,
    sender: str,
    snippet: str,
    body_text: str,
) -> tuple[int, list[str]]:
    """
    Conservative application-mail scoring.

    We intentionally prefer missing a generic career email over polluting
    Career Inbox with newsletters/job alerts. A message needs evidence that
    it belongs to an application already submitted or a concrete recruiter
    conversation about an application.
    """

    text = _normalise_message_text(
        subject,
        sender,
        snippet,
        body_text,
    )

    subject_text = _normalise_message_text(
        subject,
    )

    score = 0
    reasons: list[str] = []

    strong_hits = [
        signal
        for signal in _STRONG_APPLICATION_SIGNALS
        if signal in text
    ]

    blocked_source = _is_blocked_source(
        sender=sender,
        subject=subject,
        snippet=snippet,
        body_text=body_text,
    )

    if blocked_source and not _has_unmistakable_transactional_signal(text):
        score -= 20
        reasons.append(
            "blocked-career-platform"
        )

    if strong_hits:
        score += 6
        reasons.append(
            f"transactional:{strong_hits[0]}"
        )

    # Subject lines are high-value evidence because application systems
    # typically put the event type there.
    subject_events = (
        "application",
        "interview",
        "assessment",
        "screening",
        "offer",
        "rejection",
        "candidate",
    )

    if any(
        event in subject_text
        for event in subject_events
    ):
        score += 2
        reasons.append(
            "application-event-in-subject"
        )

    # Specific "application for <role>" / "applied for <role>" language is
    # useful for direct recruiter correspondence as well as ATS emails.
    if (
        "application for" in text
        or "applied for" in text
        or "applied to" in text
        or "regarding the" in text
        and "position" in text
    ):
        score += 3
        reasons.append(
            "specific-application-reference"
        )

    hiring_context_hits = sum(
        1
        for signal in (
            "recruiter",
            "recruiting",
            "talent acquisition",
            "hiring team",
            "hiring manager",
            "candidate",
        )
        if signal in text
    )

    if hiring_context_hits:
        score += min(
            hiring_context_hits,
            2,
        )
        reasons.append(
            "hiring-context"
        )

    process_hits = sum(
        1
        for signal in (
            "interview",
            "assessment",
            "screening",
            "next round",
            "offer",
            "rejection",
            "shortlisted",
        )
        if signal in text
    )

    if process_hits:
        score += min(
            process_hits * 2,
            4,
        )
        reasons.append(
            "application-process-event"
        )

    # Newsletter/job-alert language is a strong negative only when there
    # is not already a strong transactional employer signal.
    newsletter_hits = [
        signal
        for signal in _NEWSLETTER_ALERT_SIGNALS
        if signal in text
    ]

    discovery_hits = [
        signal
        for signal in _DISCOVERY_PLATFORM_SIGNALS
        if signal in text
    ]

    if newsletter_hits and not strong_hits:
        score -= 7
        reasons.append(
            f"newsletter:{newsletter_hits[0]}"
        )

    if discovery_hits and not strong_hits:
        score -= 5
        reasons.append(
            f"discovery-platform:{discovery_hits[0]}"
        )

    # Generic "hiring" alone is NOT enough. Many newsletters say
    # "companies hiring now". We only use it as supporting evidence.
    if (
        "hiring" in text
        and (
            "your application" in text
            or "application for" in text
            or process_hits
        )
    ):
        score += 1
        reasons.append(
            "hiring-plus-application-context"
        )

    return score, reasons


def _is_application_mail(
    *,
    subject: str,
    sender: str,
    snippet: str,
    body_text: str,
) -> bool:
    text = _normalise_message_text(
        subject,
        sender,
        snippet,
        body_text,
    )

    blocked_source = _is_blocked_source(
        sender=sender,
        subject=subject,
        snippet=snippet,
        body_text=body_text,
    )

    unmistakable = (
        _has_unmistakable_transactional_signal(
            text
        )
    )

    # Keep genuine application-context mail visible in Career Inbox even
    # when it is informational and should NOT change tracker status.
    # Examples: "application incomplete", "keep track of your application",
    # and other messages that clearly refer to the user's submitted application.
    application_context = any(
        signal in text
        for signal in (
            "your application",
            "application for",
            "application status",
            "application is incomplete",
            "application incomplete",
            "complete your application",
            "keep track of your application",
            "applied for",
            "applied to",
        )
    )

    lifecycle_context = any(
        signal in text
        for signal in (
            "screening",
            "assessment",
            "interview",
            "next round",
            "shortlisted",
            "offer letter",
            "pleased to offer",
            "not moving forward",
            "regret to inform",
            "rejected",
        )
    )

    # Known discovery/newsletter sources still need a concrete transactional
    # or application-specific signal. This prevents generic job alerts from
    # flooding Career Inbox while allowing real application mail through.
    if (
        blocked_source
        and not unmistakable
        and not application_context
        and not lifecycle_context
    ):
        return False

    score, _ = _career_message_score(
        subject=subject,
        sender=sender,
        snippet=snippet,
        body_text=body_text,
    )

    return (
        score >= 5
        or application_context
        or lifecycle_context
    )


async def sync_career_messages(
    *,
    max_results: int = 50,
    newer_than_days: int = 180,
) -> list[dict[str, Any]]:
    """
    Fetch a broad-but-reasonable candidate set from Gmail, then run a
    precision-first local filter before anything reaches Career Inbox.

    Important:
    - We do NOT trust Gmail keyword search alone.
    - Generic newsletters/job alerts are intentionally removed.
    - Direct recruiter/application conversations can still pass.
    """

    # Stage 1 intentionally stays simple. Gmail's API search parser can
    # reject complex grouped negative-from expressions even when OAuth is
    # perfectly valid. We therefore fetch recent non-junk mail broadly and
    # apply the career/source filtering locally below.
    search = (
        f"newer_than:{newer_than_days}d "
        "-category:promotions "
        "-category:social "
        "-category:forums "
        "-label:spam "
        "-label:trash"
    )

    candidate_limit = min(
        max(
            max_results * 3,
            75,
        ),
        180,
    )

    listing = await _gmail_get(
        "/users/me/messages",
        params={
            "q": search,
            "maxResults":
                candidate_limit,
        },
    )

    refs = listing.get(
        "messages",
        []
    ) or []

    messages: list[
        dict[str, Any]
    ] = []

    for ref in refs:
        if len(messages) >= max_results:
            break

        message_id = ref.get("id")

        if not message_id:
            continue

        raw = await _gmail_get(
            f"/users/me/messages/{message_id}",
            params={
                "format": "full",
            },
        )

        payload = raw.get(
            "payload",
            {},
        ) or {}

        headers = payload.get(
            "headers",
            [],
        ) or []

        subject = _header(
            headers,
            "Subject",
        )

        sender = _header(
            headers,
            "From",
        )

        snippet = str(
            raw.get(
                "snippet",
                "",
            )
        )

        body_text = _plain_text_from_payload(
            payload
        )[:5000]

        if not _is_application_mail(
            subject=subject,
            sender=sender,
            snippet=snippet,
            body_text=body_text,
        ):
            continue

        score, reasons = (
            _career_message_score(
                subject=subject,
                sender=sender,
                snippet=snippet,
                body_text=body_text,
            )
        )

        message = GmailMessage(
            id=str(message_id),
            thread_id=str(
                raw.get(
                    "threadId",
                    "",
                )
            ),
            subject=subject,
            sender=sender,
            date=_header(
                headers,
                "Date",
            ),
            snippet=snippet,
            body_text=body_text,
        )

        item = message.to_dict()

        # Useful for debugging locally; frontend can safely ignore this.
        item["career_score"] = score
        item["career_reasons"] = reasons

        messages.append(item)

    return messages