"""
GDELT news archive search — free, no API key required.

Good for current-event and geopolitical claims where a broad, global news
archive helps more than a handful of top web hits (spec §11).
"""

import logging

import httpx

logger = logging.getLogger("proofdesk.research.gdelt")

_URL = "https://api.gdeltproject.org/api/v2/doc/doc"


def search(query: str, max_results: int = 3) -> list[dict]:
    """Return up to ``max_results`` news articles from the GDELT archive."""
    try:
        with httpx.Client(timeout=8.0) as client:
            resp = client.get(_URL, params={
                "query": query,
                "mode": "artlist",
                "maxrecords": max_results,
                "format": "json",
                "sort": "hybridrel",
            })
            resp.raise_for_status()
            articles = resp.json().get("articles", []) or []
            return [{
                "title": a.get("title", ""),
                "url": a.get("url"),
                "publisher": a.get("domain"),
                "published_at": a.get("seendate"),
                "snippet": None,
            } for a in articles]
    except Exception:
        logger.warning("GDELT search failed for query: %s", query, exc_info=True)
        return []
