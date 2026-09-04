"""
DuckDuckGo web search — free, no API key required.

Wraps the ``ddgs`` package. Any failure (network, rate limit, package
error) is swallowed and results in an empty list so the pipeline can keep
going with whatever other sources are available.
"""

import logging

logger = logging.getLogger("proofdesk.research.duckduckgo")


def search(query: str, max_results: int = 4) -> list[dict]:
    """Return up to ``max_results`` web search hits as raw dicts."""
    try:
        from ddgs import DDGS

        with DDGS() as ddgs:
            return list(ddgs.text(query, max_results=max_results))
    except Exception:
        logger.warning("DuckDuckGo search failed for query: %s", query, exc_info=True)
        return []
