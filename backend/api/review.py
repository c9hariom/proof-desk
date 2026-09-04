"""
Review API — submit a document for review, poll its progress, fetch the
full structured result, and list a user's review history.

Identity is intentionally lightweight (spec: email-only, no password, no
name) — it exists purely to let a user find their own past reviews again,
not to authenticate anything.
"""

import json
import logging

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, EmailStr, Field

from core.config import settings
from core.activity_log import get as get_activity, start as start_activity
from core.research_progress import get as get_research_progress, start as start_research_progress
from core.database import (
    complete_review,
    create_claim,
    create_evidence,
    create_red_team_note,
    create_review,
    create_risk_flag,
    delete_review,
    fail_review,
    get_claims,
    get_evidence_for_claims,
    get_red_team_notes,
    get_review,
    get_risk_flags,
    list_reviews,
    update_review_stage,
)
from demo.demo_data import DEMO_DOCUMENT_TEXT, DEMO_TITLE, build_demo_state

logger = logging.getLogger("proofdesk.api.review")

router = APIRouter(prefix="/reviews", tags=["reviews"])

MAX_DOCUMENT_CHARS = 20_000
SUMMARY_FIELDS = [
    "headline", "can_trust", "should_verify", "assumptions",
    "could_be_challenged", "needs_human_review", "needs_attention",
]


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------


class SubmitReviewRequest(BaseModel):
    email: EmailStr
    title: str | None = Field(default=None, max_length=200)
    document_text: str | None = Field(default=None, max_length=MAX_DOCUMENT_CHARS)
    use_demo: bool = False


class SubmitReviewResponse(BaseModel):
    review_id: str
    status: str
    is_demo: bool


class ReassessReviewRequest(BaseModel):
    email: EmailStr


class ReviewSummary(BaseModel):
    id: str
    title: str
    status: str
    created_at: str
    is_demo: bool


# ---------------------------------------------------------------------------
# Persistence helper — shared by both demo and real pipeline runs
# ---------------------------------------------------------------------------


def _persist_pipeline_state(review_id: str, state: dict) -> None:
    """Write a completed ``PipelineState`` into SQLite and mark the review complete."""
    claims = state.get("claims", [])
    claims_evidence = state.get("claims_evidence", [[] for _ in claims])
    cross_check_by_index = {c["claim_index"]: c for c in state.get("cross_check", [])}

    claim_ids: list[str] = []
    for i, claim in enumerate(claims):
        cc = cross_check_by_index.get(i)
        claim_row = {
            "text": claim["text"],
            "claim_type": claim["claim_type"],
            "importance": claim["importance"],
            "uncertainty": claim.get("uncertainty"),
            "status": cc["status"] if cc else "unverified",
            "freshness": cc["freshness"] if cc else None,
            "supports": cc["supports"] if cc else None,
            "does_not_establish": cc["does_not_establish"] if cc else None,
            "editorial_note": cc["editorial_note"] if cc else None,
        }
        claim_id = create_claim(review_id, claim_row, sort_order=i)
        claim_ids.append(claim_id)

        sources = claims_evidence[i] if i < len(claims_evidence) else []
        relationship_by_source_index = {
            src["source_index"]: src["relationship"] for src in (cc.get("sources", []) if cc else [])
        }
        for j, source in enumerate(sources):
            item = dict(source)
            item["relationship"] = relationship_by_source_index.get(j, "context")
            create_evidence(claim_id, item)

    for flag in state.get("risk_flags", []):
        flag_row = dict(flag)
        idx = flag_row.pop("claim_index", None)
        flag_row["claim_id"] = claim_ids[idx] if idx is not None and 0 <= idx < len(claim_ids) else None
        create_risk_flag(review_id, flag_row)

    for note in state.get("red_team", []):
        note_row = dict(note)
        idx = note_row.pop("claim_index", None)
        note_row["claim_id"] = claim_ids[idx] if idx is not None and 0 <= idx < len(claim_ids) else None
        create_red_team_note(review_id, note_row)

    synthesis = state.get("synthesis", {})
    scorecard = synthesis.get("scorecard", {})
    summary = {field: synthesis.get(field) for field in SUMMARY_FIELDS}
    complete_review(review_id, scorecard, summary)


