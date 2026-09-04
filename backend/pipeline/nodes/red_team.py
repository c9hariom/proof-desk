"""
Red-Team Editor node — Stage 4.
"""

import logging

from core.activity_log import log as log_activity
from llm.client import call_structured
from pipeline.state import PipelineState, RedTeamResult
from prompts.red_team import SYSTEM_PROMPT, build_user_prompt

logger = logging.getLogger("proofdesk.pipeline.red_team")


def run(state: PipelineState) -> dict:
    """Challenge the reasoning behind the research-priority claims."""
    review_id = state["review_id"]
    claims = state.get("claims", [])
    priority_indices = [i for i, c in enumerate(claims) if c.get("research_priority")]

    if not priority_indices:
        return {"red_team": []}

    log_activity(review_id, f"Red-teaming {len(priority_indices)} claim(s) — looking for hidden assumptions and reasoning gaps…")

    try:
        sub_claims = [claims[i] for i in priority_indices]
        result = call_structured(SYSTEM_PROMPT, build_user_prompt(sub_claims), RedTeamResult)

        notes = []
        for note in result.notes:
            entry = note.model_dump()
            if entry["claim_index"] is not None and 0 <= entry["claim_index"] < len(priority_indices):
                entry["claim_index"] = priority_indices[entry["claim_index"]]
            notes.append(entry)
        log_activity(review_id, f"Red team produced {len(notes)} note(s).")
        return {"red_team": notes}
    except Exception as exc:
        logger.exception("Red-team stage failed")
        log_activity(review_id, "Red-teaming failed.")
        errors = dict(state.get("errors", {}))
        errors["red_team"] = str(exc)
        return {"red_team": [], "errors": errors}
