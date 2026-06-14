import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useToast } from '../../../toast/ToastContext'
import {
  JOURNEYS,
  DEFAULT_PROGRESS,
  type JourneyDef,
  type JourneyProgress,
  type JourneyStatus,
} from './journeyData'

/**
 * Per-user Guided Journeys state.
 *
 * Holds progress for every journey (persisted to localStorage), the currently
 * running tour, and the "just completed" journey for the success modal. All
 * status transitions (start / resume / next / prev / pause / exit / complete)
 * live here so the view and the tour runner stay in sync.
 */

export type Journey = JourneyDef & JourneyProgress & { totalSteps: number }

export type JourneyFilter = 'in_progress' | 'completed' | 'not_started'

type ActiveTour = { journeyId: string; step: number } | null

type JourneysValue = {
  journeys: Journey[]
  counts: Record<JourneyFilter, number>
  activeTour: ActiveTour
  activeJourney: Journey | null
  completedJourney: Journey | null
  learningDismissed: boolean
  startJourney: (id: string) => void
  resumeJourney: (id: string) => void
  nextStep: () => void
  prevStep: () => void
  pauseTour: () => void
  exitTour: () => void
  closeCompletion: () => void
  dismissLearning: () => void
}

const STORAGE_KEY = 'tlx:journeys:v1'
const LEARNING_KEY = 'tlx:journeys:learning-dismissed'

const JourneysContext = createContext<JourneysValue | undefined>(undefined)

/** Build the initial progress map: seed defaults, then overlay stored state. */
function loadProgress(): Record<string, JourneyProgress> {
  const map: Record<string, JourneyProgress> = {}
  for (const j of JOURNEYS) {
    const seed = DEFAULT_PROGRESS[j.id]
    map[j.id] = {
      status: seed?.status ?? 'not_started',
      currentStep: seed?.currentStep ?? 0,
      progressPct: seed?.progressPct ?? 0,
      updatedLabel: seed?.updatedLabel,
    }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const stored = JSON.parse(raw) as Record<string, Partial<JourneyProgress>>
      for (const id of Object.keys(stored)) {
        if (map[id]) map[id] = { ...map[id], ...stored[id] }
      }
    }
  } catch {
    /* ignore malformed storage */
  }
  return map
}

export function JourneysProvider({ children }: { children: ReactNode }) {
  const toast = useToast()
  const [progress, setProgress] = useState<Record<string, JourneyProgress>>(loadProgress)
  const [activeTour, setActiveTour] = useState<ActiveTour>(null)
  const [completedId, setCompletedId] = useState<string | null>(null)
  const [learningDismissed, setLearningDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(LEARNING_KEY) === '1'
    } catch {
      return false
    }
  })

  const update = useCallback(
    (id: string, patch: Partial<JourneyProgress>) => {
      setProgress((prev) => {
        const next = { ...prev, [id]: { ...prev[id], ...patch } }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        } catch {
          /* ignore */
        }
        return next
      })
    },
    [],
  )

  const defs = useMemo(() => new Map(JOURNEYS.map((j) => [j.id, j])), [])

  const journeys = useMemo<Journey[]>(
    () =>
      JOURNEYS.map((j) => ({
        ...j,
        ...progress[j.id],
        totalSteps: j.steps.length,
      })),
    [progress],
  )

  const counts = useMemo<Record<JourneyFilter, number>>(() => {
    const c = { in_progress: 0, completed: 0, not_started: 0 }
    for (const j of journeys) {
      if (j.status === 'completed') c.completed += 1
      else if (j.status === 'not_started') c.not_started += 1
      else c.in_progress += 1 // in_progress + paused
    }
    return c
  }, [journeys])

  const launch = useCallback(
    (id: string, step: number) => {
      update(id, {
        status: 'in_progress',
        currentStep: step,
        progressPct: pct(step, defs.get(id)!.steps.length),
        updatedLabel: undefined,
      })
      setActiveTour({ journeyId: id, step })
    },
    [defs, update],
  )

  const startJourney = useCallback((id: string) => launch(id, 0), [launch])

  const resumeJourney = useCallback(
    (id: string) => launch(id, progress[id]?.currentStep ?? 0),
    [launch, progress],
  )

  const nextStep = useCallback(() => {
    setActiveTour((cur) => {
      if (!cur) return cur
      const total = defs.get(cur.journeyId)!.steps.length
      const next = cur.step + 1
      if (next >= total) {
        // Completed.
        update(cur.journeyId, { status: 'completed', currentStep: total, progressPct: 100, updatedLabel: undefined })
        return null
      }
      update(cur.journeyId, { status: 'in_progress', currentStep: next, progressPct: pct(next, total) })
      return { ...cur, step: next }
    })
  }, [defs, update])

  const prevStep = useCallback(() => {
    setActiveTour((cur) => {
      if (!cur) return cur
      const prev = Math.max(0, cur.step - 1)
      const total = defs.get(cur.journeyId)!.steps.length
      update(cur.journeyId, { currentStep: prev, progressPct: pct(prev, total) })
      return { ...cur, step: prev }
    })
  }, [defs, update])

  const pauseTour = useCallback(() => {
    setActiveTour((cur) => {
      if (cur) {
        update(cur.journeyId, { status: 'paused', currentStep: cur.step, updatedLabel: 'Paused just now' })
      }
      return null
    })
    toast({
      title: 'Journey paused',
      description: 'Resume anytime from Help & Guidance.',
    })
  }, [toast, update])

  const exitTour = useCallback(() => {
    setActiveTour((cur) => {
      if (cur && progress[cur.journeyId]?.status !== 'completed') {
        update(cur.journeyId, { status: 'in_progress', currentStep: cur.step })
      }
      return null
    })
  }, [progress, update])

  const closeCompletion = useCallback(() => setCompletedId(null), [])

  const dismissLearning = useCallback(() => {
    setLearningDismissed(true)
    try {
      sessionStorage.setItem(LEARNING_KEY, '1')
    } catch {
      /* ignore */
    }
  }, [])

  const activeJourney = useMemo(
    () => (activeTour ? journeys.find((j) => j.id === activeTour.journeyId) ?? null : null),
    [activeTour, journeys],
  )
  const completedJourney = useMemo(
    () => (completedId ? journeys.find((j) => j.id === completedId) ?? null : null),
    [completedId, journeys],
  )

  const value: JourneysValue = {
    journeys,
    counts,
    activeTour,
    activeJourney,
    completedJourney,
    learningDismissed,
    startJourney,
    resumeJourney,
    nextStep,
    prevStep,
    pauseTour,
    exitTour,
    closeCompletion,
    dismissLearning,
  }

  return <JourneysContext.Provider value={value}>{children}</JourneysContext.Provider>
}

function pct(stepIndex: number, total: number): number {
  return Math.round((stepIndex / total) * 100)
}

export function useJourneys(): JourneysValue {
  const ctx = useContext(JourneysContext)
  if (!ctx) throw new Error('useJourneys must be used within a JourneysProvider')
  return ctx
}

export type { JourneyStatus }