def _run_review_pipeline(review_id: str, title: str, document_text: str) -> None:
    """Background task: stream the LangGraph pipeline, tracking stage progress, then persist."""
    from pipeline.graph import get_graph

    # ``graph.stream()`` only yields a node's name once that node has *finished* —
    # so naively setting current_stage to the node that just completed makes the
    # UI's progress stepper lag one stage behind what's actually running. Instead,
    # advance current_stage to whatever stage is about to run next, and show the
    # very first stage as active immediately, before any node has completed.
    NEXT_STAGE = {
        "claim_analyst": "evidence_researcher",
        "evidence_researcher": "cross_checker",
        "cross_checker": "red_team",  # first of the two parallel branches to display as active
    }
    PARALLEL_BRANCH = {"red_team", "publication_risk"}

    initial_state = {"review_id": review_id, "title": title, "document_text": document_text, "errors": {}}
    final_state = dict(initial_state)
    update_review_stage(review_id, "claim_analyst")
    completed: set[str] = set()
    try:
        graph = get_graph()
        for step in graph.stream(initial_state):
            for node_name, partial in step.items():
                final_state.update(partial)
                completed.add(node_name)
                if node_name in PARALLEL_BRANCH:
                    if PARALLEL_BRANCH <= completed:
                        update_review_stage(review_id, "synthesizer")
                    else:
                        still_running = (PARALLEL_BRANCH - {node_name}).pop()
                        update_review_stage(review_id, still_running)
                else:
                    next_stage = NEXT_STAGE.get(node_name)
                    if next_stage:
                        update_review_stage(review_id, next_stage)
        _persist_pipeline_state(review_id, final_state)
    except Exception as exc:
        logger.exception("Review pipeline failed for review_id=%s", review_id)
        fail_review(review_id, str(exc))


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.post("", response_model=SubmitReviewResponse)
def submit_review(request: SubmitReviewRequest, background_tasks: BackgroundTasks) -> SubmitReviewResponse:
    """Submit a document for review. Runs instantly in demo mode, in the background otherwise."""
    use_demo = request.use_demo or settings.demo_mode or not request.document_text

    if use_demo:
        review_id = create_review(request.email, DEMO_TITLE, DEMO_DOCUMENT_TEXT, is_demo=True)
        _persist_pipeline_state(review_id, build_demo_state(review_id))
        return SubmitReviewResponse(review_id=review_id, status="complete", is_demo=True)

    if not request.title:
        raise HTTPException(status_code=422, detail="title is required when document_text is provided")

    review_id = create_review(request.email, request.title, request.document_text, is_demo=False)
    start_activity(review_id)
    start_research_progress(review_id, [])
    background_tasks.add_task(_run_review_pipeline, review_id, request.title, request.document_text)
    return SubmitReviewResponse(review_id=review_id, status="running", is_demo=False)


@router.post("/{review_id}/reassess", response_model=SubmitReviewResponse)
def reassess_review(
    review_id: str, request: ReassessReviewRequest, background_tasks: BackgroundTasks
) -> SubmitReviewResponse:
    """Re-run the full pipeline against a previous review's original document, as a new review."""
    review = get_review(review_id)
    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")
    if review["user_email"] != request.email:
        raise HTTPException(status_code=404, detail="Review not found")

    if review["is_demo"]:
        new_id = create_review(request.email, review["title"], review["document_text"], is_demo=True)
        _persist_pipeline_state(new_id, build_demo_state(new_id))
        return SubmitReviewResponse(review_id=new_id, status="complete", is_demo=True)

    new_id = create_review(request.email, review["title"], review["document_text"], is_demo=False)
    start_activity(new_id)
    start_research_progress(new_id, [])
    background_tasks.add_task(_run_review_pipeline, new_id, review["title"], review["document_text"])
    return SubmitReviewResponse(review_id=new_id, status="running", is_demo=False)


@router.delete("/{review_id}")
def remove_review(review_id: str, email: EmailStr) -> dict:
    """Delete a review and all of its associated data. Requires the owner's email."""
    review = get_review(review_id)
    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")
    if review["user_email"] != email:
        raise HTTPException(status_code=404, detail="Review not found")

    delete_review(review_id)
    return {"deleted": True}


@router.get("/{review_id}/activity")
def get_review_activity(review_id: str) -> dict:
    """Return the live 'what is it looking at' console lines for a running review."""
    return {"lines": get_activity(review_id)}


@router.get("/{review_id}/research-progress")
def get_review_research_progress(review_id: str) -> dict:
    """Return live per-category scan status and the rolling feed of found sources."""
    return get_research_progress(review_id)


@router.get("/{review_id}")
def get_review_detail(review_id: str) -> dict:
    """Return the full structured review: claims (with evidence), risk flags, red-team notes, scorecard."""
    review = get_review(review_id)
    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")

    claims = get_claims(review_id)
    evidence_by_claim = get_evidence_for_claims(review_id)
    claims_out = [{**claim, "evidence": evidence_by_claim.get(claim["id"], [])} for claim in claims]

    return {
        "id": review["id"],
        "title": review["title"],
        "status": review["status"],
        "current_stage": review["current_stage"],
        "created_at": review["created_at"],
        "is_demo": bool(review["is_demo"]),
        "document_text": review["document_text"],
        "scorecard": json.loads(review["scorecard"]) if review["scorecard"] else None,
        "summary": json.loads(review["summary"]) if review["summary"] else None,
        "claims": claims_out,
        "risk_flags": get_risk_flags(review_id),
        "red_team_notes": get_red_team_notes(review_id),
    }


@router.get("", response_model=list[ReviewSummary])
def get_review_history(email: EmailStr) -> list[ReviewSummary]:
    """Return the review history for a given email, most recent first."""
    return [ReviewSummary(**row) for row in list_reviews(email)]
