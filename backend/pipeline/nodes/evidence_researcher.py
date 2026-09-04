"""
Evidence Researcher node — Stage 2.

This is deliberately NOT an OpenAI call (spec §8, §33): it only gathers raw
candidate sources from free search tools, in parallel, one claim at a time.
The Cross-Checker stage later judges each source's actual relevance.
"""

import logging
from concurrent.futures import ThreadPoolExecutor

from core.activity_log import log as log_activity
from pipeline.state import PipelineState
from research.aggregate import gather_candidates

logger = logging.getLogger("proofdesk.pipeline.evidence_researcher")


def run(state: PipelineState) -> dict:
    """Gather candidate sources for every research-priority claim, in parallel."""
    review_id = state["review_id"]
    claims = state.get("claims", [])
    claims_evidence: list[list[dict]] = [[] for _ in claims]
    priority_indices = [i for i, c in enumerate(claims) if c.get("research_priority")]

    if not priority_indices:
        log_activity(review_id, "No high-priority claims to research.")
        return {"claims_evidence": claims_evidence}

    log_activity(review_id, f"Researching evidence for {len(priority_indices)} high-priority claim(s)…")

    try:
        with ThreadPoolExecutor(max_workers=min(8, len(priority_indices))) as pool:
            future_map = {
                pool.submit(gather_candidates, review_id, claims[i]["text"]): i for i in priority_indices
            }
            for future, idx in future_map.items():
                try:
                    claims_evidence[idx] = future.result()
                except Exception:
                    logger.warning("Research failed for claim %d", idx, exc_info=True)
                    claims_evidence[idx] = []
        log_activity(review_id, "Finished gathering candidate sources.")
        return {"claims_evidence": claims_evidence}
    except Exception as exc:
        logger.exception("Evidence researcher stage failed")
        log_activity(review_id, "Evidence research failed — continuing with what was gathered.")
        errors = dict(state.get("errors", {}))
        errors["evidence_researcher"] = str(exc)
        return {"claims_evidence": claims_evidence, "errors": errors}
