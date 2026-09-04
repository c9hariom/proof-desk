/**
 * useReviewApi — thin fetch wrappers around the Proof Desk backend.
 */

import { API_URL } from '../constants'

async function parseJsonOrThrow(res) {
  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      detail = body.detail || JSON.stringify(body)
    } catch {
      // ignore — use statusText
    }
    throw new Error(detail)
  }
  return res.json()
}

/** Submit a document (or demo request) for review. Returns { review_id, status, is_demo }. */
export async function submitReview({ email, title, documentText, useDemo = false }) {
  const res = await fetch(`${API_URL}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      title: title || null,
      document_text: documentText || null,
      use_demo: useDemo,
    }),
  })
  return parseJsonOrThrow(res)
}

/** Fetch the full structured review (claims, evidence, risk flags, red-team notes, scorecard). */
export async function getReview(reviewId) {
  const res = await fetch(`${API_URL}/reviews/${reviewId}`)
  return parseJsonOrThrow(res)
}

/** List review history for an email, most recent first. */
export async function listReviews(email) {
  const res = await fetch(`${API_URL}/reviews?email=${encodeURIComponent(email)}`)
  return parseJsonOrThrow(res)
}
