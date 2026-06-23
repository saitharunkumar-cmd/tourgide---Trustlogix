import type { ComponentType, SVGProps } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Logo from '../Logo'
import { RobotIcon, ShieldPolicyIcon, DatabaseIcon, UsersIcon } from '../icons'
import {
  OverviewIcon,
  ReportIcon,
  McpIcon,
  AppsIcon,
  DomainsIcon,
  GearIcon,
  IntegrationsIcon,
  AttributeIcon,
  AuthShieldIcon,
  ChevronsLeftIcon,
} from '../navIcons'

type Icon = ComponentType<SVGProps<SVGSVGElement>>
type NavItem = { label: string; icon: Icon; path?: string }
type NavGroup = { group: string; items: NavItem[] }

const NAV: NavGroup[] = [
  {
    group: 'Trust DSPM',
    items: [
      { label: 'Security Overview', icon: OverviewIcon, path: '/security-overview' },
      { label: 'Reports', icon: ReportIcon },
    ],
  },
  {
    group: 'Trust AI',
    items: [
      { label: 'MCP Services', icon: McpIcon },
      { label: 'AI Agents', icon: RobotIcon },
      { label: 'Guardian Agent', icon: ShieldPolicyIcon },
    ],
  },
  {
    group: 'Trust Access',
    items: [
      { label: 'Data Sources', icon: DatabaseIcon, path: '/data-sources' },
      { label: 'Applications', icon: AppsIcon },
      { label: 'Data Domains', icon: DomainsIcon },
    ],
  },
  {
    group: 'Settings',
    items: [
      { label: 'Configurations', icon: GearIcon },
      { label: 'Integrations', icon: IntegrationsIcon },
      { label: 'Attribute Management', icon: AttributeIcon },
    ],
  },
  {
    group: 'Security',
    items: [
      { label: 'Users', icon: UsersIcon },
      { label: 'Authentication Security', icon: AuthShieldIcon },
    ],
  },
]

export default function Sidebar({
  collapsed = false,
  onToggle,
}: {
  collapsed?: boolean
  onToggle?: () => void
}) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <aside
      className={[
        'relative flex h-screen shrink-0 flex-col border-r border-tlx-border bg-white transition-[width] duration-300 ease-out',
        collapsed ? 'w-[72px]' : 'w-[232px] min-[1440px]:w-[270px]',
      ].join(' ')}
    >
      {/* Collapse handle — overhangs the sidebar's right edge */}
      <button
        type="button"
        onClick={onToggle}
        aria-label="Toggle sidebar"
        className="absolute top-4 -right-3 z-20 flex h-7 w-7 items-center justify-center rounded-[5px] border border-tlx-border bg-white text-[#617085] shadow-sm transition-colors hover:bg-neutral-100 hover:text-[#20293A]"
      >
        <ChevronsLeftIcon
          className={['h-4 w-4 transition-transform duration-300', collapsed ? 'rotate-180' : ''].join(' ')}
        />
      </button>
      <div
        className={[
          'flex min-h-[64px] items-center py-[17px]',
          collapsed ? 'justify-center px-2' : 'px-3',
        ].join(' ')}
      >
        {collapsed ? <LogoIcon /> : <Logo />}
      </div>

      <nav className={['flex-1 space-y-1 overflow-y-auto py-1', collapsed ? 'px-2' : 'px-2'].join(' ')}>
        {NAV.map((group) => (
          <div key={group.group}>
            {!collapsed ? (
              <p className="px-4 pb-1.5 pt-4 text-[12px] font-medium uppercase leading-[12px] tracking-[0.5px] text-[#617085]">
                {group.group}
              </p>
            ) : (
              <div className="mx-auto my-1.5 h-px w-8 bg-tlx-border" />
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.path ? pathname === item.path : false
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => item.path && navigate(item.path)}
                      aria-current={active ? 'page' : undefined}
                      title={collapsed ? item.label : undefined}
                      className={[
                        'flex w-full items-center rounded-[6px] transition-colors',
                        collapsed
                          ? 'justify-center px-0 py-2.5'
                          : 'gap-3 px-4 py-2 text-left text-[14px] font-medium leading-[21px]',
                        active
                          ? 'bg-[#E8F7FB] text-[#00A8CF]'
                          : 'text-[#20293A] hover:bg-[rgba(32,41,58,0.04)]',
                      ].join(' ')}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                        <item.icon
                          className={`h-5 w-5 ${active ? 'text-[#00A8CF]' : 'text-[#20293A]'}`}
                        />
                      </span>
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}

const RAMP = ['#6FBE46', '#43B86C', '#28B091', '#1EAEAB', '#16A9BD', '#0AA9C8', '#00A8CF']

function LogoIcon() {
  const cells = [0, 1, 2, 3]
  return (
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
  )
}
