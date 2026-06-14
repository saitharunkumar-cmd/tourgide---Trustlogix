import { useEffect, useLayoutEffect, useState, useCallback } from 'react'
import { useJourneys } from './JourneysContext'
import { useJourneyIntro } from '../../../v4/JourneyIntroContext'

type Rect = { top: number; left: number; width: number; height: number }

const PAD = 8

export default function TourRunner() {
  const {
    journeys,
    activeTour,
    activeJourney,
    completedJourney,
    nextStep,
    prevStep,
    pauseTour,
    exitTour,
    closeCompletion,
    startJourney,
    resumeJourney,
  } = useJourneys()

  const v4 = useJourneyIntro()

  const [rect, setRect] = useState<Rect | null>(null)
  const [v1RegisterActive, setV1RegisterActive] = useState(false)

  const nextNotStarted = journeys.find((j) => j.status === 'not_started')

  const step = activeJourney && activeTour ? activeJourney.steps[activeTour.step] : null
  const targetSel = step?.target

  useLayoutEffect(() => {
    if (!activeTour || !targetSel) {
      setRect(null)
      return
    }
    const measure = () => {
      const el = document.querySelector(targetSel)
      if (!el) {
        setRect(null)
        return
      }
      const r = el.getBoundingClientRect()
      setRect({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 })
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [activeTour, targetSel])

  useEffect(() => {
    if (!activeTour) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exitTour()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeTour, exitTour])

  const openRegisterFlow = useCallback(() => {
    if (!activeTour || !activeJourney) return
    pauseTour()
    setV1RegisterActive(true)
    v4.setSelectVariant('v1')
    v4.startJourney()
    v4.openRegisterModal()
  }, [activeTour, activeJourney, pauseTour, v4])

  useEffect(() => {
    if (!v1RegisterActive) return
    const modalDone = v4.phase === 'idle' || v4.subStep === 'chapter2-intro'
    if (modalDone) {
      if (v4.phase !== 'idle') v4.close()
      v4.setSelectVariant('v2')
      setV1RegisterActive(false)
      const paused = journeys.find((j) => j.status === 'paused')
      if (paused) {
        resumeJourney(paused.id)
        setTimeout(() => nextStep(), 50)
      }
    }
  }, [v1RegisterActive, v4.phase, v4.subStep, journeys, resumeJourney, nextStep, v4])

  useEffect(() => {
    if (!activeTour || !step?.interactAction || step.interactAction !== 'open-register') return
    const target = step.target
    if (!target) return
    const el = document.querySelector(target)
    if (!el) return
    const handler = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      openRegisterFlow()
    }
    el.addEventListener('click', handler, true)
    return () => el.removeEventListener('click', handler, true)
  }, [activeTour, step, openRegisterFlow])

  return (
    <>
      {activeTour && activeJourney && step && (
        <TourOverlay
          rect={rect}
          title={activeJourney.title}
          stepText={step.text}
          stepIndex={activeTour.step}
          totalSteps={activeJourney.totalSteps}
          interactive={step.interactive}
          actionHint={step.actionHint}
          onPrev={prevStep}
          onNext={nextStep}
          onPause={pauseTour}
          onExit={exitTour}
        />
      )}

      {completedJourney && (
        <CompletionModal
          title={completedJourney.title}
          onClose={closeCompletion}
          onNext={() => {
            closeCompletion()
            if (nextNotStarted) startJourney(nextNotStarted.id)
          }}
          hasNext={!!nextNotStarted}
        />
      )}
    </>
  )
}

/* ----------------------------- spotlight UI ------------------------------ */

function TourOverlay({
  rect,
  title,
  stepText,
  stepIndex,
  totalSteps,
  interactive,
  actionHint,
  onPrev,
  onNext,
  onPause,
  onExit,
}: {
  rect: Rect | null
  title: string
  stepText: string
  stepIndex: number
  totalSteps: number
  interactive?: boolean
  actionHint?: string
  onPrev: () => void
  onNext: () => void
  onPause: () => void
  onExit: () => void
}) {
  const isFirst = stepIndex === 0
  const isLast = stepIndex === totalSteps - 1

  const CARD_W = 360
  const CARD_H = 220
  const GAP = 12
  const EDGE = 16
  const pct = ((stepIndex + 1) / totalSteps) * 100

  const card: React.CSSProperties = (() => {
    if (!rect) {
      return { position: 'fixed', top: '50%', left: '50%', width: 380, transform: 'translate(-50%, -50%)' }
    }

    const vw = window.innerWidth
    const vh = window.innerHeight
    const spaceBelow = vh - (rect.top + rect.height + GAP)
    const spaceRight = vw - (rect.left + rect.width + GAP)
    const spaceLeft = rect.left - GAP

    if (spaceBelow >= CARD_H) {
      return {
        position: 'fixed',
        top: rect.top + rect.height + GAP,
        left: clamp(rect.left, EDGE, vw - CARD_W - EDGE),
        width: CARD_W,
      }
    }

    if (spaceRight >= CARD_W + EDGE) {
      return {
        position: 'fixed',
        top: clamp(rect.top, EDGE, vh - CARD_H - EDGE),
        left: rect.left + rect.width + GAP,
        width: CARD_W,
      }
    }

    if (spaceLeft >= CARD_W + EDGE) {
      return {
        position: 'fixed',
        top: clamp(rect.top, EDGE, vh - CARD_H - EDGE),
        left: rect.left - GAP - CARD_W,
        width: CARD_W,
      }
    }

    return {
      position: 'fixed',
      top: Math.max(rect.top - CARD_H - GAP, EDGE),
      left: clamp(rect.left, EDGE, vw - CARD_W - EDGE),
      width: CARD_W,
    }
  })() as React.CSSProperties

  return (
    <div className="pointer-events-none fixed inset-0 z-[10050]" role="dialog" aria-modal="true" aria-label={`${title} walkthrough`}>
      {/* Dim overlay with spotlight cutout */}
      {rect ? (
        <>
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <mask id="tour-hole">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={rect.left}
                  y={rect.top}
                  width={rect.width}
                  height={rect.height}
                  rx={12}
                  ry={12}
                  fill="black"
                />
              </mask>
              <linearGradient id="spotlight-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00A8CF" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#66CAE3" stopOpacity="1" />
                <stop offset="100%" stopColor="#00A8CF" stopOpacity="0.9" />
              </linearGradient>
              <filter id="spotlight-glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Dark backdrop */}
            <rect
              width="100%"
              height="100%"
              fill="rgba(15,23,42,0.6)"
              mask="url(#tour-hole)"
              className="transition-all duration-500"
            />
            {/* Animated glow ring around spotlight */}
            <rect
              x={rect.left - 2}
              y={rect.top - 2}
              width={rect.width + 4}
              height={rect.height + 4}
              rx={14}
              ry={14}
              fill="none"
              stroke="url(#spotlight-grad)"
              strokeWidth="2"
              filter="url(#spotlight-glow)"
              className="animate-spotlight-breathe"
            />
            {/* Outer soft ring */}
            <rect
              x={rect.left - 6}
              y={rect.top - 6}
              width={rect.width + 12}
              height={rect.height + 12}
              rx={18}
              ry={18}
              fill="none"
              stroke="rgba(0,168,207,0.15)"
              strokeWidth="1.5"
              className="animate-spotlight-ring"
            />
          </svg>
          {/* Click-blocker with hole */}
          <div
            className="pointer-events-auto absolute inset-0"
            style={{
              clipPath: `polygon(
                0 0, 0 100%, ${rect.left}px 100%, ${rect.left}px ${rect.top}px,
                ${rect.left + rect.width}px ${rect.top}px,
                ${rect.left + rect.width}px ${rect.top + rect.height}px,
                ${rect.left}px ${rect.top + rect.height}px,
                ${rect.left}px 100%, 100% 100%, 100% 0
              )`,
            }}
          />
        </>
      ) : (
        <div className="pointer-events-auto absolute inset-0 bg-[rgba(15,23,42,0.6)]" />
      )}

      {/* Step card — premium elevated */}
      <div
        style={card}
        className="pointer-events-auto animate-card-rise rounded-xl border border-white/80 bg-white/[0.97] backdrop-blur-sm shadow-[0_4px_6px_-1px_rgba(0,168,207,0.06),0_20px_50px_-12px_rgba(15,23,42,0.25),0_0_0_1px_rgba(0,168,207,0.08)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="flex items-center gap-2 rounded-full bg-[#E8F7FB] py-1.5 pl-1.5 pr-3.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00A8CF] text-[10px] font-bold text-white">
              {stepIndex + 1}
            </span>
            <span className="text-[12px] font-semibold text-[#00A8CF]">{title}</span>
          </div>
          <button
            type="button"
            onClick={onExit}
            aria-label="Close tour"
            title="Exit tour"
            className="flex h-7 w-7 items-center justify-center rounded-full text-tlx-muted transition-all duration-200 hover:bg-[#E8F7FB] hover:text-[#00A8CF] hover:scale-110"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="relative mx-5 mt-3 h-[5px] w-auto overflow-hidden rounded-full bg-tlx-border">
          <div
            className="h-full rounded-full bg-[#00A8CF] transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        <p className="mt-4 px-5 text-[13px] leading-[1.7] text-tlx-text">{stepText}</p>

        {/* Interactive action hint */}
        {interactive && actionHint && (
          <div className="mx-5 mt-3 flex items-center gap-2 rounded-[5px] bg-[#E8F7FB] px-3 py-2">
            <svg className="h-3.5 w-3.5 shrink-0 text-[#00A8CF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 15l-2 5L9 9l11 4-5 2z" />
              <path d="M18.5 18.5L22 22" />
            </svg>
            <span className="text-[11px] font-semibold text-[#00A8CF]">{actionHint}</span>
          </div>
        )}

        {/* Footer */}
        <div className="mx-5 mb-4 mt-5 flex items-center justify-between border-t border-tlx-border pt-3">
          <button
            type="button"
            onClick={isFirst ? onExit : onPause}
            className="rounded-[5px] border border-[#617085] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#617085] transition-all duration-200 hover:border-[#00A8CF] hover:text-[#00A8CF]"
          >
            {isFirst ? 'Skip tour' : 'Pause tour'}
          </button>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={onPrev}
                className="flex h-8 w-8 items-center justify-center rounded-[5px] border border-tlx-border text-tlx-muted transition-all duration-200 hover:border-[#00A8CF] hover:text-[#00A8CF]"
                aria-label="Previous step"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
            )}
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-1.5 rounded-[5px] bg-[#00A8CF] px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#66CAE3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2"
            >
              {isLast ? 'Finish' : 'Next'}
              {!isLast && (
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------- completion modal --------------------------- */

function CompletionModal({
  title,
  onClose,
  onNext,
  hasNext,
}: {
  title: string
  onClose: () => void
  onNext: () => void
  hasNext: boolean
}) {
  return (
    <div className="fixed inset-0 z-[10060] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[rgba(15,23,42,0.55)]"
      />
      <div className="relative w-full max-w-sm animate-card-rise rounded-xl border border-white/80 bg-white/[0.97] backdrop-blur-sm p-7 text-center shadow-[0_4px_6px_-1px_rgba(0,168,207,0.06),0_30px_60px_-12px_rgba(15,23,42,0.28)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F7FB] text-3xl">
          🎉
        </div>
        <h3 className="mt-4 text-[15px] font-bold tracking-tight text-tlx-text">Journey Completed</h3>
        <p className="mt-1.5 text-[13px] text-tlx-secondary">You have completed</p>
        <p className="text-[13px] font-bold text-[#00A8CF]">{title}</p>

        <div className="mt-6 flex flex-col gap-2.5">
          {hasNext && (
            <button
              type="button"
              onClick={onNext}
              className="rounded-[5px] bg-[#00A8CF] px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#66CAE3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2"
            >
              Explore Next Journey
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-[5px] border border-[#617085] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#617085] transition-all duration-200 hover:border-[#00A8CF] hover:text-[#00A8CF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------- helpers --------------------------------- */

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), Math.max(min, max))
}
