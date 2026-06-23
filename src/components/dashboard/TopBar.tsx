import { ClockIcon } from '../icons'
import { BellIcon, HelpIcon } from '../navIcons'

export default function TopBar() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-end border-b border-[#E4E7EB] bg-white pr-[50px]">
      {/* UTC pill */}
      <button
        type="button"
        className="flex items-center gap-[5px] rounded-[3px] border border-transparent px-[10.8px] py-[6.8px] transition-colors hover:border-[#E4E7EB] hover:bg-[#F3F4F6]"
      >
        <ClockIcon className="h-6 w-6 text-[#20293A]" />
        <span className="text-[14px] leading-none text-[#20293A]">UTC</span>
      </button>

      {/* Notifications */}
      <button
        type="button"
        aria-label="Notifications"
        className="ml-[10px] flex h-9 w-9 items-center justify-center rounded-[5px] text-[#20293A] transition-colors hover:bg-[#F3F4F6]"
      >
        <BellIcon className="h-6 w-6" />
      </button>

      {/* Help / Info */}
      <button
        type="button"
        aria-label="Help"
        onClick={() => {
          window.dispatchEvent(new CustomEvent('tlx:open-help-drawer'))
        }}
        className="mx-5 flex h-9 w-9 items-center justify-center rounded-[5px] text-[#20293A] transition-colors hover:bg-[#F3F4F6]"
      >
        <HelpIcon className="h-5 w-5" />
      </button>

      {/* Account pill */}
      <div className="flex items-center gap-[10px] rounded-[50px] border border-[#20293A] py-[5.8px] pl-[15.8px] pr-[5.8px]">
        <span className="text-[14px] font-bold leading-none text-[#20293A]">GigBank</span>
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#00A8CF] text-[14px] font-medium leading-none text-white">
          P
        </span>
      </div>
    </header>
  )
}
