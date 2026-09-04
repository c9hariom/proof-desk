export default function Footer({ email }) {
  return (
    <footer className="flex-shrink-0 bg-[#161311] border-t-[3px] border-[#e3120b] px-6 py-2.5 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-white text-[13px] font-bold tracking-tight flex-shrink-0" style={{ fontFamily: 'Georgia, serif' }}>
          Proof Desk
        </span>
        <span className="text-white/25 text-xs flex-shrink-0">·</span>
        <span className="text-white/45 text-[11px] truncate hidden sm:inline">
          Evidence accelerates production. Proof Desk accelerates judgement.
        </span>
      </div>

      <p className="text-white/40 text-[11px] text-center flex-1 min-w-[220px] max-w-xl">
        Not legal advice — Proof Desk surfaces potential risk signals for human editorial &amp; legal review.
      </p>

      <div className="flex items-center gap-3 flex-shrink-0">
        {email && <span className="text-white/30 text-[11px] hidden lg:inline">{email}</span>}
        <span className="text-white/25 text-[11px]">© {new Date().getFullYear()}</span>
      </div>
    </footer>
  )
}
