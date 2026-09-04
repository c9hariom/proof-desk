function Icon({ path, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {path}
    </svg>
  )
}

const ICON_PATHS = {
  doc: <><path d="M6.5 2H18v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  network: <><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="12" cy="18" r="2.5" /><path d="M8 7.3 10.5 16M16 7.3 13.5 16" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.5" /><path d="M15.5 14.2c2.6.4 4.5 2.6 4.5 5.3" /></>,
  scale: <><path d="M12 3v18M5 7h14M5 7 2 14a3 3 0 0 0 6 0L5 7ZM19 7l-3 7a3 3 0 0 0 6 0l-3-7Z" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  shieldCheck: <><path d="M12 3 5 6v5c0 4.5 3 8 7 9 4-1 7-4.5 7-9V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>,
}

const STEPS = [
  { n: '1', title: 'Claim analyst', icon: 'doc', text: 'Breaks the document into atomic, checkable claims and prioritises the ones that matter most.' },
  { n: '2', title: 'Evidence researcher', icon: 'search', text: 'Searches DuckDuckGo, Wikipedia, Google News, GDELT and NewsAPI for supporting and contradicting sources — all free.' },
  { n: '3', title: 'Cross-checker', icon: 'network', text: 'Judges whether each source actually supports the claim as written, and how fresh it is.' },
  { n: '4', title: 'Red team', icon: 'users', text: 'Attacks the reasoning like a sceptical editor — hidden assumptions, weak links, missing counterarguments.' },
  { n: '5', title: 'Legal & publication risk', icon: 'scale', text: 'Flags passages that may need qualification, attribution, or human legal review — never a legal verdict.' },
  { n: '6', title: 'Synthesizer', icon: 'doc', text: 'Produces one concise scorecard and executive summary you can act on.' },
]

export default function Landing({ onStartReview, onTryExample, onViewHistory }) {
  return (
    <div className="h-full overflow-y-auto px-6 py-12 flex flex-col items-center">
      <div className="relative w-full max-w-3xl text-center animate-fade-slide-up">
        <div className="hidden lg:block absolute -left-28 top-1/2 -translate-y-1/2 w-40 h-40 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 rounded-full bg-[#e3120b]/5 blur-xl" />
          <div className="absolute left-4 top-6 w-24 h-32 rotate-[-8deg] rounded-lg bg-white border border-gray-200 shadow-sm" />
          <div className="absolute left-8 top-10 w-24 h-32 rotate-[4deg] rounded-lg bg-white border border-gray-200 shadow-sm p-3 flex flex-col gap-1.5">
            <span className="h-1.5 w-3/4 rounded bg-gray-200" />
            <span className="h-1.5 w-full rounded bg-gray-200" />
            <span className="h-1.5 w-2/3 rounded bg-gray-200" />
          </div>
          <div className="absolute left-14 top-16 w-11 h-11 rounded-full bg-white border-2 border-[#e3120b] flex items-center justify-center shadow-sm">
            <Icon path={ICON_PATHS.search} className="w-5 h-5 text-[#e3120b]" />
          </div>
        </div>

        <div className="hidden lg:block absolute -right-28 top-1/2 -translate-y-1/2 w-40 h-40 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 rounded-full bg-[#e3120b]/5 blur-xl" />
          <div className="absolute right-4 top-4 w-24 h-32 rotate-[8deg] rounded-lg bg-white border border-gray-200 shadow-sm" />
          <div className="absolute right-8 top-8 w-24 h-32 rotate-[-4deg] rounded-lg bg-white border border-gray-200 shadow-sm p-3 flex flex-col gap-1.5">
            <span className="h-1.5 w-3/4 rounded bg-gray-200" />
            <span className="h-1.5 w-full rounded bg-gray-200" />
            <span className="h-1.5 w-2/3 rounded bg-gray-200" />
          </div>
          <div className="absolute right-14 top-14 w-11 h-11 rounded-xl bg-[#e3120b] flex items-center justify-center shadow-sm">
            <Icon path={ICON_PATHS.shieldCheck} className="w-5 h-5 text-white" />
          </div>
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#e3120b] mb-4">
          Evidence, reasoning &amp; publication-risk review
        </p>
        <h1 className="text-5xl font-bold text-[#1a1a1a] mb-5 leading-[1.15] tracking-tight">
          Before you publish, know what you're <span className="text-[#e3120b]">actually</span> claiming.
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-[1.7]">
          Proof Desk traces every important claim to its evidence, challenges the reasoning behind it,
          checks freshness, and surfaces passages that may deserve human — or legal — review.
        </p>

        <div className="flex items-center justify-center gap-3 mb-5">
          <button
            onClick={onStartReview}
            className="inline-flex items-center gap-2 rounded-xl bg-[#e3120b] text-white text-[15px] font-semibold px-7 py-3.5 hover:bg-[#c41009] transition-colors"
          >
            New review
            <Icon path={ICON_PATHS.arrow} className="w-4 h-4" />
          </button>
          <button
            onClick={onTryExample}
            className="rounded-xl border border-gray-300 text-[#1a1a1a] text-[15px] font-semibold px-7 py-3.5 hover:border-[#e3120b]/50 hover:text-[#e3120b] transition-colors"
          >
            Try an example
          </button>
        </div>
        <button onClick={onViewHistory} className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2">
          View past reviews
        </button>
      </div>

      <div className="w-full max-w-4xl mt-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">How it works</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STEPS.map((step) => (
            <div key={step.n} className="text-left p-4 bg-white border border-gray-200 rounded-2xl animate-pop-in">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-[#e3120b] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                    {step.n}
                  </span>
                  <span className="text-lg font-bold text-[#1a1a1a] truncate">{step.title}</span>
                </div>
                <Icon path={ICON_PATHS[step.icon]} className="w-4 h-4 text-[#e3120b] flex-shrink-0" />
              </div>
              <p className="text-[16px] font-normal text-gray-500 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-300 mt-10 max-w-lg text-center leading-relaxed">
        Proof Desk does not provide legal advice. It surfaces potential risk signals and recommends
        human editorial or legal review where appropriate.
      </p>
    </div>
  )
}
