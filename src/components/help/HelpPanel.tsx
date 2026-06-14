import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { Send, Mic } from 'lucide-react'
import { useOnboarding } from '../../onboarding/OnboardingContext'
import { ChevronRightIcon } from '../icons'
import { useJourneyIntro } from '../../v4/JourneyIntroContext'
import { useJourneys } from './journeys/JourneysContext'
import { readTourVersion } from '../../missionBoard/tourVersion'
import {
  SparkleIcon,
  SendIcon,
  DataSourceIcon,
  SprawlIcon,
  AnalyzerIcon,
  ShieldIcon,
  PolicyIcon,
  RiskIcon,
  KeyIcon,
  EyeIcon,
  TagIcon,
  PlugIcon,
  DatabaseIcon,
  ChartBarIcon,
} from './helpIcons'

export type HelpTab = 'help' | 'tour' | 'settings'

type HelpPanelProps = {
  open: boolean
  onClose: () => void
}

const TRIGGER_SELECTOR = 'button[aria-label="Help and Guidance"]'
const GAP = 14
const MARGIN = 16
const MIN_W = 340
const MIN_H = 360
const SIZE_KEY = 'tlx:help-panel-size'

type Size = { width: number; height: number }
type Rect = { left: number; top: number; width: number; height: number }
type Layout = Rect & { origin: string; mobile: boolean }
type Edge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

const clampN = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max))

function loadSize(): Size | null {
  try {
    const raw = localStorage.getItem(SIZE_KEY)
    return raw ? (JSON.parse(raw) as Size) : null
  } catch {
    return null
  }
}
function saveSize(s: Size) {
  try {
    localStorage.setItem(SIZE_KEY, JSON.stringify(s))
  } catch { /* ignore */ }
}

function computeLayout(size: Size | null): Layout {
  const vw = window.innerWidth
  const vh = window.innerHeight

  if (vw < 640) {
    const height = Math.round(vh * 0.8)
    return { left: 0, top: vh - height, width: vw, height, origin: 'bottom center', mobile: true }
  }

  const tablet = vw < 1024
  const defaultW = tablet ? 380 : 420
  const defaultH = tablet ? Math.round(vh * 0.7) : Math.round(Math.min(650, vh * 0.8))

  const width = clampN(size?.width ?? defaultW, MIN_W, vw - MARGIN * 2)
  const height = clampN(size?.height ?? defaultH, MIN_H, vh - MARGIN * 2)

  const trigger = document.querySelector(TRIGGER_SELECTOR)?.getBoundingClientRect()
  const anchorRight = trigger ? trigger.right : vw - MARGIN
  const anchorTop = trigger ? trigger.top : vh - MARGIN

  const left = clampN(anchorRight - width, MARGIN, vw - width - MARGIN)
  const top = clampN(anchorTop - GAP - height, MARGIN, vh - height - MARGIN)

  return { left, top, width, height, origin: 'bottom right', mobile: false }
}

function resizeRect(edge: Edge, start: Rect, dx: number, dy: number): Rect {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const right = start.left + start.width
  const bottom = start.top + start.height
  let { left, top, width, height } = start

  if (edge.includes('e')) width = clampN(start.width + dx, MIN_W, vw - MARGIN - start.left)
  if (edge.includes('s')) height = clampN(start.height + dy, MIN_H, vh - MARGIN - start.top)
  if (edge.includes('w')) {
    left = clampN(start.left + dx, MARGIN, right - MIN_W)
    width = right - left
  }
  if (edge.includes('n')) {
    top = clampN(start.top + dy, MARGIN, bottom - MIN_H)
    height = bottom - top
  }
  return { left, top, width, height }
}

