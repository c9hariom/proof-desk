const FIELDS = [
  { key: 'strongest_argument', label: 'Strongest argument', text: 'text-emerald-700', bg: 'bg-emerald-50/60', border: 'border-emerald-100' },
  { key: 'weakest_argument', label: 'Weakest argument', text: 'text-[#e3120b]', bg: 'bg-red-50/60', border: 'border-red-100' },
  { key: 'hidden_assumption', label: 'Hidden assumption', text: 'text-amber-700', bg: 'bg-amber-50/60', border: 'border-amber-100' },
  { key: 'strongest_counterargument', label: 'Strongest counterargument', text: 'text-sky-700', bg: 'bg-sky-50/60', border: 'border-sky-100' },
  { key: 'missing_evidence', label: 'Missing evidence', text: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', italic: false },
  { key: 'editorial_question', label: 'Editorial question', text: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', italic: true },
]

export default function RedTeamSection({ notes, claimsById }) {
  if (notes.length === 0) {
    return <p className="text-sm text-gray-400 italic px-1">No reasoning issues were flagged for this document.</p>
  }

  return (
    <div className="flex flex-col gap-5">
      {notes.map((note) => {
        const claim = note.claim_id ? claimsById[note.claim_id] : null
        return (
          <div key={note.id} className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
            {claim && (
              <p className="text-sm text-gray-500 italic mb-4 border-l-2 border-gray-200 pl-3 leading-relaxed">
                On: "{claim.text}"
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FIELDS.map((field) => (
                <div key={field.key} className={`rounded-xl border p-3.5 ${field.bg} ${field.border}`}>
                  <dt className={`text-xs font-bold uppercase tracking-[0.08em] mb-1 ${field.text}`}>{field.label}</dt>
                  <dd className={`text-[15px] text-gray-700 leading-relaxed ${field.italic ? 'italic' : ''}`}>{note[field.key]}</dd>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
