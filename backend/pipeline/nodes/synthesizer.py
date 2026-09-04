"""
Review Synthesizer node — Stage 6 (final editorial report).
"""

import logging

from core.activity_log import log as log_activity
from llm.client import call_structured
from pipeline.state import PipelineState, SynthesisResult
from prompts.synthesizer import SYSTEM_PROMPT, build_user_prompt

logger = logging.getLogger("proofdesk.pipeline.synthesizer")

_FALLBACK_SYNTHESIS = {
    "headline": "Synthesis unavailable — review the individual sections below.",
    "can_trust": "Unavailable.",
    "should_verify": "Unavailable.",
    "assumptions": "Unavailable.",
    "could_be_challenged": "Unavailable.",
    "needs_human_review": "Synthesis failed — a human editor should review this document directly.",
    "scorecard": {
        "evidence": {"label": "Unavailable", "level": "fair"},
        "freshness": {"label": "Unavailable", "level": "fair"},
        "reasoning": {"label": "Unavailable", "level": "fair"},
        "publication_risk": {"label": "Unavailable", "level": "fair"},
    },
    "needs_attention": [],
}


def run(state: PipelineState) -> dict:
    """Produce the final executive summary and scorecard from all prior stages."""
    review_id = state["review_id"]
    log_activity(review_id, "Synthesizing the final editorial report…")
    try:
        result = call_structured(
            SYSTEM_PROMPT,
            build_user_prompt(
                state.get("document_classification", "unknown"),
                state.get("claims", []),
                state.get("cross_check", []),
                state.get("red_team", []),
                state.get("risk_flags", []),
            ),
            SynthesisResult,
        )
        log_activity(review_id, "Editorial report ready.")
        return {"synthesis": result.model_dump()}
    except Exception as exc:
        logger.exception("Synthesizer stage failed")
        log_activity(review_id, "Synthesis failed — showing partial results.")
        errors = dict(state.get("errors", {}))
        errors["synthesizer"] = str(exc)
        return {"synthesis": _FALLBACK_SYNTHESIS, "errors": errors}
