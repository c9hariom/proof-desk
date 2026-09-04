import { useEffect, useState } from 'react'
import { getAdminUsers } from '../hooks/useReviewApi'

const STATUS_BADGES = {
  complete: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  running: 'bg-amber-50 text-amber-700 border-amber-200',
  failed: 'bg-red-50 text-[#e3120b] border-red-200',
}

export default function Admin({ email }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedEmail, setExpandedEmail] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getAdminUsers(email)
      .then((data) => { if (!cancelled) setUsers(data.users || []) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [email])

  const totalReviews = users.reduce((sum, u) => sum + u.review_count, 0)

  return (
    <div className="h-full overflow-y-auto px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#e3120b] mb-1">Admin</p>
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Active users</h1>
        <p className="text-sm text-gray-400 mb-6">
          {users.length} user{users.length === 1 ? '' : 's'} · {totalReviews} review{totalReviews === 1 ? '' : 's'} analysed
        </p>

        {loading && <p className="text-sm text-gray-400 italic">Loading…</p>}
        {error && <p className="text-sm text-[#e3120b]">{error}</p>}
        {!loading && !error && users.length === 0 && (
          <p className="text-sm text-gray-400 italic">No users yet.</p>
        )}

        <div className="flex flex-col gap-2">
          {users.map((user) => {
            const isExpanded = expandedEmail === user.email
            return (
              <div key={user.email} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedEmail(isExpanded ? null : user.email)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1a1a1a] truncate">
                      {user.email}
                      {user.is_admin && (
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-[#e3120b] align-middle">
                          Admin
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Last seen {new Date(user.last_seen_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 flex-shrink-0">
                    {user.review_count} stor{user.review_count === 1 ? 'y' : 'ies'}
                  </span>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-3 flex flex-col gap-2">
                    {user.reviews.length === 0 && (
                      <p className="text-xs text-gray-400 italic px-1 py-1">No reviews yet.</p>
                    )}
                    {user.reviews.map((review) => (
                      <div key={review.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-gray-50">
                        <div className="min-w-0">
                          <p className="text-sm text-[#1a1a1a] truncate">
                            {review.title}{review.is_demo ? ' (demo)' : ''}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(review.created_at).toLocaleString()}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS_BADGES[review.status] || STATUS_BADGES.running}`}>
                          {review.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