export default function HelpPanel({ open, onClose }: HelpPanelProps) {
  const [mounted, setMounted] = useState(false)
  const [shown, setShown] = useState(false)
  const [resizing, setResizing] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const [layout, setLayout] = useState<Layout | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const sizeRef = useRef<Size | null>(loadSize())
  const resize = useRef({ active: false, edge: 'e' as Edge, sx: 0, sy: 0, rect: { left: 0, top: 0, width: 0, height: 0 } })

  useEffect(() => {
    if (open) {
      setMounted(true)
      setLayout(computeLayout(sizeRef.current))
      const id = requestAnimationFrame(() => setShown(true))
      return () => cancelAnimationFrame(id)
    }
    setShown(false)
    const t = setTimeout(() => setMounted(false), 220)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onResize = () => setLayout(computeLayout(sizeRef.current))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [open])

  const onResizeDown = (edge: Edge) => (e: React.PointerEvent) => {
    if (!layout) return
    e.preventDefault()
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    resize.current = {
      active: true,
      edge,
      sx: e.clientX,
      sy: e.clientY,
      rect: { left: layout.left, top: layout.top, width: layout.width, height: layout.height },
    }
    setResizing(true)
  }
  const onResizeMove = (e: React.PointerEvent) => {
    const r = resize.current
    if (!r.active) return
    const next = resizeRect(r.edge, r.rect, e.clientX - r.sx, e.clientY - r.sy)
    setLayout((l) => (l ? { ...l, ...next } : l))
  }
  const onResizeUp = (e: React.PointerEvent) => {
    const r = resize.current
    if (!r.active) return
    r.active = false
    setResizing(false)
    ;(e.target as Element).releasePointerCapture?.(e.pointerId)
    setLayout((l) => {
      if (l) {
        sizeRef.current = { width: l.width, height: l.height }
        saveSize(sizeRef.current)
      }
      return l
    })
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (cardRef.current?.contains(target)) return
      if ((target as Element).closest?.(TRIGGER_SELECTOR)) return
      onClose()
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown, true)
    const focusId = requestAnimationFrame(() => cardRef.current?.focus())
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown, true)
      cancelAnimationFrame(focusId)
    }
  }, [open, onClose])

  if (!mounted || !layout) return videoOpen ? <FloatingVideoPlayer onClose={() => setVideoOpen(false)} /> : null

  return (
    <>
      {videoOpen && <FloatingVideoPlayer onClose={() => setVideoOpen(false)} />}
      <div
        ref={cardRef}
        role="dialog"
        aria-label="Help and Guidance"
        tabIndex={-1}
        style={{
          position: 'fixed',
          left: layout.left,
          top: layout.top,
          width: layout.width,
          height: layout.height,
          zIndex: 10100,
          transformOrigin: layout.origin,
        }}
        className={[
          'flex flex-col overflow-hidden rounded-[10px] border border-tlx-border bg-white',
          'shadow-[0_24px_64px_-16px_rgba(32,41,58,0.28)]',
          resizing
            ? 'select-none'
            : 'transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none',
          shown ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
        ].join(' ')}
      >
        {!layout.mobile && (
          <ResizeHandles onDown={onResizeDown} onMove={onResizeMove} onUp={onResizeUp} />
        )}
        <HelpTabContent onClose={onClose} onOpenVideo={() => setVideoOpen(true)} />
      </div>
    </>
  )
}

const HANDLES: { edge: Edge; pos: string; cursor: string }[] = [
  { edge: 'n', pos: 'left-3 right-3 top-0 h-1.5', cursor: 'ns-resize' },
  { edge: 's', pos: 'left-3 right-3 bottom-0 h-1.5', cursor: 'ns-resize' },
  { edge: 'e', pos: 'top-3 bottom-3 right-0 w-1.5', cursor: 'ew-resize' },
  { edge: 'w', pos: 'top-3 bottom-3 left-0 w-1.5', cursor: 'ew-resize' },
  { edge: 'nw', pos: 'top-0 left-0 h-3 w-3', cursor: 'nwse-resize' },
  { edge: 'se', pos: 'bottom-0 right-0 h-3 w-3', cursor: 'nwse-resize' },
  { edge: 'ne', pos: 'top-0 right-0 h-3 w-3', cursor: 'nesw-resize' },
  { edge: 'sw', pos: 'bottom-0 left-0 h-3 w-3', cursor: 'nesw-resize' },
]

function ResizeHandles({
  onDown,
  onMove,
  onUp,
}: {
  onDown: (edge: Edge) => (e: React.PointerEvent) => void
  onMove: (e: React.PointerEvent) => void
  onUp: (e: React.PointerEvent) => void
}) {
  return (
    <>
      {HANDLES.map(({ edge, pos, cursor }) => (
        <div
          key={edge}
          role="presentation"
          aria-hidden="true"
          onPointerDown={onDown(edge)}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          style={{ cursor }}
          className={`absolute z-30 ${pos}`}
        />
      ))}
    </>
  )
}

type Topic = { icon: typeof DataSourceIcon; title: string; description: string }

