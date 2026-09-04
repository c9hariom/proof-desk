import { useMemo, useState } from 'react'
import ScorecardCard from './ScorecardCard'
import ClaimMapTable from './ClaimMapTable'
import ClaimDetailPanel from './ClaimDetailPanel'
import RedTeamSection from './RedTeamSection'
import PublicationRiskSection from './PublicationRiskSection'
import NeedsAttentionSection from './NeedsAttentionSection'
import ClaimStatusChart from './ClaimStatusChart'
import EvidenceTierChart from './EvidenceTierChart'

const TABS = [
  { key: 'claim_map', label: 'Claim map' },
  { key: 'red_team', label: 'Red team' },
  { key: 'publication_risk', label: 'Legal & publication risk' },
  { key: 'needs_attention', label: 'Needs attention' },
]

export default function Report({ review }) {
  const [activeTab, setActiveTab] = useState('claim_map')
  const [selectedClaimId, setSelectedClaimId] = useState(null)

  const claimsById = useMemo(
    () => Object.fromEntries(review.claims.map((c) => [c.id, c])),
    [review.claims],
  )
  const selectedClaim = selectedClaimId ? claimsById[selectedClaimId] : null

  const summary = review.summary || {}
  const scorecard = review.scorecard || {}
  const needsAttentionCount = (summary.needs_attention || []).length

  return (
    <div className="h-full overflow-y-auto px-6 py-6 fontwrapper">
      <div className="max-w-5xl mx-auto">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#e3120b] mb-1">
          Proof Desk review
        </p>
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1 leading-snug" style={{ fontFamily: 'Georgia, serif' }}>
          {review.title}
        </h1>
        <p className="text-xs text-gray-400 mb-6">
          Reviewed {new Date(review.created_at).toLocaleString()}{review.is_demo ? ' · Demo example' : ''}
        </p>

        {summary.headline && (
          <p className="text-base text-gray-700 italic mb-6 leading-relaxed">"{summary.headline}"</p>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <ScorecardCard label="Evidence" indicator={scorecard.evidence} />
          <ScorecardCard label="Freshness" indicator={scorecard.freshness} />
          <ScorecardCard label="Reasoning" indicator={scorecard.reasoning} />
          <ScorecardCard label="Publication risk" indicator={scorecard.publication_risk} />
        </div>

        {review.claims.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <ClaimStatusChart claims={review.claims} />
            <EvidenceTierChart claims={review.claims} />
          </div>
        )}

        {(summary.can_trust || summary.should_verify || summary.assumptions || summary.could_be_challenged || summary.needs_human_review) && (
          <div className="grid sm:grid-cols-2 gap-4 mb-8 bg-white border border-gray-200 rounded-2xl p-5">
            <SummaryField label="What can I trust?" text={summary.can_trust} />
            <SummaryField label="What should I verify?" text={summary.should_verify} />
            <SummaryField label="What am I assuming?" text={summary.assumptions} />
            <SummaryField label="What could I be challenged on?" text={summary.could_be_challenged} />
            <div className="sm:col-span-2">
              <SummaryField label="What needs human review?" text={summary.needs_human_review} accent />
            </div>
          </div>
        )}

        <div className="flex items-end gap-1 border-b-2 border-gray-200 mb-6">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-5 py-2.5 text-sm font-bold rounded-t-lg border border-b-0 -mb-0.5 transition-all duration-150 ${
                  isActive
                    ? 'bg-white text-[#e3120b] border-gray-200 shadow-[0_-2px_6px_rgba(0,0,0,0.04)]'
                    : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.key === 'needs_attention' && needsAttentionCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#e3120b] text-white text-[9px]">
                    {needsAttentionCount}
                  </span>
                )}
                <span
                  className={`absolute left-0 right-0 -bottom-0.5 h-0.5 rounded-full ${
                    isActive ? 'bg-[#e3120b]' : 'bg-transparent'
                  }`}
                />
              </button>
            )
          })}
        </div>

        {activeTab === 'claim_map' && (
          <div className="grid lg:grid-cols-[1fr_360px] gap-5">
            <ClaimMapTable claims={review.claims} selectedClaimId={selectedClaimId} onSelectClaim={setSelectedClaimId} />
            <div className="hidden lg:block border border-gray-200 rounded-2xl bg-white">
              <ClaimDetailPanel claim={selectedClaim} onClose={() => setSelectedClaimId(null)} />
            </div>
            {selectedClaim && (
              <div className="lg:hidden border border-gray-200 rounded-2xl bg-white">
                <ClaimDetailPanel claim={selectedClaim} onClose={() => setSelectedClaimId(null)} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'red_team' && (
          <div>
            <p className="text-sm text-gray-500 mb-4 italic">If a sceptical editor challenged this…</p>
            <RedTeamSection notes={review.red_team_notes} claimsById={claimsById} />
          </div>
        )}

        {activeTab === 'publication_risk' && <PublicationRiskSection flags={review.risk_flags} />}

        {activeTab === 'needs_attention' && <NeedsAttentionSection items={summary.needs_attention} />}
      </div>
    </div>
  )
}

function SummaryField({ label, text, accent }) {
  if (!text) return null
  return (
    <div>
      <p className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${accent ? 'text-[#e3120b]' : 'text-gray-400'}`}>
        {label}
      </p>
      <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
    </div>
  )
}
