import { useState, type ReactNode } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((o) => !o)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-[#FCFCFF]">{children}</main>
      </div>
    </div>
  )
}
