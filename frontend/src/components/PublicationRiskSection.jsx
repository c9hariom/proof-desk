import { RISK_LEVEL_COLORS } from '../constants'

const ACTION_LABELS = {
  verify: 'Verify',
  attribute: 'Attribute',
  qualify: 'Qualify wording',
  seek_response: 'Seek response',
  editorial_review: 'Editorial review',
  legal_review: 'Legal review',
}

export default function PublicationRiskSection({ flags }) {
  const counts = { high: 0, medium: 0, low: 0 }
  flags.forEach((f) => { counts[f.risk_level] = (counts[f.risk_level] || 0) + 1 })

  return (
    <div>
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#e3120b] mb-1">
          Legal &amp; publication risk
        </p>
        <h3 className="text-lg font-bold text-[#1a1a1a] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
          What could go wrong before this is published?
        </h3>
        <div className="flex items-center gap-4">
          <CountPill label="High" count={counts.high} color="#e3120b" />
          <CountPill label="Medium" count={counts.medium} color="#d97706" />
          <CountPill label="Low" count={counts.low} color="#64748b" />
        </div>
      </div>

      {flags.length === 0 ? (
        <p className="text-sm text-gray-400 italic px-1 mb-4">No publication-risk signals were flagged for this document.</p>
      ) : (
        <div className="flex flex-col gap-4 mb-5">
          {flags.map((flag) => {
            const colors = RISK_LEVEL_COLORS[flag.risk_level] || RISK_LEVEL_COLORS.low
            return (
              <div key={flag.id} className={`rounded-2xl border p-4 ${colors.bg} ${colors.border}`}>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${colors.text}`}>
                    {flag.risk_level} risk
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-gray-500">· {flag.category}</span>
                </div>

                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">Current wording</p>
                <p className="text-sm text-[#1a1a1a] italic mb-2 leading-snug">"{flag.passage}"</p>

                <p className="text-sm text-gray-700 leading-relaxed mb-2">{flag.reason}</p>

                {flag.evidence_gap && (
                  <p className="text-xs text-gray-500 mb-2">
                    <span className="font-semibold">Evidence gap: </span>{flag.evidence_gap}
                  </p>
                )}

                {flag.possible_revision && (
                  <div className="mt-2 border-t border-black/5 pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">
                      Possible revision — human editorial judgement required
                    </p>
                    <p className="text-sm text-gray-700 italic leading-snug">"{flag.possible_revision}"</p>
                  </div>
                )}

                <span className="inline-block mt-3 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/70 border border-black/5">
                  Suggested action: {ACTION_LABELS[flag.suggested_action] || flag.suggested_action}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 leading-relaxed border-t border-gray-200 pt-3">
        Proof Desk identifies potential publication-risk signals. It does not provide legal advice or
        determine whether content is lawful or safe to publish. Editorial and legal judgement remain
        with the appropriate human reviewers.
      </p>
    </div>
  )
}

function CountPill({ label, count, color }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="font-semibold" style={{ color }}>{count}</span>
      <span className="text-gray-500">{label}</span>
    </div>
  )
}
