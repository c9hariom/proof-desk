"""
NewsAPI.org — optional, free-tier (requires a signup key).

No-ops silently when ``NEWSAPI_API_KEY`` is not configured, so the research
layer degrades gracefully to the always-free sources.
"""

import logging

import httpx

from core.config import settings

logger = logging.getLogger("proofdesk.research.newsapi")

_URL = "https://newsapi.org/v2/everything"


def search(query: str, max_results: int = 4) -> list[dict]:
    """Return up to ``max_results`` articles from NewsAPI, or [] if no key is set."""
    if not settings.newsapi_api_key:
        return []
    try:
        with httpx.Client(timeout=8.0) as client:
            resp = client.get(_URL, params={
                "q": query,
                "sortBy": "relevancy",
                "pageSize": max_results,
                "language": "en",
                "apiKey": settings.newsapi_api_key,
            })
            resp.raise_for_status()
            articles = resp.json().get("articles", [])
            return [{
                "title": a.get("title", ""),
                "url": a.get("url"),
                "publisher": (a.get("source") or {}).get("name"),
                "published_at": a.get("publishedAt"),
                "snippet": a.get("description"),
            } for a in articles]
    except Exception:
        logger.warning("NewsAPI search failed for query: %s", query, exc_info=True)
        return []
