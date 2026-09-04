import { TIER_LABELS } from '../constants'

const TIER_ORDER = ['tier_1_primary', 'tier_2_strong_secondary', 'tier_3_context', 'tier_4_unverified']
const TIER_BAR_COLORS = {
  tier_1_primary: '#e3120b',
  tier_2_strong_secondary: '#d97706',
  tier_3_context: '#64748b',
  tier_4_unverified: '#9ca3af',
}

export default function EvidenceTierChart({ claims }) {
  const allEvidence = claims.flatMap((c) => c.evidence || [])
  const counts = TIER_ORDER
    .map((tier) => ({ tier, count: allEvidence.filter((e) => e.tier === tier).length }))
    .filter((t) => t.count > 0)

  if (counts.length === 0) return null
  const max = Math.max(...counts.map((c) => c.count))

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Evidence by source tier</p>
      <div className="flex flex-col gap-2.5">
        {counts.map(({ tier, count }) => (
          <div key={tier} className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-32 flex-shrink-0 truncate">
              {TIER_LABELS[tier] || tier}
            </span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(count / max) * 100}%`, backgroundColor: TIER_BAR_COLORS[tier] }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-500 w-5 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
