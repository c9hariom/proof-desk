import { STATUS_LABELS } from '../constants'

const STATUS_ORDER = [
  'supported', 'partially_supported', 'contradicted',
  'methodology_difference', 'outdated', 'unverified',
]
const STATUS_BAR_COLORS = {
  supported: '#059669',
  partially_supported: '#d97706',
  contradicted: '#e3120b',
  methodology_difference: '#0284c7',
  outdated: '#e3120b',
  unverified: '#6b7280',
}

export default function ClaimStatusChart({ claims }) {
  const counts = STATUS_ORDER
    .map((status) => ({ status, count: claims.filter((c) => c.status === status).length }))
    .filter((s) => s.count > 0)

  if (counts.length === 0) return null
  const max = Math.max(...counts.map((c) => c.count))

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Claims by status</p>
      <div className="flex flex-col gap-2.5">
        {counts.map(({ status, count }) => (
          <div key={status} className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-32 flex-shrink-0 truncate">
              {STATUS_LABELS[status] || status}
            </span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(count / max) * 100}%`, backgroundColor: STATUS_BAR_COLORS[status] || '#6b7280' }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-500 w-5 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