const TOPICS_DATA_SOURCES: Topic[] = [
  { icon: DataSourceIcon, title: 'What is a Data Source?', description: 'Understand data sources in TrustLogix' },
  { icon: SprawlIcon, title: 'What is Data Sprawl?', description: 'Learn how we detect and reduce it' },
  { icon: AnalyzerIcon, title: 'Access Analyzer Explained', description: 'See how permissions are analyzed' },
]

const TOPICS_REGISTER: Topic[] = [
  { icon: PlugIcon, title: 'Connecting a Data Source', description: 'Step-by-step registration guide' },
  { icon: DatabaseIcon, title: 'Supported Platforms', description: 'Snowflake, Databricks, AWS and more' },
  { icon: KeyIcon, title: 'Authentication Setup', description: 'Securely connect your data platform' },
]

const TOPICS_REGISTER_PREREQ: Topic[] = [
  { icon: ShieldIcon, title: 'Prerequisites Check', description: 'What you need before connecting' },
  { icon: PolicyIcon, title: 'Network & Firewall Rules', description: 'Ensure connectivity to your platform' },
  { icon: KeyIcon, title: 'Service Account Setup', description: 'Create credentials for TrustLogix' },
]

const TOPICS_REGISTER_AUTH: Topic[] = [
  { icon: KeyIcon, title: 'Authentication Methods', description: 'Key pair, OAuth, or password auth' },
  { icon: ShieldIcon, title: 'Connection Security', description: 'Encryption and secure tunnels' },
  { icon: PlugIcon, title: 'Testing Connectivity', description: 'Verify your connection works' },
]

const TOPICS_OVERVIEW: Topic[] = [
  { icon: ChartBarIcon, title: 'Dashboard Overview', description: 'Key metrics and risk summary at a glance' },
  { icon: RiskIcon, title: 'AI Related Data Risks', description: 'Understand AI-driven risk detection' },
  { icon: EyeIcon, title: 'Dark Data Explained', description: 'Find unclassified and hidden data' },
]

const TOPICS_DEFAULT: Topic[] = TOPICS_DATA_SOURCES

function useJourneyCTA(pageContext: string): { label: string; description: string } {
  if (pageContext.startsWith('Register Data Source'))
    return { label: 'Start Registration Tour', description: 'Walk through data source registration step by step' }
  if (pageContext.includes('Overview'))
    return { label: 'Start Overview Tour', description: 'Explore the overview dashboard' }
  return { label: 'Start Data Sources Tour', description: 'Walk through Data Sources step by step' }
}

function usePageTopics(pageContext: string): Topic[] {
  if (pageContext.includes('Connection & Authentication')) return TOPICS_REGISTER_AUTH
  if (pageContext.includes('Prerequisites')) return TOPICS_REGISTER_PREREQ
  if (pageContext.startsWith('Register Data Source')) return TOPICS_REGISTER
  if (pageContext.includes('Overview')) return TOPICS_OVERVIEW
  if (pageContext === 'Data Sources') return TOPICS_DATA_SOURCES
  return TOPICS_DEFAULT
}

type ChatMsg =
  | { id: number; role: 'user'; text: string }
  | { id: number; role: 'agent'; topic: 'data-sources' | 'generic' }

const REGISTER_STEP_LABELS: Record<string, string> = {
  'select-platform': 'Select Data Source',
  'name-connection': 'Select Data Source',
  'run-prerequisites': 'Prerequisites',
  'verify-complete': 'Prerequisites',
  'connection-auth': 'Connection & Authentication',
}

const PAGE_LABELS: Record<string, string> = {
  '/': 'Login',
  '/welcome': 'Welcome',
  '/security-overview': 'Security Overview',
  '/data-sources': 'Data Sources',
  '/dashboard': 'Dashboard',
}

function usePageContext(): string {
  const location = useLocation()
  const [params] = useSearchParams()
  const path = location.pathname
  const journeyIntro = useJourneyIntro()

  const registerSubStep = journeyIntro.phase === 'journey' ? journeyIntro.subStep : null
  if (registerSubStep && REGISTER_STEP_LABELS[registerSubStep]) {
    return `Register Data Source › ${REGISTER_STEP_LABELS[registerSubStep]}`
  }

  if (path.startsWith('/data-sources/')) {
    const id = path.replace('/data-sources/', '')
    const name = id === 'snowflake-production'
      ? 'Snowflake Production'
      : id.replace(/^ds-\d+-?/, '').split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || 'Snowflake Production'
    const tab = params.get('tab')
    const tabLabel = tab ?? 'Overview'
    return `${name} › ${tabLabel}`
  }

  return PAGE_LABELS[path] ?? path.split('/').filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' › ')
}

