"""
Deterministic demo fixture (spec §30) — shaped exactly like the final
``PipelineState`` produced by a real pipeline run, so the API layer can
persist it with the exact same code path used for real reviews.

Covers, as required: strong + weak claims, a genuine contradiction, an
outdated prediction, a causal inference, a hidden assumption, an
allegation, and at least one publication-risk flag. All names, companies
and figures are fictional.
"""

import pathlib

_DEMO_DIR = pathlib.Path(__file__).parent

DEMO_TITLE = "The Lithium Gambit: A Boom, a Bust and a Geopolitical Gamble"
DEMO_DOCUMENT_TEXT = (_DEMO_DIR / "demo_document.md").read_text(encoding="utf-8").strip()

_CLAIMS = [
    {  # 0
        "text": "Vertale's lithium exports rose 340% between 2019 and 2025.",
        "claim_type": "statistic", "importance": "high", "uncertainty": "low",
        "risk_potential": "low", "research_priority": True,
    },
    {  # 1
        "text": "Vertale's lithium export growth has outpaced global lithium demand growth.",
        "claim_type": "comparison", "importance": "medium", "uncertainty": "low",
        "risk_potential": "low", "research_priority": True,
    },
    {  # 2
        "text": "Accelerated brine extraction by Northgate Minerals is causing water shortages in the Altiva basin.",
        "claim_type": "causal", "importance": "high", "uncertainty": "high",
        "risk_potential": "medium", "research_priority": True,
    },
    {  # 3
        "text": "Northgate Minerals falsified water-usage compliance reports submitted in 2023 and 2024.",
        "claim_type": "allegation", "importance": "high", "uncertainty": "high",
        "risk_potential": "high", "research_priority": True,
    },
    {  # 4
        "text": "A neighbouring bloc's refiners accounted for 38% of Vertale's lithium exports in 2025, up from 6% in 2020.",
        "claim_type": "statistic", "importance": "medium", "uncertainty": "low",
        "risk_potential": "low", "research_priority": True,
    },
    {  # 5
        "text": "The shift in export destinations demonstrates a deliberate strategic pivot away from Vertale's traditional trading partners.",
        "claim_type": "inference", "importance": "high", "uncertainty": "high",
        "risk_potential": "medium", "research_priority": True,
    },
    {  # 6
        "text": "Cordena has increased troop rotations along the Vertale border twice this year.",
        "claim_type": "current_event", "importance": "medium", "uncertainty": "medium",
        "risk_potential": "low", "research_priority": False,
    },
    {  # 7
        "text": "Analysts at Calder & Frist predicted lithium prices would collapse to $9,000 a tonne by 2027.",
        "claim_type": "prediction", "importance": "medium", "uncertainty": "medium",
        "risk_potential": "low", "research_priority": True,
    },
    {  # 8
        "text": "Vertale and Cordena fought a border war in the 1970s over territory inside the Altiva basin.",
        "claim_type": "historical", "importance": "low", "uncertainty": "low",
        "risk_potential": "low", "research_priority": False,
    },
    {  # 9
        "text": "President Marsh's supporters argue the lithium boom has lifted Vertale out of two decades of stagnation.",
        "claim_type": "opinion", "importance": "low", "uncertainty": "medium",
        "risk_potential": "low", "research_priority": False,
    },
]

