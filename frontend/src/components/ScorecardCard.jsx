import { SCORECARD_LEVEL_COLORS } from '../constants'

export default function ScorecardCard({ label, indicator }) {
  const colors = SCORECARD_LEVEL_COLORS[indicator?.level] || SCORECARD_LEVEL_COLORS.fair
  return (
    <div className={`rounded-2xl border p-4 ${colors.bg} ${colors.border}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${colors.text}`}>
        {indicator?.label || '—'}
      </p>
    </div>
  )
}
