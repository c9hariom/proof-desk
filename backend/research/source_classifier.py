"""
Source hierarchy classification (spec §9).

Classifies a source into one of four tiers based on its domain/publisher.
This is a heuristic, not a definitive ruling — the cross-checker LLM stage
still weighs each source's actual content, but the tier gives it (and the
UI) a starting signal for reliability.
"""

import re
from urllib.parse import urlparse

_TIER_1_DOMAINS = {
    # Governments, regulators, central banks, IGOs, official statistics
    "gov", "europa.eu", "imf.org", "worldbank.org", "un.org", "oecd.org",
    "federalreserve.gov", "ecb.europa.eu", "bis.org", "sec.gov", "who.int",
    "data.gov", "ons.gov.uk", "bls.gov", "census.gov",
}

_TIER_2_DOMAINS = {
    "reuters.com", "apnews.com", "bbc.com", "bbc.co.uk", "ft.com",
    "economist.com", "bloomberg.com", "wsj.com", "nature.com",
    "science.org", "nytimes.com", "washingtonpost.com", "theguardian.com",
    "npr.org", "afp.com",
}

_TIER_3_DOMAINS = {
    "wikipedia.org", "britannica.com", "investopedia.com",
}


def classify_domain(url: str | None, publisher: str | None = None) -> str:
    """Return a ``SourceTier`` literal string for the given URL/publisher."""
    host = ""
    if url:
        try:
            host = urlparse(url).netloc.lower()
            host = re.sub(r"^www\.", "", host)
        except ValueError:
            host = ""

    if host.endswith(".gov") or host.endswith(".gov.uk") or any(host.endswith(d) for d in _TIER_1_DOMAINS):
        return "tier_1_primary"
    if any(host.endswith(d) for d in _TIER_2_DOMAINS):
        return "tier_2_strong_secondary"
    if any(host.endswith(d) for d in _TIER_3_DOMAINS):
        return "tier_3_context"

    publisher_lower = (publisher or "").lower()
    if any(k in publisher_lower for k in ("reuters", "associated press", "bbc", "financial times", "bloomberg")):
        return "tier_2_strong_secondary"
    if "wikipedia" in publisher_lower:
        return "tier_3_context"

    return "tier_4_unverified"
