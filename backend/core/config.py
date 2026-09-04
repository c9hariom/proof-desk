"""
Application configuration — loaded from environment variables or a ``.env`` file.

Proof Desk uses OpenAI only. If ``OPENAI_API_KEY`` is missing, the app
automatically falls back to deterministic demo mode instead of failing.
"""

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central settings object — values are read from env vars or a ``.env`` file."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # OpenAI (the only intelligence provider)
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    # Optional free-tier research API. If empty, the Evidence Researcher
    # stage simply skips NewsAPI and relies on DuckDuckGo / Wikipedia / RSS.
    newsapi_api_key: str = ""

    # When true (or when openai_api_key is empty), serve a deterministic
    # fixture review instead of calling OpenAI.
    demo_mode: bool = False

    # Comma-separated list of allowed frontend origins.
    cors_origins: str = "http://localhost:5173"

    @model_validator(mode="after")
    def _resolve_demo_mode(self) -> "Settings":
        """Force demo mode on whenever no OpenAI key is configured."""
        if not self.openai_api_key:
            self.demo_mode = True
        return self

    @property
    def cors_origin_list(self) -> list[str]:
        """Return ``cors_origins`` split into a clean list of origins."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
