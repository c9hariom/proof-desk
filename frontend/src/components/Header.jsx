export default function Header({ view, onNavigate, email, onChangeEmail }) {
  return (
    <header className="relative flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#e3120b] flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-white/15 flex items-center justify-center">
          <span className="text-white text-sm font-bold">P</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight leading-none">
            Proof Desk
          </h1>
          <p className="text-[10px] text-white/60 uppercase tracking-widest leading-none mt-0.5">
            Evidence, reasoning &amp; publication-risk review
          </p>
        </div>
      </div>

      {email && (
        <button
          onClick={onChangeEmail}
          title="Change email"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] text-white/60 hover:text-white transition-colors hidden lg:block"
        >
          {email}
        </button>
      )}

      <nav className="flex items-center gap-1 bg-black/15 rounded-xl p-1">
        <button
          onClick={() => onNavigate('landing')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            view === 'landing' || view === 'home' ? 'bg-white text-[#e3120b]' : 'text-white/70 hover:text-white'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => onNavigate('history')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            view === 'history' ? 'bg-white text-[#e3120b]' : 'text-white/70 hover:text-white'
          }`}
        >
          History
        </button>
      </nav>
    </header>
  )
}
