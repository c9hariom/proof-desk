import { useState } from 'react'

/**
 * EmailGateModal — the only "identity" check in Proof Desk: an email
 * address, nothing else. No password, no name. It exists purely so a
 * user can find their own past reviews again in History.
 */
export default function EmailGateModal({ onSubmit, onCancel }) {
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (!isValid) return
    onSubmit(email.trim())
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(15,15,15,0.45)' }}
      className="flex items-center justify-center px-4"
    >
      <form
        onSubmit={handleSubmit}
        className="animate-pop-in w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-gray-200"
      >
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#e3120b] mb-2">
          Before you start
        </p>
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">
          What's your email?
        </h2>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
          No password, no name — just an email so you can find this review again later in History.
        </p>
        <input
          type="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-[#1a1a1a] placeholder-gray-400 focus:outline-none focus:border-[#e3120b]/60 focus:ring-2 focus:ring-[#e3120b]/10 mb-1"
        />
        {touched && !isValid && (
          <p className="text-xs text-[#e3120b] mb-2">Enter a valid email address.</p>
        )}
        <div className="flex items-center gap-2 mt-4">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-[#e3120b] text-white text-sm font-semibold py-2.5 hover:bg-[#c41009] transition-colors"
          >
            Continue
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
