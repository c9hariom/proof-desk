"""
Evidence Researcher — aggregates the free research sources for one claim.

This stage is deliberately NOT an LLM call (spec §33: minimise API calls).
It just gathers raw candidate sources; the Cross-Checker stage (an LLM
call) later judges how each source relates to the claim. Every search is
logged to the activity log so the Analysing screen can show, in real
time, which source is being consulted and for what claim.
"""

import logging
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse

from core.activity_log import log as log_activity
from core.config import settings
from core import research_progress
from research import duckduckgo, gdelt, news_rss, newsapi, wikipedia
from research.source_classifier import classify_domain

logger = logging.getLogger("proofdesk.research.aggregate")

_MAX_CANDIDATES = 6

# (search function, activity-log label, resulting source_type)
_SOURCES = [
    (duckduckgo.search, "DuckDuckGo web search", "web"),
    (wikipedia.search, "Wikipedia", "encyclopedia"),
    (news_rss.search, "Google News RSS", "news"),
    (newsapi.search, "NewsAPI", "news"),
    (gdelt.search, "GDELT news archive", "news"),
]

# Category labels shown live on the Analysing screen, in display order.
CATEGORY_LABELS = [label for _fn, label, _source_type in _SOURCES]


def _domain(url: str | None) -> str:
    if not url:
        return ""
    try:
        return urlparse(url).netloc.lower().removeprefix("www.")
    except ValueError:
        return ""


def _truncate(text: str, limit: int = 80) -> str:
    return text if len(text) <= limit else text[: limit - 1] + "…"


def _run_source(review_id: str, fn, label: str, claim_text: str, short_claim: str) -> list[dict]:
    """Run one search source, logging its start and result count."""
    if fn is newsapi.search and not settings.newsapi_api_key:
        return []  # skip silently — no key configured, nothing to log

    log_activity(review_id, f"Searching {label} for: \u201c{short_claim}\u201d")
    research_progress.mark_scanning(review_id, label)
    try:
        results = fn(claim_text)
    except Exception:
        logger.warning("%s search raised for claim: %s", label, claim_text, exc_info=True)
        results = []
    log_activity(review_id, f"{label} returned {len(results)} result(s) for: \u201c{short_claim}\u201d")
    research_progress.mark_done(review_id, label, len(results))

    for item in results:
        domain = _domain(item.get("url"))
        research_progress.add_source(review_id, {
            "title": item.get("title", "Untitled source"),
            "url": item.get("url"),
            "publisher": item.get("publisher") or domain,
            "published_at": item.get("published_at"),
            "snippet": item.get("snippet") or item.get("body"),
            "tier": classify_domain(item.get("url"), item.get("publisher")),
            "category": label,
            "claim": short_claim,
        })

    return results


def gather_candidates(review_id: str, claim_text: str) -> list[dict]:
    """
    Run all free research sources for ``claim_text`` in parallel, merge,
    deduplicate by domain, classify tiers and cap the result list.

    Returns a list of ``CandidateSource``-shaped dicts.
    """
    short_claim = _truncate(claim_text)

    with ThreadPoolExecutor(max_workers=len(_SOURCES)) as pool:
        futures = [
            pool.submit(_run_source, review_id, fn, label, claim_text, short_claim)
            for fn, label, _source_type in _SOURCES
        ]
        raw_results = [future.result() for future in futures]

    seen_domains: set[str] = set()
    candidates: list[dict] = []

    for (_fn, _label, source_type), results in zip(_SOURCES, raw_results):
        for item in results:
            domain = _domain(item.get("url"))
            dedup_key = domain or item.get("title", "")
            if dedup_key in seen_domains:
                continue
            seen_domains.add(dedup_key)

            candidates.append({
                "title": item.get("title", "Untitled source"),
                "url": item.get("url"),
                "publisher": item.get("publisher") or domain,
                "published_at": item.get("published_at"),
                "source_type": source_type,
                "tier": classify_domain(item.get("url"), item.get("publisher")),
                "snippet": item.get("snippet") or item.get("body"),
            })

            if len(candidates) >= _MAX_CANDIDATES:
                return candidates

    return candidates

