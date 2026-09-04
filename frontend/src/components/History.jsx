import { useEffect, useState } from 'react'
import { listReviews } from '../hooks/useReviewApi'

const STATUS_BADGES = {
  complete: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  running: 'bg-amber-50 text-amber-700 border-amber-200',
  failed: 'bg-red-50 text-[#e3120b] border-red-200',
}

export default function History({ email, onOpenReview }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listReviews(email)
      .then((data) => { if (!cancelled) setReviews(data) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [email])

  return (
    <div className="h-full overflow-y-auto px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#e3120b] mb-1">History</p>
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1" style={{ fontFamily: 'Georgia, serif' }}>
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
            <button
              key={review.id}
              onClick={() => onOpenReview(review.id)}
              className="text-left flex items-center justify-between gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#e3120b]/40 hover:shadow-sm transition-all"
            >
              <div>
                <p className="text-sm font-semibold text-[#1a1a1a] leading-snug">
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
          ))}
        </div>
      </div>
    </div>
  )
}
