import { forwardRef, useEffect, useRef, useState, useId } from 'react'

export interface FloatingLabelInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type' | 'prefix'> {
  label: string
  value: string
  onChange: (next: string) => void
  type?: 'text' | 'password' | 'email' | 'url' | 'search'
  /** Shown inside the input only when the label is in the floated (active) position */
  placeholder?: string
  /** Arbitrary content below the input (icon + text, links, etc.) */
  helperText?: React.ReactNode
  /** When set, switches to error state — displays this message as helper text in red */
  error?: string
  /** Turns the border cyan — use for "required but still empty" attention nudge */
  highlightBorder?: boolean
  wrapperClassName?: string
  inputClassName?: string
  /** ReactNode rendered absolutely inside the wrapper (caller owns positioning) */
  suffix?: React.ReactNode
  /** Override the input's right padding (px) when a suffix occupies space */
  inputPaddingRight?: number
}

const FloatingLabelInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  (
    {
      id: idProp,
      label,
      value,
      onChange,
      type = 'text',
      placeholder,
      helperText,
      error,
      highlightBorder,
      disabled,
      readOnly,
      required,
      wrapperClassName,
      inputClassName,
      suffix,
      inputPaddingRight,
      onFocus,
      onBlur,
      ...rest
    },
    forwardedRef,
  ) => {
    const generatedId = useId()
    const id = idProp ?? generatedId
    const helperId = `${id}-helper`
    const localRef = useRef<HTMLInputElement>(null)

    const [isFocused, setIsFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [autofilled, setAutofilled] = useState(false)

    const isActive = isFocused || value.length > 0 || autofilled
    const hasError = !!error
    const isPassword = type === 'password'

    // Detect browser autofill via CSS animation trick (see index.css for keyframes)
    useEffect(() => {
      const input =
        (forwardedRef as React.RefObject<HTMLInputElement> | null)?.current ??
        localRef.current
      if (!input) return
      const handle = (e: AnimationEvent) => {
        if (e.animationName === 'onAutoFillStart') setAutofilled(true)
        else if (e.animationName === 'onAutoFillCancel') setAutofilled(false)
      }
      input.addEventListener('animationstart', handle)
      return () => input.removeEventListener('animationstart', handle)
    }, [forwardedRef])

    const combinedRef = (el: HTMLInputElement | null) => {
      ;(localRef as React.MutableRefObject<HTMLInputElement | null>).current = el
      if (typeof forwardedRef === 'function') forwardedRef(el)
      else if (forwardedRef)
        (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = el
    }

    const borderColor = hasError
      ? '#D92D20'
      : disabled
        ? '#E4E7EB'
        : highlightBorder
          ? '#00A8CF'
          : '#20293A'

    const labelColor = hasError ? '#D92D20' : disabled ? '#617085' : '#20293A'
    const bgColor = disabled || readOnly ? '#FAFBFD' : '#FFFFFF'
    const paddingRight = inputPaddingRight ?? (isPassword ? 36 : 8.8)

    return (
      <div
        className={['relative flex flex-col', wrapperClassName].filter(Boolean).join(' ')}
        style={{ paddingTop: 10 }}
      >
        <input
          ref={combinedRef}
          id={id}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          // Placeholder text is hidden while the label rests inside; only visible when active
          placeholder={isActive ? (placeholder ?? '') : ''}
          aria-invalid={hasError || undefined}
          aria-describedby={helperText || error ? helperId : undefined}
          onFocus={e => { setIsFocused(true); onFocus?.(e) }}
          onBlur={e => { setIsFocused(false); onBlur?.(e) }}
          className={['tlx-input block w-full rounded-[5px] outline-none', inputClassName]
            .filter(Boolean)
            .join(' ')}
          style={{
            height: 40,
            minHeight: 40,
            background: bgColor,
            border: `1px solid ${borderColor}`,
            borderRadius: 5,
            // Padding shifts between states so the value text doesn't crowd the floated label
            paddingTop: isActive ? 11.4 : 10,
            paddingBottom: isActive ? 12.2 : 10,
            paddingLeft: 8.8,
            paddingRight,
            fontSize: 14,
            lineHeight: '20px',
            color: disabled ? '#617085' : '#20293A',
            cursor: disabled ? 'not-allowed' : readOnly ? 'default' : undefined,
            overflow: 'hidden',
            // Inset shadow thickens the border to 1.5px on focus without layout shift
            boxShadow:
              isFocused && !hasError && !disabled && !readOnly
                ? `inset 0 0 0 0.5px ${highlightBorder ? '#00A8CF' : '#20293A'}`
                : 'none',
            transition:
              'padding-top 150ms ease-out, padding-bottom 150ms ease-out, box-shadow 100ms ease-out',
            fontFamily: '"Objectivity", system-ui, sans-serif',
          }}
          {...rest}
        />

        {/* Floating label — rests inside the input at 14px, floats to 11px on the border when active */}
        <label
          htmlFor={id}
          className="tlx-input-label"
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            top: isActive ? 6 : 20,
            left: 10,
            paddingLeft: isActive ? 4 : 0,
            paddingRight: isActive ? 4 : 0,
            // White chip background cuts through the border line so the label reads cleanly on it
            background: isActive ? '#FFFFFF' : 'transparent',
            fontSize: isActive ? 11 : 14,
            lineHeight: isActive ? '13px' : '20px',
            color: labelColor,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            maxWidth: 'calc(100% - 20px)',
            zIndex: 10,
            transition: [
              'top 150ms ease-out',
              'font-size 150ms ease-out',
              'line-height 150ms ease-out',
              'padding-left 100ms ease-out',
              'padding-right 100ms ease-out',
              'background-color 100ms ease-out 50ms',
            ].join(', '),
            fontFamily: '"Objectivity", system-ui, sans-serif',
          }}
        >
          {label}{required ? ' *' : ''}
        </label>

        {/* Suffix slot — caller is responsible for absolute positioning within this wrapper */}
        {suffix}

        {/* Password visibility toggle */}
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute flex items-center justify-center text-[#617085] transition-colors hover:text-[#20293A] disabled:opacity-40"
            style={{ top: 10, right: 8.8, height: 40, width: 20 }}
          >
            {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          </button>
        )}

        {/* Helper / error text */}
        {error && (
          <div
            id={helperId}
            className="mt-[6px] flex items-center gap-[6px] text-[12px] leading-[16.8px] text-[#D92D20]"
          >
            {error}
          </div>
        )}
        {!error && helperText && (
          <div id={helperId} className="mt-[6px] flex items-center gap-[6px]">
            {helperText}
          </div>
        )}
      </div>
    )
  },
)

FloatingLabelInput.displayName = 'FloatingLabelInput'
export default FloatingLabelInput

/* ── Icon primitives ─────────────────────────────────────────────────────── */

type IconProps = React.SVGProps<SVGSVGElement>

function EyeIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}
      strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}
      strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}
