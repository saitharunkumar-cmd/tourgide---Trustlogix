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

export default function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <aside className="flex h-screen w-[232px] shrink-0 flex-col border-r border-tlx-border bg-white">
      <div className="px-5 py-5">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        {NAV.map((group) => (
          <div key={group.group} className="mt-5 first:mt-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-grey-200">
              {group.group}
            </p>
            <ul className="mt-1.5 space-y-0.5">
              {group.items.map((item) => {
                const active = item.path ? pathname === item.path : false
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => item.path && navigate(item.path)}
                      aria-current={active ? 'page' : undefined}
                      className={[
                        'flex w-full items-center gap-3 rounded-[5px] px-3 py-2 text-left text-[13px] font-medium transition-colors',
                        active
                          ? 'bg-brand-50 text-brand-500'
                          : 'text-grey-300 hover:bg-neutral-100 hover:text-tlx-text',
                      ].join(' ')}
                    >
                      <item.icon
                        className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-brand-500' : 'text-grey-200'}`}
                      />
                      <span className="truncate">{item.label}</span>
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
