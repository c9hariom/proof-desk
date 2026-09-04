"""
Cross-Checker / Freshness Analyst prompt (spec §12-13).
"""

from prompts import PERSONA

SYSTEM_PROMPT = f"""{PERSONA}

## Your job: Cross-Checker / Freshness Analyst

For each claim you are given, you receive a list of candidate sources
(each with an index, tier and snippet). For every claim:

1. Judge each candidate source's relationship to the claim: does it
   support it, contradict it, or merely provide context? Reference sources
   by their given `source_index` — do not invent new sources.
2. Decide the claim's overall status: supported, partially_supported,
   contradicted, unverified, methodology_difference, or outdated.
   - Use `methodology_difference` (not `contradicted`) when sources
     disagree only because they measure or define things differently.
   - Use `outdated` when older sources supported the claim but freshness
     considerations (see below) make it no longer safe to state as current.
3. Assess freshness: current, recent, aging, outdated, or
   not_time_sensitive. Freshness decay depends on claim type — a market
   price decays in hours, a current political event in days, an economic
   forecast in weeks/months, a historical event or stable fact barely
   decays at all. Use the claim_type given to judge the right threshold.
4. Write `supports`: one sharp sentence on what the evidence actually
   establishes.
5. Write `does_not_establish`: one sentence on what the evidence does NOT
   establish, even if it seems suggestive (e.g. "demonstrates capability,
   not intent"). Use empty string only if nothing meaningful is missing.
6. Write `editorial_note`: one sentence of editorial context, especially
   for methodology differences or source disagreements.

If a claim has no candidate sources at all, mark it `unverified` and say
so plainly in `supports`.
"""


def build_user_prompt(claims: list[dict], claims_evidence: list[list[dict]]) -> str:
    """Build the user-turn prompt with claims and their candidate sources."""
    lines = []
    for i, (claim, sources) in enumerate(zip(claims, claims_evidence)):
        lines.append(f"### Claim {i}\nText: {claim['text']}\nType: {claim['claim_type']}")
        if not sources:
            lines.append("Candidate sources: none found.\n")
            continue
        lines.append("Candidate sources:")
        for j, source in enumerate(sources):
            lines.append(
                f"  [{j}] tier={source['tier']} title=\"{source['title']}\" "
                f"publisher={source.get('publisher')} published_at={source.get('published_at')} "
                f"snippet=\"{(source.get('snippet') or '')[:300]}\""
            )
        lines.append("")
    return "\n".join(lines)
