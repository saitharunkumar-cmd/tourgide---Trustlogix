import { useEffect, useState } from 'react'
import { useJourneyIntro } from './JourneyIntroContext'

const CARD_W = 360
const MARGIN = 16

type Anchor = {
  dotX: number
  dotY: number
  cardLeft: number
  cardTop: number
  placement: 'right' | 'below'
  tail: number
} | null

export default function JourneyIntroCard() {
  const { phase, startJourney, close } = useJourneyIntro()
  const open = phase === 'intro'
  const [anchor, setAnchor] = useState<Anchor>(null)

  useEffect(() => {
    if (!open) return
    const measure = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const heading = [...document.querySelectorAll('h1')].find(
        (el) => el.textContent?.trim() === 'Data Sources',
      )
      if (heading) {
        const range = document.createRange()
        range.selectNodeContents(heading)
        const r = range.getBoundingClientRect()
        const dotX = r.right + 14
        const dotY = r.top + r.height / 2
        if (dotX + 20 + CARD_W <= vw - MARGIN) {
          const cardTop = clamp(r.top - 16, MARGIN, vh - 200)
          setAnchor({
            dotX,
            dotY,
            cardLeft: dotX + 20,
            cardTop,
            placement: 'right',
            tail: Math.max(24, dotY - cardTop),
          })
        } else {
          const cardLeft = clamp(dotX - 56, MARGIN, vw - CARD_W - MARGIN)
          const cardTop = dotY + 18
          setAnchor({ dotX, dotY, cardLeft, cardTop, placement: 'below', tail: clamp(dotX - cardLeft, 28, CARD_W - 28) })
        }
      } else {
        const cardLeft = clamp((vw - CARD_W) / 2, MARGIN, vw - CARD_W - MARGIN)
        setAnchor({ dotX: 0, dotY: 0, cardLeft, cardTop: 96, placement: 'below', tail: -100 })
      }
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  if (!open || !anchor) return null
  const showAnchor = anchor.dotX > 0

  return (
    <div className="pointer-events-none fixed inset-0 z-[9300]">
      {showAnchor && (
        <span
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 animate-ripple-ring rounded-full bg-brand-500"
          style={{ left: anchor.dotX, top: anchor.dotY }}
        />
      )}

      <section
        role="dialog"
        aria-label="Welcome to Data Sources"
        className="pointer-events-auto absolute animate-nav-rise rounded-[10px] border border-tlx-border bg-white shadow-[0_30px_80px_-24px_rgba(32,41,58,0.32)]"
        style={{ left: anchor.cardLeft, top: anchor.cardTop, width: CARD_W, animationDelay: '0.13s' }}
      >
        {showAnchor &&
          (anchor.placement === 'right' ? (
            <span
              className="absolute h-3.5 w-3.5 -left-[7px] rotate-45 rounded-[3px] border-b border-l border-tlx-border bg-white"
              style={{ top: anchor.tail - 7 }}
            />
          ) : (
            <span
              className="absolute -top-[7px] h-3.5 w-3.5 rotate-45 rounded-[3px] border-l border-t border-tlx-border bg-white"
              style={{ left: anchor.tail - 7 }}
            />
          ))}

        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-[5px] text-tlx-muted transition-colors hover:bg-tlx-surface hover:text-tlx-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
        >
          <CloseIcon className="h-[18px] w-[18px]" />
        </button>

        <div className="p-5">
          <div className="pr-5">
            <h2 className="text-base font-bold text-tlx-text">Welcome to Data Sources</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-tlx-secondary">
              Data Sources are the foundation of{' '}
              <span className="font-semibold text-[#00A8CF]">TrustLogix</span>.
              Connect your data platforms to discover, monitor, analyze and protect your critical data.
            </p>
          </div>

          <p className="mb-2.5 mt-4 text-[11px] font-bold uppercase tracking-wide text-[#20293A]">What you can do</p>
          <div className="space-y-2.5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] border border-[#E4E7EB] bg-[#FAFBFD]">
                  <Icon className="h-4 w-4 text-[#B8BFC9]" />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[13px] font-semibold text-tlx-text">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-tlx-secondary">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={startJourney}
            className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-[5px] bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#66CAE3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2"
          >
            Start Data Sources Tour
          </button>
        </div>
      </section>
    </div>
  )
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi))

const FEATURES = [
  { icon: SearchIcon, title: 'Discover & Analyze', desc: 'Uncover sensitive data and analyze permissions.' },
  { icon: ActivityIcon, title: 'Monitor & Detect', desc: 'Continuously monitor activity and detect risks.' },
  { icon: ShieldIcon, title: 'Protect & Govern', desc: 'Enforce policies and maintain compliance.' },
]

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
}
type P = React.SVGProps<SVGSVGElement>

function DatabaseCheckIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <ellipse cx="11" cy="5.5" rx="6.5" ry="2.6" />
      <path d="M4.5 5.5v6c0 1.4 2.9 2.6 6.5 2.6" />
      <path d="M4.5 11.5v6c0 1.4 2.9 2.6 6.5 2.6 .5 0 1 0 1.5-.06" />
      <circle cx="17.5" cy="16.5" r="4" />
      <path d="m15.9 16.5 1.1 1.1 2-2.2" />
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
function ActivityIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M3 12h3l2.5-6 4 13 2.5-7H21" />
    </svg>
  )
}
function ShieldIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3 5 6v5.5c0 4.2 2.9 7.4 7 8.5 4.1-1.1 7-4.3 7-8.5V6l-7-3Z" />
      <path d="m9.2 11.8 1.9 1.9 3.7-3.7" />
    </svg>
  )
}
function ArrowRightIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  )
}
function PlayIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}>
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}
function CloseIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}
