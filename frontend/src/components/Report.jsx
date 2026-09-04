import { useMemo, useState } from 'react'
import ScorecardCard from './ScorecardCard'
import ClaimMapTable from './ClaimMapTable'
import ClaimDetailPanel from './ClaimDetailPanel'
import RedTeamSection from './RedTeamSection'
import PublicationRiskSection from './PublicationRiskSection'
import NeedsAttentionSection from './NeedsAttentionSection'
import ClaimStatusChart from './ClaimStatusChart'
import EvidenceTierChart from './EvidenceTierChart'
import { Icon, ICONS } from './icons'

const TABS = [
  { key: 'claim_map', label: 'Claim map' },
  { key: 'red_team', label: 'Red team' },
  { key: 'publication_risk', label: 'Legal & publication risk' },
  { key: 'needs_attention', label: 'Needs attention' },
]

const INSIGHTS = [
  { key: 'can_trust', label: 'What can I trust?', icon: 'shieldCheck' },
  { key: 'should_verify', label: 'What should I verify?', icon: 'search' },
  { key: 'assumptions', label: 'What am I assuming?', icon: 'question' },
  { key: 'could_be_challenged', label: 'What could I be challenged on?', icon: 'flag' },
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
  const hasInsights = INSIGHTS.some((i) => summary[i.key])

  return (
    <div className="h-full overflow-y-auto px-6 py-8 fontwrapper">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#e3120b] mb-3">
          Proof Desk review
        </p>
        <h1 className="text-3xl sm:text-[34px] font-bold text-[#1a1a1a] mb-3 leading-[1.2] tracking-tight">
          {review.title}
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          Reviewed {new Date(review.created_at).toLocaleString()}{review.is_demo ? ' · Demo example' : ''}
        </p>

        {summary.headline && (
          <p className="text-lg text-gray-600 italic mb-8 leading-relaxed">"{summary.headline}"</p>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <ScorecardCard label="Evidence" indicator={scorecard.evidence} icon="evidence" />
          <ScorecardCard label="Freshness" indicator={scorecard.freshness} icon="clock" />
          <ScorecardCard label="Reasoning" indicator={scorecard.reasoning} icon="scale" />
          <ScorecardCard label="Publication risk" indicator={scorecard.publication_risk} icon="shield" />
        </div>

        {review.claims.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <ClaimStatusChart claims={review.claims} />
            <EvidenceTierChart claims={review.claims} />
          </div>
        )}

        {hasInsights && (
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            {INSIGHTS.map((insight) => (
              summary[insight.key] && (
                <div key={insight.key} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Icon path={ICONS[insight.icon]} className="w-4 h-4 text-[#e3120b] flex-shrink-0" />
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                      {insight.label}
                    </p>
                  </div>
                  <p className="text-[17px] text-gray-700 leading-relaxed">{summary[insight.key]}</p>
                </div>
              )
            ))}
          </div>
        )}

        {summary.needs_human_review && (
          <div className="bg-red-50/70 border border-red-200 rounded-2xl p-6 mb-8 flex items-start gap-3">
            <span className="flex-shrink-0 w-9 h-9 rounded-full bg-[#e3120b] text-white flex items-center justify-center mt-0.5">
              <Icon path={ICONS.shieldAlert} className="w-5 h-5" />
            </span>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.1em] text-[#e3120b] mb-1.5">
                What needs human review?
              </p>
              <p className="text-[17px] text-[#1a1a1a] leading-relaxed">{summary.needs_human_review}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-7 border-b border-gray-200 mb-7">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative pb-3 text-[15px] transition-colors ${
                  isActive ? 'text-[#e3120b] font-bold' : 'text-gray-400 font-semibold hover:text-gray-600'
                }`}
              >
                {tab.label}
                {tab.key === 'needs_attention' && needsAttentionCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#e3120b] text-white text-[9px] align-text-top">
                    {needsAttentionCount}
                  </span>
                )}
                {isActive && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-[#e3120b] rounded-full" />}
              </button>
            )
          })}
        </div>

        {activeTab === 'claim_map' && (
          <div className="grid lg:grid-cols-[1fr_380px] gap-5 items-start">
            <ClaimMapTable claims={review.claims} selectedClaimId={selectedClaimId} onSelectClaim={setSelectedClaimId} />
            <div className="hidden lg:block border border-gray-200 rounded-2xl bg-white lg:sticky lg:top-0 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
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
            <p className="text-base text-gray-500 mb-5 italic">If a sceptical editor challenged this…</p>
            <RedTeamSection notes={review.red_team_notes} claimsById={claimsById} />
          </div>
        )}

        {activeTab === 'publication_risk' && <PublicationRiskSection flags={review.risk_flags} />}

        {activeTab === 'needs_attention' && <NeedsAttentionSection items={summary.needs_attention} />}
      </div>
    </div>
  )
}
