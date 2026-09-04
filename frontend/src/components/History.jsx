import { useEffect, useState } from 'react'
import { deleteReview, listReviews } from '../hooks/useReviewApi'
import { Icon, ICONS } from './icons'

const STATUS_BADGES = {
  complete: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  running: 'bg-amber-50 text-amber-700 border-amber-200',
  failed: 'bg-red-50 text-[#e3120b] border-red-200',
}

export default function History({ email, onOpenReview, onReassess }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listReviews(email)
      .then((data) => { if (!cancelled) setReviews(data) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [email])

  const handleDelete = async (e, review) => {
    e.stopPropagation()
    if (busyId) return
    if (!window.confirm(`Delete "${review.title}"? This can't be undone.`)) return
    setBusyId(review.id)
    try {
      await deleteReview(review.id, email)
      setReviews((prev) => prev.filter((r) => r.id !== review.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleReassess = async (e, review) => {
    e.stopPropagation()
    if (busyId) return
    setBusyId(review.id)
    try {
      await onReassess(review.id)
    } catch (err) {
      setError(err.message)
      setBusyId(null)
    }
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#e3120b] mb-1">History</p>
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">
          Your reviews
        </h1>
        <p className="text-sm text-gray-400 mb-6">Showing reviews for {email}</p>

        {loading && <p className="text-sm text-gray-400 italic">Loading…</p>}
        {error && <p className="text-sm text-[#e3120b]">{error}</p>}
        {!loading && !error && reviews.length === 0 && (
          <p className="text-sm text-gray-400 italic">No reviews yet — start one from "New review".</p>
        )}

        <div className="flex flex-col gap-2">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="group flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#e3120b]/40 hover:shadow-sm transition-all"
            >
              <button
                onClick={() => onOpenReview(review.id)}
                className="flex-1 min-w-0 flex items-center justify-between gap-3 text-left"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a] leading-snug truncate">
                    {review.title}{review.is_demo ? ' (demo)' : ''}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(review.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS_BADGES[review.status] || STATUS_BADGES.running}`}>
                  {review.status}
                </span>
              </button>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={(e) => handleReassess(e, review)}
                  disabled={busyId === review.id}
                  title="Reassess — run a fresh review of the same document"
                  className="p-2 rounded-lg text-gray-400 hover:text-[#e3120b] hover:bg-red-50 transition-colors disabled:opacity-40"
                >
                  <Icon path={ICONS.refresh} className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleDelete(e, review)}
                  disabled={busyId === review.id}
                  title="Delete this review"
                  className="p-2 rounded-lg text-gray-400 hover:text-[#e3120b] hover:bg-red-50 transition-colors disabled:opacity-40"
                >
                  <Icon path={ICONS.trash} className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
