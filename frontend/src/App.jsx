import { useCallback, useState } from 'react'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import Landing from './components/Landing'
import Home from './components/Home'
import Analysing from './components/Analysing'
import Report from './components/Report'
import History from './components/History'
import EmailGateModal from './components/EmailGateModal'
import { submitReview } from './hooks/useReviewApi'
import { usePollReview } from './hooks/usePollReview'
import { EMAIL_STORAGE_KEY } from './constants'

export default function App() {
  const [view, setView] = useState('landing')
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_STORAGE_KEY) || '')
  const [pendingAction, setPendingAction] = useState(null) // { title, documentText } | { useDemo: true } | null
  const [showEmailGate, setShowEmailGate] = useState(false)

  const [reviewId, setReviewId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [completedReview, setCompletedReview] = useState(null)

  const { review: polledReview, error: pollError, activity, researchProgress } = usePollReview(view === 'analysing' ? reviewId : null)

  // Once polling reports completion, move to the report view.
  if (view === 'analysing' && polledReview?.status === 'complete' && completedReview?.id !== polledReview.id) {
    setCompletedReview(polledReview)
    setView('report')
  }

  const runSubmit = useCallback(async (userEmail, action) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const result = await submitReview({
        email: userEmail,
        title: action.title,
        documentText: action.documentText,
        useDemo: !!action.useDemo,
      })
      setReviewId(result.review_id)
      if (result.status === 'complete') {
        const { getReview } = await import('./hooks/useReviewApi')
        const full = await getReview(result.review_id)
        setCompletedReview(full)
        setView('report')
      } else {
        setView('analysing')
      }
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }, [])

  const beginAction = useCallback((action) => {
    if (!email) {
      setPendingAction(action)
      setShowEmailGate(true)
      return
    }
    runSubmit(email, action)
  }, [email, runSubmit])

  const handleEmailSubmit = useCallback((newEmail) => {
    localStorage.setItem(EMAIL_STORAGE_KEY, newEmail)
    setEmail(newEmail)
    setShowEmailGate(false)
    if (pendingAction) {
      runSubmit(newEmail, pendingAction)
      setPendingAction(null)
    }
  }, [pendingAction, runSubmit])

  const handleOpenReview = useCallback(async (id) => {
    const { getReview } = await import('./hooks/useReviewApi')
    const full = await getReview(id)
    setCompletedReview(full)
    setReviewId(id)
    setView('report')
  }, [])

  const handleChangeEmail = useCallback(() => {
    setPendingAction(null)
    setShowEmailGate(true)
  }, [])

  return (
    <div className="app-container">
      <main className="editorial-frame">
        <Header
          view={view}
          onNavigate={(v) => setView(v)}
          email={email}
          onChangeEmail={handleChangeEmail}
        />

        <div style={{ flex: 1, overflow: 'hidden' }}>
          {view === 'landing' && (
            <Landing
              onStartReview={() => setView('home')}
              onTryExample={() => beginAction({ useDemo: true })}
              onViewHistory={() => setView('history')}
            />
          )}

          {view === 'home' && (
            <Home
              onStartReview={(action) => beginAction(action)}
              onTryExample={() => beginAction({ useDemo: true })}
              submitting={submitting}
              submitError={submitError}
            />
          )}

          {view === 'analysing' && (
            <Analysing review={polledReview} error={pollError} activity={activity} researchProgress={researchProgress} />
          )}

          {view === 'report' && completedReview && <Report review={completedReview} />}

          {view === 'history' && email && (
            <History email={email} onOpenReview={handleOpenReview} />
          )}
          {view === 'history' && !email && (
            <div className="h-full flex items-center justify-center px-6 text-center">
              <div>
                <p className="text-sm text-gray-500 mb-3">Enter your email to see your review history.</p>
                <button
                  onClick={() => setShowEmailGate(true)}
                  className="rounded-xl bg-[#e3120b] text-white text-sm font-semibold px-5 py-2.5 hover:bg-[#c41009] transition-colors"
                >
                  Enter email
                </button>
              </div>
            </div>
          )}
        </div>

        <Footer email={email} />
      </main>

      {showEmailGate && (
        <EmailGateModal
          onSubmit={handleEmailSubmit}
          onCancel={pendingAction ? () => { setShowEmailGate(false); setPendingAction(null) } : () => setShowEmailGate(false)}
        />
      )}
    </div>
  )
}
