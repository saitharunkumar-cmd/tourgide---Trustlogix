import type { ReactNode } from 'react'

type DatasourceCardProps = {
  name: string
  logo: ReactNode
  badge?: string
  selected: boolean
  onSelect: () => void
}

export default function DatasourceCard({ name, logo, selected, onSelect }: DatasourceCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        'relative flex h-[120px] w-full flex-col items-center justify-center gap-[12px] rounded-[5px] border bg-white p-[1px]',
        'transition-all duration-200 ease-out',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00A8CF] focus-visible:outline-offset-2',
        selected
          ? 'border-[2px] border-[#00A8CF]'
          : 'border-[#E4E7EB] hover:border-[#20293A] hover:shadow-[0_2px_4px_rgba(0,0,0,0.06)]',
      ].join(' ')}
    >
      {selected && (
        <span
          aria-hidden="true"
          className="absolute -right-[6px] -top-[6px] flex h-4 w-4 items-center justify-center rounded-full bg-[#00A8CF]"
        >
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M1.5 5 4 7.5 8.5 2.5" />
          </svg>
        </span>
      )}
      <span className="flex h-[48px] w-[48px] items-center justify-center">
        <span className="flex h-[44px] w-[44px] items-center justify-center [&>svg]:h-[44px] [&>svg]:w-[44px]">
          {logo}
        </span>
      </span>
      <span className="font-['Poppins',sans-serif] text-center text-[14px] font-semibold leading-[20px] text-[#20293A]">
        {name}
      </span>
    </button>
  )
}
