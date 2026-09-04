"""
In-memory live research progress tracker — powers the "Searching for
evidence" view on the Analysing screen: per-category scan status (which
free source is being queried) and a rolling feed of candidate sources as
they're found.

Not persisted to disk; cleared on process restart, same as activity_log.
"""

import threading

_lock = threading.Lock()
_progress: dict[str, dict] = {}
_MAX_SOURCES = 60


def _state(review_id: str) -> dict:
    return _progress.setdefault(review_id, {"categories": {}, "sources": []})


def start(review_id: str, categories: list[str]) -> None:
    """Reset progress for a new review run, pre-seeding known categories."""
    with _lock:
        _progress[review_id] = {
            "categories": {c: {"status": "pending", "count": 0, "in_flight": 0} for c in categories},
            "sources": [],
        }


def mark_scanning(review_id: str, category: str) -> None:
    """Record that a search against ``category`` has started."""
    with _lock:
        state = _state(review_id)
        cat = state["categories"].setdefault(category, {"status": "pending", "count": 0, "in_flight": 0})
        cat["in_flight"] += 1
        cat["status"] = "scanning"


def mark_done(review_id: str, category: str, count: int) -> None:
    """Record that a search against ``category`` finished, with ``count`` results."""
    with _lock:
        state = _state(review_id)
        cat = state["categories"].setdefault(category, {"status": "pending", "count": 0, "in_flight": 0})
        cat["in_flight"] = max(0, cat["in_flight"] - 1)
        cat["count"] += count
        cat["status"] = "scanning" if cat["in_flight"] > 0 else "done"


def add_source(review_id: str, source: dict) -> None:
    """Append one found candidate source to the live feed, capping total length."""
    with _lock:
        state = _state(review_id)
        state["sources"].append(source)
        if len(state["sources"]) > _MAX_SOURCES:
            del state["sources"][: len(state["sources"]) - _MAX_SOURCES]


def get(review_id: str) -> dict:
    """Return a copy of the current progress: category statuses + found sources."""
    with _lock:
        state = _progress.get(review_id, {"categories": {}, "sources": []})
        return {
            "categories": {k: dict(v) for k, v in state["categories"].items()},
            "sources": list(state["sources"]),
        }
