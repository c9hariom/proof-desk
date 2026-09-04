import { useState } from 'react'
import { DEMO_EXAMPLE_BLURB } from '../constants'

export default function Home({ onStartReview, onTryExample, submitting, submitError }) {
  const [title, setTitle] = useState('')
  const [documentText, setDocumentText] = useState('')

  const canSubmit = title.trim().length > 0 && documentText.trim().length > 0 && !submitting

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    onStartReview({ title: title.trim(), documentText: documentText.trim() })
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-2xl animate-fade-slide-up">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#e3120b] mb-3 text-center">
          Before you publish
        </p>
        <h1
          className="text-3xl font-bold text-[#1a1a1a] text-center mb-3 leading-tight"
        >
          Know what you're actually claiming.
        </h1>
        <p className="text-sm text-gray-500 text-center max-w-lg mx-auto mb-8 leading-relaxed">
          Proof Desk traces important claims to their evidence, challenges the reasoning
          behind them, checks freshness and surfaces passages that may deserve human review.
        </p>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
            Document title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Draft: The Lithium Gambit"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-[#1a1a1a] placeholder-gray-400 focus:outline-none focus:border-[#e3120b]/60 focus:ring-2 focus:ring-[#e3120b]/10 mb-4"
          />

          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
            Paste your document
          </label>
          <textarea
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            placeholder="Paste the article, memo or draft you want reviewed…"
            rows={10}
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-[#1a1a1a] placeholder-gray-400 focus:outline-none focus:border-[#e3120b]/60 focus:ring-2 focus:ring-[#e3120b]/10 leading-relaxed"
          />

          {submitError && (
            <p className="text-xs text-[#e3120b] mt-2">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full mt-4 rounded-xl bg-[#e3120b] text-white text-sm font-semibold py-3 hover:bg-[#c41009] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'Starting review…' : 'Start a review'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          onClick={onTryExample}
          disabled={submitting}
          className="w-full text-left p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#e3120b]/40 hover:shadow-md hover:shadow-[#e3120b]/8 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
        >
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-red-50 text-[#e3120b] border-red-200 mb-2">
            Try an example
          </span>
          <p className="text-[13px] text-[#1a1a1a] leading-snug font-medium">
            {DEMO_EXAMPLE_BLURB}
          </p>
        </button>
      </div>
    </div>
  )
}
