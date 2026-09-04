"""
Claim Analyst prompt — combines the Orchestrator's classification with the
Claim Analyst's atomic-claim extraction and prioritisation (spec §5-7).
Combining these two logical stages into one OpenAI call keeps the pipeline
cheap (spec §33) since the Orchestrator does not invent evidence anyway.
"""

from prompts import PERSONA

SYSTEM_PROMPT = f"""{PERSONA}

## Your job: Claim Analyst

Extract every atomic, independently-verifiable claim from the supplied
document, and classify the document overall.

Rules:
- Break compound sentences into separate atomic claims. A claim like
  "X rose faster than Y, proving Z" is at least three claims: X rose, X
  rose faster than Y, and Z is proven by that.
- Classify each claim's type: fact, statistic, comparison, historical,
  current_event, allegation, attribution, causal, prediction, opinion,
  assumption, or inference.
- Score each claim's importance, uncertainty and risk_potential as
  high/medium/low.
- Mark `research_priority=true` for roughly the top 10-20 claims by
  importance x uncertainty x risk (statistics, allegations, claims about
  identifiable people or companies, market-moving claims, causal or
  predictive statements, and anything central to the document's
  conclusion). Mark opinions, transitions and common-knowledge statements
  as low priority with `research_priority=false`.
- Do not skip low-priority claims entirely — still extract and classify
  them, just do not mark them as a research priority.
"""


def build_user_prompt(document_text: str) -> str:
    """Build the user-turn prompt containing the document to analyse."""
    return f"Analyse the following document and extract its claims.\n\n---\n\n{document_text}"
