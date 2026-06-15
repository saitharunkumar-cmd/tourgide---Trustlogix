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

export default function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <aside
      className={[
        'flex h-screen shrink-0 flex-col border-r border-tlx-border bg-white transition-[width] duration-300 ease-out',
        collapsed ? 'w-[72px]' : 'w-[232px]',
      ].join(' ')}
    >
      <div className={collapsed ? 'flex justify-center px-2 py-5' : 'px-5 py-5'}>
        {collapsed ? <LogoIcon /> : <Logo />}
      </div>

      <nav className={['flex-1 overflow-y-auto pb-6', collapsed ? 'px-2' : 'px-3'].join(' ')}>
        {NAV.map((group) => (
          <div key={group.group} className="mt-5 first:mt-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-grey-200">
                {group.group}
              </p>
            )}
            {collapsed && <div className="mx-auto mb-1.5 h-px w-8 bg-tlx-border" />}
            <ul className={['space-y-0.5', collapsed ? 'mt-0' : 'mt-1.5'].join(' ')}>
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
                        'flex w-full items-center rounded-[5px] transition-colors',
                        collapsed
                          ? 'justify-center px-0 py-2.5'
                          : 'gap-3 px-3 py-2 text-left text-[13px] font-medium',
                        active
                          ? 'bg-brand-50 text-brand-500'
                          : 'text-grey-300 hover:bg-neutral-100 hover:text-tlx-text',
                      ].join(' ')}
                    >
                      <item.icon
                        className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-brand-500' : 'text-grey-200'}`}
                      />
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
