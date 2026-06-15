import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
// import { Agentation } from 'agentation'
import { ToastProvider } from './toast/ToastContext'
import { OnboardingProvider } from './onboarding/OnboardingContext'
import { JourneysProvider } from './components/help/journeys/JourneysContext'
import { JourneyIntroProvider } from './v4/JourneyIntroContext'
import HelpTrigger from './components/HelpTrigger'
import HelpPanel, { type HelpMode } from './components/help/HelpPanel'
import TourRunner from './components/help/journeys/TourRunner'
import JourneyIntroCard from './v4/JourneyIntroCard'
import Chapter1Journey from './v4/Chapter1Journey'
import RegisterDataSourceModal from './v4/RegisterDataSourceModal'
import DataSources from './pages/DataSources'

export default function App() {
  const [helpOpen, setHelpOpen] = useState(false)
  const [helpMode, setHelpMode] = useState<HelpMode>('popup')

  // TopBar's "?" button opens Help & Guidance as a side drawer.
  useEffect(() => {
    const openDrawer = () => {
      setHelpMode('drawer')
      setHelpOpen(true)
    }
    window.addEventListener('tlx:open-help-drawer', openDrawer)
    return () => window.removeEventListener('tlx:open-help-drawer', openDrawer)
  }, [])

  // The floating FAB opens the popup variant.
  const toggleHelpPopup = () => {
    setHelpMode('popup')
    setHelpOpen((o) => !o)
  }

  return (
    <ToastProvider>
      <OnboardingProvider>
        <JourneysProvider>
          <JourneyIntroProvider>
            <Routes>
              <Route path="/data-sources" element={<DataSources />} />
              <Route path="*" element={<Navigate to="/data-sources" replace />} />
            </Routes>

            <HelpTrigger open={helpOpen && helpMode === 'popup'} onToggle={toggleHelpPopup} />
            <HelpPanel open={helpOpen} onClose={() => setHelpOpen(false)} mode={helpMode} />
            <TourRunner />
            <JourneyIntroCard />
            <Chapter1Journey />
            <RegisterDataSourceModal />
            {/* <Agentation /> */}
          </JourneyIntroProvider>
        </JourneysProvider>
      </OnboardingProvider>
    </ToastProvider>
  )
}
