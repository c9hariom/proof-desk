"""
Structured JSON contracts shared by every pipeline stage (spec §35).

Every OpenAI call in the pipeline uses one of the ``*Result`` models below as
its ``response_format`` (structured output), so stages never have to parse
free-form prose.
"""

from typing import Literal, TypedDict

from pydantic import BaseModel, Field

ClaimType = Literal[
    "fact", "statistic", "comparison", "historical", "current_event",
    "allegation", "attribution", "causal", "prediction", "opinion",
    "assumption", "inference",
]
Importance = Literal["high", "medium", "low"]
ClaimStatus = Literal[
    "supported", "partially_supported", "contradicted",
    "unverified", "methodology_difference", "outdated",
]
Freshness = Literal["current", "recent", "aging", "outdated", "not_time_sensitive"]
SourceTier = Literal["tier_1_primary", "tier_2_strong_secondary", "tier_3_context", "tier_4_unverified"]
Relationship = Literal["supports", "contradicts", "context"]
RiskLevel = Literal["high", "medium", "low"]
SuggestedAction = Literal["verify", "attribute", "qualify", "seek_response", "editorial_review", "legal_review"]
ScorecardLevel = Literal["good", "fair", "poor"]


# ---------------------------------------------------------------------------
# Stage 1 — Claim Analyst (also covers Orchestrator + prioritisation)
# ---------------------------------------------------------------------------


class ExtractedClaim(BaseModel):
    """A single atomic, independently-verifiable claim extracted from the document."""

    text: str = Field(description="The atomic claim, as a single self-contained sentence.")
    claim_type: ClaimType
    importance: Importance
    uncertainty: Importance
    risk_potential: Importance
    research_priority: bool = Field(
        description="True only for the ~10-20 highest-value claims (importance x uncertainty x risk)."
    )


class ClaimAnalysisResult(BaseModel):
    """Output of the combined Orchestrator + Claim Analyst call."""

    document_classification: str = Field(description="One short phrase, e.g. 'economic analysis'.")
    claims: list[ExtractedClaim]


# ---------------------------------------------------------------------------
# Stage 2 — Evidence Researcher (code, not an LLM call — see research/)
# ---------------------------------------------------------------------------


class CandidateSource(BaseModel):
    """A raw search result gathered by the research layer, not yet judged."""

    title: str
    url: str | None = None
    publisher: str | None = None
    published_at: str | None = None
    source_type: str | None = None
    tier: SourceTier
    snippet: str | None = None


# ---------------------------------------------------------------------------
# Stage 3 — Cross-Checker / Freshness Analyst
# ---------------------------------------------------------------------------


class SourceJudgement(BaseModel):
    """Cross-checker's verdict on how one candidate source relates to the claim."""

    source_index: int = Field(description="Index into the candidate_sources list given in the prompt.")
    relationship: Relationship


class ClaimCrossCheck(BaseModel):
    """Cross-checker's full verdict for a single claim."""

    claim_index: int = Field(description="Index into the claims list given in the prompt.")
    status: ClaimStatus
    freshness: Freshness
    supports: str = Field(description="What the evidence actually establishes.")
    does_not_establish: str = Field(description="What the evidence does NOT establish, if anything.")
    editorial_note: str = Field(description="One sentence explaining disagreement/methodology differences, if any.")
    sources: list[SourceJudgement]


class CrossCheckResult(BaseModel):
    results: list[ClaimCrossCheck]


# ---------------------------------------------------------------------------
# Stage 4 — Red-Team Editor
# ---------------------------------------------------------------------------


class RedTeamNote(BaseModel):
    claim_index: int | None = Field(default=None, description="Claim this note primarily concerns, if any.")
    strongest_argument: str
    weakest_argument: str
    hidden_assumption: str
    strongest_counterargument: str
    missing_evidence: str
    editorial_question: str


class RedTeamResult(BaseModel):
    notes: list[RedTeamNote]


# ---------------------------------------------------------------------------
# Stage 5 — Publication Risk Analyst
# ---------------------------------------------------------------------------


class RiskFlag(BaseModel):
    claim_index: int | None = None
    risk_level: RiskLevel
    category: str = Field(description="e.g. 'unattributed allegation', 'privacy concern'.")
    passage: str = Field(description="The exact flagged wording from the document.")
    reason: str
    evidence_gap: str | None = None
    suggested_action: SuggestedAction
    possible_revision: str | None = Field(
        default=None, description="A softened rewording, labelled as requiring human judgement."
    )


class PublicationRiskResult(BaseModel):
    flags: list[RiskFlag]


# ---------------------------------------------------------------------------
# Stage 6 — Review Synthesizer
# ---------------------------------------------------------------------------


class ScorecardIndicator(BaseModel):
    label: str = Field(description="Short editorial label, e.g. 'Strong', 'Needs attention'.")
    level: ScorecardLevel


class Scorecard(BaseModel):
    evidence: ScorecardIndicator
    freshness: ScorecardIndicator
    reasoning: ScorecardIndicator
    publication_risk: ScorecardIndicator


class NeedsAttentionItem(BaseModel):
    severity: RiskLevel
    description: str
    suggested_action: str


class SynthesisResult(BaseModel):
    headline: str = Field(description="One sentence capturing the overall verdict.")
    can_trust: str
    should_verify: str
    assumptions: str
    could_be_challenged: str
    needs_human_review: str
    scorecard: Scorecard
    needs_attention: list[NeedsAttentionItem]


# ---------------------------------------------------------------------------
# Graph state — flows through the LangGraph pipeline
# ---------------------------------------------------------------------------


class PipelineState(TypedDict, total=False):
    review_id: str
    title: str
    document_text: str

    document_classification: str
    claims: list[dict]  # ExtractedClaim dicts, index-aligned with claims_evidence
    claims_evidence: list[list[dict]]  # CandidateSource dicts per claim, index-aligned with claims

    cross_check: list[dict]  # ClaimCrossCheck dicts
    red_team: list[dict]  # RedTeamNote dicts
    risk_flags: list[dict]  # RiskFlag dicts
    synthesis: dict  # SynthesisResult dict

    errors: dict[str, str]  # stage name -> error message, for partial-failure handling
