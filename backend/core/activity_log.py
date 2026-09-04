"""
In-memory activity log — powers the live "what is it looking at" console
shown on the Analysing screen (spec-inspired transparency feature).

Not persisted to disk; cleared on process restart. That's fine for a
single-process dev/demo deployment — it exists purely to build user trust
in what the pipeline is doing, not as an audit trail.
"""

import threading

_lock = threading.Lock()
_logs: dict[str, list[str]] = {}
_MAX_LINES = 300


def start(review_id: str) -> None:
    """Reset the activity log for a new review run."""
    with _lock:
        _logs[review_id] = []


def log(review_id: str, message: str) -> None:
    """Append one line to a review's activity log, capping total length."""
    with _lock:
        lines = _logs.setdefault(review_id, [])
        lines.append(message)
        if len(lines) > _MAX_LINES:
            del lines[: len(lines) - _MAX_LINES]


def get(review_id: str) -> list[str]:
    """Return a copy of the current activity log lines for a review."""
    with _lock:
        return list(_logs.get(review_id, []))
