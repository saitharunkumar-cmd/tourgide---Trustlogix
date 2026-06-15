import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Agentation } from 'agentation'
import { ToastProvider } from './toast/ToastContext'
import { OnboardingProvider } from './onboarding/OnboardingContext'
import { JourneysProvider } from './components/help/journeys/JourneysContext'
import { JourneyIntroProvider } from './v4/JourneyIntroContext'
import HelpTrigger from './components/HelpTrigger'
import HelpPanel from './components/help/HelpPanel'
import TourRunner from './components/help/journeys/TourRunner'
import JourneyIntroCard from './v4/JourneyIntroCard'
import Chapter1Journey from './v4/Chapter1Journey'
import RegisterDataSourceModal from './v4/RegisterDataSourceModal'
import DataSources from './pages/DataSources'

export default function App() {
  const [helpOpen, setHelpOpen] = useState(false)

  return (
    <ToastProvider>
      <OnboardingProvider>
        <JourneysProvider>
          <JourneyIntroProvider>
            <Routes>
              <Route path="/data-sources" element={<DataSources />} />
              <Route path="*" element={<Navigate to="/data-sources" replace />} />
            </Routes>

            <HelpTrigger open={helpOpen} onToggle={() => setHelpOpen((o) => !o)} />
            <HelpPanel open={helpOpen} onClose={() => setHelpOpen(false)} />
            <TourRunner />
            <JourneyIntroCard />
            <Chapter1Journey />
            <RegisterDataSourceModal />
            <Agentation />
          </JourneyIntroProvider>
        </JourneysProvider>
      </OnboardingProvider>
    </ToastProvider>
  )
}