_CLAIMS_EVIDENCE: list[list[dict]] = [
    [  # 0
        {"title": "Vertale Ministry of Trade — Export Statistics 2025", "url": "https://trade.vertale.gov/statistics-2025",
         "publisher": "Vertale Ministry of Trade", "published_at": "2025-01-14", "source_type": "gov",
         "tier": "tier_1_primary", "snippet": "Lithium carbonate exports rose 340% between 2019 and 2025."},
        {"title": "IEA Global EV Outlook 2025", "url": "https://www.iea.org/reports/global-ev-outlook-2025",
         "publisher": "International Energy Agency", "published_at": "2025-04-01", "source_type": "gov",
         "tier": "tier_1_primary", "snippet": "Global lithium demand grew approximately 90% over 2019-2025."},
    ],
    [  # 1
        {"title": "IEA Global EV Outlook 2025", "url": "https://www.iea.org/reports/global-ev-outlook-2025",
         "publisher": "International Energy Agency", "published_at": "2025-04-01", "source_type": "gov",
         "tier": "tier_1_primary", "snippet": "Global lithium demand grew approximately 90% over 2019-2025."},
    ],
    [  # 2
        {"title": "Altiva Basin Hydrology Report", "url": "https://uni-vertale.edu/altiva-hydrology-2026",
         "publisher": "National University of Vertale", "published_at": "2026-02-10", "source_type": "research",
         "tier": "tier_2_strong_secondary",
         "snippet": "Well levels have fallen sharply since 2023; both brine extraction and a multi-year drought are likely contributing factors."},
    ],
    [  # 3
        {"title": "Vertale Environment Ministry opens compliance review of Northgate Minerals",
         "url": "https://environment.vertale.gov/press/northgate-review", "publisher": "Vertale Environment Ministry",
         "published_at": "2026-03-02", "source_type": "gov", "tier": "tier_1_primary",
         "snippet": "The ministry confirmed an active review of water-usage reports filed by Northgate Minerals in 2023 and 2024."},
        {"title": "Northgate Minerals statement on compliance review", "url": "https://northgateminerals.com/press/statement",
         "publisher": "Northgate Minerals", "published_at": "2026-03-03", "source_type": "company",
         "tier": "tier_4_unverified", "snippet": "The company called the allegation \"categorically false\" and declined to release the disputed filings."},
    ],
    [  # 4
        {"title": "Vertale Ministry of Trade — Export Destination Breakdown", "url": "https://trade.vertale.gov/destinations-2025",
         "publisher": "Vertale Ministry of Trade", "published_at": "2025-01-14", "source_type": "gov",
         "tier": "tier_1_primary", "snippet": "Regional refiners' share of exports rose from 6% in 2020 to 38% in 2025."},
    ],
    [  # 5
        {"title": "Vertale Ministry of Trade — Export Destination Breakdown", "url": "https://trade.vertale.gov/destinations-2025",
         "publisher": "Vertale Ministry of Trade", "published_at": "2025-01-14", "source_type": "gov",
         "tier": "tier_1_primary", "snippet": "Regional refiners' share of exports rose from 6% in 2020 to 38% in 2025."},
        {"title": "Vertale trade ministry denies policy shift behind export changes", "url": "https://reuters-style-wire.example/vertale-trade-denial",
         "publisher": "regional wire service", "published_at": "2026-01-20", "source_type": "news",
         "tier": "tier_2_strong_secondary", "snippet": "Trade officials said the shift 'simply reflects better pricing offers, not a change in foreign policy.'"},
    ],
    [],  # 6 — not research-priority in this demo
    [  # 7
        {"title": "Calder & Frist commodities note: lithium supply outlook", "url": "https://calderfrist.example/notes/lithium-2027",
         "publisher": "Calder & Frist", "published_at": "2025-12-05", "source_type": "research",
         "tier": "tier_4_unverified", "snippet": "Prices are forecast to collapse to $9,000 a tonne by 2027 as new supply reaches the market."},
        {"title": "Lithium carbonate spot price tracker", "url": "https://commodities-tracker.example/lithium",
         "publisher": "commodities tracker", "published_at": "2026-08-30", "source_type": "market_data",
         "tier": "tier_4_unverified", "snippet": "Spot lithium carbonate is currently trading below $9,000 a tonne, ahead of the bank's 2027 forecast."},
    ],
    [],  # 8 — historical, not researched
    [],  # 9 — opinion, not researched
]

