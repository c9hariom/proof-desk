"""
Publication Risk Analyst node — Stage 5.
"""

import logging

from core.activity_log import log as log_activity
from llm.client import call_structured
from pipeline.state import PipelineState, PublicationRiskResult
from prompts.publication_risk import SYSTEM_PROMPT, build_user_prompt

logger = logging.getLogger("proofdesk.pipeline.publication_risk")


def _risk_relevant_indices(claims: list[dict]) -> list[int]:
    """Claims worth screening for publication risk — not just research-priority ones."""
    return [
        i for i, c in enumerate(claims)
        if c.get("risk_potential") in ("high", "medium")
        or c.get("claim_type") in ("allegation", "attribution")
        or c.get("research_priority")
    ]


def run(state: PipelineState) -> dict:
    """Screen risk-relevant claims for potential publication-risk signals."""
    review_id = state["review_id"]
    claims = state.get("claims", [])
    relevant_indices = _risk_relevant_indices(claims)

    if not relevant_indices:
        return {"risk_flags": []}

    log_activity(review_id, f"Screening {len(relevant_indices)} claim(s) for legal & publication risk…")

    try:
        sub_claims = [claims[i] for i in relevant_indices]
        result = call_structured(SYSTEM_PROMPT, build_user_prompt(sub_claims), PublicationRiskResult)

        flags = []
        for flag in result.flags:
            entry = flag.model_dump()
            if entry["claim_index"] is not None and 0 <= entry["claim_index"] < len(relevant_indices):
                entry["claim_index"] = relevant_indices[entry["claim_index"]]
            flags.append(entry)
        log_activity(review_id, f"Legal & publication-risk screen complete — {len(flags)} signal(s) flagged.")
        return {"risk_flags": flags}
    except Exception as exc:
        logger.exception("Publication risk stage failed")
        log_activity(review_id, "Legal & publication-risk screening failed.")
        errors = dict(state.get("errors", {}))
        errors["publication_risk"] = str(exc)
        return {"risk_flags": [], "errors": errors}
