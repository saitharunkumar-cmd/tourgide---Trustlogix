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
  const [askAIOpen, setAskAIOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)
  const idRef = useRef(0)

  const tourVersion = readTourVersion()
  const v1Active = tourVersion === 'v1' && journeys.activeTour !== null
  const v1Paused = tourVersion === 'v1' && journeys.journeys.some((j) => j.status === 'paused')
  const tourInProgress = v1Active || journeyIntro.phase === 'journey'
  const tourPaused = !tourInProgress && (v1Paused || journeyIntro.paused)

  const ask = (q: string) => {
    const query = q.trim()
    if (!query) return
    if (!askAIOpen) setAskAIOpen(true)
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

  const openAskAI = () => {
    setAskAIOpen(true)
    setTimeout(() => chatInputRef.current?.focus(), 100)
  }

  const closeAskAI = () => {
    setAskAIOpen(false)
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

  if (askAIOpen) {
    return (
      <div role="tabpanel" className="flex min-h-0 flex-1 flex-col">
        {/* Ask AI Header */}
        <div className="flex shrink-0 items-center gap-2 border-b border-[#E4E7EB] px-3 py-2.5">
          {/* Back button */}
          <button
            type="button"
            onClick={closeAskAI}
            aria-label="Back to Help &amp; Guidance"
            className="group flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F2F4F7] text-[#617085] transition-all hover:bg-[#E8F7FB] hover:text-[#00A8CF] active:scale-95"
          >
            <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>

          {/* Divider */}
          <div className="h-5 w-px bg-[#E4E7EB]" />

          {/* AI identity */}
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00A8CF] to-[#1EAEAB]">
            <GuardianAgentIcon className="h-3.5 w-3.5 [&_path]:fill-white" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[13px] font-semibold leading-tight text-[#20293A]">Ask AI</h3>
            <p className="text-[10px] leading-tight text-[#617085]">Guardian Agent</p>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={() => { closeAskAI(); onClose(); }}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] text-[#617085] transition-colors hover:bg-neutral-100 hover:text-[#20293A]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Chat body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-4">
          {messages.length === 0 ? (
            <div className="mt-6">
              <div className="text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F7FB]">
                  <SparkleIcon className="h-5 w-5 text-[#00A8CF]" />
                </span>
                <h4 className="mt-3 text-[14px] font-semibold text-[#20293A]">How can I help?</h4>
                <p className="mt-1 text-[12px] text-[#617085]">Ask anything about your data security, policies, or platform.</p>
              </div>

              <p className="mb-2.5 mt-6 text-[11px] font-semibold uppercase tracking-wider text-[#8A95A8]">Suggested questions</p>
              <div className="space-y-2">
                {topics.map(({ icon: Icon, title, description }) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => ask(title)}
                    className="group flex w-full items-center gap-3 rounded-[8px] border border-[#E4E7EB] bg-white px-3 py-2.5 text-left transition-all hover:border-[#CCEEF4] hover:bg-[#F5FCFE]"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-[#F2F4F7] text-[#8A95A8] transition-colors group-hover:bg-[#CCEEF4] group-hover:text-[#00A8CF]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-[#20293A]">{title}</span>
                      <span className="block truncate text-[11px] text-[#8A95A8]">{description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {messages.map((m) =>
                m.role === 'user' ? (
                  <div
                    key={m.id}
                    data-role="user"
                    className="ml-auto w-fit max-w-[85%] rounded-full bg-[#00A8CF] px-4 py-2 text-[13px] font-medium text-white"
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

        {/* Ask AI input */}
        <div className="shrink-0 border-t border-[#E4E7EB] bg-white px-4 pb-3 pt-3">
          <form onSubmit={handleAsk} className="flex items-center gap-1.5 rounded-[15px] border border-[#E4E7EB] bg-[#FAFBFD] px-1.5 py-1.5 transition-colors focus-within:border-[#00A8CF] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#CCEEF4]">
            <input
              ref={chatInputRef}
              id="help-ask"
              name="question"
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              aria-label="Ask AI a question"
              placeholder="Ask a question..."
              className="min-w-0 flex-1 bg-transparent px-3 text-[13px] text-[#20293A] placeholder:text-[#B8BFC9] focus:outline-none"
            />
            <button
              type="button"
              aria-label="Voice input"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] border border-[#E4E7EB] bg-white text-[#8A95A8] transition-colors hover:bg-neutral-100 hover:text-[#20293A]"
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
      </div>

      {/* Ask AI button */}
      <div className="shrink-0 px-4 pb-3 pt-2">
        <button
          type="button"
          onClick={openAskAI}
          className="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl px-4 py-3.5 text-left shadow-[0_4px_16px_rgba(0,168,207,.2)] transition-all duration-300 hover:shadow-[0_8px_28px_rgba(0,168,207,.35)] active:scale-[.98]"
          style={{ background: 'linear-gradient(135deg, #6FBE46 0%, #41B57F 34%, #1EAEAB 63%, #08AAC5 86%, #00A8CF 100%)' }}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,.3)]">
            <GuardianAgentIcon className="h-5 w-5 [&_path]:fill-white transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
          </span>
          <div className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold text-white">Ask AI</span>
            <span className="block text-[11px] text-white/75">Ask about your data security...</span>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,.3)] transition-all duration-200 group-hover:bg-white/30">
            <Send className="h-3.5 w-3.5 text-white transition-transform duration-200 group-hover:-translate-y-[1px] group-hover:translate-x-[1px]" strokeWidth={1.7} />
          </span>
        </button>
      </div>
    </div>
  )
}

function GuardianAgentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.5643 1.58301C11.3732 1.3881 11.3732 1.07623 11.5643 0.881309L12.1977 0.235294C12.3888 0.0403759 12.6945 0.0403759 12.8856 0.235294C13.0767 0.430212 13.0767 0.742081 12.8856 0.937L12.2523 1.58301C12.1594 1.67769 12.0339 1.72781 11.9083 1.72781C11.7827 1.72781 11.6626 1.67769 11.5643 1.58301ZM9.75157 2.73582C9.56047 2.93073 9.56047 3.2426 9.75157 3.43752C9.84439 3.5322 9.96997 3.58232 10.0955 3.58232C10.2211 3.58232 10.3412 3.5322 10.4395 3.43752L11.0729 2.79151C11.264 2.59659 11.264 2.28472 11.0729 2.0898C10.8818 1.89488 10.576 1.89488 10.3849 2.0898L9.75157 2.73582ZM7.75321 18.4184L7.11985 19.0644C6.92875 19.2593 6.92875 19.5712 7.11985 19.7661C7.21267 19.8608 7.33825 19.9109 7.46383 19.9109C7.58941 19.9109 7.70953 19.8608 7.80781 19.7661L8.44117 19.1201C8.63227 18.9252 8.63227 18.6133 8.44117 18.4184C8.25007 18.2235 7.94431 18.2235 7.75321 18.4184ZM10.2539 17.2656C10.445 17.0707 10.445 16.7588 10.2539 16.5639C10.0628 16.369 9.75703 16.369 9.56593 16.5639L8.93257 17.2099C8.74147 17.4048 8.74147 17.7167 8.93257 17.9116C9.02539 18.0063 9.15097 18.0564 9.27655 18.0564C9.40213 18.0564 9.52225 18.0063 9.62053 17.9116L10.2539 17.2656ZM9.51679 13.5621C9.51679 11.8691 8.16817 10.4936 6.50833 10.4936C6.24079 10.4936 6.02239 10.2708 6.02239 9.99791C6.02239 9.72503 6.24079 9.50226 6.50833 9.50226C8.16817 9.50226 9.51679 8.1267 9.51679 6.43369C9.51679 6.16081 9.73519 5.93804 10.0027 5.93804C10.2703 5.93804 10.4887 6.16081 10.4887 6.43369C10.4887 8.1267 11.8373 9.50226 13.4971 9.50226C13.7647 9.50226 13.9831 9.72503 13.9831 9.99791C13.9831 10.2708 13.7647 10.4936 13.4971 10.4936C11.8373 10.4936 10.4887 11.8691 10.4887 13.5621C10.4887 13.835 10.2703 14.0578 10.0027 14.0578C9.73519 14.0578 9.51679 13.835 9.51679 13.5621ZM10.0027 11.6241C10.3686 10.9391 10.9255 10.3766 11.5916 10.0035C10.92 9.63035 10.3686 9.06787 10.0027 8.38287C9.63691 9.06787 9.07999 9.63035 8.41387 10.0035C9.08545 10.3766 9.63691 10.9447 10.0027 11.6241ZM7.85695 17.583C7.97707 17.5329 8.06989 17.4382 8.11903 17.3157C8.14087 17.2544 8.15725 17.1932 8.15725 17.1263V15.244C8.15725 14.9711 7.93885 14.7483 7.67131 14.7483C7.40377 14.7483 7.18537 14.9711 7.18537 15.244V15.929L1.37046 9.99791L10.3467 0.847894C10.5378 0.652976 10.5378 0.341107 10.3467 0.146189C10.1556 -0.0487296 9.84985 -0.0487296 9.65875 0.146189L0 9.99791L6.50287 16.6307H5.83129C5.56375 16.6307 5.34534 16.8535 5.34534 17.1263C5.34534 17.3992 5.56375 17.622 5.83129 17.622H7.67677C7.74229 17.622 7.80235 17.6109 7.86241 17.583H7.85695ZM13.5026 3.36512H14.1742C14.4417 3.36512 14.6601 3.14236 14.6601 2.86947C14.6601 2.59659 14.4417 2.37383 14.1742 2.37383H12.3287C12.2632 2.37383 12.2031 2.38496 12.1431 2.41281C12.0229 2.46293 11.9301 2.55761 11.881 2.68013C11.8591 2.74139 11.8428 2.80265 11.8428 2.86947V4.75183C11.8428 5.02471 12.0612 5.24748 12.3287 5.24748C12.5962 5.24748 12.8146 5.02471 12.8146 4.75183V4.06683L18.6295 9.99791L9.65329 19.1535C9.46219 19.3484 9.46219 19.6603 9.65329 19.8552C9.74611 19.9499 9.87169 20 9.99727 20C10.1229 20 10.243 19.9499 10.3412 19.8552L20 10.0035L13.4971 3.37069L13.5026 3.36512Z" fill="url(#guardian-gradient)"/>
      <defs>
        <linearGradient id="guardian-gradient" x1="10" y1="20" x2="10" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6FBE46"/>
          <stop offset="0.34" stopColor="#41B57F"/>
          <stop offset="0.63" stopColor="#1EAEAB"/>
          <stop offset="0.86" stopColor="#08AAC5"/>
          <stop offset="1" stopColor="#00A8CF"/>
        </linearGradient>
      </defs>
    </svg>
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
    <div className="rounded-2xl border border-[#E4E7EB] bg-white p-4">
      <div className="flex items-center gap-2">
        <GuardianAgentIcon className="h-4 w-4" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A95A8]">
          Guardian Agent
        </span>
      </div>
      {topic === 'data-sources' ? (
        <>
          <p className="mt-3 text-[13px] leading-[1.7] text-[#617085]">
            A <span className="font-semibold text-[#00A8CF]">data source</span> is any system
            TrustLogix connects to — like Snowflake, Databricks or Power BI — to discover sensitive
            data, analyze who can access it, and enforce least-privilege policies. The Data Sources
            page lists each connected source with its access policies, monitoring coverage and data
            risk.
          </p>
          <p className="mt-2.5 text-[13px] leading-[1.7] text-[#617085]">
            Want a hands-on walkthrough? I can guide you through it as a few quick missions.
          </p>
          <div className="mt-4 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onStartTour}
              className="flex-1 rounded-lg bg-[#00A8CF] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#66CAE3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2"
            >
              Start Data Sources Tour
            </button>
            <button
              type="button"
              onClick={onOpenVideo}
              className="rounded-lg border border-[#E4E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#617085] transition-colors hover:border-[#00A8CF] hover:text-[#00A8CF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2"
            >
              Watch Video
            </button>
          </div>
        </>
      ) : (
        <p className="mt-3 text-[13px] leading-[1.7] text-[#617085]">
          I can help with that. Try asking about your{' '}
          <button
            type="button"
            onClick={() => onAsk('What is a data source?')}
            className="font-semibold text-[#00A8CF] hover:underline"
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
