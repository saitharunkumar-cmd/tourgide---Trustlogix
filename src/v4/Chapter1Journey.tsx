import { useEffect, useState } from 'react'
import { useJourneyIntro } from './JourneyIntroContext'
import { readTourVersion } from '../missionBoard/tourVersion'

const CARD_W = 360
const MARGIN = 16

function CheckIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M5 12l5 5L20 7" />
    </svg>
  )
}

export default function Chapter1Journey() {
  const { phase, subStep, openRegisterModal } = useJourneyIntro()

  useEffect(() => {
    if (phase !== 'journey' || subStep !== 'instruction') return
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null
      const btn = target?.closest('button')
      if (
        btn &&
        btn.textContent?.includes('Register Data Source') &&
        !btn.closest('[data-v4-journey]')
      ) {
        e.preventDefault()
        e.stopPropagation()
        openRegisterModal()
      }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [phase, subStep, openRegisterModal])

  if (phase !== 'journey') return null
  if (readTourVersion() === 'v1') return null
  const preModal = subStep === 'instruction'
  const chapter2Intro = subStep === 'chapter2-intro'
  return (
    <>
      {preModal && <RegisterButtonPulse />}
      <ChaptersCard />
      {preModal && <InstructionCard />}
      {chapter2Intro && <Chapter2IntroCard />}
    </>
  )
}

function RegisterButtonPulse() {
  const [rect, setRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)

  useEffect(() => {
    const measure = () => {
      const btn = [...document.querySelectorAll('button')].find((b) =>
        b.textContent?.trim().includes('Register Data Source'),
      )
      if (btn) {
        const r = btn.getBoundingClientRect()
        setRect({ left: r.left, top: r.top, width: r.width, height: r.height })
      } else {
        setRect(null)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    const id = window.setInterval(measure, 600)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
      window.clearInterval(id)
    }
  }, [])

  if (!rect) return null
  return null
}

type Chapter = { n: number; title: string; icon: (p: P) => JSX.Element; subSteps?: string[] }

const CHAPTERS: Chapter[] = [
  {
    n: 1,
    title: 'Connect Data Source',
    icon: RocketIcon,
    subSteps: [],
  },
  { n: 2, title: 'Understand Your Data', icon: BookIcon },
  { n: 3, title: 'Monitoring Policies', icon: MonitorIcon },
  { n: 4, title: 'Access Policies', icon: LockIcon },
  { n: 5, title: 'Investigate Risks', icon: SearchIcon },
  { n: 6, title: 'Governance Features', icon: GearIcon },
]
const TOTAL = 6

function useFabPosition() {
  const [fabPos, setFabPos] = useState<{ x: number; y: number } | null>(null)
  useEffect(() => {
    const measure = () => {
      const fab = document.querySelector('[aria-label="Help and Guidance"]') as HTMLElement | null
      if (fab) {
        const r = fab.getBoundingClientRect()
        setFabPos({ x: r.left + r.width / 2, y: r.top })
      }
    }
    measure()
    const id = window.setInterval(measure, 200)
    window.addEventListener('resize', measure)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('resize', measure)
    }
  }, [])
  return fabPos
}

const CARD_WIDTH = 280

function ChaptersCard() {
  const { subStep, activeChapter, close, pauseTour } = useJourneyIntro()
  const [collapsed, setCollapsed] = useState(subStep === 'instruction')
  const current = CHAPTERS.find((c) => c.n === activeChapter) ?? CHAPTERS[0]
  const fabPos = useFabPosition()

  const ACTIVE_SUB =
    subStep === 'connection-auth' ? 3
    : subStep === 'verify-complete' || subStep === 'run-prerequisites' ? 2
    : subStep === 'name-connection' ? 1
    : 0
  const progress = activeChapter

  const fabSize = 56
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900
  const cardBottom = fabPos ? Math.max(vh - fabPos.y - fabSize, MARGIN) : MARGIN
  const cardLeft = fabPos ? Math.max(fabPos.x - fabSize / 2 - 12 - CARD_WIDTH, MARGIN) : MARGIN
  const cardStyle: React.CSSProperties = {
    position: 'fixed',
    left: cardLeft,
    bottom: cardBottom,
    zIndex: 9300,
    transition: 'left 0.32s cubic-bezier(0.22,1,0.36,1), bottom 0.32s cubic-bezier(0.22,1,0.36,1)',
  }

  if (collapsed) {
    return (
      <button
        type="button"
        data-v4-journey
        aria-label="Expand chapters"
        onClick={() => setCollapsed(false)}
        style={{ ...cardStyle, width: CARD_WIDTH }}
        className="group flex animate-tour-enter items-center justify-between rounded-[10px] border border-tlx-border bg-white py-2.5 pl-3.5 pr-4 shadow-[0_30px_80px_-24px_rgba(32,41,58,0.32)] transition-all duration-300 hover:shadow-lg"
      >
        <span className="text-left">
          <span className="block text-[13px] font-bold leading-tight text-tlx-text">{current.title}</span>
          <span className="block text-[11px] font-semibold leading-tight text-[#00A8CF]">
            Chapter {progress} of {TOTAL}
          </span>
        </span>
        <ChevronIcon className="ml-1 h-4 w-4 rotate-180 text-tlx-muted transition-transform duration-200 group-hover:translate-y-[-1px]" />
      </button>
    )
  }

  const pct = (progress / TOTAL) * 100

  return (
    <aside
      data-v4-journey
      aria-label="Journey chapters"
      style={{ ...cardStyle, width: CARD_WIDTH }}
      className="animate-tour-enter rounded-[10px] border border-tlx-border bg-white shadow-[0_30px_80px_-24px_rgba(32,41,58,0.32)]"
    >

      <div className="p-4 pt-3.5">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-bold tracking-tight text-tlx-text">Your Tour</p>
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-[#E8F7FB] px-2 py-0.5 text-[10px] font-bold tabular-nums text-[#00A8CF]">
              {progress}/{TOTAL}
            </span>
            <button
              type="button"
              aria-label="Collapse chapters"
              onClick={() => setCollapsed(true)}
              className="flex h-6 w-6 items-center justify-center rounded-[5px] text-tlx-muted transition-all duration-200 hover:bg-[#E8F7FB] hover:text-[#00A8CF]"
            >
              <ChevronIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="relative mt-3 h-[5px] w-full overflow-hidden rounded-full bg-tlx-border">
          <div
            className="h-full rounded-full bg-[#00A8CF] transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
          <span
            className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-white bg-[#00A8CF] transition-[left] duration-700 ease-out"
            style={{ left: `${pct}%` }}
          />
        </div>

        <ul className="mt-4 space-y-0.5">
          {CHAPTERS.map(({ n, title, icon: Icon, subSteps }, idx) => {
            const completed = n < activeChapter
            const active = n === activeChapter
            return (
              <li
                key={n}
                className="animate-stagger-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div
                  className={[
                    'flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all duration-300',
                    active ? 'bg-[#E8F7FB]' : 'hover:bg-tlx-surface',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold transition-all duration-300',
                      completed
                        ? 'bg-emerald-500 text-white'
                        : active
                          ? 'bg-[#00A8CF] text-white'
                          : 'bg-tlx-surface text-tlx-muted',
                    ].join(' ')}
                  >
                    {completed ? <CheckIcon className="h-3.5 w-3.5" /> : n}
                  </span>
                  <span
                    className={[
                      'truncate text-[12.5px] transition-all duration-300',
                      completed
                        ? 'font-medium text-emerald-600/70 line-through decoration-emerald-300/50'
                        : active
                          ? 'font-semibold text-[#00A8CF]'
                          : 'font-medium text-tlx-secondary',
                    ].join(' ')}
                  >
                    {title}
                  </span>
                </div>

                {active && subSteps && subSteps.length > 0 && (
                  <div className="relative ml-[18px] pl-[18px]">
                    <span
                      className="absolute left-[3px] top-1 bottom-2 w-px bg-[#E4E7EB]"
                      aria-hidden="true"
                    />
                    <ul className="space-y-1 py-1.5">
                      {subSteps.map((s, i) => {
                        const subDone = i < ACTIVE_SUB
                        const subActive = i === ACTIVE_SUB
                        return (
                          <li
                            key={s}
                            className="flex items-center gap-2.5 animate-stagger-in"
                            style={{ animationDelay: `${(idx * 50) + (i + 1) * 40}ms` }}
                          >
                            <span
                              className={[
                                'relative z-10 shrink-0 rounded-full transition-all duration-300',
                                subDone
                                  ? 'h-[7px] w-[7px] bg-emerald-400 ring-[3px] ring-white'
                                  : subActive
                                    ? 'h-2 w-2 bg-[#00A8CF] ring-[3px] ring-[#E8F7FB]'
                                    : 'h-[6px] w-[6px] bg-tlx-border ring-[3px] ring-white',
                              ].join(' ')}
                              style={{ marginLeft: '-15px' }}
                            />
                            <span
                              className={[
                                'text-[11.5px] transition-all duration-200',
                                subDone
                                  ? 'font-medium text-emerald-500/70 line-through decoration-emerald-300/40'
                                  : subActive
                                    ? 'font-semibold text-[#00A8CF]'
                                    : 'text-tlx-muted',
                              ].join(' ')}
                            >
                              {s}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        <div className="mt-3 flex items-center gap-2 border-t border-tlx-border pt-3">
          <button
            type="button"
            onClick={pauseTour}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[5px] border border-[#617085] bg-white py-2 text-[11px] font-semibold text-[#617085] transition-all duration-200 hover:border-[#00A8CF] hover:text-[#00A8CF]"
          >
            Pause
          </button>
          <button
            type="button"
            onClick={close}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[5px] border border-[#617085] bg-white py-2 text-[11px] font-semibold text-[#617085] transition-all duration-200 hover:border-[#00A8CF] hover:text-[#00A8CF]"
          >
            Exit
          </button>
        </div>
      </div>
    </aside>
  )
}

type Anchor = { cardLeft: number; cardTop: number; tailY: number; targetX: number; targetY: number } | null

function InstructionCard() {
  const [anchor, setAnchor] = useState<Anchor>(null)
  const [cardHidden, setCardHidden] = useState(false)

  useEffect(() => {
    const findBtn = () =>
      [...document.querySelectorAll('button')].find((b) =>
        b.textContent?.trim().includes('Register Data Source'),
      ) ?? null

    const measure = () => {
      const vh = window.innerHeight
      const btn = findBtn()
      if (btn) {
        const r = btn.getBoundingClientRect()
        const targetX = r.left
        const targetY = r.top + r.height / 2
        const cardLeft = clamp(targetX - CARD_W - 14, MARGIN, targetX - CARD_W - 10)
        const cardTop = clamp(targetY - 60, MARGIN, vh - 240)
        const tailY = clamp(targetY - cardTop, 28, 200)
        setAnchor({ cardLeft, cardTop, tailY, targetX, targetY })
      }
    }

    findBtn()?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [])

  if (!anchor) return null

  return (
    <>
      <button
        type="button"
        aria-label={cardHidden ? 'Show tour card' : 'Hide tour card'}
        onClick={() => setCardHidden(h => !h)}
        style={{
          position: 'fixed',
          left: anchor.targetX,
          top: anchor.targetY,
          zIndex: 9301,
        }}
        className="flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-transparent"
      >
        <span className="absolute h-3 w-3 rounded-full bg-[#00A8CF]" />
        <span className="absolute h-3 w-3 animate-ping rounded-full bg-[#00A8CF]/40" />
      </button>

      <section
        data-v4-journey
        role="dialog"
        aria-label="Connect Your First Data Source"
        style={{ position: 'fixed', left: anchor.cardLeft, top: anchor.cardTop, width: CARD_W, zIndex: 9300, display: cardHidden ? 'none' : undefined }}
        className="animate-tour-enter rounded-[10px] border border-tlx-border bg-white shadow-[0_30px_80px_-24px_rgba(32,41,58,0.32)] motion-reduce:animate-none"
      >
        <span
          className="absolute -right-[7px] h-3.5 w-3.5 rotate-45 rounded-[3px] border-r border-t border-tlx-border bg-white"
          style={{ top: anchor.tailY - 7 }}
        />

        <div className="p-5 pt-4">
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-tlx-text">Connect Your First Data Source</h2>
            <p className="mt-0.5 text-[11px] font-semibold text-[#00A8CF]">Step 1 of 4</p>
          </div>

          <div className="mt-3.5 space-y-2 text-[13px] leading-relaxed text-tlx-secondary">
            <p>
              Connect a data platform like Snowflake, Databricks, or SQL Server so TrustLogix can
              discover and secure your data.
            </p>
            <p>
              Click <span className="text-[12px] font-semibold text-[#00A8CF]">Register Data Source</span> to get started.
            </p>
          </div>

          <div className="mt-4 flex items-center justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-[5px] border border-[#617085] bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#617085] transition-all duration-200 hover:border-[#00A8CF] hover:text-[#00A8CF]"
            >
              Skip Chapter
              <ChevronRightIcon className="h-3 w-3" />
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

function Chapter2IntroCard() {
  const { registeredSources } = useJourneyIntro()
  const newest = registeredSources[registeredSources.length - 1]
  const [anchor, setAnchor] = useState<{
    cardLeft: number; cardTop: number; tailY: number; targetX: number; targetY: number
  } | null>(null)
  const [cardHidden, setCardHidden] = useState(false)

  useEffect(() => {
    if (!newest) return
    const findRow = () =>
      [...document.querySelectorAll('a')].find(
        (a) => a.textContent?.trim() === newest.name,
      )?.closest('tr')

    const measure = () => {
      const row = findRow()
      if (row) {
        const r = row.getBoundingClientRect()
        const vh = window.innerHeight
        const targetX = r.left + r.width / 2
        const targetY = r.top + r.height / 2
        const cardLeft = clamp(targetX - CARD_W / 2, MARGIN, window.innerWidth - CARD_W - MARGIN)
        const cardTop = clamp(r.bottom + 16, MARGIN, vh - 260)
        const tailX = clamp(targetX - cardLeft, 40, CARD_W - 40)
        setAnchor({ cardLeft, cardTop, tailY: tailX, targetX, targetY })
      }
    }

    findRow()?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    const t = setTimeout(measure, 400)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    const id = window.setInterval(measure, 600)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
      window.clearInterval(id)
    }
  }, [newest])

  if (!anchor || !newest) return null

  return (
    <>
      <button
        type="button"
        aria-label={cardHidden ? 'Show tour card' : 'Hide tour card'}
        onClick={() => setCardHidden(h => !h)}
        style={{ position: 'fixed', left: anchor.targetX, top: anchor.targetY, zIndex: 9301 }}
        className="flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-transparent"
      >
        <span className="absolute h-3 w-3 rounded-full bg-[#00A8CF]" />
        <span className="absolute h-3 w-3 animate-ping rounded-full bg-[#00A8CF]/40" />
      </button>

      <section
        data-v4-journey
        role="dialog"
        aria-label="Explore Your Data Source"
        style={{ position: 'fixed', left: anchor.cardLeft, top: anchor.cardTop, width: CARD_W, zIndex: 9300, display: cardHidden ? 'none' : undefined }}
        className="animate-tour-enter rounded-[10px] border border-tlx-border bg-white shadow-[0_30px_80px_-24px_rgba(32,41,58,0.32)] motion-reduce:animate-none"
      >
        <span
          className="absolute -top-[7px] h-3.5 w-3.5 rotate-45 rounded-[3px] border-l border-t border-tlx-border bg-white"
          style={{ left: anchor.tailY - 7 }}
        />

        <div className="p-5 pt-4">
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-tlx-text">Explore Your Data Source</h2>
            <p className="mt-0.5 text-[11px] font-semibold text-[#00A8CF]">Step 1 of 6 · Understand Your Data</p>
          </div>

          <div className="mt-3.5 space-y-2 text-[13px] leading-relaxed text-tlx-secondary">
            <p>
              Great — <span className="font-semibold text-tlx-text">{newest.name}</span> is now connected! Click on it to explore what TrustLogix discovered.
            </p>
            <p>
              Inside, you'll find data risks, monitoring &amp; access policies, tag management, attribute details, and more.
            </p>
          </div>

          <div className="mt-4 flex items-center justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-[5px] border border-[#617085] bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#617085] transition-all duration-200 hover:border-[#00A8CF] hover:text-[#00A8CF]"
            >
              Skip Chapter
              <ChevronRightIcon className="h-3 w-3" />
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi))

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
}
type P = React.SVGProps<SVGSVGElement>

function RocketIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M5 15c-1 2-1 4-1 4s2 0 4-1m-3-3a16 16 0 0 1 9-9c3-1 5-1 5-1s0 2-1 5a16 16 0 0 1-9 9l-4-3Z" />
      <circle cx="14.5" cy="9.5" r="1.4" />
    </svg>
  )
}
function ChevronIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
function ChevronRightIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}
function BookIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 6.5C10.5 5 8.5 4.5 5 4.8v12.4c3.5-.3 5.5.2 7 1.8 1.5-1.6 3.5-2.1 7-1.8V4.8c-3.5-.3-5.5.2-7 1.7Z" />
      <path d="M12 6.5v12.5" />
    </svg>
  )
}
function MonitorIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M3 12h3l2.5-6 4 13 2.5-7H21" />
    </svg>
  )
}
function LockIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  )
}
function SearchIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  )
}
function GearIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.1 5.1l2.1 2.1M16.8 16.8l2.1 2.1M18.9 5.1l-2.1 2.1M7.2 16.8l-2.1 2.1" />
    </svg>
  )
}
function PauseIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M9 5v14M15 5v14" />
    </svg>
  )
}
function ExitIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M14 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 12H3m0 0 3.5-3.5M3 12l3.5 3.5" />
    </svg>
  )
}
function SparkleIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.2 2.2m8.4 8.4 2.2 2.2M18.4 5.6l-2.2 2.2M7.8 16.2l-2.2 2.2" />
    </svg>
  )
}
