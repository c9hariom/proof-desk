"""
Claim Analyst node — Stage 1 (combines Orchestrator + Claim Analyst + prioritisation).
"""

import logging

from core.activity_log import log as log_activity
from llm.client import call_structured
from pipeline.state import ClaimAnalysisResult, PipelineState
from prompts.claim_analyst import SYSTEM_PROMPT, build_user_prompt

logger = logging.getLogger("proofdesk.pipeline.claim_analyst")

_WEIGHT = {"high": 3, "medium": 2, "low": 1}
_MAX_RESEARCH_PRIORITY = 20


def _score(claim: dict) -> int:
    return _WEIGHT[claim["importance"]] * _WEIGHT[claim["uncertainty"]] * _WEIGHT[claim["risk_potential"]]


def run(state: PipelineState) -> dict:
    """Extract, classify and prioritise claims from the document."""
    review_id = state["review_id"]
    log_activity(review_id, "Reading the document and extracting atomic claims…")
    try:
        result = call_structured(
            SYSTEM_PROMPT, build_user_prompt(state["document_text"]), ClaimAnalysisResult
        )
        claims = [c.model_dump() for c in result.claims]

        # Safety cap — even if the model over-flags, never research-prioritise
        # more than _MAX_RESEARCH_PRIORITY claims (spec §7: keep it to ~10-20).
        priority_claims = [c for c in claims if c["research_priority"]]
        if len(priority_claims) > _MAX_RESEARCH_PRIORITY:
            ranked = sorted(priority_claims, key=_score, reverse=True)
            keep_texts = {c["text"] for c in ranked[:_MAX_RESEARCH_PRIORITY]}
            for claim in claims:
                claim["research_priority"] = claim["text"] in keep_texts

        priority_count = sum(1 for c in claims if c["research_priority"])
        log_activity(review_id, f"Extracted {len(claims)} claim(s) — {priority_count} marked high-priority.")
        return {"document_classification": result.document_classification, "claims": claims}
    except Exception as exc:
        logger.exception("Claim analyst stage failed")
        log_activity(review_id, "Claim extraction failed.")
        errors = dict(state.get("errors", {}))
        errors["claim_analyst"] = str(exc)
        return {"claims": [], "document_classification": "unavailable", "errors": errors}
