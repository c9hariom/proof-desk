/**
 * usePollReview — polls GET /reviews/{id} until the review is complete or
 * failed, so the Analysing screen can react to real pipeline progress. Also
 * polls the live activity log so the screen can show which source is being
 * consulted, and for what, in real time.
 */

import { useEffect, useRef, useState } from 'react'
import { API_URL } from '../constants'
import { getReview } from './useReviewApi'

const POLL_INTERVAL_MS = 1200

export function usePollReview(reviewId) {
  const [review, setReview] = useState(null)
  const [activity, setActivity] = useState([])
  const [researchProgress, setResearchProgress] = useState({ categories: {}, sources: [] })
  const [error, setError] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!reviewId) return undefined
    let cancelled = false

    const pollActivity = async () => {
      try {
        const res = await fetch(`${API_URL}/reviews/${reviewId}/activity`)
        if (res.ok && !cancelled) {
          const data = await res.json()
          setActivity(data.lines || [])
        }
      } catch {
        // best-effort — activity log is a transparency nicety, not critical path
      }
    }

    const pollResearchProgress = async () => {
      try {
        const res = await fetch(`${API_URL}/reviews/${reviewId}/research-progress`)
        if (res.ok && !cancelled) {
          const data = await res.json()
          setResearchProgress({ categories: data.categories || {}, sources: data.sources || [] })
        }
      } catch {
        // best-effort — live research feed is a transparency nicety, not critical path
      }
    }

    const poll = async () => {
      try {
        const data = await getReview(reviewId)
        if (cancelled) return
        setReview(data)
        await Promise.all([pollActivity(), pollResearchProgress()])
        if (!cancelled && data.status === 'running') {
          timerRef.current = setTimeout(poll, POLL_INTERVAL_MS)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    }

    poll()

    return () => {
      cancelled = true
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [reviewId])

  return { review, error, activity, researchProgress }
}