_CROSS_CHECK = [
    {"claim_index": 0, "status": "supported", "freshness": "current",
     "supports": "Vertale's own trade ministry figures show a 340% rise in lithium exports from 2019 to 2025.",
     "does_not_establish": "Does not establish that the figures have been independently audited.",
     "editorial_note": "Figure originates from the trade ministry itself; no independent verification found.",
     "sources": [{"source_index": 0, "relationship": "supports"}, {"source_index": 1, "relationship": "context"}]},
    {"claim_index": 1, "status": "supported", "freshness": "current",
     "supports": "IEA data confirms global lithium demand grew roughly 90% over the same period, versus Vertale's 340% export growth.",
     "does_not_establish": "", "editorial_note": "",
     "sources": [{"source_index": 0, "relationship": "supports"}]},
    {"claim_index": 2, "status": "partially_supported", "freshness": "recent",
     "supports": "Regional hydrologists have linked accelerated brine extraction to falling well levels in the Altiva basin.",
     "does_not_establish": "Does not rule out the multi-year regional drought as a contributing or primary cause.",
     "editorial_note": "The hydrology report itself names both extraction and drought as likely contributing factors — the causal claim overstates certainty.",
     "sources": [{"source_index": 0, "relationship": "supports"}]},
    {"claim_index": 3, "status": "unverified", "freshness": "current",
     "supports": "Vertale's environment ministry has confirmed an active investigation into Northgate's water-usage compliance reports.",
     "does_not_establish": "An open investigation is not a finding of wrongdoing; Northgate denies the allegation and disputed filings have not been made public.",
     "editorial_note": "Presented as an open, disputed investigation, not an established fact.",
     "sources": [{"source_index": 0, "relationship": "context"}, {"source_index": 1, "relationship": "contradicts"}]},
    {"claim_index": 4, "status": "supported", "freshness": "current",
     "supports": "Trade-ministry destination data confirms the rise from 6% to 38% of export share.",
     "does_not_establish": "", "editorial_note": "",
     "sources": [{"source_index": 0, "relationship": "supports"}]},
    {"claim_index": 5, "status": "contradicted", "freshness": "current",
     "supports": "The underlying export-volume shift toward the new refining bloc is real and well-documented.",
     "does_not_establish": "Does not establish deliberate strategic intent — trade officials directly attribute the shift to pricing, not policy.",
     "editorial_note": "Cabinet characterisation and trade-ministry denial genuinely disagree on intent, not just methodology — a real contradiction, not a definitional difference.",
     "sources": [{"source_index": 0, "relationship": "supports"}, {"source_index": 1, "relationship": "contradicts"}]},
    {"claim_index": 7, "status": "outdated", "freshness": "outdated",
     "supports": "The prediction was published in a widely-cited December note from a named commodities bank.",
     "does_not_establish": "Spot prices are already trading below the predicted 2027 threshold this month, undermining the forecast's timeline.",
     "editorial_note": "Forecast has not been publicly revised despite being overtaken by current spot prices — flag as outdated.",
     "sources": [{"source_index": 0, "relationship": "supports"}, {"source_index": 1, "relationship": "contradicts"}]},
]

_RED_TEAM = [
    {"claim_index": 5,
     "strongest_argument": "The scale of the shift — from 6% to 38% of exports in five years — is large enough that pure pricing coincidence is a real stretch.",
     "weakest_argument": "The claim treats a single metric, export share, as proof of an entire government's strategic intent.",
     "hidden_assumption": "That a change in where lithium is sold reflects a change in whom Vertale wants as allies, rather than simply who is paying more.",
     "strongest_counterargument": "Trade officials attribute the shift entirely to price competitiveness, and no on-record policy statement supports a deliberate pivot.",
     "missing_evidence": "An internal government trade-strategy document or on-record ministerial statement would settle whether this is policy or opportunism.",
     "editorial_question": "What would distinguish a country simply chasing better prices from one deliberately realigning its alliances?"},
    {"claim_index": 2,
     "strongest_argument": "Hydrologists have directly linked falling well levels to brine-extraction volumes near the affected farms.",
     "weakest_argument": "The causal claim ignores the hydrologists' own caveat that a multi-year drought is a likely contributing factor.",
     "hidden_assumption": "That mining activity, not climate, is the dominant cause of the water shortage.",
     "strongest_counterargument": "A multi-year regional drought predates the current extraction volumes and affects areas with no mining activity at all.",
     "missing_evidence": "A controlled hydrological study isolating extraction volume from rainfall variation would clarify each factor's relative contribution.",
     "editorial_question": "Would well levels in comparable, non-mining areas of the same drought region show a similar decline?"},
    {"claim_index": 7,
     "strongest_argument": "The prediction came from a named bank in a widely-cited note, giving it a clear, checkable source.",
     "weakest_argument": "The forecast has already been overtaken by current spot prices but has not been publicly revised.",
     "hidden_assumption": "That new Vertalese supply will reach the market on the timeline the bank originally modelled.",
     "strongest_counterargument": "Current spot prices are already below the predicted 2027 floor, suggesting the forecast's timeline, if not its direction, was wrong.",
     "missing_evidence": "An updated note or statement from Calder & Frist addressing why prices moved faster than modelled.",
     "editorial_question": "Has Calder & Frist revised or withdrawn the forecast given it was overtaken within months of publication?"},
]

