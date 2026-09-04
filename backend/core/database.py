"""
Database layer — SQLite persistence for reviews and their structured findings.

All access goes through ``get_connection``, which configures ``sqlite3.Row``
so rows can be consumed as dicts without a separate mapping step.
"""

import json
import sqlite3
import uuid
from datetime import datetime, timezone

DB_PATH = "proofdesk.db"


def get_connection() -> sqlite3.Connection:
    """Open and return a SQLite connection with row_factory set to sqlite3.Row."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Create all tables if they do not already exist."""
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                id            TEXT PRIMARY KEY,
                user_email    TEXT NOT NULL,
                title         TEXT NOT NULL,
                document_text TEXT NOT NULL,
                status        TEXT NOT NULL DEFAULT 'running',
                current_stage TEXT NOT NULL DEFAULT 'queued',
                scorecard     TEXT,
                summary       TEXT,
                is_demo       INTEGER NOT NULL DEFAULT 0,
                created_at    TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS claims (
                id                TEXT PRIMARY KEY,
                review_id         TEXT NOT NULL,
                text              TEXT NOT NULL,
                claim_type        TEXT NOT NULL,
                importance        TEXT NOT NULL,
                uncertainty       TEXT,
                status            TEXT NOT NULL DEFAULT 'unverified',
                freshness         TEXT,
                supports          TEXT,
                does_not_establish TEXT,
                editorial_note    TEXT,
                sort_order        INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (review_id) REFERENCES reviews (id)
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS evidence (
                id           TEXT PRIMARY KEY,
                claim_id     TEXT NOT NULL,
                title        TEXT NOT NULL,
                url          TEXT,
                publisher    TEXT,
                published_at TEXT,
                source_type  TEXT,
                tier         TEXT NOT NULL,
                relationship TEXT NOT NULL,
                passage      TEXT,
                retrieved_at TEXT NOT NULL,
                FOREIGN KEY (claim_id) REFERENCES claims (id)
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS risk_flags (
                id            TEXT PRIMARY KEY,
                review_id     TEXT NOT NULL,
                claim_id      TEXT,
                risk_level    TEXT NOT NULL,
                category      TEXT NOT NULL,
                passage       TEXT NOT NULL,
                reason        TEXT NOT NULL,
                evidence_gap  TEXT,
                suggested_action TEXT NOT NULL,
                possible_revision TEXT,
                FOREIGN KEY (review_id) REFERENCES reviews (id)
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS red_team_notes (
                id                     TEXT PRIMARY KEY,
                review_id              TEXT NOT NULL,
                claim_id                TEXT,
                strongest_argument      TEXT,
                weakest_argument        TEXT,
                hidden_assumption       TEXT,
                strongest_counterargument TEXT,
                missing_evidence        TEXT,
                editorial_question      TEXT,
                FOREIGN KEY (review_id) REFERENCES reviews (id)
            )
        """)
        conn.commit()


# ---------------------------------------------------------------------------
# Reviews
# ---------------------------------------------------------------------------


def create_review(user_email: str, title: str, document_text: str, is_demo: bool = False) -> str:
    """Insert a new review row in ``running`` status and return its ID."""
    review_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO reviews (id, user_email, title, document_text, status, is_demo, created_at) "
            "VALUES (?, ?, ?, ?, 'running', ?, ?)",
            (review_id, user_email, title, document_text, int(is_demo), now),
        )
        conn.commit()
    return review_id


def update_review_stage(review_id: str, stage: str) -> None:
    """Update the ``current_stage`` marker so clients can poll pipeline progress."""
    with get_connection() as conn:
        conn.execute("UPDATE reviews SET current_stage = ? WHERE id = ?", (stage, review_id))
        conn.commit()


def complete_review(review_id: str, scorecard: dict, summary: dict) -> None:
    """Mark a review as completed and store its scorecard + executive summary."""
    with get_connection() as conn:
        conn.execute(
            "UPDATE reviews SET status = 'complete', current_stage = 'done', scorecard = ?, summary = ? WHERE id = ?",
            (json.dumps(scorecard), json.dumps(summary), review_id),
        )
        conn.commit()


def fail_review(review_id: str, error: str) -> None:
    """Mark a review as failed and store the error message in ``summary``."""
    with get_connection() as conn:
        conn.execute(
            "UPDATE reviews SET status = 'failed', summary = ? WHERE id = ?",
            (json.dumps({"error": error}), review_id),
        )
        conn.commit()


def get_review(review_id: str) -> dict | None:
    """Return a single review row (without nested claims/flags) or None."""
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM reviews WHERE id = ?", (review_id,)).fetchone()
    return dict(row) if row else None


def list_reviews(user_email: str) -> list[dict]:
    """Return all reviews for a given email, most recent first."""
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT id, title, status, created_at, is_demo FROM reviews "
            "WHERE user_email = ? ORDER BY created_at DESC",
            (user_email,),
        ).fetchall()
    return [dict(row) for row in rows]


# ---------------------------------------------------------------------------
# Claims
# ---------------------------------------------------------------------------


def create_claim(review_id: str, claim: dict, sort_order: int) -> str:
    """Insert a claim row and return its generated ID."""
    claim_id = str(uuid.uuid4())
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO claims (id, review_id, text, claim_type, importance, uncertainty, "
            "status, freshness, supports, does_not_establish, editorial_note, sort_order) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                claim_id, review_id, claim["text"], claim["claim_type"], claim["importance"],
                claim.get("uncertainty"), claim.get("status", "unverified"), claim.get("freshness"),
                claim.get("supports"), claim.get("does_not_establish"), claim.get("editorial_note"),
                sort_order,
            ),
        )
        conn.commit()
    return claim_id


def update_claim_status(claim_id: str, status: str, freshness: str | None, supports: str | None,
                         does_not_establish: str | None, editorial_note: str | None) -> None:
    """Update a claim after the cross-checker stage has evaluated it."""
    with get_connection() as conn:
        conn.execute(
            "UPDATE claims SET status = ?, freshness = ?, supports = ?, "
            "does_not_establish = ?, editorial_note = ? WHERE id = ?",
            (status, freshness, supports, does_not_establish, editorial_note, claim_id),
        )
        conn.commit()


def get_claims(review_id: str) -> list[dict]:
    """Return all claims for a review, in their original extraction order."""
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM claims WHERE review_id = ? ORDER BY sort_order ASC", (review_id,)
        ).fetchall()
    return [dict(row) for row in rows]


# ---------------------------------------------------------------------------
# Evidence
# ---------------------------------------------------------------------------


def create_evidence(claim_id: str, item: dict) -> str:
    """Insert an evidence row and return its generated ID."""
    evidence_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO evidence (id, claim_id, title, url, publisher, published_at, "
            "source_type, tier, relationship, passage, retrieved_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                evidence_id, claim_id, item["title"], item.get("url"), item.get("publisher"),
                item.get("published_at"), item.get("source_type"), item["tier"],
                item["relationship"], item.get("passage"), now,
            ),
        )
        conn.commit()
    return evidence_id


def get_evidence_for_claims(review_id: str) -> dict[str, list[dict]]:
    """Return a mapping of claim_id -> list of evidence rows for a review."""
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT evidence.* FROM evidence "
            "JOIN claims ON claims.id = evidence.claim_id "
            "WHERE claims.review_id = ?",
            (review_id,),
        ).fetchall()
    grouped: dict[str, list[dict]] = {}
    for row in rows:
        grouped.setdefault(row["claim_id"], []).append(dict(row))
    return grouped


# ---------------------------------------------------------------------------
# Risk flags
# ---------------------------------------------------------------------------


def create_risk_flag(review_id: str, flag: dict) -> str:
    """Insert a publication-risk flag row and return its generated ID."""
    flag_id = str(uuid.uuid4())
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO risk_flags (id, review_id, claim_id, risk_level, category, passage, "
            "reason, evidence_gap, suggested_action, possible_revision) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                flag_id, review_id, flag.get("claim_id"), flag["risk_level"], flag["category"],
                flag["passage"], flag["reason"], flag.get("evidence_gap"),
                flag["suggested_action"], flag.get("possible_revision"),
            ),
        )
        conn.commit()
    return flag_id


def get_risk_flags(review_id: str) -> list[dict]:
    """Return all publication-risk flags for a review."""
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM risk_flags WHERE review_id = ?", (review_id,)
        ).fetchall()
    return [dict(row) for row in rows]


# ---------------------------------------------------------------------------
# Red-team notes
# ---------------------------------------------------------------------------


def create_red_team_note(review_id: str, note: dict) -> str:
    """Insert a red-team note row and return its generated ID."""
    note_id = str(uuid.uuid4())
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO red_team_notes (id, review_id, claim_id, strongest_argument, "
            "weakest_argument, hidden_assumption, strongest_counterargument, "
            "missing_evidence, editorial_question) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                note_id, review_id, note.get("claim_id"), note.get("strongest_argument"),
                note.get("weakest_argument"), note.get("hidden_assumption"),
                note.get("strongest_counterargument"), note.get("missing_evidence"),
                note.get("editorial_question"),
            ),
        )
        conn.commit()
    return note_id


def get_red_team_notes(review_id: str) -> list[dict]:
    """Return all red-team notes for a review."""
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM red_team_notes WHERE review_id = ?", (review_id,)
        ).fetchall()
    return [dict(row) for row in rows]
