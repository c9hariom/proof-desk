import { useEffect, useMemo, useRef } from 'react'
import { PIPELINE_STAGES, TIER_LABELS } from '../constants'

function stageState(stageKey, currentStage, status) {
  if (status === 'complete') return 'done'
  const currentIdx = PIPELINE_STAGES.findIndex((s) => s.key === currentStage)
  const thisIdx = PIPELINE_STAGES.findIndex((s) => s.key === stageKey)
  if (currentIdx === -1) return 'pending'
  if (thisIdx < currentIdx) return 'done'
  if (thisIdx === currentIdx) return 'active'
  return 'pending'
}

function Icon({ path, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {path}
    </svg>
  )
}

const ICON_PATHS = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" /></>,
  docCheck: <><path d="M6.5 2H18v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="m9 12 2 2 4-4" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.5" /></>,
  scale: <><path d="M12 3v18M5 7h14M5 7 2 14a3 3 0 0 0 6 0L5 7ZM19 7l-3 7a3 3 0 0 0 6 0l-3-7Z" /></>,
  doc: <><path d="M6.5 2H18v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
  newspaper: <><path d="M4 22h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-4v14H4a2 2 0 0 1-2-2V8" /><path d="M18 4H8v14h10a2 2 0 0 0 2-2V4Z" /><path d="M11 8h4M11 11h4" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
}

const STAGE_ICON_KEYS = {
  claim_analyst: 'search',
  evidence_researcher: 'globe',
  cross_checker: 'docCheck',
  red_team: 'target',
  publication_risk: 'scale',
  synthesizer: 'doc',
}

const CATEGORY_ICON_KEYS = {
  'DuckDuckGo web search': 'search',
  Wikipedia: 'book',
  'Google News RSS': 'newspaper',
  NewsAPI: 'newspaper',
  'GDELT news archive': 'globe',
}

const CATEGORY_ACCENTS = [
  'bg-red-50 text-[#e3120b]',
  'bg-emerald-50 text-emerald-700',
  'bg-sky-50 text-sky-700',
  'bg-violet-50 text-violet-700',
  'bg-amber-50 text-amber-700',
]

const TIER_BADGE_COLORS = {
  tier_1_primary: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  tier_2_strong_secondary: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  tier_3_context: 'bg-amber-50 text-amber-700 border-amber-200',
  tier_4_unverified: 'bg-slate-50 text-slate-500 border-slate-200',
}

function CategoryCard({ label, info, accent, iconKey }) {
  const status = info?.status || 'pending'
  return (
    <div className="border border-gray-200 rounded-xl p-3 bg-white">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${accent}`}>
        <Icon path={ICON_PATHS[iconKey] || ICON_PATHS.search} />
      </div>
      <p className="text-xs font-bold text-[#1a1a1a] leading-tight">{label}</p>
      <div className="mt-1.5">
        {status === 'scanning' && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#e3120b]">
            <span className="w-3 h-3 rounded-full border-2 border-[#e3120b]/30 border-t-[#e3120b] animate-spin" />
            Scanning…
          </span>
        )}
        {status === 'done' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
            <Icon path={ICON_PATHS.check} className="w-3 h-3" />
            {info.count} result{info.count === 1 ? '' : 's'}
          </span>
        )}
        {status === 'pending' && <span className="text-[11px] text-gray-400">Queued…</span>}
      </div>
    </div>
  )
}

function SourceRow({ index, source }) {
  const tierBadge = TIER_BADGE_COLORS[source.tier] || TIER_BADGE_COLORS.tier_4_unverified
  return (
    <tr className="border-b border-gray-50 last:border-0 align-top">
      <td className="py-2 pr-2 text-gray-400">{index}</td>
      <td className="py-2 pr-2 whitespace-nowrap">
        <p className="font-semibold text-[#1a1a1a]">{source.publisher || source.category}</p>
        <p className="text-[10px] text-gray-400">{source.category}</p>
      </td>
      <td className="py-2 pr-2 max-w-[280px]">
        {source.url ? (
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-medium text-[#1a1a1a] hover:text-[#e3120b] hover:underline leading-snug line-clamp-1">
            {source.title}
          </a>
        ) : (
          <p className="font-medium text-[#1a1a1a] leading-snug line-clamp-1">{source.title}</p>
        )}
        {source.snippet && <p className="text-[11px] text-gray-400 leading-snug line-clamp-1">{source.snippet}</p>}
      </td>
      <td className="py-2 pr-2">
        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${tierBadge}`}>
          {TIER_LABELS[source.tier] || 'Unrated'}
        </span>
      </td>
      <td className="py-2 pr-2 whitespace-nowrap text-gray-500">{source.published_at || '—'}</td>
      <td className="py-2 whitespace-nowrap">
        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
          <Icon path={ICON_PATHS.check} className="w-3 h-3" />
          Found
        </span>
      </td>
    </tr>
  )
}

