export default function RedTeamSection({ notes, claimsById }) {
  if (notes.length === 0) {
    return <p className="text-sm text-gray-400 italic px-1">No reasoning issues were flagged for this document.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {notes.map((note) => {
        const claim = note.claim_id ? claimsById[note.claim_id] : null
        return (
          <div key={note.id} className="border border-gray-200 rounded-2xl p-4 bg-white">
            {claim && (
              <p className="text-xs text-gray-500 italic mb-3 border-l-2 border-gray-200 pl-2">
                On: "{claim.text}"
              </p>
            )}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 mb-0.5">Strongest argument</dt>
                <dd className="text-gray-700 leading-snug">{note.strongest_argument}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wide text-[#e3120b] mb-0.5">Weakest argument</dt>
                <dd className="text-gray-700 leading-snug">{note.weakest_argument}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wide text-amber-700 mb-0.5">Hidden assumption</dt>
                <dd className="text-gray-700 leading-snug">{note.hidden_assumption}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wide text-sky-700 mb-0.5">Strongest counterargument</dt>
                <dd className="text-gray-700 leading-snug">{note.strongest_counterargument}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-0.5">Missing evidence</dt>
                <dd className="text-gray-700 leading-snug">{note.missing_evidence}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-0.5">Editorial question</dt>
                <dd className="text-gray-700 leading-snug italic">{note.editorial_question}</dd>
              </div>
            </dl>
          </div>
        )
      })}
    </div>
  )
}
