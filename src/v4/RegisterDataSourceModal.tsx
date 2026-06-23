import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import DatasourceCard from '../components/DatasourceCard'
import { DATASOURCE_LOGOS } from '../components/datasourceLogos'
import FloatingLabelInput from '../components/ui/FloatingLabelInput'
import { useJourneyIntro } from './JourneyIntroContext'

const DATASOURCES = [
  'Aws',
  'Dremio',
  'Databricks',
  'Snowflake',
  'Mysql',
  'Postgresql',
  'Sqlserver',
  'Aurora',
  'Dynamodb',
  'S3',
  'Powerbi',
  'Oracle',
]

const LOGO_KEY: Record<string, string> = {
  Aws: 'AWS',
  Mysql: 'MySQL',
  Postgresql: 'PostgreSQL',
  Sqlserver: 'SQL Server',
  Dynamodb: 'DynamoDB',
  Powerbi: 'Power BI',
}

const STEPS = [
  { n: 1, title: 'Select Data Source' },
  { n: 2, title: 'Prerequisites' },
  { n: 3, title: 'Connection & Authentication' },
]

export default function RegisterDataSourceModal() {
  const STEP_ICONS = [StepNavDbIcon, StepNavChecksIcon, StepNavShieldIcon]
  const {
    phase,
    subStep,
    selectedDatasource,
    accountName,
    prerequisitesChecked,
    selectDatasource,
    setAccountName,
    setPrerequisitesChecked,
    downloadClicked,
    setDownloadClicked,
    selectVariant,
    goToSubStep,
    saveConnection,
    close,
  } = useJourneyIntro()

  const show =
    phase === 'journey' &&
    (subStep === 'select-platform' ||
      subStep === 'name-connection' ||
      subStep === 'run-prerequisites' ||
      subStep === 'verify-complete' ||
      subStep === 'connection-auth')
  const [connField, setConnField] = useState<ConnField>('account-id')
  const isV2 = selectVariant === 'v2'

  if (!show) return null

  const currentPage: 'select' | 'prerequisites' | 'connection' =
    subStep === 'connection-auth'
      ? 'connection'
      : subStep === 'run-prerequisites' || subStep === 'verify-complete'
        ? 'prerequisites'
        : 'select'

  const continueReady =
    currentPage === 'select'
      ? !!(selectedDatasource && accountName.trim())
      : currentPage === 'prerequisites'
        ? downloadClicked && prerequisitesChecked
        : false

  const onContinue = () => {
    if (currentPage === 'select' && continueReady) {
      goToSubStep('run-prerequisites')
    } else if (currentPage === 'prerequisites' && continueReady) {
      goToSubStep('connection-auth')
    }
  }

  const onPrevious = () => {
    if (currentPage === 'connection') {
      goToSubStep('run-prerequisites')
    } else if (currentPage === 'prerequisites') {
      goToSubStep('select-platform')
    }
  }

  return (
    <div
      data-v4-journey
      role="dialog"
      aria-label="Register Data Source"
      style={{ position: 'fixed', inset: 0, zIndex: 9100, boxShadow: '-2px 0 4px rgba(0,0,0,0.10)' }}
      className="flex animate-tour-enter flex-col bg-white"
    >
      {/* ── Header (min-h 64px) ── */}
      <header className="flex min-h-[64px] shrink-0 items-start justify-between border-b border-[#E4E7EB] bg-white px-[20px] pb-[16.8px] pt-[16px]">
        <h2 className="text-[18px] font-bold leading-[23.4px] text-[#20293A]">Register Data Source</h2>
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[#20293A] transition-colors hover:bg-[rgba(32,41,58,0.06)]"
        >
          <CloseIcon className="h-[18px] w-[18px]" />
        </button>
      </header>

      {/* ── Body: StepNav + Content ── */}
      <div className="grid min-h-0 flex-1 grid-cols-[300px_1fr] overflow-hidden">
        {/* Step Nav (left 300px rail) */}
        <aside className="overflow-y-auto border-r border-[#E4E7EB] bg-[#FAFBFD] py-[24px]">
          <ul>
            {STEPS.map((s, idx) => {
              const done =
                (s.n === 1 && currentPage !== 'select') ||
                (s.n === 2 && currentPage === 'connection')
              const active =
                (s.n === 1 && currentPage === 'select') ||
                (s.n === 2 && currentPage === 'prerequisites') ||
                (s.n === 3 && currentPage === 'connection')
              const NavIcon = STEP_ICONS[idx]
              return (
                <li
                  key={s.n}
                  className={[
                    'relative flex w-full items-center gap-[14px] py-[14px] pr-[20px]',
                    active ? 'bg-white pl-[17.6px]' : 'pl-[20px]',
                    !active && !done ? 'opacity-50' : '',
                  ].join(' ')}
                >
                  {active && (
                    <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[2.4px] bg-[#00A8CF]" />
                  )}
                  <span
                    className={[
                      'flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[10px]',
                      done ? 'bg-[#41B57F]' : active ? 'bg-[#00A8CF]' : 'bg-[#E4E7EB]',
                    ].join(' ')}
                  >
                    {done ? (
                      <CheckIcon className="h-5 w-5 text-white" />
                    ) : (
                      <NavIcon className={`h-5 w-5 ${active ? 'text-white' : 'text-[#617085]'}`} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-bold leading-[21px] text-[#20293A]">
                      {s.title}
                    </p>
                    <p className="mt-[1.4px] text-[12px] leading-[18px] text-[#617085]">
                      {s.n === 1 ? (
                        <>Choose a data source and name<br />this account</>
                      ) : s.n === 2 ? (
                        <>Run the setup script in your data<br />source</>
                      ) : (
                        'Provide the connection details'
                      )}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </aside>

        <main className="relative overflow-y-auto bg-[#FAFBFD] px-[32px] pb-[24px] pt-[28px]">
          {/* Content header */}
          <div className="flex w-full items-start justify-between pb-[20px]">
            <div className="flex flex-col gap-[4px]">
              <h3
                data-v4-select-heading={currentPage === 'select' ? '' : undefined}
                className="text-[22px] font-bold leading-[33px] text-[#20293A]"
              >
                {currentPage === 'select'
                  ? 'Select Data Source'
                  : currentPage === 'prerequisites'
                    ? 'Prerequisites'
                    : 'Connection & Authentication'}
              </h3>
              <p className="text-[13px] leading-[19.5px] text-[#617085]">
                Step {currentPage === 'select' ? '1' : currentPage === 'prerequisites' ? '2' : '3'} of 3
              </p>
            </div>
            {/* Progress pills: active = 32px wide, inactive = 20px */}
            <div className="flex items-center gap-[6px] pt-[4px]">
              {[1, 2, 3].map((n) => {
                const stepNum = currentPage === 'select' ? 1 : currentPage === 'prerequisites' ? 2 : 3
                return (
                  <span
                    key={n}
                    className={[
                      'h-[6px] rounded-[3px] transition-all duration-300',
                      stepNum === n ? 'w-[32px]' : 'w-[20px]',
                      n < stepNum ? 'bg-[#41B57F]' : n === stepNum ? 'bg-[#00A8CF]' : 'bg-[#ABABAB]',
                    ].join(' ')}
                  />
                )
              })}
            </div>
          </div>

          {currentPage === 'select' ? (
            <div
              data-v1-register-card
              className="flex w-full flex-col gap-[16px] rounded-[10px] border border-[#E4E7EB] bg-[#FAFBFD] p-[20.8px] shadow-[0_2px_2px_rgba(0,0,0,0.10)]"
            >
              {/* Card title */}
              <p className="text-[16px] font-bold leading-[24px] text-[#20293A]">
                <span data-v4-select-label>Select Data Source</span>
              </p>

              {/* Tile grid: 6 cols at lg, 4 at md, 3 at sm, 2 default */}
              <div data-v1-platform-grid className="grid grid-cols-2 gap-[16px] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {DATASOURCES.map((name) => (
                  <div key={name} data-datasource={name}>
                    <DatasourceCard
                      name={LOGO_KEY[name] ?? name}
                      logo={DATASOURCE_LOGOS[LOGO_KEY[name] ?? name]}
                      selected={selectedDatasource === name}
                      onSelect={() => selectDatasource(name)}
                    />
                  </div>
                ))}
              </div>

              {/* Account Name */}
              <div data-v4-account-name-section>
                <FloatingLabelInput
                  id="v4-account-name"
                  label="Account Name"
                  value={accountName}
                  onChange={setAccountName}
                  placeholder="e.g. production-snowflake"
                  highlightBorder={!!(selectedDatasource && !accountName.trim())}
                  inputClassName={selectedDatasource && !accountName.trim() ? 'animate-ripple-ring' : undefined}
                  data-v4-account-name
                />
              </div>
            </div>
          ) : currentPage === 'prerequisites' ? (
            <PrerequisitesContent
              checked={prerequisitesChecked}
              onCheck={setPrerequisitesChecked}
              onDownload={() => setDownloadClicked(true)}
              downloaded={downloadClicked}
              datasourceLabel={selectedDatasource ?? 'Snowflake'}
            />
          ) : (
            <ConnectionContent isV2={isV2} onFieldChange={setConnField} />
          )}
        </main>
      </div>

      {/* ── Footer (min-h 68px) ── */}
      <footer
        className={[
          'relative flex min-h-[68px] shrink-0 items-center justify-between border-t border-[#E4E7EB] bg-white px-[20px] pb-[12.8px] pt-[13.6px]',
          selectVariant === 'v1' ? 'z-[5]' : 'z-20',
        ].join(' ')}
      >
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentPage === 'select'}
          aria-disabled={currentPage === 'select'}
          className={[
            'flex h-[40px] items-center gap-[5px] rounded-[4px] border px-[10.8px] text-[14px] leading-[20px] text-[#20293A] transition-colors',
            currentPage === 'select'
              ? 'cursor-not-allowed border-[#E4E7EB] opacity-60'
              : 'border-[#20293A] hover:bg-[rgba(32,41,58,0.04)]',
          ].join(' ')}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Previous
        </button>
        <div className="flex items-center gap-[10.01px]">
          {currentPage === 'connection' && (
            <button
              type="button"
              onClick={close}
              className="flex h-[40px] items-center rounded-[5px] border border-[#20293A] px-[10.8px] text-[14px] leading-[20px] text-[#20293A] transition-colors hover:bg-[rgba(32,41,58,0.04)]"
            >
              Close
            </button>
          )}
          {currentPage === 'connection' ? (
            <button
              type="button"
              data-v4-save
              data-tour="register-ds-save-button"
              onClick={saveConnection}
              disabled={connField !== 'done'}
              className={[
                'flex items-center gap-[5px] rounded-[5px] px-[10.8px] py-[9.8px] text-[14px] leading-[20px] text-white transition-colors duration-300',
                connField === 'done'
                  ? 'bg-[#00A8CF] hover:bg-[#0094B5]' + (isV2 ? ' animate-ripple-ring' : '')
                  : 'cursor-not-allowed bg-[#99DCEC]',
              ].join(' ')}
            >
              Save
            </button>
          ) : (
            <button
              type="button"
              data-v4-continue
              onClick={onContinue}
              disabled={!continueReady}
              aria-disabled={!continueReady}
              className={[
                'flex items-center gap-[5px] rounded-[5px] px-[9.8px] py-[9.8px] text-[14px] leading-[20px] text-white transition-colors duration-300',
                continueReady
                  ? 'bg-[#00A8CF] hover:bg-[#0094B5]' + (continueReady && isV2 ? ' animate-ripple-ring' : '')
                  : 'cursor-not-allowed bg-[#99DCEC]',
              ].join(' ')}
            >
              Continue
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </footer>

      <V1RegisterTour currentPage={currentPage} connField={connField} />
      <TourCallout connField={connField} />
    </div>
  )
}

/* ---------------------- V1 overlay tour within modal ---------------------- */

type OverlayRect = { top: number; left: number; width: number; height: number }

type V1SubStep =
  | 'select-platform' | 'enter-name' | 'click-continue'
  | 'download' | 'confirm-check'
  | 'conn-account-id' | 'conn-auth-type' | 'conn-username' | 'conn-passphrase' | 'conn-private-key' | 'conn-save'

const V1_GUIDE_MAP: Record<V1SubStep, { title: string; text: string; hint: string }> = {
  'select-platform': {
    title: 'Choose Your Data Platform',
    text: 'Select the platform you want to connect with TrustLogix. We support Snowflake, Databricks, SQL Server, Power BI, and more.',
    hint: 'Click a platform card to select it',
  },
  'enter-name': {
    title: 'Name Your Connection',
    text: 'Give this connection a recognizable name so your team can easily identify it — e.g. "Production Snowflake" or "Analytics Warehouse".',
    hint: 'Type a name in the field below',
  },
  'click-continue': {
    title: 'Ready to Continue',
    text: "Everything looks good! Click Continue to proceed to the next step.",
    hint: 'Click the Continue button',
  },
  'download': {
    title: 'Download Prerequisites',
    text: 'Download the prerequisite package to set up the required roles and permissions in your data source environment.',
    hint: 'Click the Download button',
  },
  'confirm-check': {
    title: 'Confirm Completion',
    text: "Once you've run the setup script in your data source, check the box to confirm the prerequisites are complete.",
    hint: 'Check the confirmation box',
  },
  'conn-account-id': {
    title: 'Enter Account Identifier',
    text: 'Enter your Snowflake account identifier — the unique subdomain for your instance (e.g. xy12345). TrustLogix uses this to locate your environment.',
    hint: 'Type your account identifier',
  },
  'conn-auth-type': {
    title: 'Choose how to connect',
    text: 'Pick an Authentication Type. The connection fields you need will appear based on your choice — Key Pair, Basic, or OAuth.',
    hint: 'Select an authentication type',
  },
  'conn-username': {
    title: 'Provide User Name',
    text: 'Enter the user name of the TrustLogix service account created during the prerequisite setup.',
    hint: 'Type the service account username',
  },
  'conn-passphrase': {
    title: 'Set Your Passphrase',
    text: 'Provide the passphrase used to encrypt the RSA private key for key-pair authentication.',
    hint: 'Enter the passphrase',
  },
  'conn-private-key': {
    title: 'Upload Private Key',
    text: 'Upload the RSA private key that pairs with the public key registered in your Snowflake account.',
    hint: 'Click Upload to select your key file',
  },
  'conn-save': {
    title: 'Save Your Connection',
    text: 'All connection details are filled in. Click Save to test and securely store your data source connection.',
    hint: 'Click Save to finish',
  },
}

const V1_TARGET_SEL: Record<V1SubStep, string> = {
  'select-platform': '[data-v1-platform-grid]',
  'enter-name': '[data-v4-account-name-section]',
  'click-continue': '[data-v4-continue]',
  'download': '[data-v4-download]',
  'confirm-check': '[data-v4-prereq-checkbox]',
  'conn-account-id': '[data-v4-conn-account-id]',
  'conn-auth-type': '[data-v4-conn-auth-type]',
  'conn-username': '[data-v4-conn-username] input',
  'conn-passphrase': '[data-v4-conn-passphrase]',
  'conn-private-key': '[data-v4-private-key-section]',
  'conn-save': '[data-v4-save]',
}

function V1RegisterTour({ currentPage, connField }: { currentPage: 'select' | 'prerequisites' | 'connection'; connField: ConnField }) {
  const { selectVariant, selectedDatasource, accountName, downloadClicked, prerequisitesChecked } = useJourneyIntro()
  const [rect, setRect] = useState<OverlayRect | null>(null)
  const [stepIdx, setStepIdx] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const PAGE_STEPS: Record<string, V1SubStep[]> = {
    select: ['select-platform', 'enter-name', 'click-continue'],
    prerequisites: ['download', 'confirm-check', 'click-continue'],
    connection: ['conn-account-id', 'conn-auth-type', 'conn-username', 'conn-passphrase', 'conn-private-key', 'conn-save'],
  }

  const steps = PAGE_STEPS[currentPage] ?? PAGE_STEPS.select
  useEffect(() => { setStepIdx(0) }, [currentPage])

  const sub = steps[Math.min(stepIdx, steps.length - 1)]
  const targetSel = V1_TARGET_SEL[sub]

  const CONN_ORDER: ConnField[] = ['account-id', 'auth-type', 'username', 'passphrase', 'private-key', 'done']
  const connIdx = CONN_ORDER.indexOf(connField)

  const isCompleted = (() => {
    if (sub === 'select-platform') return !!selectedDatasource
    if (sub === 'enter-name') return !!accountName.trim()
    if (sub === 'click-continue') return false
    if (sub === 'download') return downloadClicked
    if (sub === 'confirm-check') return prerequisitesChecked
    if (sub === 'conn-account-id') return connIdx > 0
    if (sub === 'conn-auth-type') return connIdx > 1
    if (sub === 'conn-username') return connIdx > 2
    if (sub === 'conn-passphrase') return connIdx > 3
    if (sub === 'conn-private-key') return connIdx > 4
    return false
  })()

  const isActionStep = sub === 'click-continue' || sub === 'conn-save'
  const isLastStep = stepIdx >= steps.length - 1

  // Auto-advance when the private-key step completes (Upload button disappears,
  // so the user can't click Next — advance programmatically instead)
  const prevCompletedRef = useRef(false)
  useEffect(() => {
    if (sub === 'conn-private-key' && isCompleted && !prevCompletedRef.current && !isLastStep) {
      setStepIdx(s => s + 1)
    }
    prevCompletedRef.current = isCompleted
  }, [isCompleted, sub, isLastStep])

  useLayoutEffect(() => {
    if (selectVariant !== 'v1') { setRect(null); return }
    const measure = () => {
      const el = document.querySelector(targetSel) as HTMLElement | null
      if (!el) { setRect(null); return }
      const r = el.getBoundingClientRect()
      const PAD = 10
      setRect({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 })
    }
    measure()
    const id = window.setInterval(measure, 250)
    window.addEventListener('resize', measure)
    return () => { window.clearInterval(id); window.removeEventListener('resize', measure) }
  }, [selectVariant, targetSel])

  if (selectVariant !== 'v1' || !rect) return null

  const guide = V1_GUIDE_MAP[sub]
  const pageIndex = currentPage === 'select' ? 0 : currentPage === 'prerequisites' ? 1 : 2
  const pageLabel = ['Step 1 of 3 · Select Platform', 'Step 2 of 3 · Prerequisites', 'Step 3 of 3 · Connection'][pageIndex]

  const subBars = steps.map((_s, i) => ({
    key: _s,
    done: i < stepIdx,
    active: i === stepIdx,
  }))

  const CW = 340
  const GAP = 14
  const EDGE = 16
  const vh = window.innerHeight
  const vw = window.innerWidth
  const cardH = cardRef.current?.offsetHeight ?? 260

  let cardTop: number
  let cardLeft: number
  const below = vh - (rect.top + rect.height + GAP)
  const above = rect.top - GAP
  const right = vw - (rect.left + rect.width + GAP)

  const preferAbove = sub === 'enter-name'

  // Private Key is full-width — place card above the field, aligned to the right
  if (sub === 'conn-private-key') {
    cardTop = clamp(rect.top - cardH - GAP, EDGE, vh - cardH)
    cardLeft = vw - CW - EDGE
  } else if (!preferAbove && right >= CW + EDGE) {
    cardTop = clamp(rect.top, EDGE, vh - cardH)
    cardLeft = rect.left + rect.width + GAP
  } else if (preferAbove && above >= cardH) {
    cardTop = rect.top - cardH - GAP
    cardLeft = clamp(rect.left, EDGE, vw - CW - EDGE)
  } else if (!preferAbove && below >= cardH) {
    cardTop = rect.top + rect.height + GAP
    cardLeft = clamp(rect.left, EDGE, vw - CW - EDGE)
  } else if (above >= cardH) {
    cardTop = rect.top - cardH - GAP
    cardLeft = clamp(rect.left, EDGE, vw - CW - EDGE)
  } else {
    cardTop = clamp(rect.top + rect.height + GAP, EDGE, vh - cardH)
    cardLeft = clamp(rect.left, EDGE, vw - CW - EDGE)
  }

  const handleNext = () => {
    if (!isCompleted || isLastStep) return
    const nextIdx = stepIdx + 1
    setStepIdx(nextIdx)
    const nextSel = V1_TARGET_SEL[steps[nextIdx]]
    if (nextSel) {
      setTimeout(() => {
        const el = document.querySelector(nextSel) as HTMLElement | null
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 80)
    }
  }

  const handlePrev = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1)
  }

  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex: 10 }}>
      <svg className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden="true">
        <defs>
          <mask id="v1-register-hole">
            <rect width="100%" height="100%" fill="white" />
            <rect x={rect.left} y={rect.top} width={rect.width} height={rect.height} rx={12} ry={12} fill="black" />
          </mask>
          <linearGradient id="v1-spotlight-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00A8CF" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#66CAE3" stopOpacity="1" />
            <stop offset="100%" stopColor="#00A8CF" stopOpacity="0.9" />
          </linearGradient>
          <filter id="v1-spotlight-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="rgba(15,23,42,0.5)" mask="url(#v1-register-hole)" className="transition-all duration-500" />
        <rect
          x={rect.left - 2} y={rect.top - 2}
          width={rect.width + 4} height={rect.height + 4}
          rx={14} ry={14}
          fill="none" stroke="url(#v1-spotlight-grad)" strokeWidth="2"
          filter="url(#v1-spotlight-glow)"
          className="animate-spotlight-breathe"
        />
        <rect
          x={rect.left - 6} y={rect.top - 6}
          width={rect.width + 12} height={rect.height + 12}
          rx={18} ry={18}
          fill="none" stroke="rgba(0,168,207,0.15)" strokeWidth="1.5"
          className="animate-spotlight-ring"
        />
      </svg>

      <div
        ref={cardRef}
        key={sub}
        data-tour-card
        style={{ position: 'absolute', top: cardTop, left: cardLeft, width: CW }}
        className="pointer-events-auto animate-tour-enter rounded-[10px] border border-tlx-border bg-white shadow-[0_30px_80px_-24px_rgba(32,41,58,0.32)]"
      >
        <div className="px-4 pt-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F7FB] py-1.5 pl-1.5 pr-3.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00A8CF] text-[10px] font-bold text-white">
              {pageIndex + 1}
            </span>
            <span className="text-[12px] font-semibold text-[#00A8CF]">Registration Guide</span>
          </div>
        </div>

        <div className="px-5 pt-2">
          <h4 className="text-[14px] font-bold tracking-tight text-tlx-text">{guide.title}</h4>
        </div>

        <p className="mt-2.5 px-5 text-[13px] leading-relaxed text-tlx-secondary">{guide.text}</p>

        {/* Action hint or completion confirmation */}
        {isCompleted && !isActionStep ? (
          <div className="mx-5 mt-3 flex items-center gap-2 rounded-[5px] bg-emerald-50 px-3 py-2">
            <svg className="h-3.5 w-3.5 shrink-0 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span className="text-[11px] font-semibold text-success">Done — click Next to continue</span>
          </div>
        ) : (
          <div className="mx-5 mt-3 flex items-center gap-2 rounded-[5px] bg-[#E8F7FB] px-3 py-2">
            <svg className="h-3.5 w-3.5 shrink-0 text-[#00A8CF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 15l-2 5L9 9l11 4-5 2z" />
              <path d="M18.5 18.5L22 22" />
            </svg>
            <span className="text-[11px] font-semibold text-[#00A8CF]">{guide.hint}</span>
          </div>
        )}

        {/* Footer: progress bars + navigation */}
        <div className="mx-5 mb-4 mt-3 flex items-center justify-between border-t border-tlx-border pt-3">
          <div className="flex items-center gap-1.5">
            {subBars.map((s) => (
              <span
                key={s.key}
                className={[
                  'h-1.5 w-6 rounded-full transition-colors duration-500',
                  s.done ? 'bg-success' : s.active ? 'bg-brand-500' : 'bg-tlx-border',
                ].join(' ')}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {stepIdx > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex h-7 w-7 items-center justify-center rounded-[5px] border border-tlx-border text-tlx-muted transition-all duration-200 hover:border-[#00A8CF] hover:text-[#00A8CF]"
                aria-label="Previous step"
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
            )}
            {!isActionStep && (
              <button
                type="button"
                onClick={handleNext}
                disabled={!isCompleted}
                className={[
                  'inline-flex items-center gap-1 rounded-[5px] px-3.5 py-1.5 text-[11px] font-semibold transition-all duration-200',
                  isCompleted
                    ? 'bg-[#00A8CF] text-white hover:bg-[#66CAE3]'
                    : 'cursor-not-allowed bg-tlx-border text-tlx-muted',
                ].join(' ')}
              >
                Next
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const CARD_W = 360
const MARGIN = 16

function TourCallout({ connField }: { connField: ConnField }) {
  const { subStep, selectedDatasource, accountName, selectVariant, downloadClicked, prerequisitesChecked, completeCurrentStep } =
    useJourneyIntro()

  if (selectVariant === 'v1') return null

  const v2ReadyToContinue =
    subStep === 'select-platform' && selectVariant === 'v2' && !!selectedDatasource && accountName.trim().length > 0
  const [pos, setPos] = useState<{
    cardLeft: number
    cardTop: number
    tailX: number
    tailY?: number
    tailSide: 'top' | 'left' | 'right' | 'bottom'
    target: { x: number; y: number } | null
  } | null>(null)
  const [cardHidden, setCardHidden] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setCardHidden(false) }, [subStep, connField])

  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight

      if (subStep === 'select-platform' && selectVariant === 'v2') {
        if (!selectedDatasource) {
          const el = document.querySelector('[data-v4-select-label]') as HTMLElement | null
          if (!el) return
          const range = document.createRange()
          range.selectNodeContents(el)
          const tr = range.getBoundingClientRect()
          const dotX = tr.right + 14
          const dotY = tr.top + tr.height / 2
          const cardLeft = clamp(dotX + 16, MARGIN, vw - CARD_W - MARGIN)
          const cardTop = clamp(dotY - 36, MARGIN, vh - 320)
          const tailY = clamp(dotY - cardTop, 24, 280)
          setPos({ cardLeft, cardTop, tailX: 0, tailY, tailSide: 'left', target: { x: dotX, y: dotY } })
        } else if (accountName.trim().length > 0) {
          const el = document.querySelector('[data-v4-continue]') as HTMLElement | null
          if (!el) return
          const r = el.getBoundingClientRect()
          const targetX = r.left + r.width / 2
          const targetY = r.top
          const cardH = ref.current?.offsetHeight ?? 200
          const cardTop = clamp(targetY - cardH - 16, MARGIN, vh - cardH - MARGIN)
          const cardLeft = clamp(targetX - CARD_W / 2, MARGIN, vw - CARD_W - MARGIN)
          const tailX = clamp(targetX - cardLeft, 28, CARD_W - 28)
          setPos({ cardLeft, cardTop, tailX, tailSide: 'bottom', target: { x: targetX, y: targetY } })
        } else {
          const el = document.querySelector('[data-v4-account-name]') as HTMLElement | null
          if (!el) return
          const r = el.getBoundingClientRect()
          const targetX = r.left + r.width / 2
          const targetY = r.top
          const cardH = ref.current?.offsetHeight ?? 240
          const cardTop = clamp(targetY - cardH - 16, MARGIN, vh - cardH - MARGIN)
          const cardLeft = clamp(targetX - CARD_W / 2, MARGIN, vw - CARD_W - MARGIN)
          const tailX = clamp(targetX - cardLeft, 28, CARD_W - 28)
          setPos({ cardLeft, cardTop, tailX, tailSide: 'bottom', target: { x: targetX, y: targetY } })
        }
        return
      }

      if (subStep === 'name-connection') {
        const el = document.querySelector('[data-v4-account-name]') as HTMLElement | null
        if (!el) return
        const r = el.getBoundingClientRect()
        const targetX = r.left + r.width / 2
        const targetY = r.top
        const cardH = ref.current?.offsetHeight ?? 240
        const cardTop = clamp(targetY - cardH - 16, MARGIN, vh - cardH - MARGIN)
        const cardLeft = clamp(targetX - CARD_W / 2, MARGIN, vw - CARD_W - MARGIN)
        const tailX = clamp(targetX - cardLeft, 28, CARD_W - 28)
        setPos({ cardLeft, cardTop, tailX, tailSide: 'bottom', target: { x: targetX, y: targetY } })
        return
      }

      if (subStep === 'run-prerequisites' || subStep === 'verify-complete') {
        if (selectVariant === 'v2') {
          if (!downloadClicked) {
            const dl = document.querySelector('[data-v4-download]') as HTMLElement | null
            if (!dl) return
            const r = dl.getBoundingClientRect()
            const targetX = r.left + r.width / 2
            const targetY = r.bottom
            const cardTop = clamp(targetY + 16, MARGIN, vh - 280)
            const cardLeft = clamp(targetX - CARD_W / 2, MARGIN, vw - CARD_W - MARGIN)
            const tailX = clamp(targetX - cardLeft, 28, CARD_W - 28)
            setPos({ cardLeft, cardTop, tailX, tailSide: 'top', target: { x: targetX, y: targetY } })
          } else if (!prerequisitesChecked) {
            const cb = document.querySelector('[data-v4-prereq-checkbox]') as HTMLElement | null
            if (!cb) return
            const icon = cb.querySelector('span[aria-hidden="true"]') as HTMLElement | null
            const box = (icon ?? cb).getBoundingClientRect()
            const targetX = box.left + box.width / 2
            const targetY = box.bottom + 6
            const cardTop = clamp(targetY + 10, MARGIN, vh - 220)
            const cardLeft = clamp(targetX - CARD_W / 2, MARGIN, vw - CARD_W - MARGIN)
            const tailX = clamp(targetX - cardLeft, 28, CARD_W - 28)
            setPos({ cardLeft, cardTop, tailX, tailSide: 'top', target: { x: targetX, y: targetY } })
          } else {
            const el = document.querySelector('[data-v4-continue]') as HTMLElement | null
            if (!el) return
            const r = el.getBoundingClientRect()
            const targetX = r.left + r.width / 2
            const targetY = r.top
            const cardH = ref.current?.offsetHeight ?? 200
            const cardTop = clamp(targetY - cardH - 16, MARGIN, vh - cardH - MARGIN)
            const cardLeft = clamp(targetX - CARD_W / 2, MARGIN, vw - CARD_W - MARGIN)
            const tailX = clamp(targetX - cardLeft, 28, CARD_W - 28)
            setPos({ cardLeft, cardTop, tailX, tailSide: 'bottom', target: { x: targetX, y: targetY } })
          }
        } else {
          const main = document.querySelector('main')
          if (!main) return
          const mr = main.getBoundingClientRect()
          const cardLeft = clamp(mr.right - CARD_W - 32, MARGIN, vw - CARD_W - MARGIN)
          const cardTop = clamp(mr.top + 40, MARGIN, vh - 480)
          setPos({ cardLeft, cardTop, tailX: CARD_W / 2, tailSide: 'top', target: null })
        }
        return
      }

      if (subStep === 'connection-auth') {
        if (selectVariant === 'v2') {
          if (connField === 'done') {
            const el = document.querySelector('[data-v4-save]') as HTMLElement | null
            if (!el) return
            const r = el.getBoundingClientRect()
            const targetX = r.left + r.width / 2
            const targetY = r.top
            const cardH = ref.current?.offsetHeight ?? 200
            const cardTop = clamp(targetY - cardH - 16, MARGIN, vh - cardH - MARGIN)
            const cardLeft = clamp(targetX - CARD_W / 2, MARGIN, vw - CARD_W - MARGIN)
            const tailX = clamp(targetX - cardLeft, 28, CARD_W - 28)
            setPos({ cardLeft, cardTop, tailX, tailSide: 'bottom', target: { x: targetX, y: targetY } })
            return
          }

          const selectors: Record<Exclude<ConnField, 'done'>, string> = {
            'account-id': '[data-v4-conn-account-id]',
            'auth-type': '[data-v4-conn-auth-type]',
            'username': '[data-v4-conn-username]',
            'passphrase': '[data-v4-conn-passphrase]',
            'private-key': '[data-v4-upload]',
          }
          const el = document.querySelector(selectors[connField]) as HTMLElement | null
          if (!el) return
          const r = el.getBoundingClientRect()

          if (connField === 'account-id') {
            const inputEl = el.querySelector('input') as HTMLElement | null
            const ir = (inputEl ?? el).getBoundingClientRect()
            const targetX = ir.right
            const targetY = ir.top + ir.height / 2
            const cardLeft = clamp(ir.right + 10, MARGIN, vw - CARD_W - MARGIN)
            const cardTop = clamp(targetY - 60, MARGIN, vh - 280)
            const tailY = clamp(targetY - cardTop, 28, 240)
            setPos({ cardLeft, cardTop, tailX: 0, tailY, tailSide: 'left', target: { x: targetX, y: targetY } })
          } else if (connField === 'auth-type') {
            const targetX = r.left - 10
            const targetY = r.top + 10
            const cardLeft = clamp(targetX - CARD_W - 10, MARGIN, vw - CARD_W - MARGIN)
            const cardTop = clamp(targetY - 60, MARGIN, vh - 280)
            const tailY = clamp(targetY - cardTop, 28, 240)
            setPos({ cardLeft, cardTop, tailX: CARD_W, tailY, tailSide: 'right', target: { x: targetX, y: targetY } })
          } else if (connField === 'username') {
            const targetX = r.right
            const targetY = r.top + r.height / 2
            const cardLeft = clamp(r.right + 10, MARGIN, vw - CARD_W - MARGIN)
            const cardTop = clamp(targetY - 60, MARGIN, vh - 280)
            const tailY = clamp(targetY - cardTop, 28, 240)
            setPos({ cardLeft, cardTop, tailX: 0, tailY, tailSide: 'left', target: { x: targetX, y: targetY } })
          } else if (connField === 'passphrase') {
            const targetX = r.left
            const targetY = r.top + r.height / 2
            const cardLeft = clamp(targetX - CARD_W - 10, MARGIN, vw - CARD_W - MARGIN)
            const cardTop = clamp(targetY - 60, MARGIN, vh - 280)
            const tailY = clamp(targetY - cardTop, 28, 240)
            setPos({ cardLeft, cardTop, tailX: CARD_W, tailY, tailSide: 'right', target: { x: targetX, y: targetY } })
          } else {
            const targetX = r.left + r.width / 2
            const targetY = r.top
            const CARD_H = 220
            const cardTop = clamp(targetY - CARD_H - 36, MARGIN, vh - CARD_H - MARGIN)
            const cardLeft = clamp(targetX - CARD_W / 2, MARGIN, vw - CARD_W - MARGIN)
            const tailX = clamp(targetX - cardLeft, 28, CARD_W - 28)
            setPos({ cardLeft, cardTop, tailX, tailSide: 'bottom', target: { x: targetX, y: targetY } })
          }
          return
        }

        if (selectVariant === 'v2') {
          setPos(null)
          return
        }

        const el = document.querySelector('[data-v4-conn-account-id]') as HTMLElement | null
        if (!el) return
        const r = el.getBoundingClientRect()
        const targetX = r.right
        const targetY = r.top + r.height / 2
        const cardLeft = clamp(r.right + 64, MARGIN, vw - CARD_W - MARGIN)
        const cardTop = clamp(targetY - 80, MARGIN, vh - 480)
        const tailY = clamp(targetY - cardTop, 28, 420)
        setPos({ cardLeft, cardTop, tailX: 0, tailY, tailSide: 'left', target: { x: targetX, y: targetY } })
        return
      }

      const main = document.querySelector('main')
      const inputEl = document.querySelector('[data-v4-account-name]') as HTMLElement | null
      if (!main) return
      const mr = main.getBoundingClientRect()
      const cardLeft = clamp(mr.right - CARD_W - 32, MARGIN, vw - CARD_W - MARGIN)
      let cardTop: number
      if (inputEl) {
        const ir = inputEl.getBoundingClientRect()
        cardTop = clamp(ir.top - 360, mr.top + 80, vh - 380)
      } else {
        cardTop = clamp(mr.top + 220, MARGIN, vh - 380)
      }
      setPos({ cardLeft, cardTop, tailX: CARD_W / 2, tailSide: 'top', target: null })
    }

    measure()
    const id = window.setInterval(measure, 250)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [subStep, selectVariant, selectedDatasource, accountName, downloadClicked, prerequisitesChecked, connField])

  if (!pos) return null

  const onSelectPlatform = subStep === 'select-platform'
  const onNameConnection = subStep === 'name-connection'
  const onRunPrereqs = subStep === 'run-prerequisites' || subStep === 'verify-complete'
  const onConnection = subStep === 'connection-auth'
  const isV2 = selectVariant === 'v2'
  const onSelectV2 = onSelectPlatform && isV2
  const v2PhaseA = onSelectV2 && !selectedDatasource
  const v2PhaseB = onSelectV2 && !!selectedDatasource && !accountName.trim()
  const v2PhaseC = onSelectV2 && !!selectedDatasource && accountName.trim().length > 0
  const onPrereqsV2 = onRunPrereqs && isV2
  const prereqPhaseA = onPrereqsV2 && !downloadClicked
  const prereqPhaseB = onPrereqsV2 && downloadClicked && !prerequisitesChecked
  const prereqPhaseC = onPrereqsV2 && downloadClicked && prerequisitesChecked
  const onConnV2 = onConnection && isV2 && connField !== 'done'
  const connPhaseE = onConnection && isV2 && connField === 'done'

  const connTitles: Record<Exclude<ConnField, 'done'>, string> = {
    'account-id': 'Enter Account Identifier',
    'auth-type': 'Choose how to connect',
    'username': 'Provide Your User Name',
    'passphrase': 'Set Your Passphrase',
    'private-key': 'Upload Private Key',
  }

  const title = connPhaseE
    ? 'Save Your Connection'
    : onConnV2
    ? connTitles[connField as Exclude<ConnField, 'done'>]
    : v2PhaseA
    ? 'Choose Your Data Platform'
    : v2PhaseB
      ? 'Name Your Connection'
      : v2PhaseC
        ? 'Ready to Continue'
        : onSelectPlatform
        ? 'Choose Your Data Platform'
        : onNameConnection
      ? 'Name Your Data Source'
      : prereqPhaseC
        ? 'Ready to Continue'
        : onRunPrereqs
        ? (isV2 ? (downloadClicked ? 'Confirm Completion' : 'Download Prerequisites') : 'Run Prerequisite Setup')
        : 'Establish Secure Connection'
  const stepLabel = onSelectPlatform
    ? 'Step 2 of 4 · Select Platform'
    : onNameConnection
      ? 'Step 2 of 4 · Data Source Name'
      : onRunPrereqs
        ? 'Step 3 of 4 · Run Prerequisites'
        : 'Step 4 of 4 · Verify & Complete'

  const ready = onNameConnection ? accountName.trim().length > 0 : false

  return (
    <>
      {pos.target && (
        <button
          type="button"
          aria-label={cardHidden ? 'Show tour card' : 'Hide tour card'}
          onClick={() => setCardHidden(h => !h)}
          style={{ position: 'fixed', left: pos.target.x, top: pos.target.y, zIndex: 9401 }}
          className="flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-transparent"
        >
          <span className="absolute h-3 w-3 rounded-full bg-[#00A8CF]" />
          <span className="absolute h-3 w-3 animate-ping rounded-full bg-[#00A8CF]/40" />
        </button>
      )}

      <section
        ref={ref}
        data-v4-journey
        data-v4-callout-card
        data-tour-card
        role="dialog"
        aria-label={title}
        style={{
          position: 'fixed',
          left: pos.cardLeft,
          top: pos.cardTop,
          width: CARD_W,
          zIndex: 9400,
          transition: 'left 300ms cubic-bezier(0.22,1,0.36,1), top 300ms cubic-bezier(0.22,1,0.36,1)',
          display: cardHidden ? 'none' : undefined,
        }}
        className="animate-tour-enter rounded-[10px] border border-tlx-border bg-white shadow-[0_30px_80px_-24px_rgba(32,41,58,0.32)]"
      >
        {pos.target && (() => {
          if (pos.tailSide === 'top') return (
            <span className="absolute -top-[7px] h-3.5 w-3.5 rotate-45 rounded-[3px] border-l border-t border-tlx-border bg-white" style={{ left: pos.tailX - 7 }} />
          )
          if (pos.tailSide === 'bottom') return (
            <span className="absolute -bottom-[7px] h-3.5 w-3.5 rotate-45 rounded-[3px] border-b border-r border-tlx-border bg-white" style={{ left: pos.tailX - 7 }} />
          )
          if (pos.tailSide === 'right') return (
            <span className="absolute -right-[7px] h-3.5 w-3.5 rotate-45 rounded-[3px] border-r border-t border-tlx-border bg-white" style={{ top: (pos.tailY ?? 0) - 7 }} />
          )
          return (
            <span className="absolute -left-[7px] h-3.5 w-3.5 rotate-45 rounded-[3px] border-b border-l border-tlx-border bg-white" style={{ top: (pos.tailY ?? 0) - 7 }} />
          )
        })()}

        <div className="p-5 pt-4">
        <div>
          <h3 className="text-[14px] font-bold tracking-tight text-tlx-text">{title}</h3>
          <p className="mt-0.5 text-[10.5px] font-semibold text-[#00A8CF]">{stepLabel}</p>
        </div>

        {onSelectPlatform && !onSelectV2 && (
          <div className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-tlx-secondary">
            <p>Select the platform you want TrustLogix to connect with.</p>
            <p>TrustLogix supports Snowflake, Databricks, Dremio, SQL Server, PostgreSQL, Power BI, and more.</p>
            <p>Your selected platform determines the authentication and setup process in the next steps.</p>
          </div>
        )}
        {v2PhaseA && (
          <div className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-tlx-secondary">
            <p>Pick the data platform you'd like to connect to <span className="font-semibold text-brand-600">TrustLogix</span>.</p>
            <p>We support Snowflake, Databricks, SQL Server, Power BI, and more — your choice shapes the secure setup steps ahead.</p>
          </div>
        )}
        {v2PhaseB && (
          <div className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-tlx-secondary">
            <p>Give this connection a recognizable name so you can easily identify it across <span className="font-semibold text-brand-600">TrustLogix</span>.</p>
            <p>A clear name like <span className="font-semibold text-tlx-text">Production Snowflake</span> or <span className="font-semibold text-tlx-text">Analytics Warehouse</span> helps your team stay organized.</p>
          </div>
        )}
        {v2PhaseC && (
          <div className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-tlx-secondary">
            <p>You're all set! Click <span className="font-semibold text-tlx-text">Continue</span> to proceed to the prerequisites step where you'll configure the required roles and permissions.</p>
          </div>
        )}
        {onNameConnection && (
          <div className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-tlx-secondary">
            <p>Give this connection a recognizable name. Examples:</p>
            <ul className="ml-1 space-y-0.5 text-tlx-text">
              <li>• Production Snowflake</li>
              <li>• Finance Warehouse</li>
              <li>• Analytics Environment</li>
            </ul>
            <p>This helps identify the data source across TrustLogix.</p>
          </div>
        )}
        {prereqPhaseA && (
          <div className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-tlx-secondary">
            <p>Download the prerequisite package to set up the required roles and permissions in your data source environment.</p>
            <p>Extract the zip and run the setup script — then check the box to confirm completion.</p>
          </div>
        )}
        {prereqPhaseB && (
          <div className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-tlx-secondary">
            <p>Once you've run the setup script in your data source, check the box to confirm the prerequisites are complete.</p>
            <p>This unlocks the <span className="font-semibold text-tlx-text">Continue</span> button so you can proceed to the connection step.</p>
          </div>
        )}
        {prereqPhaseC && (
          <div className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-tlx-secondary">
            <p>You're all set! Click <span className="font-semibold text-tlx-text">Continue</span> to proceed to the connection step where you'll securely link your data source.</p>
          </div>
        )}
        {onRunPrereqs && !isV2 && (
          <div className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-tlx-secondary">
            <p>Before TrustLogix can analyze your data source, a setup script must be executed in your Snowflake environment.</p>
            <p>This script creates the required roles, permissions, and metadata access needed for TrustLogix to securely discover and monitor your data.</p>
            <p className="font-semibold text-tlx-text">Follow these steps:</p>
            <ul className="ml-1 space-y-0.5 text-tlx-secondary">
              <li className="flex gap-2"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand-500" />Download the prerequisite package.</li>
              <li className="flex gap-2"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand-500" />Run the setup script using Snowsight or SnowSQL.</li>
              <li className="flex gap-2"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand-500" />Verify the script completed successfully.</li>
              <li className="flex gap-2"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand-500" />Confirm completion using the checkbox below.</li>
            </ul>
            <p>Once completed, you'll be ready to establish the secure connection in the next step.</p>
          </div>
        )}
        {onConnV2 && connField === 'account-id' && (
          <div className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-tlx-secondary">
            <p>Enter your Snowflake account identifier — the unique subdomain for your instance (e.g. <code className="rounded bg-tlx-surface px-1 text-[12px]">xy12345</code>).</p>
            <p>TrustLogix uses this to locate and connect to your Snowflake environment securely.</p>
          </div>
        )}
        {onConnV2 && connField === 'auth-type' && (
          <div className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-tlx-secondary">
            <p>Pick an <span className="font-semibold text-tlx-text">Authentication Type</span>. The connection fields you need will appear based on your choice.</p>
            <ul className="ml-1 space-y-0.5">
              <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-500" /><span><span className="font-semibold text-tlx-text">Key Pair</span> — RSA key-pair authentication</span></li>
              <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-500" /><span><span className="font-semibold text-tlx-text">Basic</span> — username and password</span></li>
              <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-500" /><span><span className="font-semibold text-tlx-text">OAuth</span> — token-based authentication</span></li>
            </ul>
          </div>
        )}
        {onConnV2 && connField === 'username' && (
          <div className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-tlx-secondary">
            <p>Enter the user name of the TrustLogix service account created during the prerequisite setup.</p>
            <p>This is the dedicated account that TrustLogix will use to authenticate with your data source.</p>
          </div>
        )}
        {onConnV2 && connField === 'passphrase' && (
          <div className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-tlx-secondary">
            <p>Provide the passphrase used to encrypt the RSA private key for key-pair authentication.</p>
            <p>This ensures the private key can be securely decrypted during the connection handshake.</p>
          </div>
        )}
        {onConnV2 && connField === 'private-key' && (
          <div className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-tlx-secondary">
            <p>Upload the RSA private key that pairs with the public key registered in your Snowflake account.</p>
            <p>Once uploaded, click <span className="font-semibold text-tlx-text">Save</span> to test and establish the secure connection.</p>
          </div>
        )}
        {connPhaseE && (
          <div className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-tlx-secondary">
            <p>All connection details are filled in. Click <span className="font-semibold text-tlx-text">Save</span> to test and securely store your data source connection.</p>
          </div>
        )}
        {onConnection && !onConnV2 && !connPhaseE && (
          <div className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-tlx-secondary">
            <p>Provide the connection details TrustLogix needs to securely reach your <span className="font-semibold text-tlx-text">Snowflake</span> account and authenticate.</p>
            <p className="font-semibold text-tlx-text">Fill in:</p>
            <ul className="ml-1 space-y-0.5 text-tlx-secondary">
              <li className="flex gap-2"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand-500" /><span><span className="font-semibold text-tlx-text">Account Identifier</span> — your Snowflake account.</span></li>
              <li className="flex gap-2"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand-500" /><span><span className="font-semibold text-tlx-text">Authentication Type</span> — Key Pair, Basic, or OAuth.</span></li>
              <li className="flex gap-2"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand-500" /><span><span className="font-semibold text-tlx-text">User Name + Passphrase</span> — the TrustLogix service account.</span></li>
              <li className="flex gap-2"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand-500" /><span><span className="font-semibold text-tlx-text">Private Key</span> — upload the RSA key.</span></li>
            </ul>
            <p>Click <span className="font-semibold text-tlx-text">Save</span> to test and store the connection.</p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-tlx-border pt-3">
          {(onConnV2 || connPhaseE) ? (
            <StepBars steps={[
              { key: 'account-id', done: (['auth-type','username','passphrase','private-key','done'] as string[]).includes(connField), active: connField === 'account-id' },
              { key: 'auth-type', done: (['username','passphrase','private-key','done'] as string[]).includes(connField), active: connField === 'auth-type' },
              { key: 'username', done: (['passphrase','private-key','done'] as string[]).includes(connField), active: connField === 'username' },
              { key: 'passphrase', done: (['private-key','done'] as string[]).includes(connField), active: connField === 'passphrase' },
              { key: 'private-key', done: connField === 'done', active: connField === 'private-key' },
              { key: 'save', done: false, active: connField === 'done' },
            ]} />
          ) : onSelectPlatform ? (
            <StepBars steps={[
              { key: 'platform', done: !!selectedDatasource, active: !selectedDatasource },
              { key: 'name', done: !!selectedDatasource && accountName.trim().length > 0, active: !!selectedDatasource && !accountName.trim() },
              { key: 'continue', done: false, active: !!selectedDatasource && accountName.trim().length > 0 },
            ]} />
          ) : onRunPrereqs ? (
            <StepBars steps={[
              { key: 'download', done: downloadClicked, active: !downloadClicked },
              { key: 'confirm', done: downloadClicked && prerequisitesChecked, active: downloadClicked && !prerequisitesChecked },
              { key: 'continue', done: false, active: downloadClicked && prerequisitesChecked },
            ]} />
          ) : (
            <div />
          )}
          {!onSelectPlatform && !onRunPrereqs && !onConnV2 && !connPhaseE && (
            <button
              type="button"
              disabled={!ready}
              onClick={completeCurrentStep}
              className={[
                'inline-flex items-center gap-1.5 rounded-[5px] px-3.5 py-1.5 text-[12px] font-semibold transition-all duration-300',
                ready
                  ? 'bg-[#00A8CF] text-white shadow-sm hover:bg-[#66CAE3]'
                  : 'cursor-not-allowed bg-tlx-surface text-tlx-muted',
              ].join(' ')}
            >
              <CheckIcon className="h-3.5 w-3.5" />
              Done
            </button>
          )}
        </div>
        </div>
      </section>
    </>
  )
}

function StepBars({ steps }: { steps: { key: string; done: boolean; active: boolean }[] }) {
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((step) => (
        <span
          key={step.key}
          className={[
            'h-1.5 w-6 rounded-full transition-colors duration-500',
            step.done ? 'bg-success' : step.active ? 'bg-brand-500' : 'bg-tlx-border',
          ].join(' ')}
        />
      ))}
    </div>
  )
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi))

type ConnField = 'account-id' | 'auth-type' | 'username' | 'passphrase' | 'private-key' | 'done'

type AuthType = 'keypair' | 'basic' | 'oauth'


function ConnectionContent({ onFieldChange }: { isV2: boolean; onFieldChange?: (f: ConnField) => void }) {
  const { selectedDatasource } = useJourneyIntro()
  const [accountId, setAccountId] = useState('')
  const [authType, setAuthType] = useState<AuthType | null>(null)

  // Phase B fields — cleared on auth type switch
  const [userName, setUserName] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [password, setPassword] = useState('')
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [oauthTokenUrl, setOauthTokenUrl] = useState('')
  const [privateKeyContent, setPrivateKeyContent] = useState('')

  const accountIdValid = /^[A-Za-z0-9_.-]{3,}$/.test(accountId.trim())

  const saveReady = (() => {
    if (!accountIdValid || !authType) return false
    if (authType === 'keypair') return !!userName.trim() && !!privateKeyContent.trim()
    if (authType === 'basic') return !!userName.trim() && !!password.trim()
    if (authType === 'oauth') return !!clientId.trim() && !!clientSecret.trim() && !!oauthTokenUrl.trim()
    return false
  })()

  const activeField: ConnField = saveReady ? 'done'
    : !accountIdValid ? 'account-id'
    : !authType ? 'auth-type'
    : authType === 'keypair'
      ? (!userName.trim() ? 'username' : !passphrase.trim() ? 'passphrase' : !privateKeyContent.trim() ? 'private-key' : 'done')
      : authType === 'basic'
        ? (!userName.trim() ? 'username' : 'passphrase')
        : (!clientId.trim() ? 'username' : !clientSecret.trim() ? 'passphrase' : 'private-key')

  useEffect(() => { onFieldChange?.(activeField) }, [activeField, onFieldChange])

  const handleAuthTypeChange = (type: AuthType) => {
    setAuthType(type)
    setUserName(''); setPassphrase(''); setPassword('')
    setClientId(''); setClientSecret(''); setOauthTokenUrl('')
    setPrivateKeyContent('')
  }

  const isSnowflake = !selectedDatasource || selectedDatasource === 'Snowflake'
  const suffix = isSnowflake ? '.snowflakecomputing.com' : null

  return (
    <div
      data-v1-register-card
      className="flex w-full flex-col gap-[16px] rounded-[10px] border border-[#E4E7EB] bg-[#FAFBFD] p-[20.8px] shadow-[0_2px_2px_rgba(0,0,0,0.10)]"
    >
      <p className="text-[16px] font-bold leading-[24px] text-[#20293A]">Connection Configuration</p>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,50fr) minmax(0,48fr)', columnGap: 15, rowGap: 20 }}>

        {/* ── Row 1 Col 1 — Account Identifier ── */}
        <div data-v4-conn-account-id data-tour="register-ds-account-identifier" className="flex flex-col pb-[22.2px]" style={{ overflow: 'visible' }}>
          <FloatingLabelInput
            id="v4-conn-account-id"
            label="Account Identifier"
            value={accountId}
            onChange={setAccountId}
            inputPaddingRight={160}
            suffix={suffix ? (
              <span className="pointer-events-none absolute flex items-stretch" style={{ left: 279.7, top: 10, height: 40 }}>
                <span className="border-l-[0.8px] border-[#20293A]" style={{ marginTop: 5, marginBottom: 5 }} />
                <span className="flex items-center pl-[5px] text-[14px] font-medium leading-[20px] text-[#617085]">{suffix}</span>
              </span>
            ) : undefined}
            helperText={
              <>
                <InfoIcon className="h-[14px] w-[14px] shrink-0 text-[#617085]" />
                <span className="text-[12px] leading-[16.8px] text-[#617085]">
                  How to obtain the {selectedDatasource ?? 'Snowflake'}{' '}
                  <a
                    href="https://docs.snowflake.com/en/user-guide/admin-account-identifier"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#00A8CF] underline underline-offset-2"
                  >
                    account identifier
                  </a>?
                </span>
              </>
            }
          />
        </div>

        {/* ── Row 1 Col 2 — Authentication Type ── */}
        <div
          data-v4-conn-auth-type
          data-tour="register-ds-auth-type-group"
          className="flex flex-col"
          style={{ gap: '0.1px' }}
        >
          <p className="text-[14px] leading-[21px] text-[#20293A]">Authentication Type</p>
          <div role="radiogroup" aria-label="Authentication Type" className="relative" style={{ height: 74, width: '100%' }}>
            {([
              { id: 'keypair' as AuthType, label: 'Key Pair Authentication', pos: { top: 0, left: 0 } },
              { id: 'basic' as AuthType, label: 'Basic Authentication', pos: { top: 0, left: 199.89 } },
              { id: 'oauth' as AuthType, label: 'OAuth Authentication', pos: { top: 45, left: 0 } },
            ]).map(({ id, label, pos }) => {
              const selected = authType === id
              return (
                <label
                  key={id}
                  className="absolute flex cursor-pointer select-none items-center gap-[4px] py-[4px]"
                  style={{ top: pos.top, left: pos.left }}
                >
                  <input
                    type="radio"
                    name="v4-auth-type"
                    value={id}
                    checked={selected}
                    onChange={() => handleAuthTypeChange(id)}
                    className="sr-only peer"
                  />
                  <span
                    role="radio"
                    aria-checked={selected}
                    className="flex shrink-0 items-center justify-center rounded-full transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-[#00A8CF] focus-within:outline-offset-2"
                    style={selected
                      ? { width: 16.4, height: 16.4, background: '#41B57F', border: '1px solid #41B57F', padding: 1 }
                      : { width: 16, height: 16, background: '#FFFFFF', border: '1px solid #6B6B6B' }
                    }
                  >
                    {selected && <span className="rounded-full bg-white" style={{ width: 4, height: 4 }} />}
                  </span>
                  <span className="text-[14px] leading-[21px] text-[#20293A]">{label}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* ── Rows 2 & 3 — Phase B (conditional, animated) ── */}
        {authType !== null && (
          <PhaseBFields
            key={authType}
            authType={authType}
            userName={userName} setUserName={setUserName}
            passphrase={passphrase} setPassphrase={setPassphrase}
            password={password} setPassword={setPassword}
            clientId={clientId} setClientId={setClientId}
            clientSecret={clientSecret} setClientSecret={setClientSecret}
            oauthTokenUrl={oauthTokenUrl} setOauthTokenUrl={setOauthTokenUrl}
            privateKeyContent={privateKeyContent} setPrivateKeyContent={setPrivateKeyContent}
          />
        )}
      </div>
    </div>
  )
}

type PhaseBProps = {
  authType: AuthType
  userName: string; setUserName: (v: string) => void
  passphrase: string; setPassphrase: (v: string) => void
  password: string; setPassword: (v: string) => void
  clientId: string; setClientId: (v: string) => void
  clientSecret: string; setClientSecret: (v: string) => void
  oauthTokenUrl: string; setOauthTokenUrl: (v: string) => void
  privateKeyContent: string; setPrivateKeyContent: (v: string) => void
}

function PhaseBFields({
  authType, userName, setUserName, passphrase, setPassphrase,
  password, setPassword, clientId, setClientId, clientSecret, setClientSecret,
  oauthTokenUrl, setOauthTokenUrl, privateKeyContent, setPrivateKeyContent,
}: PhaseBProps) {
  const enterClass = 'phase-b-enter'

  // Row 2 Col 1 — User Name (keypair/basic) or Client ID (oauth)
  const col1Label = authType === 'oauth' ? 'Client ID' : 'User Name'
  const col1Value = authType === 'oauth' ? clientId : userName
  const col1Set = authType === 'oauth' ? setClientId : setUserName
  const col1Id = authType === 'oauth' ? 'v4-conn-client-id' : 'v4-conn-username'

  return (
    <>
      {/* Row 2, Col 1 */}
      <div
        data-v4-conn-username
        className={enterClass}
        style={{ animation: 'phase-b-in 200ms ease-out both' }}
      >
        <FloatingLabelInput id={col1Id} label={col1Label} value={col1Value} onChange={col1Set} required />
      </div>

      {/* Row 2, Col 2 */}
      <div
        data-v4-conn-passphrase
        className={enterClass}
        style={{ animation: 'phase-b-in 200ms ease-out both' }}
      >
        {authType === 'keypair' && (
          <FloatingLabelInput
            id="v4-conn-passphrase"
            label="Passphrase"
            type="password"
            value={passphrase}
            onChange={setPassphrase}
            helperText={
              <>
                <InfoIcon className="h-[14px] w-[14px] shrink-0 text-[#617085]" />
                <span className="text-[12px] leading-[16.8px] text-[#617085]">Passphrase used to encrypt the RSA private key.</span>
              </>
            }
          />
        )}
        {authType === 'basic' && (
          <FloatingLabelInput id="v4-conn-password" label="Password" type="password" value={password} onChange={setPassword} required />
        )}
        {authType === 'oauth' && (
          <FloatingLabelInput id="v4-conn-client-secret" label="Client Secret" type="password" value={clientSecret} onChange={setClientSecret} required />
        )}
      </div>

      {/* Row 3, full width — Key Pair: Private Key | OAuth: Token URL | Basic: nothing */}
      {authType === 'keypair' && (
        <div
          data-v4-private-key-section
          className={[enterClass, 'col-span-2'].join(' ')}
          style={{ animation: 'phase-b-in 200ms ease-out both', gridColumn: '1 / span 2' }}
        >
          <FloatingLabelInput
            id="v4-conn-private-key"
            label="Private Key"
            value={privateKeyContent}
            onChange={() => {}}
            readOnly
            inputPaddingRight={privateKeyContent ? 32 : 80}
            suffix={
              privateKeyContent ? (
                <button
                  type="button"
                  onClick={() => setPrivateKeyContent('')}
                  aria-label="Clear private key"
                  className="absolute flex items-center justify-center text-[#617085] hover:text-[#20293A] transition-colors"
                  style={{ top: 10, right: 8.8, height: 40, width: 20 }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  data-v4-upload
                  onClick={() => setPrivateKeyContent(
                    '-----BEGIN ENCRYPTED PRIVATE KEY-----\nMIIEpAIBAAKCAQEA2a5KQVBpLMm+FIkXJFoqXpGZ4mVy\nKT7Lz8kN9pRfE2wX1dQhA3bYcM6sJvNuP0qWlOiT5eD\nj3vY6bR8pQmN1sX2tUfW4gHcIoKzA7nBdLe9yMxCuZ0\n-----END ENCRYPTED PRIVATE KEY-----'
                  )}
                  className="absolute flex items-center gap-[2px] text-[14px] leading-[21px] text-[#00A8CF] hover:text-[#0094B5]"
                  style={{ top: 10, right: 10.73, height: 40 }}
                >
                  <UploadIcon className="h-4 w-4" />
                  Upload
                </button>
              )
            }
            helperText={
              <>
                <InfoIcon className="h-[14px] w-[14px] shrink-0 text-[#617085]" />
                <span className="text-[12px] leading-[16.8px] text-[#617085]">
                  Learn how to generate your Private and Public Key — see the{' '}
                  <a
                    href="https://docs.snowflake.com/en/user-guide/key-pair-auth"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#00A8CF] underline underline-offset-2"
                  >
                    Snowflake key-pair authentication docs
                  </a>.
                </span>
              </>
            }
          />
        </div>
      )}
      {authType === 'oauth' && (
        <div
          className={enterClass}
          style={{ animation: 'phase-b-in 200ms ease-out both', gridColumn: '1 / span 2' }}
        >
          <FloatingLabelInput
            id="v4-conn-oauth-token-url"
            label="OAuth Token URL"
            value={oauthTokenUrl}
            onChange={setOauthTokenUrl}
            required
            helperText={
              <>
                <InfoIcon className="h-[14px] w-[14px] shrink-0 text-[#617085]" />
                <span className="text-[12px] leading-[16.8px] text-[#617085]">The token endpoint URL provided by your identity provider.</span>
              </>
            }
          />
        </div>
      )}
    </>
  )
}

function PrerequisitesContent({ checked, onCheck, onDownload, datasourceLabel }: { checked: boolean; onCheck: (v: boolean) => void; onDownload: () => void; downloaded?: boolean; datasourceLabel: string }) {
  return (
    <div
      data-v1-register-card
      className="flex w-full flex-col rounded-[10px] border border-[#E4E7EB] bg-[#FAFBFD] p-[20.8px] shadow-[0_2px_2px_rgba(0,0,0,0.10)]"
    >
      {/* Card title */}
      <p className="text-[16px] font-bold leading-[24px] text-[#20293A]">Prerequisite Steps</p>

      {/* Intro paragraph */}
      <p className="pt-[16px] text-[14px] leading-[21px] text-[#20293A]">
        Download and run the {datasourceLabel} setup script before completing the connection step.
      </p>

      {/* Steps two-column grid */}
      <div className="grid pt-[16px]" style={{ gridTemplateColumns: '57.85px 1fr', gap: '20px' }}>
        {/* Row 1 — Step 1 label */}
        <span className="flex items-center text-[14px] leading-[21px] text-[#20293A]">Step 1 -</span>
        {/* Row 1 — Download button + trailing text */}
        <div className="flex flex-wrap items-center" style={{ gap: '4.32px' }}>
          <button
            type="button"
            data-v4-download
            onClick={onDownload}
            className="rounded-[5px] border border-[#00A8CF] bg-[#00A8CF] px-[10.8px] py-[9.6px] text-[14px] leading-[20px] text-white transition-colors hover:bg-[#0094B5]"
          >
            Download
          </button>
          <span className="text-[14px] leading-[21px] text-[#20293A]">and extract the zip file.</span>
        </div>

        {/* Row 2 — Step 2 label (align-self: start so it sits at the top of the text block) */}
        <span className="self-start pt-[2px] text-[14px] leading-[21px] text-[#20293A]">Step 2 -</span>
        {/* Row 2 — Instructions with Bold spans (no <code> elements) */}
        <p className="text-[14px] leading-[21px] text-[#20293A]">
          <span className="font-bold">Using Snowsight or Classic Console :</span> Please upload the .ipynb notebook OR copy the content from the downloaded zip folder file{' '}
          <span className="font-bold">tlx_snowflake_pre_requisite_sql_setup.sql</span> onto the UI. Replace the{' '}
          <span className="font-bold">&lt;password&gt;</span>/<span className="font-bold">&lt;RSA_PUBLIC_KEY&gt;</span> value with actual password/public key for the TrustLogix Snowflake user and execute all the SQL statements using the{' '}
          <span className="font-bold">ACCOUNTADMIN</span> role.
        </p>
      </div>

      {/* Confirmation checkbox */}
      <div className="pt-[16px]">
      <label
        data-v4-prereq-checkbox
        className="flex w-fit cursor-pointer items-center gap-[8px] py-[10px] px-[12px] rounded-[5px] text-[14px] leading-[21px] text-[#20293A]"
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheck(e.target.checked)}
          className="sr-only peer"
          id="prereq-checkbox"
        />
        <span
          aria-hidden="true"
          className={[
            'relative flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors',
            checked ? 'border-[#00A8CF] bg-[#00A8CF]' : 'border-[#20293A] bg-white',
            'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-[#00A8CF] peer-focus-visible:outline-offset-2',
          ].join(' ')}
        >
          {checked && (
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6.5 4.5 9 10 3" />
            </svg>
          )}
        </span>
        <span>I have run the prerequisite script in my {datasourceLabel} account.</span>
      </label>
      </div>
    </div>
  )
}

const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, viewBox: '0 0 24 24' }
type P = React.SVGProps<SVGSVGElement>

function StepNavDbIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <ellipse cx="12" cy="5.5" rx="7" ry="2.5" />
      <path d="M5 5.5v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-5" />
      <path d="M5 10.5v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-5" />
    </svg>
  )
}
function StepNavChecksIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M10 5h9M10 12h9M10 19h9" />
      <path d="m4 5 1 1 2-2M4 12l1 1 2-2M4 19l1 1 2-2" />
    </svg>
  )
}
function StepNavShieldIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 2 4 6v6c0 5.5 3.6 10.7 8 12 4.4-1.3 8-6.5 8-12V6L12 2Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
function CloseIcon(p: P) { return <svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg> }
function ChevronLeftIcon(p: P) { return <svg {...base} {...p}><path d="m15 6-6 6 6 6" /></svg> }
function ChevronRightIcon(p: P) { return <svg {...base} {...p}><path d="m9 6 6 6-6 6" /></svg> }
function CheckIcon(p: P) { return <svg {...base} {...p}><path d="m5 12.5 4.5 4.5L19 7" /></svg> }
function ClipboardIcon(p: P) { return <svg {...base} {...p}><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4V3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" /><path d="M9 11h6M9 15h6M9 19h4" /></svg> }
function StepIcon(p: P) { return <svg {...base} {...p}><ellipse cx="11" cy="5.5" rx="6.5" ry="2.6" /><path d="M4.5 5.5v6c0 1.4 2.9 2.6 6.5 2.6" /><path d="M4.5 11.5v6c0 1.4 2.9 2.6 6.5 2.6" /></svg> }
function DatabasePlusIcon(p: P) { return <svg {...base} {...p}><ellipse cx="10.5" cy="5.5" rx="6.5" ry="2.6" /><path d="M4 5.5v6c0 1.4 2.9 2.6 6.5 2.6" /><path d="M4 11.5v6c0 1.4 2.9 2.6 6.5 2.6" /><circle cx="17.5" cy="16.5" r="4" /><path d="M17.5 14.8v3.4M15.8 16.5h3.4" /></svg> }
function DownloadIcon(p: P) { return <svg {...base} {...p}><path d="M12 4v11M7.5 11l4.5 4 4.5-4" /><path d="M5 19h14" /></svg> }
function KeyIcon(p: P) { return <svg {...base} {...p}><circle cx="8" cy="14" r="4" /><path d="m10.8 11.2 8.2-8.2 2 2-2 2 2 2-2 2-2-2-1.2 1.2" /></svg> }
function InfoIcon(p: P) { return <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.6h.01" /></svg> }
function UploadIcon(p: P) { return <svg {...base} {...p}><path d="M12 19V8M7.5 12l4.5-4 4.5 4" /><path d="M5 5h14" /></svg> }
