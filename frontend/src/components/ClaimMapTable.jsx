import {
  CLAIM_TYPE_ICONS,
  IMPORTANCE_COLORS,
  STATUS_ACCENT_BAR,
  STATUS_CONFIDENCE,
  STATUS_LABELS,
} from '../constants'
import { Icon, ICONS } from './icons'

const STATUS_BADGE_COLORS = {
  supported: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  partially_supported: 'bg-amber-50 text-amber-700 border-amber-200',
  contradicted: 'bg-red-50 text-[#e3120b] border-red-200',
  unverified: 'bg-slate-50 text-slate-600 border-slate-200',
  methodology_difference: 'bg-sky-50 text-sky-700 border-sky-200',
  outdated: 'bg-red-50 text-[#e3120b] border-red-200',
}

export default function ClaimMapTable({ claims, selectedClaimId, onSelectClaim }) {
  if (claims.length === 0) {
    return <p className="text-sm text-gray-400 italic px-1">No claims were extracted for this document.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1 mb-0.5">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">
          {claims.length} claim{claims.length === 1 ? '' : 's'} extracted
        </p>
        <p className="text-xs text-gray-400">Sorted by document order</p>
      </div>

      {claims.map((claim) => {
        const isSelected = selectedClaimId === claim.id
        const confidence = STATUS_CONFIDENCE[claim.status] || STATUS_CONFIDENCE.unverified
        const accentBar = STATUS_ACCENT_BAR[claim.status] || STATUS_ACCENT_BAR.unverified
        const badgeColors = STATUS_BADGE_COLORS[claim.status] || STATUS_BADGE_COLORS.unverified

        return (
          <button
            key={claim.id}
            onClick={() => onSelectClaim(claim.id)}
            className={`text-left w-full bg-white border border-l-4 rounded-xl px-5 py-4 transition-all duration-150 ${accentBar} ${
              isSelected
                ? 'border-gray-200 ring-2 ring-[#e3120b]/25 shadow-sm'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-[11px] font-bold flex items-center justify-center mt-0.5"
                  title={claim.claim_type.replace(/_/g, ' ')}
                >
                  {CLAIM_TYPE_ICONS[claim.claim_type] || '•'}
                </span>
                <div className="min-w-0">
                  <p className="text-[16px] text-[#1a1a1a] leading-snug font-medium">{claim.text}</p>
                  <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                    <span className="text-[11px] uppercase tracking-wide text-gray-400">
                      {claim.claim_type.replace(/_/g, ' ')}
                    </span>
                    {claim.importance && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                        <span className={`w-1.5 h-1.5 rounded-full ${IMPORTANCE_COLORS[claim.importance] || IMPORTANCE_COLORS.low}`} />
                        {claim.importance} importance
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${badgeColors}`}>
                {STATUS_LABELS[claim.status] || claim.status}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-3.5 pl-9">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 whitespace-nowrap">
                <Icon path={ICONS.evidence} className="w-3.5 h-3.5" />
                {claim.evidence.length} source{claim.evidence.length === 1 ? '' : 's'}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-400 whitespace-nowrap capitalize">
                <Icon path={ICONS.clock} className="w-3.5 h-3.5" />
                {claim.freshness ? claim.freshness.replace(/_/g, ' ') : 'not researched'}
              </div>

              <div className="flex-1 flex items-center gap-2 min-w-[80px]">
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full ${confidence.bar}`} style={{ width: `${confidence.pct}%` }} />
                </div>
                <span className="text-[11px] text-gray-400 flex-shrink-0">{confidence.pct}%</span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
