import { useMemo } from 'react'
import SourceCard from './SourceCard'

export default function ClaimDetailPanel({ claim, onClose }) {
  const sortedEvidence = useMemo(() => {
    if (!claim) return []
    // Sources with a real web link are more useful to a reader — surface them first.
    return [...claim.evidence].sort((a, b) => (b.url ? 1 : 0) - (a.url ? 1 : 0))
  }, [claim])

  if (!claim) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-400 italic px-6 text-center">
        Select a claim from the map to see what the evidence does — and does not — establish.
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-gray-400">
          {claim.claim_type.replace(/_/g, ' ')}
        </p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xs lg:hidden">
          Close
        </button>
      </div>

      <p className="text-xl font-bold text-[#1a1a1a] leading-snug mb-5">
        {claim.text}
      </p>

      {claim.supports && (
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-emerald-700 mb-1.5">What the evidence supports</p>
          <p className="text-[15px] text-gray-700 leading-relaxed">{claim.supports}</p>
        </div>
      )}

      {claim.does_not_establish && (
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#e3120b] mb-1.5">What it does not establish</p>
          <p className="text-[15px] text-gray-700 leading-relaxed">{claim.does_not_establish}</p>
        </div>
      )}

      {claim.editorial_note && (
        <div className="mb-5 bg-gray-50 border-l-2 border-gray-300 rounded-r-lg pl-3.5 pr-3 py-2.5">
          <p className="text-[14px] italic text-gray-600 leading-relaxed">{claim.editorial_note}</p>
        </div>
      )}

      <p className="text-xs font-bold uppercase tracking-[0.1em] text-gray-400 mb-2.5 mt-6">
        Sources ({claim.evidence.length})
      </p>
      <div className="flex flex-col gap-2.5">
        {claim.evidence.length === 0 && (
          <p className="text-sm text-gray-400 italic">No candidate sources were found for this claim.</p>
        )}
        {sortedEvidence.map((source) => (
          <SourceCard key={source.id} source={source} />
        ))}
      </div>
    </div>
  )
}
