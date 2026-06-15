import { ClockIcon } from '../icons'
import { ChevronsLeftIcon, BellIcon, HelpIcon } from '../navIcons'

export default function TopBar({ collapsed, onToggleSidebar }: { collapsed: boolean; onToggleSidebar: () => void }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-tlx-border bg-white px-5">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="flex h-8 w-8 items-center justify-center rounded-[5px] border border-tlx-border text-grey-200 transition-colors hover:bg-neutral-100 hover:text-tlx-text"
      >
        <ChevronsLeftIcon
          className={[
            'h-4.5 w-4.5 transition-transform duration-300',
            collapsed ? 'rotate-180' : '',
          ].join(' ')}
        />
      </button>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[13px] font-medium text-grey-300">
          <ClockIcon className="h-4 w-4" />
          UTC
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-[5px] text-grey-200 transition-colors hover:bg-neutral-100 hover:text-tlx-text"
        >
          <BellIcon className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-danger" />
        </button>

        <button
          type="button"
          aria-label="Help"
          onClick={() => {
            const fab = document.querySelector<HTMLButtonElement>('button[aria-label="Help and Guidance"]')
            fab?.click()
          }}
          className="flex h-8 w-8 items-center justify-center rounded-[5px] text-grey-200 transition-colors hover:bg-neutral-100 hover:text-tlx-text"
        >
          <HelpIcon className="h-[18px] w-[18px]" />
        </button>

        <div className="flex items-center gap-2 rounded-full border border-tlx-border py-1 pl-3.5 pr-1">
          <span className="text-[13px] font-semibold text-tlx-text">GigBank</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
            P
          </span>
        </div>
      </div>
    </header>
  )
}
