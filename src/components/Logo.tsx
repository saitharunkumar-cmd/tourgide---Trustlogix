const RAMP = ['#6FBE46', '#43B86C', '#28B091', '#1EAEAB', '#16A9BD', '#0AA9C8', '#00A8CF']

export default function Logo({ className = '' }: { className?: string }) {
  const cells = [0, 1, 2, 3]
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true">
        <g transform="rotate(45 20 20)">
          {cells.map((r) =>
            cells.map((c) => (
              <rect
                key={`${r}-${c}`}
                x={8 + c * 6.4}
                y={8 + r * 6.4}
                width="5"
                height="5"
                rx="1"
                fill={RAMP[r + c]}
              />
            )),
          )}
        </g>
      </svg>
      <span className="text-xl font-bold tracking-wide text-tlx-text">
        TRUST<span className="font-semibold">LOGIX</span>
      </span>
    </div>
  )
}
