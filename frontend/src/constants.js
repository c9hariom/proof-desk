export const API_URL = 'http://localhost:8000'

export const EMAIL_STORAGE_KEY = 'proofdesk_email'

/** Ordered pipeline stages shown on the analysing screen (spec §26). */
export const PIPELINE_STAGES = [
  { key: 'claim_analyst', label: 'Extracting & prioritising claims' },
  { key: 'evidence_researcher', label: 'Researching evidence across free sources' },
  { key: 'cross_checker', label: 'Cross-checking sources & freshness' },
  { key: 'red_team', label: 'Testing the reasoning' },
  { key: 'publication_risk', label: 'Legal & publication-risk analysis' },
  { key: 'synthesizer', label: 'Preparing editorial review' },
]

export const SCORECARD_LEVEL_COLORS = {
  good: { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  fair: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  poor: { text: 'text-[#e3120b]', bg: 'bg-red-50', border: 'border-red-200' },
}

export const RISK_LEVEL_COLORS = {
  high: { text: 'text-[#e3120b]', bg: 'bg-red-50', border: 'border-red-200' },
  medium: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  low: { text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
}

export const STATUS_LABELS = {
  supported: 'Supported',
  partially_supported: 'Partially supported',
  contradicted: 'Contradicted',
  unverified: 'Unverified',
  methodology_difference: 'Methodology difference',
  outdated: 'Outdated',
}

/** Bar color + fill % used for the Claim Map's "confidence" indicator. */
export const STATUS_CONFIDENCE = {
  supported: { pct: 92, bar: 'bg-emerald-500' },
  partially_supported: { pct: 55, bar: 'bg-amber-500' },
  methodology_difference: { pct: 50, bar: 'bg-sky-500' },
  contradicted: { pct: 15, bar: 'bg-[#e3120b]' },
  outdated: { pct: 25, bar: 'bg-[#e3120b]' },
  unverified: { pct: 10, bar: 'bg-slate-400' },
}

/** Left accent-bar color per claim status, used on Claim Map cards. */
export const STATUS_ACCENT_BAR = {
  supported: 'border-l-emerald-500',
  partially_supported: 'border-l-amber-500',
  methodology_difference: 'border-l-sky-500',
  contradicted: 'border-l-[#e3120b]',
  outdated: 'border-l-[#e3120b]',
  unverified: 'border-l-slate-300',
}

export const IMPORTANCE_COLORS = {
  high: 'bg-[#e3120b]',
  medium: 'bg-amber-500',
  low: 'bg-slate-300',
}

export const CLAIM_TYPE_ICONS = {
  fact: '◆',
  statistic: '#',
  comparison: '⇄',
  historical: '⏳',
  current_event: '●',
  allegation: '!',
  attribution: '“',
  causal: '→',
  prediction: '↗',
  opinion: '◐',
  assumption: '?',
  inference: '⋯',
}

export const TIER_LABELS = {
  tier_1_primary: 'Primary',
  tier_2_strong_secondary: 'Strong secondary',
  tier_3_context: 'Context',
  tier_4_unverified: 'Unverified',
}

export const DEMO_EXAMPLE_BLURB =
  "A fictional 900-word article about a lithium boom — pre-loaded with a contradiction, an outdated forecast, a causal inference and an unresolved allegation, so you can see every feature without writing anything."
