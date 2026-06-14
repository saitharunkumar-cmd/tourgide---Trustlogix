import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import { SnowflakeMark } from '../components/navIcons'
import { useOnboarding } from '../onboarding/OnboardingContext'
import { useJourneyIntro } from '../v4/JourneyIntroContext'
import { DATASOURCE_LOGOS } from '../components/datasourceLogos'
import { readTourVersion, writeTourVersion, type TourVersion } from '../missionBoard/tourVersion'

type DataSource = {
  id: string
  name: string
  logo: ReactNode
  accessPolicy: number | null
  monitoringPolicy: number | null
  dataRisk: number | null
  status: 'Active' | 'Missing info'
}

const LOGO_KEY: Record<string, string> = {
  Aws: 'AWS', Mysql: 'MySQL', Postgresql: 'PostgreSQL',
  Sqlserver: 'SQL Server', Dynamodb: 'DynamoDB', Powerbi: 'Power BI',
}

export default function DataSources() {
  const { datasource } = useOnboarding()
  const { registeredSources, phase, subStep } = useJourneyIntro()
  const prevCountRef = useRef(registeredSources.length)
  const [rippleId, setRippleId] = useState<string | null>(null)

  useEffect(() => {
    if (registeredSources.length > prevCountRef.current) {
      const newest = registeredSources[registeredSources.length - 1]
      setRippleId(newest.id)
      const timer = setTimeout(() => setRippleId(null), 3000)
      prevCountRef.current = registeredSources.length
      return () => clearTimeout(timer)
    }
    prevCountRef.current = registeredSources.length
  }, [registeredSources])
  const name = `${datasource ?? 'Snowflake'} Production`

  const sources: DataSource[] = [
    {
      id: 'snowflake-production',
      name,
      logo: <SnowflakeMark className="h-5 w-5" />,
      accessPolicy: 0,
      monitoringPolicy: 0,
      dataRisk: 0,
      status: 'Active',
    },
    ...registeredSources.map((rs) => {
      const logoKey = LOGO_KEY[rs.platform] ?? rs.platform
      const logoNode = DATASOURCE_LOGOS[logoKey]
      return {
        id: rs.id,
        name: rs.name,
        logo: logoNode ? <span className="h-5 w-5 [&>svg]:h-5 [&>svg]:w-5">{logoNode}</span> : <SnowflakeMark className="h-5 w-5" />,
        accessPolicy: 0,
        monitoringPolicy: 0,
        dataRisk: 0,
        status: rs.status as 'Active' | 'Missing info',
      }
    }),
  ]

  return (
    <DashboardLayout>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[13px] text-grey-300">
        <HomeIcon className="h-4 w-4 text-brand-500" />
        <ChevronRight className="h-3 w-3 text-grey-100" />
        <span className="font-medium text-tlx-text">Data Sources</span>
      </nav>

      {/* Header */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div data-v1-heading>
          <h1 className="text-tlx-3xl font-bold text-tlx-text">Data Sources</h1>
          <p className="mt-1 text-[13px] text-grey-300">
            View registered data sources, make configuration changes and verify connectivity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            data-v1-filter
            className="inline-flex items-center gap-2 rounded-[5px] border border-tlx-border bg-white px-4 py-2 text-[13px] font-semibold text-grey-300 transition-colors hover:border-[#00A8CF] hover:text-[#00A8CF]"
          >
            <FilterIcon className="h-4 w-4" />
            Filters
          </button>
          <button
            type="button"
            data-v1-register
            className={[
              'inline-flex items-center gap-2 rounded-[5px] bg-brand-500 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#66CAE3]',
              phase === 'journey' && subStep === 'instruction' ? 'animate-ripple-ring' : '',
            ].join(' ')}
          >
            <PlusIcon className="h-4 w-4" />
            Register Data Source
          </button>
          <button
            type="button"
            aria-label="Grid view"
            className="flex h-9 w-9 items-center justify-center rounded-[5px] border border-tlx-border bg-white text-grey-200 transition-colors hover:bg-neutral-100 hover:text-tlx-text"
          >
            <GridIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Column settings"
            className="flex h-9 w-9 items-center justify-center rounded-[5px] border border-tlx-border bg-white text-grey-200 transition-colors hover:bg-neutral-100 hover:text-tlx-text"
          >
            <ColumnsIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <TourVersionBar />

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-[10px] border border-tlx-border bg-white shadow-tlx-sm">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-tlx-border bg-neutral-100 text-left">
              <th className="px-5 py-3.5 text-[13px] font-semibold text-tlx-text">Data Source Name</th>
              <th className="px-5 py-3.5 text-[13px] font-semibold text-tlx-text">Access Policy</th>
              <th className="px-5 py-3.5 text-[13px] font-semibold text-tlx-text">Monitoring Policy</th>
              <th className="px-5 py-3.5 text-[13px] font-semibold text-tlx-text">Data Risk</th>
              <th className="px-5 py-3.5 text-[13px] font-semibold text-tlx-text">Status</th>
              <th className="w-12 px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr
                key={s.name}
                className={[
                  'border-b border-tlx-border last:border-0 transition-colors hover:bg-neutral-50',
                  rippleId === s.id ? 'bg-brand-50' : '',
                ].join(' ')}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] border border-[#E4E7EB] bg-[#FAFBFD] text-[#B8BFC9]">
                      {s.logo}
                    </span>
                    <Link
                      to={`/data-sources/${s.id}`}
                      className="font-medium text-brand-500 hover:text-brand-600 hover:underline"
                    >
                      {s.name}
                    </Link>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <CountCell value={s.accessPolicy} />
                </td>
                <td className="px-5 py-3.5">
                  <CountCell value={s.monitoringPolicy} />
                </td>
                <td className="px-5 py-3.5">
                  <CountCell value={s.dataRisk} />
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={s.status} />
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    type="button"
                    aria-label="Row actions"
                    className="flex h-7 w-7 items-center justify-center rounded-[5px] text-grey-200 transition-colors hover:bg-neutral-100 hover:text-tlx-text"
                  >
                    <DotsIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}

function TourVersionBar() {
  const [version, setVersion] = useState<TourVersion>(() => readTourVersion())

  const pick = (v: TourVersion) => {
    setVersion(v)
    writeTourVersion(v)
  }

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-tlx-border bg-tlx-surface px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <CompassIcon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-tlx-text">Guided onboarding</p>
          <p className="text-xs text-tlx-secondary">
            {version === 'v4'
              ? 'Journey Intro — contextual onboarding card'
              : 'Classic tour — step-by-step walkthrough'}
            <span className="text-tlx-muted"> · start it from Help &amp; Guidance</span>
          </p>
        </div>
      </div>

      <div className="inline-flex rounded-lg border border-tlx-border bg-white p-0.5">
        {(['v1', 'v4'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => pick(v)}
            title={v === 'v1' ? 'Classic Guided Journey' : 'Journey Introduction card'}
            aria-pressed={version === v}
            className={[
              'rounded-md px-3 py-1 text-xs font-bold uppercase tracking-wide transition-colors',
              version === v ? 'bg-brand-500 text-white' : 'text-tlx-secondary hover:text-tlx-text',
            ].join(' ')}
          >
            {v === 'v4' ? 'v2' : v}
          </button>
        ))}
      </div>
    </div>
  )
}

const CompassIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
  </svg>
)

function CountCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-grey-100">–</span>
  if (value === 0) return <span className="font-medium text-grey-200">0</span>
  return <span className="font-semibold text-brand-500">{value}</span>
}

function StatusBadge({ status }: { status: 'Active' | 'Missing info' }) {
  const styles =
    status === 'Active'
      ? 'bg-success text-white'
      : 'bg-warning text-white'
  return (
    <span className={`inline-flex rounded-tlx-sm px-2.5 py-1 text-[11px] font-semibold ${styles}`}>
      {status}
    </span>
  )
}

type IconProps = React.SVGProps<SVGSVGElement>
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
}

const HomeIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 11 12 4l8 7" />
    <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
  </svg>
)
const ChevronRight = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m9 6 6 6-6 6" />
  </svg>
)
const FilterIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 5h16l-6 7v5l-4 2v-7L4 5Z" />
  </svg>
)
const PlusIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)
const GridIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </svg>
)
const ColumnsIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M10 4v16M14 4v16" />
  </svg>
)
const DotsIcon = (p: IconProps) => (
  <svg {...p} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="12" cy="19" r="1.6" />
  </svg>
)
