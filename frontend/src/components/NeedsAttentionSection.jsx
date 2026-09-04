import { RISK_LEVEL_COLORS } from '../constants'

export default function NeedsAttentionSection({ items }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-gray-400 italic px-1">Nothing needs urgent human attention in this review.</p>
  }

  return (
    <div className="flex flex-col gap-3.5">
      <p className="text-base text-gray-500">
        {items.length} issue{items.length === 1 ? '' : 's'} identified.
      </p>
      {items.map((item, i) => {
        const colors = RISK_LEVEL_COLORS[item.severity] || RISK_LEVEL_COLORS.low
        return (
          <div key={i} className={`flex items-start gap-4 rounded-xl border p-4 ${colors.bg} ${colors.border}`}>
            <span className={`text-xs font-bold uppercase tracking-[0.08em] ${colors.text} flex-shrink-0 mt-0.5`}>
              {item.severity}
            </span>
            <div>
              <p className="text-[15px] text-[#1a1a1a] leading-relaxed">{item.description}</p>
              <p className="text-sm text-gray-500 mt-1.5">
                Suggested action: <span className="font-semibold">{item.suggested_action}</span>
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
