import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

type Phase = 'idle' | 'intro' | 'journey'
export type SubStep =
  | 'instruction'
  | 'select-platform'
  | 'name-connection'
  | 'run-prerequisites'
  | 'verify-complete'
  | 'connection-auth'
  | 'chapter2-intro'

export type SelectVariant = 'v1' | 'v2'

export type RegisteredSource = {
  id: string
  name: string
  platform: string
  status: 'Active' | 'Missing info'
}

type V4Value = {
  phase: Phase
  subStep: SubStep
  activeChapter: number
  paused: boolean
  selectedDatasource: string | null
  accountName: string
  prerequisitesChecked: boolean
  downloadClicked: boolean
  selectVariant: SelectVariant
  registeredSources: RegisteredSource[]
  launch: () => void
  startJourney: () => void
  openRegisterModal: () => void
  selectDatasource: (name: string) => void
  setAccountName: (s: string) => void
  setPrerequisitesChecked: (v: boolean) => void
  setDownloadClicked: (v: boolean) => void
  setSelectVariant: (v: SelectVariant) => void
  completeCurrentStep: () => void
  goToSubStep: (s: SubStep) => void
  saveConnection: () => void
  pauseTour: () => void
  resumeTour: () => void
  restartTour: () => void
  close: () => void
}

const V4Context = createContext<V4Value | undefined>(undefined)

export function JourneyIntroProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [subStep, setSubStep] = useState<SubStep>('instruction')
  const [selectedDatasource, setSelected] = useState<string | null>(null)
  const [accountName, setName] = useState('')
  const [prerequisitesChecked, setPrereqChecked] = useState(false)
  const [downloadClicked, setDownloadClickedState] = useState(false)
  const [selectVariant, setSelectVariantState] = useState<SelectVariant>('v2')
  const [registeredSources, setRegisteredSources] = useState<RegisteredSource[]>([])
  const [activeChapter, setActiveChapter] = useState(1)
  const [paused, setPaused] = useState(false)
  const pausedSnapshot = useRef<{ subStep: SubStep; chapter: number } | null>(null)

  const advanceTimer = useRef<number | null>(null)

  const clearAdvanceTimer = () => {
    if (advanceTimer.current != null) {
      window.clearTimeout(advanceTimer.current)
      advanceTimer.current = null
    }
  }

  const reset = () => {
    clearAdvanceTimer()
    setSubStep('instruction')
    setSelected(null)
    setName('')
    setPrereqChecked(false)
    setDownloadClickedState(false)
    setActiveChapter(1)
  }

  const launch = useCallback(() => {
    reset()
    setPhase('intro')
  }, [])
  const startJourney = useCallback(() => {
    reset()
    setPhase('journey')
  }, [])
  const openRegisterModal = useCallback(() => setSubStep('select-platform'), [])
  const selectDatasource = useCallback((name: string) => {
    setSelected(name)
  }, [])
  const setAccountName = useCallback((s: string) => setName(s), [])
  const setPrerequisitesChecked = useCallback((v: boolean) => setPrereqChecked(v), [])
  const setDownloadClicked = useCallback((v: boolean) => setDownloadClickedState(v), [])
  const setSelectVariant = useCallback((v: SelectVariant) => {
    setSelectVariantState(v)
    try {
      localStorage.setItem('tlx:v4-select-variant', v)
    } catch {
      /* ignore */
    }
  }, [])
  const completeCurrentStep = useCallback(() => {
    clearAdvanceTimer()
    setSubStep((s) => {
      if (s === 'select-platform') return 'name-connection'
      if (s === 'name-connection') return 'run-prerequisites'
      if (s === 'run-prerequisites') return 'verify-complete'
      return s
    })
  }, [])
  const goToSubStep = useCallback((s: SubStep) => {
    clearAdvanceTimer()
    setSubStep(s)
  }, [])
  const saveConnection = useCallback(() => {
    setRegisteredSources((prev) => {
      const platform = selectedDatasource ?? 'Snowflake'
      const name = accountName.trim() || `${platform} Production`
      const id = `ds-${Date.now()}`
      if (prev.some((s) => s.name === name)) return prev
      return [...prev, { id, name, platform, status: 'Active' }]
    })
    clearAdvanceTimer()
    setSubStep('chapter2-intro')
    setActiveChapter(2)
  }, [selectedDatasource, accountName])

  const pauseTour = useCallback(() => {
    pausedSnapshot.current = { subStep, chapter: activeChapter }
    setPaused(true)
    setPhase('idle')
  }, [subStep, activeChapter])

  const resumeTour = useCallback(() => {
    if (pausedSnapshot.current) {
      setSubStep(pausedSnapshot.current.subStep)
      setActiveChapter(pausedSnapshot.current.chapter)
      setPhase('journey')
      pausedSnapshot.current = null
    }
    setPaused(false)
  }, [])

  const restartTour = useCallback(() => {
    pausedSnapshot.current = null
    setPaused(false)
    reset()
    setPhase('journey')
  }, [])

  const close = useCallback(() => {
    pausedSnapshot.current = null
    setPaused(false)
    reset()
    setPhase('idle')
  }, [])

  return (
    <V4Context.Provider
      value={{
        phase,
        subStep,
        activeChapter,
        paused,
        selectedDatasource,
        accountName,
        prerequisitesChecked,
        downloadClicked,
        selectVariant,
        registeredSources,
        launch,
        startJourney,
        openRegisterModal,
        selectDatasource,
        setAccountName,
        setPrerequisitesChecked,
        setDownloadClicked,
        setSelectVariant,
        completeCurrentStep,
        goToSubStep,
        saveConnection,
        pauseTour,
        resumeTour,
        restartTour,
        close,
      }}
    >
      {children}
    </V4Context.Provider>
  )
}

export function useJourneyIntro(): V4Value {
  const ctx = useContext(V4Context)
  if (!ctx) throw new Error('useJourneyIntro must be used within a JourneyIntroProvider')
  return ctx
}
