"""
Cross-Checker / Freshness Analyst node — Stage 3.
"""

import logging

from core.activity_log import log as log_activity
from llm.client import call_structured
from pipeline.state import CrossCheckResult, PipelineState
from prompts.cross_checker import SYSTEM_PROMPT, build_user_prompt

logger = logging.getLogger("proofdesk.pipeline.cross_checker")


def run(state: PipelineState) -> dict:
    """Judge each research-priority claim against its gathered candidate sources."""
    review_id = state["review_id"]
    claims = state.get("claims", [])
    claims_evidence = state.get("claims_evidence", [[] for _ in claims])
    priority_indices = [i for i, c in enumerate(claims) if c.get("research_priority")]

    if not priority_indices:
        return {"cross_check": []}

    log_activity(review_id, f"Cross-checking {len(priority_indices)} claim(s) against gathered evidence and testing freshness…")

    try:
        sub_claims = [claims[i] for i in priority_indices]
        sub_evidence = [claims_evidence[i] for i in priority_indices]
        result = call_structured(
            SYSTEM_PROMPT, build_user_prompt(sub_claims, sub_evidence), CrossCheckResult
        )

        cross_check = []
        for item in result.results:
            entry = item.model_dump()
            local_idx = entry["claim_index"]
            if 0 <= local_idx < len(priority_indices):
                # source_index stays local to this claim's own candidate-source list, which is fine —
                # the API layer joins cross_check entries back to claims_evidence by claim_index.
                entry["claim_index"] = priority_indices[local_idx]
                cross_check.append(entry)
        log_activity(review_id, f"Cross-check complete — {len(cross_check)} verdict(s) recorded.")
        return {"cross_check": cross_check}
    except Exception as exc:
        logger.exception("Cross-checker stage failed")
        log_activity(review_id, "Cross-checking failed.")
        errors = dict(state.get("errors", {}))
        errors["cross_checker"] = str(exc)
        return {"cross_check": [], "errors": errors}
