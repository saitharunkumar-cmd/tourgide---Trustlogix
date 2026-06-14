import type { ReactNode } from 'react'

type DatasourceCardProps = {
  name: string
  logo: ReactNode
  badge?: string
  selected: boolean
  onSelect: () => void
}

export default function DatasourceCard({
  name,
  logo,
  badge,
  selected,
  onSelect,
}: DatasourceCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        'group relative flex h-[120px] w-full flex-col items-center justify-center gap-3 rounded-[5px] border bg-white',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        selected
          ? 'border-brand-500 ring-4 ring-brand-100'
          : 'border-tlx-border hover:border-brand-200 hover:shadow-md',
      ].join(' ')}
    >
      <span className="flex h-12 w-12 items-center justify-center">{logo}</span>
      <span className="text-sm font-semibold text-tlx-text">{name}</span>
      {badge && (
        <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600">
          {badge}
        </span>
      )}
    </button>
  )
}
