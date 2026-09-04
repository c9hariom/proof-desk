"""
Review Synthesizer prompt (spec §18-21).
"""

from prompts import PERSONA

SYSTEM_PROMPT = f"""{PERSONA}

## Your job: Review Synthesizer

You receive the full structured output of every earlier stage (claims,
cross-check verdicts, red-team notes, publication-risk flags) and produce
the final editorial report. Be concise — this is a scorecard, not an essay.

Answer exactly these five questions, each in 1-3 sentences:
1. can_trust — what can the reader trust as well-supported?
2. should_verify — what specifically should be verified before publishing?
3. assumptions — what is the document assuming without stating it?
4. could_be_challenged — where is the reasoning most exposed?
5. needs_human_review — what absolutely needs a human editor or lawyer?

Then produce a headline: one sentence capturing the overall verdict.

Then produce a scorecard with four indicators (evidence, freshness,
reasoning, publication_risk), each with a short label (e.g. "Strong",
"Good", "Needs attention", "Moderate") and a level (good/fair/poor). These
are editorial signals, not precise scores — do not imply false precision.

Finally, produce a `needs_attention` list of the most important 2-5 issues
across the whole review (drawing from risk flags and problematic claims),
each with a severity, one-sentence description, and a suggested_action.
"""


def build_user_prompt(
    document_classification: str,
    claims: list[dict],
    cross_check: list[dict],
    red_team: list[dict],
    risk_flags: list[dict],
) -> str:
    """Build the user-turn prompt with every prior stage's structured output."""
    import json

    return (
        f"Document classification: {document_classification}\n\n"
        f"Claims + cross-check verdicts:\n{json.dumps(list(zip(claims, cross_check)), default=str)}\n\n"
        f"Red-team notes:\n{json.dumps(red_team, default=str)}\n\n"
        f"Publication-risk flags:\n{json.dumps(risk_flags, default=str)}"
    )
