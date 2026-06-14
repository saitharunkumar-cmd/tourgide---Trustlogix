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

export const OverviewIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="4" y="4" width="7" height="16" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </svg>
)

export const ReportIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 20h18" />
    <path d="M6 20v-5M11 20v-10M16 20v-4" />
  </svg>
)

export const McpIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="2.5" />
    <circle cx="5" cy="6" r="2" />
    <circle cx="19" cy="6" r="2" />
    <circle cx="12" cy="20" r="2" />
    <path d="M10.3 10.4 6.6 7.4M13.7 10.4l3.7-3M12 14.5V18" />
  </svg>
)

export const AppsIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="4" y="5" width="16" height="14" rx="2" />
    <path d="M4 9h16M7 7h.01M9.5 7h.01" />
  </svg>
)

export const DomainsIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </svg>
)

export const GearIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.1 5.1l2.1 2.1M16.8 16.8l2.1 2.1M18.9 5.1l-2.1 2.1M7.2 16.8l-2.1 2.1" />
  </svg>
)

export const IntegrationsIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M10.5 13.5a4 4 0 0 1 0-5.6l1.4-1.4a4 4 0 0 1 5.6 5.6L16 13.7" />
    <path d="M13.5 10.5a4 4 0 0 1 0 5.6l-1.4 1.4a4 4 0 0 1-5.6-5.6L8 10.3" />
  </svg>
)

export const AttributeIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
    <circle cx="9" cy="7" r="2" fill="#fff" />
    <circle cx="15" cy="12" r="2" fill="#fff" />
    <circle cx="8" cy="17" r="2" fill="#fff" />
  </svg>
)

export const AuthShieldIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3 5 6v5.5c0 4.2 2.9 7.4 7 8.5 4.1-1.1 7-4.3 7-8.5V6l-7-3Z" />
    <rect x="9.3" y="11" width="5.4" height="4.2" rx="1" />
    <path d="M10.4 11v-1a1.6 1.6 0 0 1 3.2 0v1" />
  </svg>
)

export const ChevronsLeftIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m11 7-5 5 5 5M17 7l-5 5 5 5" />
  </svg>
)

export const BellIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </svg>
)

export const HelpIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.6 9.2a2.5 2.5 0 0 1 4.6 1.3c0 1.6-2.2 2-2.2 3.5M12 17h.01" />
  </svg>
)

export const PieChartIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 12V3M12 12l7.5 4" />
  </svg>
)

export const SnowflakeMark = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="#29B5E8"
    strokeWidth="1.7"
    strokeLinecap="round"
    aria-hidden="true"
  >
    {[0, 60, 120, 180, 240, 300].map((a) => (
      <g key={a} transform={`rotate(${a} 12 12)`}>
        <path d="M12 12V3" />
        <path d="M12 5.5 10 4M12 5.5 14 4" />
      </g>
    ))}
  </svg>
)
