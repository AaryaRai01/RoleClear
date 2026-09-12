from functools import lru_cache

from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)


class Settings(BaseSettings):
    frontend_origins: str = (
        "http://localhost:4000,"
        "http://127.0.0.1:4000,"
        "http://localhost:4001,"
        "http://127.0.0.1:4001,"
        "http://localhost:5173,"
        "http://127.0.0.1:5173"
    )

    request_timeout_seconds: float = 15.0

    user_agent: str = (
        "Mozilla/5.0 "
        "(compatible; RoleClear/1.0)"
    )

    # Gmail OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = (
        "http://127.0.0.1:8000/"
        "api/v1/email/gmail/callback"
    )

    # Local V1 only. Do not commit this token file.
    gmail_token_path: str = (
        ".roleclear_gmail_tokens.json"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins(
        self,
    ) -> list[str]:
        return [
            origin.strip()
            for origin
            in self.frontend_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
