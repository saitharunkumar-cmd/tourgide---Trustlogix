import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
}

export const SearchIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="6" />
    <path d="m20 20-3.2-3.2" />
  </svg>
)

export const ShieldPolicyIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3 5 6v5.5c0 4.2 2.9 7.4 7 8.5 4.1-1.1 7-4.3 7-8.5V6l-7-3Z" />
    <path d="m9.2 11.8 1.9 1.9 3.7-3.7" />
  </svg>
)

export const ActivityIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 12h3l2.5-6 4 13 2.5-7H21" />
  </svg>
)

export const RobotIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="5" y="8" width="14" height="10" rx="2.5" />
    <path d="M12 5v3M9 13h.01M15 13h.01M9.5 16h5" />
    <circle cx="12" cy="4" r="1" />
  </svg>
)

export const DocumentIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </svg>
)

export const DatabaseIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <ellipse cx="12" cy="5.5" rx="7" ry="2.8" />
    <path d="M5 5.5v6c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-6" />
    <path d="M5 11.5v6c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-6" />
  </svg>
)

export const ClockIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4l2.8 1.6" />
  </svg>
)

export const PulseIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 12h3l2-4 3 8 2.5-6 1.5 2H21" />
  </svg>
)

export const ChevronRightIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m9 6 6 6-6 6" />
  </svg>
)

export const ArrowRightIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
)

export const CheckIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
)

export const DownloadIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 4v11M7.5 11l4.5 4 4.5-4" />
    <path d="M5 19h14" />
  </svg>
)

export const CloseIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const UsersIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
    <path d="M16 5.2a3.2 3.2 0 0 1 0 6M17.5 14c2.2.5 3.5 2.4 3.5 5" />
  </svg>
)

export const RocketIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 15c-1 2-1 4-1 4s2 0 4-1m-3-3a16 16 0 0 1 9-9c3-1 5-1 5-1s0 2-1 5a16 16 0 0 1-9 9l-4-3Z" />
    <circle cx="14.5" cy="9.5" r="1.6" />
  </svg>
)

export const InfoIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 7.6h.01" />
  </svg>
)

export const AlertIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5M12 16h.01" />
  </svg>
)

export const FingerprintIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 11a2 2 0 0 0-2 2c0 2.5.5 4.5 1.5 6" />
    <path d="M8 11a4 4 0 0 1 8 0c0 3 .5 5.5 1.5 7.5" />
    <path d="M5 13a7 7 0 0 1 14 0c0 1.5 0 3 .5 4.5" />
    <path d="M7.5 8.5a7 7 0 0 1 9 0" />
  </svg>
)

export const LockIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    <path d="M12 15v2" />
  </svg>
)
