import SourceCard from './SourceCard'

export default function ClaimDetailPanel({ claim, onClose }) {
  if (!claim) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-400 italic px-6 text-center">
        Select a claim from the map to see what the evidence does — and does not — establish.
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {claim.claim_type.replace(/_/g, ' ')}
        </p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xs lg:hidden">
          Close
        </button>
      </div>

      <p className="text-base font-semibold text-[#1a1a1a] leading-snug mb-4" style={{ fontFamily: 'Georgia, serif' }}>
        {claim.text}
      </p>

      {claim.supports && (
        <div className="mb-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 mb-1">What the evidence supports</p>
          <p className="text-sm text-gray-700 leading-relaxed">{claim.supports}</p>
        </div>
      )}

      {claim.does_not_establish && (
        <div className="mb-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#e3120b] mb-1">What it does not establish</p>
          <p className="text-sm text-gray-700 leading-relaxed">{claim.does_not_establish}</p>
        </div>
      )}

      {claim.editorial_note && (
        <div className="mb-4 border-l-2 border-gray-200 pl-3">
          <p className="text-xs italic text-gray-500 leading-relaxed">{claim.editorial_note}</p>
        </div>
      )}

      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2 mt-5">
        Sources ({claim.evidence.length})
      </p>
      <div className="flex flex-col gap-2">
        {claim.evidence.length === 0 && (
          <p className="text-xs text-gray-400 italic">No candidate sources were found for this claim.</p>
        )}
        {claim.evidence.map((source) => (
          <SourceCard key={source.id} source={source} />
        ))}
      </div>
    </div>
  )
}
