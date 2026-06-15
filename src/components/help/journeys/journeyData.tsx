import type { SVGProps } from 'react'
import { ShieldPolicyIcon, LockIcon } from '../../icons'
import { BellIcon } from '../../navIcons'

/**
 * Guided Journeys catalog + step content.
 *
 * Status/progress here are the DEFAULTS — live per-user progress is merged on
 * top from localStorage by JourneysContext. Counts are tuned to the design:
 * In Progress (2) · Completed (4) · Not Started (6).
 */

export type JourneyStatus = 'not_started' | 'in_progress' | 'paused' | 'completed'
export type JourneyTone = 'brand' | 'success' | 'warning' | 'danger'

export type JourneyStep = {
  text: string
  target?: string
  interactive?: boolean
  actionHint?: string
  interactAction?: 'open-register'
}

export type JourneyDef = {
  id: string
  title: string
  icon: (p: SVGProps<SVGSVGElement>) => JSX.Element
  tone: JourneyTone
  steps: JourneyStep[]
}

/** Default runtime state for a journey (overridden by stored progress). */
export type JourneyProgress = {
  status: JourneyStatus
  currentStep: number // 0-based index of the next step to show
  progressPct: number
  updatedLabel?: string
}

/** Tailwind classes for each tone's icon chip (all TLX tokens, no purple). */
export const TONE_CHIP: Record<JourneyTone, string> = {
  brand: 'bg-[#E8F7FB] text-[#00A8CF]',
  success: 'bg-emerald-50 text-emerald-500',
  warning: 'bg-amber-50 text-amber-500',
  danger: 'bg-red-50 text-red-500',
}

const steps = (...texts: (string | JourneyStep)[]): JourneyStep[] =>
  texts.map((t) => (typeof t === 'string' ? { text: t } : t))

export const JOURNEYS: JourneyDef[] = [
  {
    id: 'data-sources',
    title: 'Data Sources Tour',
    icon: BookIcon,
    tone: 'brand',
    steps: [
      {
        text: 'Welcome to Data Sources — this is where you manage every platform TrustLogix connects to. From here you can view registered sources, check their security posture, and monitor connectivity status.',
        target: '[data-v1-heading]',
      },
      {
        text: 'Filters let you narrow your view by status, platform, or risk level — essential when your fleet of data sources grows.',
        target: '[data-v1-filter]',
      },
      {
        text: 'Register Data Source connects a new platform like Snowflake, Databricks, or SQL Server. The guided setup walks you through prerequisites and authentication.',
        target: '[data-v1-register]',
        interactive: true,
        actionHint: 'Try it — click to start registration',
        interactAction: 'open-register',
      },
      {
        text: 'Your newly registered data source is now live! Each row is a connected data source. Click any row to explore its details — data risks, monitoring policies, access policies, and more.',
        target: 'table tbody tr:last-child',
        interactive: true,
        actionHint: 'Try it — click the data source row',
      },
    ],
  },
  {
    id: 'overview',
    title: 'Overview Tour',
    icon: BarChartIcon,
    tone: 'brand',
    steps: [
      {
        text: 'The Overview tab gives you a quick snapshot of the security posture for this data source. Six dashboard cards cover AI risks, identity security, dark data, shadow IT, data management, and data access — everything you need at a glance.',
        target: '[data-v1-tab-nav]',
      },
      {
        text: 'AI Related Data Risks tracks risks from AI and machine-learning workloads accessing your data over the last 7 days. Watch for spikes that might indicate unauthorized AI model training or data exfiltration.',
        target: '[data-v1-overview="ai-risks"]',
      },
      {
        text: 'Identity Security shows overly granted roles and identity-related risks. A high number of overly granted roles means users or services have more access than they need — a key vector for data breaches.',
        target: '[data-v1-overview="identity-security"]',
      },
      {
        text: 'Dark Data reveals objects that haven\'t been accessed in 90+ days. Unclassified dark data is a compliance blind spot — classify it or archive it to reduce your attack surface.',
        target: '[data-v1-overview="dark-data"]',
      },
      {
        text: 'Shadow IT Client Tools detects unlisted or unapproved tools connecting to your data source. These unmanaged connections bypass your security policies and create unmonitored access paths.',
        target: '[data-v1-overview="shadow-it"]',
      },
      {
        text: 'Data Management monitors data movement activity — copies, transfers, and transformations. Unusual movement patterns can indicate data exfiltration or misconfigured pipelines.',
        target: '[data-v1-overview="data-management"]',
      },
      {
        text: 'Data Access tracks access activity on classified objects. This helps you understand who is accessing sensitive data, how often, and whether access patterns match expected behavior.',
        target: '[data-v1-overview="data-access"]',
      },
    ],
  },
  {
    id: 'monitoring-policies',
    title: 'Monitoring Policies Tour',
    icon: BellIcon,
    tone: 'brand',
    steps: steps(
      'Monitoring policies watch for risky activity across your data.',
      'Review which policies are enabled for each source.',
      'Tune thresholds to match your risk tolerance.',
      'Route alerts to the right channels and owners.',
      'Mute or snooze noisy policies without losing coverage.',
      "You're monitoring like a pro — keep an eye on alerts.",
    ),
  },
  // Completed (4)
  { id: 'getting-started', title: 'Getting Started Tour', icon: CompassDotIcon, tone: 'brand', steps: steps('a', 'b', 'c', 'd', 'e') },
  { id: 'user-management', title: 'User Management Tour', icon: UsersDotIcon, tone: 'brand', steps: steps('a', 'b', 'c', 'd') },
  { id: 'integrations', title: 'Integrations Tour', icon: PlugIcon, tone: 'brand', steps: steps('a', 'b', 'c', 'd', 'e') },
  { id: 'security-overview', title: 'Security Overview Tour', icon: ShieldPolicyIcon, tone: 'brand', steps: steps('a', 'b', 'c', 'd', 'e', 'f') },
  // Not started (6)
  {
    id: 'access-policies',
    title: 'Access Policies Tour',
    icon: ShieldPolicyIcon,
    tone: 'success',
    steps: steps(
      'Access policies control who can reach your data.',
      'See policies grouped by data source.',
      'Create a policy from a reusable template.',
      'Preview the effective access before deploying.',
      'Deploy with confidence and audit changes later.',
    ),
  },
  {
    id: 'data-classification',
    title: 'Data Classification Tour',
    icon: SitemapIcon,
    tone: 'warning',
    steps: steps(
      'Classification labels sensitive data automatically.',
      'Review detected categories (PII, PCI, HIPAA…).',
      'Adjust classifiers for your environment.',
      'Map labels to handling requirements.',
      'Track classification coverage over time.',
      'You can now find sensitive data fast.',
    ),
  },
  {
    id: 'reports-dashboards',
    title: 'Reports & Dashboards Tour',
    icon: BarChartIcon,
    tone: 'danger',
    steps: steps(
      'Dashboards summarize your security posture.',
      'Drill into a metric to see the details.',
      'Filter by source, domain, or time range.',
      'Schedule reports for stakeholders.',
      'Export findings for audits.',
      'Pin the views you check most.',
      'Reporting mastered — share the insights.',
    ),
  },
  {
    id: 'ai-governance',
    title: 'AI Governance Tour',
    icon: LockIcon,
    tone: 'brand',
    steps: steps(
      'Govern how AI agents access your data.',
      'Review connected MCP services and agents.',
      'Apply guardrails to sensitive operations.',
      'Monitor agent activity for anomalies.',
      'Set approval flows for risky actions.',
      'Your AI usage is now governed.',
    ),
  },
  { id: 'applications', title: 'Applications Tour', icon: AppsDotIcon, tone: 'brand', steps: steps('a', 'b', 'c', 'd', 'e') },
  { id: 'data-domains', title: 'Data Domains Tour', icon: SitemapIcon, tone: 'brand', steps: steps('a', 'b', 'c', 'd') },
]

