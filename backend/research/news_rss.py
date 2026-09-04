"""
Google News RSS — free, no API key required.

Provides recency-oriented results, useful for current-event and
market-moving claims where publication date matters most (spec §11).
"""

import logging

import feedparser

logger = logging.getLogger("proofdesk.research.news_rss")

_FEED_URL = "https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en"


def search(query: str, max_results: int = 4) -> list[dict]:
    """Return up to ``max_results`` recent news items for ``query``."""
    try:
        feed = feedparser.parse(_FEED_URL.format(query=query.replace(" ", "+")))
        results = []
        for entry in feed.entries[:max_results]:
            publisher = getattr(entry, "source", {}).get("title") if hasattr(entry, "source") else None
            results.append({
                "title": entry.get("title", ""),
                "url": entry.get("link"),
                "publisher": publisher,
                "published_at": entry.get("published"),
                "snippet": entry.get("summary", ""),
            })
        return results
    except Exception:
        logger.warning("News RSS search failed for query: %s", query, exc_info=True)
        return []
