const STEPS = [
  { n: '1', title: 'Claim analyst', text: 'Breaks the document into atomic, checkable claims and prioritises the ones that matter most.' },
  { n: '2', title: 'Evidence researcher', text: 'Searches DuckDuckGo, Wikipedia, Google News, GDELT and NewsAPI for supporting and contradicting sources — all free.' },
  { n: '3', title: 'Cross-checker', text: 'Judges whether each source actually supports the claim as written, and how fresh it is.' },
  { n: '4', title: 'Red team', text: 'Attacks the reasoning like a sceptical editor — hidden assumptions, weak links, missing counterarguments.' },
  { n: '5', title: 'Legal & publication risk', text: 'Flags passages that may need qualification, attribution, or human legal review — never a legal verdict.' },
  { n: '6', title: 'Synthesizer', text: 'Produces one concise scorecard and executive summary you can act on.' },
]

export default function Landing({ onStartReview, onTryExample, onViewHistory }) {
  return (
    <div className="h-full overflow-y-auto px-6 py-12 flex flex-col items-center">
      <div className="w-full max-w-3xl text-center animate-fade-slide-up">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#e3120b] mb-3">
          Evidence, reasoning &amp; publication-risk review
        </p>
        <h1 className="text-4xl font-bold text-[#1a1a1a] mb-4 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
          Before you publish, know what you're actually claiming.
        </h1>
        <p className="text-base text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
          Proof Desk traces every important claim to its evidence, challenges the reasoning behind it,
          checks freshness, and surfaces passages that may deserve human — or legal — review.
        </p>

        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={onStartReview}
            className="rounded-xl bg-[#e3120b] text-white text-sm font-semibold px-6 py-3 hover:bg-[#c41009] transition-colors"
          >
            New review
          </button>
          <button
            onClick={onTryExample}
            className="rounded-xl border border-gray-300 text-[#1a1a1a] text-sm font-semibold px-6 py-3 hover:border-[#e3120b]/50 hover:text-[#e3120b] transition-colors"
          >
            Try an example
          </button>
        </div>
        <button onClick={onViewHistory} className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2">
          View past reviews
        </button>
      </div>

      <div className="w-full max-w-4xl mt-14">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">How it works</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STEPS.map((step) => (
            <div key={step.n} className="text-left p-4 bg-white border border-gray-200 rounded-2xl animate-pop-in">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-[#e3120b] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                  {step.n}
                </span>
                <span className="text-sm font-semibold text-[#1a1a1a]">{step.title}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{step.text}</p>
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