export default function Analysing({ review, error, activity, researchProgress }) {
  const status = review?.status
  const currentStage = review?.current_stage
  const consoleRef = useRef(null)

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [activity])

  const isSearching = currentStage === 'evidence_researcher'
  const categories = researchProgress?.categories || {}
  const sources = researchProgress?.sources || []
  const categoryEntries = Object.entries(categories)
  const anyScanning = categoryEntries.some(([, info]) => info.status === 'scanning')
  const hasResearch = categoryEntries.length > 0

  // Sources with a real web link are more useful to a reader — keep them on top,
  // most-recently-found first within each group.
  const sortedSources = useMemo(() => {
    const withUrl = []
    const withoutUrl = []
    for (const s of sources) (s.url ? withUrl : withoutUrl).push(s)
    return [...withUrl.reverse(), ...withoutUrl.reverse()]
  }, [sources])

  return (
    <div className="h-full overflow-y-auto px-6 py-8">
      <div className="max-w-5xl mx-auto animate-fade-slide-up">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#e3120b] mb-2 text-center">
          Analysing document
        </p>
        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2 text-center">
          Tracing every claim to its evidence…
        </h2>
        <p className="text-sm text-gray-500 text-center max-w-xl mx-auto mb-8 leading-relaxed">
          Our AI searches multiple trusted sources, cross-checks the information, and finds the most reliable
          evidence for each claim.
        </p>

        <div className="flex items-start mb-8">
          {PIPELINE_STAGES.map((stage, i) => {
            const state = stageState(stage.key, currentStage, status)
            return (
              <div key={stage.key} className="flex-1 flex items-start">
                {i > 0 && (
                  <div className={`h-0.5 flex-1 mt-4 ${state === 'pending' ? 'bg-gray-200' : 'bg-[#e3120b]'}`} />
                )}
                <div className="flex flex-col items-center text-center px-1">
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 ${
                      state === 'done'
                        ? 'bg-[#e3120b] border-[#e3120b] text-white'
                        : state === 'active'
                          ? 'bg-white border-[#e3120b] text-[#e3120b]'
                          : 'bg-white border-gray-200 text-gray-300'
                    }`}
                    style={state === 'active' ? { animation: 'checklistPulse 1.2s ease-in-out infinite' } : undefined}
                  >
                    {state === 'done' ? <Icon path={ICON_PATHS.check} /> : <Icon path={ICON_PATHS[STAGE_ICON_KEYS[stage.key]]} />}
                  </span>
                  <span
                    className={`text-[11px] leading-tight max-w-[90px] ${
                      state === 'pending' ? 'text-gray-300' : state === 'active' ? 'text-[#e3120b] font-bold' : 'text-gray-500 font-medium'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-5 items-start">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            {hasResearch ? (
              <>
                <h3 className="text-base font-bold text-[#1a1a1a] mb-1">
                  {isSearching ? 'Searching for evidence…' : 'Evidence gathered'}
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  {isSearching
                    ? 'Scanning trusted sources and finding relevant information for each claim.'
                    : `These sources are now being used while ${(PIPELINE_STAGES.find((s) => s.key === currentStage)?.label || 'the review continues').toLowerCase()}.`}
                </p>

                <div className="grid sm:grid-cols-3 gap-2.5 mb-5">
                  {categoryEntries.map(([label, info], i) => (
                    <CategoryCard
                      key={label}
                      label={label}
                      info={info}
                      accent={CATEGORY_ACCENTS[i % CATEGORY_ACCENTS.length]}
                      iconKey={CATEGORY_ICON_KEYS[label]}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${isSearching ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <p className="text-sm font-bold text-[#1a1a1a]">
                    {isSearching ? 'Live research results' : 'Sources gathered'}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  {isSearching ? 'Sources being scanned and matched to claims in real time.' : 'Carried forward from the research stage for reference.'}
                </p>

                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-xs px-1">
                    <thead>
                      <tr className="text-left text-[10px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                        <th className="py-1.5 pr-2 font-semibold">#</th>
                        <th className="py-1.5 pr-2 font-semibold">Source</th>
                        <th className="py-1.5 pr-2 font-semibold">Title / snippet</th>
                        <th className="py-1.5 pr-2 font-semibold">Relevance</th>
                        <th className="py-1.5 pr-2 font-semibold">Published</th>
                        <th className="py-1.5 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedSources.slice(0, 12).map((s, i) => (
                        <SourceRow key={`${s.url || s.title}-${i}`} index={i + 1} source={s} />
                      ))}
                      {sortedSources.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-gray-400 italic">
                            {isSearching ? 'Waiting for the first results…' : 'No candidate sources were found for the prioritised claims.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 text-[11px] text-gray-400">
                  <span>
                    {sortedSources.length} source{sortedSources.length === 1 ? '' : 's'} processed
                    {sortedSources.length > 12 ? ` · ${sortedSources.length - 12} more in queue` : ''}
                  </span>
                  {anyScanning && (
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <span className="w-3 h-3 rounded-full border-2 border-gray-300 border-t-gray-500 animate-spin" />
                      Searching the web…
                    </span>
                  )}
                </div>
              </>
            ) : (
              <GenericStagePanel currentStage={currentStage} activity={activity} consoleRef={consoleRef} />
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm font-bold text-[#1a1a1a] mb-2">Why multiple sources?</p>
            <ul className="flex flex-col gap-1.5 mb-4">
              {[
                'News websites for the latest updates',
                'Wikipedia for background & context',
                'Independent news archives for broader coverage',
                'Cross-checking to catch bias or gaps',
                'Every finding traced back to a live source link',
              ].map((line) => (
                <li key={line} className="flex items-start gap-1.5 text-xs text-gray-600 leading-snug">
                  <Icon path={ICON_PATHS.check} className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {line}
                </li>
              ))}
            </ul>
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-[#e3120b] text-white flex items-center justify-center">
                <Icon path={ICON_PATHS.scale} className="w-3.5 h-3.5" />
              </span>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                We cross-check information across sources to ensure accuracy, freshness and impartiality.
              </p>
            </div>
          </div>
        </div>

        {status === 'failed' && (
          <p className="text-xs text-[#e3120b] mt-6 text-center">
            The review failed to complete. Please try again.
          </p>
        )}
        {error && <p className="text-xs text-[#e3120b] mt-6 text-center">{error}</p>}
      </div>
    </div>
  )
}

function GenericStagePanel({ currentStage, activity, consoleRef }) {
  const stage = PIPELINE_STAGES.find((s) => s.key === currentStage)
  return (
    <div>
      <h3 className="text-base font-bold text-[#1a1a1a] mb-1">{stage ? stage.label : 'Working…'}</h3>
      <p className="text-xs text-gray-500 mb-4">Hang tight — this stage is running now.</p>
      {activity && activity.length > 0 && (
        <div
          ref={consoleRef}
          className="bg-[#12120f] rounded-xl p-3 h-48 overflow-y-auto font-mono text-[11px] text-emerald-300 leading-relaxed"
        >
          {activity.map((line, i) => (
            <p key={i} className="whitespace-pre-wrap">
              <span className="text-emerald-500/60">{'> '}</span>{line}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

