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

  // Always force V2 mode for client demos — banner is hidden so this locks the version
  useEffect(() => { writeTourVersion('v4') }, [])

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

  const total = sources.length

  return (
    <DashboardLayout>
      {/* Breadcrumb block — padding 30/50/20/50 */}
      <div className="px-[50px] pb-[20px] pt-[30px]">
        <nav className="flex items-center gap-[10px]">
          <button type="button" aria-label="Home" className="text-[#00A8CF]">
            <HomeIcon className="h-4 w-4" />
          </button>
          <ChevronRight className="h-4 w-4 text-[#20293A] opacity-60" />
          <span className="text-[14px] font-medium leading-[21px] text-[#20293A]">Data Sources</span>
        </nav>
      </div>

      {/* Content — padding 20/50/30/50 */}
      <div className="px-[50px] pb-[30px] pt-[20px]">
        {/* Page header row */}
        <div className="flex w-full items-center justify-between">
          <div data-v1-heading className="flex flex-col gap-[9.4px]">
            <h1 className="text-[20px] font-bold leading-[20px] text-[#20293A]">Data Sources</h1>
            <p className="text-[14px] font-medium leading-[14px] text-[#617085]">
              View registered data sources, make configuration changes and verify
              <br />
              connectivity.
            </p>
          </div>

          <div className="flex items-center gap-[15px]">
            <button
              type="button"
              data-v1-filter
              className="group flex min-h-[42px] w-[145px] items-center justify-center gap-[5px] rounded-[5px] border border-[#20293A] px-[10.8px] py-[11.9px] text-[14px] leading-[18.2px] text-[#20293A] transition-colors hover:border-[#00A8CF] hover:text-[#00A8CF]"
            >
              <FilterIcon className="h-[14px] w-[14px] text-[#617085] transition-colors group-hover:text-[#00A8CF]" />
              Filters
            </button>
            <button
              type="button"
              data-v1-register
              className={[
                'flex min-h-[42px] items-center gap-[5px] rounded-[5px] border border-[#00A8CF] bg-[#00A8CF] px-[10.8px] text-[14px] leading-[18.2px] text-white transition-colors hover:border-[#0094B5] hover:bg-[#0094B5]',
                phase === 'journey' && subStep === 'instruction' ? 'animate-ripple-ring' : '',
              ].join(' ')}
            >
              <PlusIcon className="h-4 w-4" />
              Register Data Source
            </button>
            <button
              type="button"
              aria-label="Grid view"
              className="group flex min-h-[42px] items-center justify-center rounded-[5px] border border-[#20293A] p-[10.8px] transition-colors hover:border-[#00A8CF]"
            >
              <GridIcon className="h-5 w-5 text-[#617085] transition-colors group-hover:text-[#00A8CF]" />
            </button>
            <button
              type="button"
              aria-label="Layout"
              className="group flex min-h-[42px] items-center justify-center rounded-[5px] border border-[#20293A] p-[10.8px] transition-colors hover:border-[#00A8CF]"
            >
              <SplitIcon className="h-5 w-5 text-[#617085] transition-colors group-hover:text-[#00A8CF]" />
            </button>
          </div>
        </div>

        {/* Table card */}
        <div className="mt-[19.8px] w-full overflow-x-auto rounded-[6px] border border-[#E4E7EB] bg-white p-px">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col style={{ width: '40%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '44px' }} />
            </colgroup>
            <thead>
              <tr className="h-[49px] bg-[#FAFBFD]">
                <th className="px-3 text-left align-middle text-[14px] font-bold leading-[20px] text-[#20293A]">
                  Data Source Name
                </th>
                <th className="border-l-[0.8px] border-[#B4BDBD] px-3 text-left align-middle text-[14px] font-bold leading-[20px] text-[#20293A]">
                  Access Policy
                </th>
                <th className="border-l-[0.8px] border-[#B4BDBD] px-3 text-left align-middle text-[14px] font-bold leading-[20px] text-[#20293A]">
                  Monitoring Policy
                </th>
                <th className="border-l-[0.8px] border-[#B4BDBD] px-3 text-left align-middle text-[14px] font-bold leading-[20px] text-[#20293A]">
                  Data Risk
                </th>
                <th className="border-l-[0.8px] border-[#B4BDBD] px-3 text-left align-middle text-[14px] font-bold leading-[20px] text-[#20293A]">
                  Status
                </th>
                <th className="border-l-[0.8px] border-[#B4BDBD]" aria-hidden="true" />
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr
                  key={s.name}
                  className={['border-t-[0.8px] border-[#E4E7EB] transition-colors', rippleId === s.id ? 'bg-brand-50' : ''].join(' ')}
                >
                  <td className="px-[20px] pb-[21px] pt-[21.8px]">
                    <div className="flex items-start gap-[10px]">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-5 [&>svg]:w-5">
                        {s.logo}
                      </span>
                      <Link
                        to={`/data-sources/${s.id}`}
                        className="font-['Poppins',sans-serif] text-[14px] font-normal leading-[19.5px] text-[#20293A] hover:underline"
                      >
                        {s.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-[20px] pb-[21px] pt-[21.8px] text-center">
                    <CountCell value={s.accessPolicy} />
                  </td>
                  <td className="px-[20px] pb-[21px] pt-[21.8px] text-center">
                    <CountCell value={s.monitoringPolicy} />
                  </td>
                  <td className="px-[20px] pb-[21px] pt-[21.8px] text-center">
                    <CountCell value={s.dataRisk} />
                  </td>
                  <td className="px-[20px] pb-[16px] pt-[16.8px]">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="border-x-[0.8px] border-[#E4E7EB] p-[1.8px] shadow-[-20px_15px_20px_0_rgba(0,0,0,0.03)]">
                    <button
                      type="button"
                      aria-label="Row actions"
                      className="mx-auto flex h-[60px] w-[41.75px] items-center justify-center rounded-[5px] text-[#20293A] transition-colors hover:bg-neutral-100"
                    >
                      <DotsIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination total={total} />
        </div>
      </div>
    </DashboardLayout>
  )
}

function Pagination({ total }: { total: number }) {
  const navBtn = 'flex min-w-[30px] items-center justify-center rounded-[5px] border border-transparent px-[4.8px] py-[10px] text-[#20293A] opacity-60'
  return (
    <div className="flex items-center gap-[14px] border-t-[0.8px] border-[#E4E7EB] bg-[#FAFBFD] px-2 pb-2 pt-[8.8px]">
      {/* Left — page navigation */}
      <div className="flex items-center">
        <button type="button" aria-label="First page" aria-disabled="true" className={navBtn}>
          <span className="flex h-5 w-5 items-center justify-center"><DoubleChevronLeft className="h-4 w-4" /></span>
        </button>
        <button type="button" aria-label="Previous page" aria-disabled="true" className={navBtn}>
          <span className="flex h-5 w-5 items-center justify-center"><ChevronLeft className="h-4 w-4" /></span>
        </button>

        <div className="flex items-center gap-[6.8px] px-[14px]">
          <span className="text-[14px] leading-[20px] text-[#20293A]">Page</span>
          <input
            type="text"
            defaultValue="1"
            aria-label="Page number"
            className="min-h-[40px] w-[70.4px] rounded-[5px] border border-[#20293A] bg-white px-2 py-[9.2px] text-[14px] leading-[20px] text-[#20293A] focus:outline-none"
          />
          <span className="text-[14px] leading-[20px] text-[#20293A]">of 1</span>
        </div>

        <button type="button" aria-label="Next page" aria-disabled="true" className={navBtn}>
          <span className="flex h-5 w-5 items-center justify-center"><ChevronRight className="h-4 w-4" /></span>
        </button>
        <button type="button" aria-label="Last page" aria-disabled="true" className={navBtn}>
          <span className="flex h-5 w-5 items-center justify-center"><DoubleChevronRight className="h-4 w-4" /></span>
        </button>
      </div>

      {/* Center — items per page */}
      <div className="flex items-center gap-[6.84px]">
        <div className="flex min-h-[40px] min-w-[70px] items-center rounded-[5px] border border-[#20293A] bg-white">
          <span className="px-2 pr-[5.09px] py-1 text-[14px] leading-[20px] text-[#6B6B6B]">50</span>
          <span className="flex w-[28px] items-center justify-center self-stretch border-l-[0.8px] border-transparent text-[#20293A]">
            <ChevronDown className="h-4 w-4" />
          </span>
        </div>
        <span className="text-[14px] leading-[20px] text-[#20293A]">items per page</span>
      </div>

      {/* Right — row count */}
      <div className="flex-1 text-right text-[14px] leading-[20px] text-[#20293A]">
        1 - {total} of {total} items
      </div>
    </div>
  )
}

function TourVersionBar() {
  const [version, setVersion] = useState<TourVersion>(() => readTourVersion())

  const pick = (v: TourVersion) => {
    setVersion(v)
    writeTourVersion(v)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[6px] border border-tlx-border bg-tlx-surface px-4 py-3">
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
        {(['v4'] as const).map((v) => (
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
  const text = value === null ? '—' : String(value)
  return (
    <span className="text-[14px] font-medium leading-[19.32px] tracking-[0.26px] text-[#00A8CF]">
      {text}
    </span>
  )
}

function StatusBadge({ status }: { status: 'Active' | 'Missing info' }) {
  const isActive = status === 'Active'
  return (
    <span
      className={[
        'inline-flex min-w-[100px] items-center justify-center rounded-[3px] px-[30.81px] pb-[5.86px] pt-[6.4px] text-[12px] font-medium leading-[17.14px] text-white',
        isActive ? 'bg-[#41B57F]' : 'bg-[#FF8F6B]',
      ].join(' ')}
    >
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
const SplitIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M10 4v16" />
  </svg>
)
const ChevronLeft = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m15 6-6 6 6 6" />
  </svg>
)
const DoubleChevronLeft = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m17 6-6 6 6 6M11 6l-6 6 6 6" />
  </svg>
)
const DoubleChevronRight = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m7 6 6 6-6 6M13 6l6 6-6 6" />
  </svg>
)
const ChevronDown = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)
const DotsIcon = (p: IconProps) => (
  <svg {...p} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="12" cy="19" r="1.6" />
  </svg>
)