_RISK_FLAGS = [
    {"claim_index": 3, "risk_level": "high", "category": "allegation stated with more certainty than the evidence supports",
     "passage": "Northgate Minerals falsified water-usage compliance reports submitted in 2023 and 2024.",
     "reason": "The wording presents falsification as an active fact pattern, while the only established fact is that an investigation exists. Northgate denies the allegation and has not been found to have violated any rule.",
     "evidence_gap": "No independent confirmation that the reports were falsified — only that an investigation was opened.",
     "suggested_action": "qualify",
     "possible_revision": "Vertale's environment ministry is investigating whether Northgate falsified water-usage compliance reports; the company denies the allegation."},
    {"claim_index": 5, "risk_level": "medium", "category": "claim stronger than the evidence",
     "passage": "a deliberate strategic pivot away from Vertale's traditional trading partners",
     "reason": "Framing a change in trade volume as deliberate strategic intent goes beyond what the underlying export data can establish on its own.",
     "evidence_gap": "No on-record confirmation of a policy decision — only an export-volume trend and an unattributed cabinet characterisation.",
     "suggested_action": "attribute",
     "possible_revision": "Some officials describe the trade shift as a strategic pivot, though trade-ministry officials attribute it to pricing rather than policy."},
]

_SYNTHESIS = {
    "headline": "A real lithium boom, a contested water crisis, and a strategic narrative that outruns its evidence.",
    "can_trust": "The scale of Vertale's export growth and its rising trade share with the new refining bloc are both well-documented in trade-ministry and IEA data.",
    "should_verify": "Whether Northgate's compliance reports were actually falsified, and whether Calder & Frist's price forecast has been quietly revised, both need independent verification before publication.",
    "assumptions": "The piece assumes a change in trade partners reflects deliberate government strategy, and that mining activity, rather than drought, is the primary driver of the water shortage.",
    "could_be_challenged": "The causal water-shortage claim and the 'strategic pivot' framing are the most exposed points; both rely on inference rather than confirmed fact.",
    "needs_human_review": "The falsification allegation against Northgate should go to editorial and likely legal review before publication, given the reputational stakes and the open, unresolved investigation.",
    "scorecard": {
        "evidence": {"label": "Fair", "level": "fair"},
        "freshness": {"label": "Needs attention", "level": "poor"},
        "reasoning": {"label": "Needs attention", "level": "poor"},
        "publication_risk": {"label": "Moderate", "level": "fair"},
    },
    "needs_attention": [
        {"severity": "high",
         "description": "The allegation that Northgate falsified compliance reports is stated with more certainty than an open investigation supports.",
         "suggested_action": "Qualify the wording and attribute it to the ongoing investigation; consider editorial/legal review."},
        {"severity": "medium",
         "description": "The claim of a 'deliberate strategic pivot' rests on an export-volume trend, not a confirmed policy decision.",
         "suggested_action": "Attribute the characterisation to specific officials rather than stating it as fact."},
        {"severity": "medium",
         "description": "Calder & Frist's lithium-price forecast has already been overtaken by current spot prices but is cited without noting this.",
         "suggested_action": "Verify whether the forecast has been revised before citing it as current."},
        {"severity": "low",
         "description": "The causal link between mining and water shortages does not rule out the region's ongoing drought as a contributing cause.",
         "suggested_action": "Qualify the causal claim to acknowledge the drought as a confounding factor."},
    ],
}


def build_demo_state(review_id: str) -> dict:
    """Return a complete, deterministic ``PipelineState``-shaped fixture."""
    return {
        "review_id": review_id,
        "title": DEMO_TITLE,
        "document_text": DEMO_DOCUMENT_TEXT,
        "document_classification": "geopolitical / economic analysis",
        "claims": [dict(c) for c in _CLAIMS],
        "claims_evidence": [[dict(e) for e in evidence] for evidence in _CLAIMS_EVIDENCE],
        "cross_check": [dict(c) for c in _CROSS_CHECK],
        "red_team": [dict(n) for n in _RED_TEAM],
        "risk_flags": [dict(f) for f in _RISK_FLAGS],
        "synthesis": dict(_SYNTHESIS),
        "errors": {},
    }
