import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'tlx:help-trigger-position'
const MARGIN = 16
const DRAG_THRESHOLD = 4

type Pos = { x: number; y: number }

export default function HelpTrigger({
  onToggle,
  open = false,
}: {
  onToggle?: () => void
  open?: boolean
}) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState<Pos | null>(null)
  const [dragging, setDragging] = useState(false)

  const drag = useRef({
    active: false,
    moved: false,
    offsetX: 0,
    offsetY: 0,
    startX: 0,
    startY: 0,
  })

  const clamp = useCallback((x: number, y: number): Pos => {
    const size = btnRef.current?.offsetWidth ?? 56
    const maxX = Math.max(window.innerWidth - size - MARGIN, MARGIN)
    const maxY = Math.max(window.innerHeight - size - MARGIN, MARGIN)
    return {
      x: Math.min(Math.max(x, MARGIN), maxX),
      y: Math.min(Math.max(y, MARGIN), maxY),
    }
  }, [])

  useLayoutEffect(() => {
    const size = btnRef.current?.offsetWidth ?? 56
    const corner: Pos = {
      x: window.innerWidth - size - MARGIN,
      y: window.innerHeight - size - MARGIN,
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const saved = raw ? (JSON.parse(raw) as Pos) : null
      setPos(saved ? clamp(saved.x, saved.y) : corner)
    } catch {
      setPos(corner)
    }
  }, [clamp])

  const [nudged, setNudged] = useState(false)

  useEffect(() => {
    const onResize = () => setPos((p) => (p ? clamp(p.x, p.y) : p))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [clamp])

  useEffect(() => {
    let prev = false
    const check = () => {
      const size = btnRef.current?.offsetWidth ?? 56
      const homeX = window.innerWidth - size - MARGIN
      const homeY = window.innerHeight - size - MARGIN
      const PAD = 20
      const homeRect = { left: homeX - PAD, top: homeY - PAD, right: homeX + size + PAD, bottom: homeY + size + PAD }
      const cards = document.querySelectorAll('[data-tour-card]')
      let overlaps = false
      cards.forEach((card) => {
        const cr = card.getBoundingClientRect()
        if (cr.width === 0) return
        if (homeRect.right > cr.left && homeRect.left < cr.right && homeRect.bottom > cr.top && homeRect.top < cr.bottom) {
          overlaps = true
        }
      })
      if (overlaps !== prev) { prev = overlaps; setNudged(overlaps) }
    }
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.body, { childList: true, subtree: true })
    window.addEventListener('resize', check)
    const interval = setInterval(check, 500)
    return () => { observer.disconnect(); window.removeEventListener('resize', check); clearInterval(interval) }
  }, [])

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!pos) return
    btnRef.current?.setPointerCapture(e.pointerId)
    drag.current = {
      active: true,
      moved: false,
      offsetX: e.clientX - pos.x,
      offsetY: e.clientY - pos.y,
      startX: e.clientX,
      startY: e.clientY,
    }
    setDragging(true)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d.active) return
    if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > DRAG_THRESHOLD) {
      d.moved = true
    }
    setPos(clamp(e.clientX - d.offsetX, e.clientY - d.offsetY))
  }

  const endDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d.active) return
    d.active = false
    setDragging(false)
    btnRef.current?.releasePointerCapture(e.pointerId)
    setPos((p) => {
      if (p) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
        } catch {
          /* ignore */
        }
      }
      return p
    })
  }

  const onClick = () => {
    if (drag.current.moved) {
      drag.current.moved = false
      return
    }
    onToggle?.()
  }

  const displayX = nudged ? MARGIN : pos?.x
  const displayY = nudged ? (pos?.y ?? window.innerHeight - 72) : pos?.y

  return (
    <div
      style={{
        position: 'fixed',
        left: displayX,
        top: displayY,
        zIndex: 10100,
        visibility: pos ? 'visible' : 'hidden',
        transition: dragging
          ? 'none'
          : 'left 0.32s cubic-bezier(0.22, 1, 0.36, 1), top 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'left, top',
      }}
      className={pos ? 'animate-help-pop-in motion-reduce:animate-none' : ''}
    >
      <button
        ref={btnRef}
        type="button"
        aria-label="Help and Guidance"
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Help & Guidance"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={onClick}
        style={{
          touchAction: 'none',
          cursor: dragging ? 'grabbing' : 'grab',
          willChange: 'transform',
        }}
        className={[
          'group relative flex h-12 w-12 items-center justify-center rounded-full sm:h-14 sm:w-14',
          'bg-brand-500 text-white outline-none select-none',
          'shadow-lg',
          'transition-[transform,box-shadow,background-color] duration-200 ease-out',
          'motion-reduce:transition-none',
          'hover:bg-[#66CAE3] hover:shadow-lg',
          'focus-visible:ring-4 focus-visible:ring-brand-200',
          dragging
            ? 'scale-110 shadow-2xl'
            : 'hover:-translate-y-0.5 active:scale-95 active:translate-y-0',
        ].join(' ')}
      >
        <QuestionIcon className="h-6 w-6 transition-transform duration-200 ease-out group-hover:scale-110 motion-reduce:transition-none sm:h-7 sm:w-7" />
      </button>
    </div>
  )
}

function QuestionIcon({ className = '', ...rest }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d="M9.2 9.2a2.9 2.9 0 0 1 5.5 1.1c0 1.9-2.7 2.4-2.7 4.1" />
      <path d="M12 17.6h.01" />
    </svg>
  )
}
