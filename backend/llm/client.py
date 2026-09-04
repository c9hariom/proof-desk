"""
OpenAI client wrapper — the only LLM entry point used by the pipeline.

Every pipeline stage calls ``call_structured`` with a Pydantic model as the
``response_schema``; this keeps every stage's output validated JSON (spec
§35) and avoids parsing free-form prose anywhere in the codebase.
"""

import logging
from typing import TypeVar

from pydantic import BaseModel

from core.config import settings

logger = logging.getLogger("proofdesk.llm")

T = TypeVar("T", bound=BaseModel)

_client = None


def _get_client():
    """Return a cached ``openai.OpenAI`` client, creating it on first call."""
    global _client
    if _client is None:
        from openai import OpenAI
        _client = OpenAI(api_key=settings.openai_api_key)
    return _client


def call_structured(system_prompt: str, user_prompt: str, response_schema: type[T]) -> T:
    """
    Call the configured OpenAI model and parse the response into
    ``response_schema``.

    Raises on any API or validation failure — callers are responsible for
    catching this and recording a partial-failure error (spec §32) rather
    than letting one stage take down the whole review.
    """
    client = _get_client()
    completion = client.chat.completions.parse(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format=response_schema,
    )
    parsed = completion.choices[0].message.parsed
    if parsed is None:
        raise RuntimeError(f"OpenAI returned no parsed {response_schema.__name__} output")
    return parsed
