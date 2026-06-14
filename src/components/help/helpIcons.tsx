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

export const SparkleIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
    <path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z" />
  </svg>
)

export const SendIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4.5 12 20 4l-4.5 16-3.5-6-7.5-2Z" />
    <path d="M12 14 20 4" />
  </svg>
)

export const DataSourceIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5" />
    <circle cx="11" cy="14" r="2" />
  </svg>
)

export const SprawlIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="2.5" />
    <circle cx="5" cy="6" r="1.8" />
    <circle cx="19" cy="7" r="1.8" />
    <circle cx="6" cy="18" r="1.8" />
    <circle cx="18" cy="18" r="1.8" />
    <path d="m10.2 10.6-3.6-3M13.8 10.7l3.6-2.7M10.4 13.6l-3.2 3.1M13.6 13.6l3 3" />
  </svg>
)

export const AnalyzerIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 19V5M4 19h16" />
    <path d="m7 15 3-4 3 2 4-6" />
  </svg>
)

export const ShieldIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3 4 7v5c0 5.25 3.4 10.15 8 11.25 4.6-1.1 8-6 8-11.25V7l-8-4Z" />
  </svg>
)

export const PolicyIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M9 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6M9 16h4" />
  </svg>
)

export const RiskIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
)

export const KeyIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="15" cy="9" r="4" />
    <path d="m7.5 15.5 4-4M5 18l2.5-2.5M9.5 14 11 15.5" />
  </svg>
)

export const EyeIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const TagIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8 8a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828l-8-8Z" />
    <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
  </svg>
)

export const PlugIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 22v-5M9 8V2M15 8V2M6 8h12a2 2 0 0 1 2 2v1a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5v-1a2 2 0 0 1 2-2Z" />
  </svg>
)

export const DatabaseIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <ellipse cx="12" cy="5" rx="8" ry="3" />
    <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
    <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
  </svg>
)

export const ChartBarIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="12" width="4" height="8" rx="1" />
    <rect x="10" y="8" width="4" height="12" rx="1" />
    <rect x="17" y="4" width="4" height="16" rx="1" />
  </svg>
)

export const WelcomeArt = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <path d="M58 64 78 54l20 10-20 10-20-10Z" fill="#99DCED" />
    <path d="M58 64v20l20 10V74L58 64Z" fill="#00A8CF" />
    <path d="M98 64v20L78 94V74l20-10Z" fill="#047690" />
    <circle cx="52" cy="44" r="14" fill="#E8F7FB" stroke="#00A8CF" strokeWidth="3" />
    <circle cx="52" cy="44" r="6" fill="#CCEDF6" />
    <path d="m62 54 9 9" stroke="#00A8CF" strokeWidth="4" strokeLinecap="round" />
    <circle cx="96" cy="40" r="3" fill="#00A8CF" />
    <circle cx="40" cy="74" r="2.5" fill="#99DCED" />
  </svg>
)

export const JourneyArt = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 140 100" fill="none" aria-hidden="true">
    <path d="M30 64 70 44l40 18-40 20-40-18Z" fill="#E8F7FB" stroke="#99DCED" strokeWidth="2" />
    <path
      d="M44 60c8 6 14-4 22 0s10 8 20 4"
      stroke="#00A8CF"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeDasharray="2 5"
    />
    <circle cx="44" cy="60" r="4" fill="#047690" />
    <path d="M104 44v18" stroke="#00A8CF" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M104 44h10l-3 4 3 4h-10" fill="#00A8CF" />
    <path d="M70 30c4 0 7 3 7 7 0 5-7 11-7 11s-7-6-7-11c0-4 3-7 7-7Z" fill="#00A8CF" />
    <circle cx="70" cy="37" r="2.6" fill="#fff" />
  </svg>
)
