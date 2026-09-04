import { SCORECARD_LEVEL_COLORS } from '../constants'
import { Icon, ICONS } from './icons'

export default function ScorecardCard({ label, indicator, icon }) {
  const colors = SCORECARD_LEVEL_COLORS[indicator?.level] || SCORECARD_LEVEL_COLORS.fair
  return (
    <div className={`rounded-2xl border p-4 ${colors.bg} ${colors.border}`}>
      <div className="flex items-center gap-1.5 mb-2">
        {icon && <Icon path={ICONS[icon]} className={`w-3.5 h-3.5 ${colors.text} opacity-70`} />}
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">{label}</p>
      </div>
      <p className={`text-xl font-bold ${colors.text}`}>
        {indicator?.label || '—'}
      </p>
    </div>
  )
}