function FloatingVideoPlayer({ onClose }: { onClose: () => void }) {
  const [pos, setPos] = useState({ x: 80, y: 80 })
  const [size, setSize] = useState({ w: 560, h: 315 })
  const [minimized, setMinimized] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null)

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y }
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 200, dragRef.current.origX + ev.clientX - dragRef.current.startX)),
        y: Math.max(0, Math.min(window.innerHeight - 48, dragRef.current.origY + ev.clientY - dragRef.current.startY)),
      })
    }
    const onUp = () => { dragRef.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [pos])

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    resizeRef.current = { startX: e.clientX, startY: e.clientY, origW: size.w, origH: size.h }
    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return
      setSize({ w: Math.max(320, resizeRef.current.origW + ev.clientX - resizeRef.current.startX), h: Math.max(180, resizeRef.current.origH + ev.clientY - resizeRef.current.startY) })
    }
    const onUp = () => { resizeRef.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [size])

  return (
    <div
      className="fixed z-[9999] animate-tour-enter overflow-hidden rounded-[10px] border border-tlx-border shadow-[0_16px_48px_-8px_rgba(32,41,58,0.22)]"
      style={{ left: pos.x, top: pos.y, width: minimized ? 280 : size.w }}
    >
      <div
        onMouseDown={onDragStart}
        className="flex cursor-grab items-center gap-2 rounded-t-xl border-b border-tlx-border bg-white px-3 py-2 active:cursor-grabbing"
      >
        <svg className="h-3.5 w-3.5 text-brand-500" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
        <span className="flex-1 truncate text-xs font-semibold text-tlx-text">Video Tour — TrustLogix Data Security</span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setMinimized((m) => !m)} className="flex h-6 w-6 items-center justify-center rounded text-tlx-secondary transition-colors hover:bg-tlx-surface hover:text-tlx-text" title={minimized ? 'Expand' : 'Minimize'}>
            {minimized ? (
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
            ) : (
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" /></svg>
            )}
          </button>
          <button type="button" onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded text-tlx-secondary transition-colors hover:bg-red-50 hover:text-red-500" title="Close">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
      {!minimized && (
        <div className="relative bg-black" style={{ height: size.h }}>
          <iframe
            src="https://www.youtube.com/embed/KAe-INfkxOI?autoplay=1&rel=0"
            title="Data Source Registration Video Tour"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
          <div onMouseDown={onResizeStart} className="absolute bottom-0 right-0 h-5 w-5 cursor-nwse-resize" title="Drag to resize">
            <svg className="h-full w-full text-tlx-muted" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 22H20V20H22V22ZM22 18H18V22H16V18H22V18ZM14 22H10V20H14V22Z" />
            </svg>
          </div>
        </div>
      )}
      <div className="border-t border-tlx-border bg-white px-3 py-1.5">
        <p className="text-[10px] text-tlx-muted">Drag title bar to move · drag corner to resize</p>
      </div>
    </div>
  )
}

