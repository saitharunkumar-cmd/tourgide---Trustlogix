import { CheckIcon, AlertIcon, CloseIcon } from './icons'

export type ToastVariant = 'success' | 'error'

export type ToastItem = {
  id: number
  title: string
  description?: string
  variant: ToastVariant
}

export default function Toast({
  toast,
  onClose,
}: {
  toast: ToastItem
  onClose: () => void
}) {
  const isError = toast.variant === 'error'

  return (
    <div className="pointer-events-auto flex animate-fade-in items-start gap-3 rounded-[10px] border border-tlx-border bg-white p-4 shadow-lg">
      <span
        className={[
          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
          isError ? 'bg-danger-50 text-danger' : 'bg-success-50 text-success',
        ].join(' ')}
      >
        {isError ? <AlertIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-tlx-text">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-sm text-tlx-secondary">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="text-tlx-muted transition-colors hover:text-tlx-text"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
