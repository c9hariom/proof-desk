"""
Wikipedia search — free, no API key required.

Used for entity discovery, terminology and background context (spec §10),
never treated as a primary evidence source by itself.
"""

import logging

import httpx

logger = logging.getLogger("proofdesk.research.wikipedia")

_SEARCH_URL = "https://en.wikipedia.org/w/api.php"
_SUMMARY_URL = "https://en.wikipedia.org/api/rest_v1/page/summary/{title}"


def search(query: str, max_results: int = 2) -> list[dict]:
    """Return up to ``max_results`` Wikipedia articles with a short summary."""
    try:
        with httpx.Client(timeout=8.0) as client:
            resp = client.get(_SEARCH_URL, params={
                "action": "query",
                "list": "search",
                "srsearch": query,
                "format": "json",
                "srlimit": max_results,
            })
            resp.raise_for_status()
            hits = resp.json().get("query", {}).get("search", [])

            results = []
            for hit in hits:
                title = hit["title"]
                summary_resp = client.get(_SUMMARY_URL.format(title=title.replace(" ", "_")))
                extract = ""
                page_url = f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}"
                if summary_resp.status_code == 200:
                    data = summary_resp.json()
                    extract = data.get("extract", "")
                    page_url = data.get("content_urls", {}).get("desktop", {}).get("page", page_url)
                results.append({"title": title, "url": page_url, "snippet": extract})
            return results
    except Exception:
        logger.warning("Wikipedia search failed for query: %s", query, exc_info=True)
        return []