/** Seed progress for the journeys the design shows mid-flight. */
export const DEFAULT_PROGRESS: Record<string, Partial<JourneyProgress>> = {
  'data-sources': { status: 'paused', currentStep: 1, progressPct: 25, updatedLabel: 'Paused 12 min ago' },
  'monitoring-policies': { status: 'in_progress', currentStep: 0, progressPct: 15, updatedLabel: 'Paused 45 min ago' },
  'getting-started': { status: 'completed', progressPct: 100 },
  'user-management': { status: 'completed', progressPct: 100 },
  integrations: { status: 'completed', progressPct: 100 },
  'security-overview': { status: 'completed', progressPct: 100 },
}

/* ------------------------------ local icons ------------------------------ */

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
}
type P = SVGProps<SVGSVGElement>

function BookIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 6.5C10.5 5 8.5 4.5 5 4.8v12.4c3.5-.3 5.5.2 7 1.8 1.5-1.6 3.5-2.1 7-1.8V4.8c-3.5-.3-5.5.2-7 1.7Z" />
      <path d="M12 6.5v12.5" />
    </svg>
  )
}
function SitemapIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <rect x="9.5" y="3.5" width="5" height="4" rx="1" />
      <rect x="3.5" y="16.5" width="5" height="4" rx="1" />
      <rect x="15.5" y="16.5" width="5" height="4" rx="1" />
      <path d="M12 7.5v4M6 16.5v-2.5h12v2.5M12 11.5v2.5" />
    </svg>
  )
}
function BarChartIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M4 20V4M4 20h16" />
      <rect x="7.5" y="12" width="2.6" height="5" rx="0.6" fill="currentColor" stroke="none" />
      <rect x="12" y="8.5" width="2.6" height="8.5" rx="0.6" fill="currentColor" stroke="none" />
      <rect x="16.5" y="13.5" width="2.6" height="3.5" rx="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}
function CompassDotIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </svg>
  )
}
function UsersDotIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.8 18.5c0-2.8 2.3-4.7 5.2-4.7s5.2 1.9 5.2 4.7" />
      <path d="M16 5.4a3 3 0 0 1 0 5.7M17.4 14c2 .5 3.1 2.3 3.1 4.5" />
    </svg>
  )
}
function PlugIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M10.5 13.5a4 4 0 0 1 0-5.6l1.4-1.4a4 4 0 0 1 5.6 5.6L16 13.7" />
      <path d="M13.5 10.5a4 4 0 0 1 0 5.6l-1.4 1.4a4 4 0 0 1-5.6-5.6L8 10.3" />
    </svg>
  )
}
function AppsDotIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M4 9h16M7 7h.01M9.5 7h.01" />
    </svg>
  )
}
