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
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-gray-500 mb-4">Claims by status</p>
      <div className="flex flex-col gap-3.5">
        {counts.map(({ status, count }) => (
          <div key={status} className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-36 flex-shrink-0 truncate">
              {STATUS_LABELS[status] || status}
            </span>
            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(count / max) * 100}%`, backgroundColor: STATUS_BAR_COLORS[status] || '#6b7280' }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-500 w-6 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
