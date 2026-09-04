import { TIER_LABELS } from '../constants'

const RELATIONSHIP_LABELS = { supports: 'Supports', contradicts: 'Contradicts', context: 'Context' }
const RELATIONSHIP_COLORS = {
  supports: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  contradicts: 'bg-red-50 text-[#e3120b] border-red-200',
  context: 'bg-slate-50 text-slate-600 border-slate-200',
}
const TIER_COLORS = {
  tier_1_primary: 'bg-red-50 text-[#e3120b] border-red-200',
  tier_2_strong_secondary: 'bg-amber-50 text-amber-700 border-amber-200',
  tier_3_context: 'bg-slate-50 text-slate-600 border-slate-200',
  tier_4_unverified: 'bg-gray-50 text-gray-400 border-gray-200',
}

export default function SourceCard({ source }) {
  return (
    <div className="border border-gray-200 rounded-xl p-3 bg-white">
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${TIER_COLORS[source.tier] || TIER_COLORS.tier_4_unverified}`}>
          {TIER_LABELS[source.tier] || source.tier}
        </span>
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${RELATIONSHIP_COLORS[source.relationship] || RELATIONSHIP_COLORS.context}`}>
          {RELATIONSHIP_LABELS[source.relationship] || source.relationship}
        </span>
      </div>
      <p className="text-sm font-semibold text-[#1a1a1a] leading-snug">{source.title}</p>
      <p className="text-xs text-gray-500 mt-0.5">
        {source.publisher || 'Unknown publisher'}{source.published_at ? ` · ${source.published_at}` : ''}
      </p>
      {source.url && (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-xs font-semibold text-[#e3120b] hover:text-[#c41009] underline underline-offset-2"
        >
          View source
        </a>
      )}
    </div>
  )
}
