import { useEffect, useRef } from 'react'
import { PIPELINE_STAGES } from '../constants'

function stageState(stageKey, currentStage, status) {
  if (status === 'complete') return 'done'
  const currentIdx = PIPELINE_STAGES.findIndex((s) => s.key === currentStage)
  const thisIdx = PIPELINE_STAGES.findIndex((s) => s.key === stageKey)
  if (currentIdx === -1) return 'pending'
  if (thisIdx < currentIdx) return 'done'
  if (thisIdx === currentIdx) return 'active'
  return 'pending'
}

export default function Analysing({ review, error, activity }) {
  const status = review?.status
  const currentStage = review?.current_stage
  const consoleRef = useRef(null)

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [activity])

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
      <div className="w-full max-w-md animate-fade-slide-up">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#e3120b] mb-2 text-center">
          Analysing document
        </p>
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-8 text-center" style={{ fontFamily: 'Georgia, serif' }}>
          Tracing every claim to its evidence…
        </h2>

        <div className="flex flex-col gap-3">
          {PIPELINE_STAGES.map((stage) => {
            const state = stageState(stage.key, currentStage, status)
            return (
              <div key={stage.key} className="flex items-center gap-3">
                <span
                  className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    state === 'done'
                      ? 'bg-[#e3120b] text-white'
                      : state === 'active'
                        ? 'bg-white border-2 border-[#e3120b] text-[#e3120b]'
                        : 'bg-gray-100 text-gray-300'
                  }`}
                  style={state === 'active' ? { animation: 'checklistPulse 1.2s ease-in-out infinite' } : undefined}
                >
                  {state === 'done' ? '✓' : ''}
                </span>
                <span
                  className={`text-sm ${
                    state === 'pending' ? 'text-gray-300' : state === 'active' ? 'text-[#1a1a1a] font-medium' : 'text-gray-500'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            )
          })}
        </div>

        {activity && activity.length > 0 && (
          <div className="mt-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 text-center">
              Live research console
            </p>
            <div
              ref={consoleRef}
              className="bg-[#12120f] rounded-xl p-3 h-40 overflow-y-auto font-mono text-[11px] text-emerald-300 leading-relaxed"
            >
              {activity.map((line, i) => (
                <p key={i} className="whitespace-pre-wrap">
                  <span className="text-emerald-500/60">{'> '}</span>{line}
                </p>
              ))}
            </div>
          </div>
        )}

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

