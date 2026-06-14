import { useState } from 'react'
import { CheckIcon, ArrowRightIcon, CloseIcon } from '../../icons'
import { JourneyArt } from '../helpIcons'
import { TONE_CHIP } from './journeyData'
import { useJourneys, type Journey, type JourneyFilter } from './JourneysContext'

/**
 * Guided Journeys — the Tour tab content area.
 *
 * Replaces the Help content with: filter tabs (In Progress / Completed / Not
 * Started), a "Continue your journey" section of active tours, an "All
 * journeys" list, a view-all toggle, and a dismissible learning card.
 *
 * Pure view + state wiring — the actual walkthrough runs in TourRunner. Launch
 * (Start / Resume / Restart) closes the panel via `onLaunchTour`.
 */

const FILTERS: { id: JourneyFilter; label: string }[] = [
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'not_started', label: 'Not Started' },
]

export default function GuidedJourneys({ onLaunchTour }: { onLaunchTour: () => void }) {
  const {
    journeys,
    counts,
    learningDismissed,
    startJourney,
    resumeJourney,
    dismissLearning,
  } = useJourneys()

  const [filter, setFilter] = useState<JourneyFilter>('in_progress')
  const [showAll, setShowAll] = useState(false)

  const active = journeys.filter((j) => j.status === 'in_progress' || j.status === 'paused')
  const notStarted = journeys.filter((j) => j.status === 'not_started')
  const completed = journeys.filter((j) => j.status === 'completed')

  const launch = (fn: (id: string) => void, id: string) => {
    fn(id)
    onLaunchTour()
  }

  return (
    <div role="tabpanel" className="flex min-h-0 flex-1 flex-col">
      {/* Filter tabs — never wrap; scroll horizontally if space is tight */}
      <div className="flex shrink-0 items-center gap-4 overflow-x-auto border-b border-tlx-border px-4 pt-4 [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((f) => {
          const isActive = filter === f.id
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-current={isActive ? 'true' : undefined}
              className={[
                '-mb-px whitespace-nowrap border-b-2 py-2.5 text-[13px] font-semibold transition-colors focus-visible:outline-none',
                isActive
                  ? 'border-[#00A8CF] text-[#00A8CF]'
                  : 'border-transparent text-tlx-secondary hover:text-tlx-text',
              ].join(' ')}
            >
              {f.label} ({counts[f.id]})
            </button>
          )
        })}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {filter === 'in_progress' && (
          <>
            {/* Section 1: Continue your journey */}
            <h4 className="text-sm font-bold text-tlx-text">Continue your journey</h4>
            <div className="mt-2.5 space-y-2.5">
              {active.length === 0 && <EmptyNote>No journeys in progress yet.</EmptyNote>}
              {active.map((j) => (
                <ContinueCard key={j.id} journey={j} onResume={() => launch(resumeJourney, j.id)} />
              ))}
            </div>

            {/* Section 2: All journeys */}
            <h4 className="mt-5 text-sm font-bold text-tlx-text">All journeys</h4>
            <div className="mt-2.5 overflow-hidden rounded-[10px] border border-tlx-border">
              {(showAll ? notStarted : notStarted.slice(0, 4)).map((j) => (
                <CompactRow
                  key={j.id}
                  journey={j}
                  meta={`Step 0 of ${j.totalSteps} • Not Started`}
                  action={
                    <OutlineButton onClick={() => launch(startJourney, j.id)}>Start</OutlineButton>
                  }
                />
              ))}
            </div>

            {/* View all */}
            {notStarted.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] border border-tlx-border bg-tlx-surface py-3 text-[13px] font-semibold text-[#00A8CF] transition-colors hover:bg-[#E8F7FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
              >
                {showAll ? 'Show fewer journeys' : 'View all journeys'}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            )}

            {/* Learning card */}
            {!learningDismissed && (
              <div className="relative mt-4 overflow-hidden rounded-[10px] bg-[#E8F7FB] p-4">
                <button
                  type="button"
                  aria-label="Dismiss learning card"
                  onClick={dismissLearning}
                  className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-lg text-tlx-secondary transition-colors hover:bg-white/70 hover:text-tlx-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3">
                  <JourneyArt className="h-14 w-16 shrink-0" />
                  <div className="min-w-0 pr-5">
                    <h5 className="truncate text-[13px] font-bold text-[#00A8CF]">Learn step by step</h5>
                    <p className="mt-0.5 text-xs leading-relaxed text-tlx-secondary">
                      Our guided tours help you understand TrustLogix features and complete tasks
                      with confidence.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {filter === 'completed' && (
          <div className="overflow-hidden rounded-[10px] border border-tlx-border">
            {completed.length === 0 && (
              <div className="px-4 py-6">
                <EmptyNote>No completed journeys yet.</EmptyNote>
              </div>
            )}
            {completed.map((j) => (
              <CompactRow
                key={j.id}
                journey={j}
                meta={`Completed • ${j.totalSteps} steps`}
                badge={
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <CheckIcon className="h-3 w-3" />
                  </span>
                }
                action={
                  <OutlineButton onClick={() => launch(startJourney, j.id)}>Restart</OutlineButton>
                }
              />
            ))}
          </div>
        )}

        {filter === 'not_started' && (
          <div className="overflow-hidden rounded-[10px] border border-tlx-border">
            {notStarted.map((j) => (
              <CompactRow
                key={j.id}
                journey={j}
                meta={`Step 0 of ${j.totalSteps} • Not Started`}
                action={
                  <OutlineButton onClick={() => launch(startJourney, j.id)}>Start</OutlineButton>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------- pieces ---------------------------------- */

function ContinueCard({ journey, onResume }: { journey: Journey; onResume: () => void }) {
  const stepLine =
    journey.status === 'paused'
      ? `${journey.progressPct}% complete`
      : 'In Progress'
  return (
    <div className="rounded-[10px] border border-[#E8F7FB] bg-[#E8F7FB] p-4">
      {/* Single-line title (no leading icon) */}
      <p className="truncate text-[13px] font-bold text-tlx-text">{journey.title}</p>

      <p className="mt-1.5 truncate text-[11px] font-semibold text-[#00A8CF]">
        Step {journey.currentStep + 1} of {journey.totalSteps}{' '}
        <span className="text-[#00A8CF]/40">•</span> {stepLine}
      </p>
      <div className="relative mt-2 h-[5px] w-full overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-[#00A8CF] transition-[width] duration-700 ease-out"
          style={{ width: `${journey.progressPct}%` }}
        />
      </div>

      {/* Row: status + Resume */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-xs text-tlx-secondary">{journey.updatedLabel ?? ' '}</p>
        <button
          type="button"
          onClick={onResume}
          className="shrink-0 rounded-[5px] bg-[#00A8CF] px-4 py-1.5 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-[#66CAE3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2"
        >
          Resume
        </button>
      </div>
    </div>
  )
}

function CompactRow({
  journey,
  meta,
  action,
  badge,
}: {
  journey: Journey
  meta: string
  action: React.ReactNode
  badge?: React.ReactNode
}) {
  const Icon = journey.icon
  return (
    <div className="flex items-center gap-3 border-b border-tlx-border px-3.5 py-3 last:border-0">
      <span className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] ${TONE_CHIP[journey.tone]}`}>
        <Icon className="h-[18px] w-[18px]" />
        {badge && <span className="absolute -right-1 -top-1">{badge}</span>}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-tlx-text">{journey.title}</p>
        <p className="truncate text-[11px] text-tlx-secondary">{meta}</p>
      </div>
      {action}
    </div>
  )
}

function OutlineButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-[5px] border border-[#617085] bg-white px-4 py-1.5 text-[12px] font-semibold text-[#617085] transition-all duration-200 hover:border-[#00A8CF] hover:text-[#00A8CF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
    >
      {children}
    </button>
  )
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-tlx-secondary">{children}</p>
}
