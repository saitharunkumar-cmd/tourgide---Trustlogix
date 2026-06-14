import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type OnboardingState = {
  datasource: string | null
  accountName: string
  prerequisitesCompleted: boolean
  connectionValidated: boolean
  setDatasource: (id: string | null) => void
  setAccountName: (name: string) => void
  setPrerequisitesCompleted: (done: boolean) => void
  setConnectionValidated: (done: boolean) => void
}

const OnboardingContext = createContext<OnboardingState | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [datasource, setDatasource] = useState<string | null>('Snowflake')
  const [accountName, setAccountName] = useState('')
  const [prerequisitesCompleted, setPrerequisitesCompleted] = useState(false)
  const [connectionValidated, setConnectionValidated] = useState(false)

  const value = useMemo(
    () => ({
      datasource,
      accountName,
      prerequisitesCompleted,
      connectionValidated,
      setDatasource,
      setAccountName,
      setPrerequisitesCompleted,
      setConnectionValidated,
    }),
    [datasource, accountName, prerequisitesCompleted, connectionValidated],
  )

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}

export function useOnboarding(): OnboardingState {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used within an OnboardingProvider')
  return ctx
}