function HelpTabContent({ onClose, onOpenVideo }: { onClose: () => void; onOpenVideo: () => void }) {
  const { datasource } = useOnboarding()
  const journeyIntro = useJourneyIntro()
  const journeys = useJourneys()
  const pageContext = usePageContext()
  const topics = usePageTopics(pageContext)
  const journeyCTA = useJourneyCTA(pageContext)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [chatInput, setChatInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)

  const tourVersion = readTourVersion()
  const v1Active = tourVersion === 'v1' && journeys.activeTour !== null
  const v1Paused = tourVersion === 'v1' && journeys.journeys.some((j) => j.status === 'paused')
  const tourInProgress = v1Active || journeyIntro.phase === 'journey'
  const tourPaused = !tourInProgress && (v1Paused || journeyIntro.paused)

  const ask = (q: string) => {
    const query = q.trim()
    if (!query) return
    const topic: 'data-sources' | 'generic' = /data\s*source/i.test(query) ? 'data-sources' : 'generic'
    setMessages((m) => [
      ...m,
      { id: (idRef.current += 1), role: 'user', text: query },
      { id: (idRef.current += 1), role: 'agent', topic },
    ])
  }

  const handleAsk = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    ask(chatInput)
    setChatInput('')
  }

  const startTour = () => {
    onClose()
    if (tourVersion === 'v1') {
      journeys.startJourney('data-sources')
    } else {
      journeyIntro.launch()
    }
  }

  const resumeTour = () => {
    onClose()
    if (tourVersion === 'v1') {
      const paused = journeys.journeys.find((j) => j.status === 'paused')
      if (paused) journeys.resumeJourney(paused.id)
    } else {
      journeyIntro.resumeTour()
    }
  }

  const pauseCurrentTour = () => {
    if (tourVersion === 'v1') {
      journeys.pauseTour()
    } else {
      journeyIntro.pauseTour()
    }
  }

  const restartTour = () => {
    onClose()
    if (tourVersion === 'v1') {
      journeys.startJourney('data-sources')
    } else {
      journeyIntro.restartTour()
    }
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el && messages.length) el.scrollTop = el.scrollHeight
  }, [messages])

  return (
    <div role="tabpanel" className="flex min-h-0 flex-1 flex-col">
      {/* Context — sticky */}
      <div className="shrink-0 px-4 pt-5">
        <div className="flex items-center gap-3 rounded-[10px] bg-tlx-surface px-3.5 py-2.5">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-tlx-muted">You're on</p>
            <p className="mt-0.5 truncate text-[13px] font-semibold text-tlx-text">
              {pageContext}
            </p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Welcome + state-based CTA */}
        <div className="mt-3 overflow-hidden rounded-[10px] border border-[#E4E7EB]">
          <div className="border-b border-[#E4E7EB] bg-[#E8F7FB] px-4 py-3.5">
            <h3 className="text-[15px] font-semibold text-[#00A8CF]">Hi Prathik!</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-[#617085]">
              I understand this page and can help you in the best way.
            </p>
          </div>

          {/* State: Idle — Get Started */}
          {!tourInProgress && !tourPaused && (
            <div className="bg-white px-4 py-3.5">
              <p className="text-[14px] font-bold text-[#20293A]">Get Started</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-[#617085]">
                {journeyCTA.description}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={startTour}
                  className="flex-1 rounded-[5px] bg-brand-500 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#66CAE3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2"
                >
                  {journeyCTA.label}
                </button>
                <button
                  type="button"
                  onClick={onOpenVideo}
                  className="rounded-[5px] border border-[#617085] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#617085] transition-colors hover:border-[#00A8CF] hover:text-[#00A8CF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2"
                >
                  Watch Video
                </button>
              </div>
            </div>
          )}

          {/* State: Tour Paused */}
          {tourPaused && (
            <div className="bg-white px-4 py-3.5">
              <p className="text-[14px] font-bold text-[#20293A]">Tour Paused</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-[#617085]">
                Your guided tour has been paused. Pick up where you left off or start fresh.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={resumeTour}
                  className="flex-1 rounded-[5px] bg-brand-500 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#66CAE3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2"
                >
                  Resume Tour
                </button>
                <button
                  type="button"
                  onClick={restartTour}
                  className="rounded-[5px] border border-[#617085] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#617085] transition-colors hover:border-[#00A8CF] hover:text-[#00A8CF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2"
                >
                  Restart Tour
                </button>
              </div>
            </div>
          )}

          {/* State: Tour in Progress */}
          {tourInProgress && (
            <div className="bg-white px-4 py-3.5">
              <p className="text-[14px] font-bold text-[#20293A]">Tour in Progress</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-[#617085]">
                Your guided tour is running
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-[5px] bg-brand-500 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#66CAE3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2"
                >
                  Continue Tour
                </button>
                <button
                  type="button"
                  onClick={pauseCurrentTour}
                  className="rounded-[5px] border border-[#617085] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#617085] transition-colors hover:border-[#00A8CF] hover:text-[#00A8CF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2"
                >
                  Pause Tour
              </button>
            </div>
          </div>
        )}
        </div>

        {/* Popular help topics */}
        <h4 className="mb-2 mt-5 text-[13px] font-semibold text-tlx-text">Popular help topics</h4>
        <div className="space-y-2">
          {topics.map(({ icon: Icon, title, description }) => (
            <button
              key={title}
              type="button"
              onClick={() => ask(title)}
              className="group flex w-full items-center gap-3 rounded-[5px] border border-tlx-border bg-white px-3 py-2.5 text-left transition-all hover:border-brand-200 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] border border-[#E4E7EB] bg-[#FAFBFD] text-[#B8BFC9] transition-colors group-hover:border-[#CCEEF4] group-hover:bg-[#CCEEF4] group-hover:text-[#00A8CF]">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-tlx-text">{title}</span>
                <span className="block truncate text-xs text-tlx-secondary">{description}</span>
              </span>
              <ChevronRightIcon className="h-4 w-4 shrink-0 text-tlx-muted" />
            </button>
          ))}
        </div>


        {/* Chat thread */}
        {messages.length > 0 && (
          <div className="mt-5 space-y-3 border-t border-tlx-border pt-4">
            {messages.map((m) =>
              m.role === 'user' ? (
                <div
                  key={m.id}
                  data-role="user"
                  className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-brand-500 px-3.5 py-2 text-[13px] text-white"
                >
                  {m.text}
                </div>
              ) : (
                <AgentAnswer key={m.id} topic={m.topic} onStartTour={startTour} onAsk={ask} onOpenVideo={onOpenVideo} />
              ),
            )}
          </div>
        )}
      </div>

      {/* Ask input */}
      <div className="shrink-0 bg-white px-4 pb-3 pt-3">
        <form onSubmit={handleAsk} className="flex items-center gap-1.5 rounded-[15px] border border-[#E4E7EB] bg-white px-1.5 py-1.5">
          <input
            id="help-ask"
            name="question"
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            aria-label="Ask about your data security"
            placeholder="Ask about your data security..."
            className="min-w-0 flex-1 bg-transparent px-3 text-[13px] text-[#617085] placeholder:text-[#B8BFC9] focus:outline-none"
          />
          <button
            type="button"
            aria-label="Attach"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] border border-[#E4E7EB] bg-[#FAFBFD] text-[#8A95A8] transition-colors hover:bg-neutral-100"
          >
            <Mic className="h-4 w-4" strokeWidth={1.7} />
          </button>
          <button
            type="submit"
            aria-label="Send question"
            className={[
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200',
              chatInput.trim()
                ? 'bg-[#00A8CF] text-white hover:bg-[#66CAE3]'
                : 'bg-[#CCEDF6] text-white',
            ].join(' ')}
          >
            <Send className="h-4 w-4" strokeWidth={1.7} />
          </button>
        </form>
      </div>
    </div>
  )
}

function AgentAnswer({
  topic,
  onStartTour,
  onAsk,
  onOpenVideo,
}: {
  topic: 'data-sources' | 'generic'
  onStartTour: () => void
  onAsk: (q: string) => void
  onOpenVideo: () => void
}) {
  return (
    <div className="rounded-[10px] border border-tlx-border bg-white p-3.5">
      <div className="flex items-center gap-1.5">
        <SparkleIcon className="h-3.5 w-3.5 text-brand-500" />
        <span className="text-[11px] font-bold uppercase tracking-wide text-tlx-muted">
          Guardian Agent
        </span>
      </div>
      {topic === 'data-sources' ? (
        <>
          <p className="mt-2 text-[13px] leading-relaxed text-tlx-secondary">
            A <span className="font-semibold text-tlx-text">data source</span> is any system
            TrustLogix connects to — like Snowflake, Databricks or Power BI — to discover sensitive
            data, analyze who can access it, and enforce least-privilege policies. The Data Sources
            page lists each connected source with its access policies, monitoring coverage and data
            risk.
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-tlx-secondary">
            Want a hands-on walkthrough? I can guide you through it as a few quick missions.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onStartTour}
              className="flex-1 rounded-[5px] bg-brand-500 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#66CAE3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2"
            >
              Start Data Sources Tour
            </button>
            <button
              type="button"
              onClick={onOpenVideo}
              className="flex items-center gap-1.5 rounded-[5px] border border-[#617085] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#617085] transition-colors hover:border-[#00A8CF] hover:text-[#00A8CF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2"
            >
              Watch Video
            </button>
          </div>
        </>
      ) : (
        <p className="mt-2 text-[13px] leading-relaxed text-tlx-secondary">
          I can help with that. Try asking about your{' '}
          <button
            type="button"
            onClick={() => onAsk('What is a data source?')}
            className="font-semibold text-brand-600 hover:underline"
          >
            data sources
          </button>
          , policies, or data risks.
        </p>
      )}
    </div>
  )
}

const MicIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...p}>
    <rect x="9" y="2" width="6" height="11" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <path d="M12 17v4M8 21h8" />
  </svg>
)

const InProgressIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
)

const PauseCircleIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M10 9v6M14 9v6" />
  </svg>
)
