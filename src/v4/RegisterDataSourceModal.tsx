import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import DatasourceCard from '../components/DatasourceCard'
import { DATASOURCE_LOGOS } from '../components/datasourceLogos'
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
  {
    n: 1,
    title: 'Select Data Source',
    sub: 'Choose a data source and name this account',
  },
  {
    n: 2,
    title: 'Prerequisites',
    sub: 'Run the setup script in your data source',
  },
  {
    n: 3,
    title: 'Connection & Authentication',
    sub: 'Provide the connection details',
  },
]

export default function RegisterDataSourceModal() {
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
      style={{ position: 'fixed', inset: 0, zIndex: 9100 }}
      className="flex animate-tour-enter flex-col bg-white"
    >
      <header className="relative flex shrink-0 items-center justify-between border-b border-tlx-border bg-white px-7 py-5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold tracking-tight text-tlx-text">Register Data Source</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="flex h-9 w-9 items-center justify-center rounded-[5px] text-tlx-muted transition-all duration-200 hover:bg-danger-50 hover:text-danger-500"
          >
            <CloseIcon className="h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[280px_1fr] gap-0">
        <aside className="relative overflow-y-auto bg-white px-5 py-7">
          <span
            aria-hidden="true"
            className="absolute left-0 w-[3px] rounded-r-full bg-[#00A8CF] transition-[top] duration-500 ease-out"
            style={{
              top: currentPage === 'select' ? 24 : currentPage === 'prerequisites' ? 92 : 160,
              height: 84,
            }}
          />
          <span aria-hidden="true" className="absolute inset-y-0 right-0 w-px bg-tlx-border" />

          <ul className="space-y-5">
            {STEPS.map((s, idx) => {
              const done =
                (s.n === 1 && currentPage !== 'select') ||
                (s.n === 2 && currentPage === 'connection')
              const active =
                (s.n === 1 && currentPage === 'select') ||
                (s.n === 2 && currentPage === 'prerequisites') ||
                (s.n === 3 && currentPage === 'connection')
              return (
                <li
                  key={s.n}
                  className="flex items-start gap-3 animate-stagger-in"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <span
                    className={[
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all duration-500',
                      done
                        ? 'bg-[#00A8CF] text-white shadow-sm'
                        : active
                          ? 'bg-[#00A8CF] text-white shadow-sm'
                          : 'border border-tlx-border bg-white text-tlx-muted',
                    ].join(' ')}
                  >
                    {done ? <CheckIcon className="h-4 w-4" /> : s.n}
                  </span>
                  <div className="pt-0.5">
                    <p
                      className={[
                        'text-[13px] transition-colors duration-300',
                        active
                          ? 'font-bold text-tlx-text'
                          : done
                            ? 'font-semibold text-[#00A8CF]'
                            : 'font-semibold text-tlx-secondary',
                      ].join(' ')}
                    >
                      {s.title}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-tlx-muted">{s.sub}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </aside>

        <main className="relative overflow-y-auto bg-tlx-surface px-8 py-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3
                data-v4-select-heading={currentPage === 'select' ? '' : undefined}
                className="relative text-lg font-bold text-tlx-text"
              >
                {currentPage === 'select'
                  ? 'Select Data Source'
                  : currentPage === 'prerequisites'
                    ? 'Prerequisites'
                    : 'Connection & Authentication'}
              </h3>
              <p className="mt-0.5 text-xs font-semibold text-tlx-secondary">
                Step {currentPage === 'select' ? '1' : currentPage === 'prerequisites' ? '2' : '3'} of 3
              </p>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <span
                className={[
                  'h-1.5 w-6 rounded-full transition-colors',
                  currentPage !== 'select' ? 'bg-success' : 'bg-brand-500',
                ].join(' ')}
              />
              <span
                className={[
                  'h-1.5 w-6 rounded-full transition-colors',
                  currentPage === 'connection'
                    ? 'bg-success'
                    : currentPage === 'prerequisites'
                      ? 'bg-brand-500'
                      : 'bg-tlx-border',
                ].join(' ')}
              />
              <span
                className={[
                  'h-1.5 w-6 rounded-full transition-colors',
                  currentPage === 'connection' ? 'bg-brand-500' : 'bg-tlx-border',
                ].join(' ')}
              />
            </div>
          </div>

          {currentPage === 'select' ? (
            <div data-v1-register-card className="mt-5 rounded-[10px] border border-tlx-border bg-white p-6 shadow-sm">
              <div data-v1-platform-grid>
              <p className="text-sm font-bold text-tlx-text"><span data-v4-select-label>Select Data Source</span></p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {DATASOURCES.map((name) => (
                  <div key={name} data-datasource={name}>
                    <DatasourceCard
                      name={name}
                      logo={DATASOURCE_LOGOS[LOGO_KEY[name] ?? name]}
                      selected={selectedDatasource === name}
                      onSelect={() => selectDatasource(name)}
                    />
                  </div>
                ))}
              </div>
              </div>

              <div className="relative mt-7" data-v4-account-name-section>
                <input
                  id="v4-account-name"
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder=" "
                  className={[
                    'peer block w-full rounded-lg border bg-[#FFFFFF] px-3.5 py-3.5 text-sm text-[#20293A] focus:border-[#2D3A50] focus:outline-none focus:ring-1 focus:ring-[#2D3A50]',
                    selectedDatasource && !accountName.trim()
                      ? 'border-brand-500 ring-2 ring-brand-200 animate-ripple-ring'
                      : 'border-[#2D3A50]',
                  ].join(' ')}
                  data-v4-account-name
                />
                <label
                  htmlFor="v4-account-name"
                  className="pointer-events-none absolute left-3 top-1/2 origin-[0] -translate-y-1/2 bg-white px-1 text-sm text-[#617085] transition-all duration-200 peer-focus:-top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-[#617085] peer-[:not(:placeholder-shown)]:-top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs"
                >
                  Account Name<span className="text-danger">*</span>
                </label>
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

      <footer className={[
        'relative flex shrink-0 items-center justify-between px-7 py-4',
        selectVariant === 'v1' ? 'z-[5]' : 'z-20 border-t border-tlx-border bg-white',
      ].join(' ')}>
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentPage === 'select'}
          className={[
            'inline-flex items-center gap-1.5 rounded-[5px] border px-4 py-2 text-sm font-semibold transition-all duration-200',
            currentPage === 'select'
              ? 'cursor-not-allowed border-tlx-border bg-white text-tlx-muted'
              : 'border-[#617085] bg-white text-[#617085] hover:border-[#00A8CF] hover:text-[#00A8CF]',
          ].join(' ')}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Previous
        </button>
        <div className="flex items-center gap-2.5">
          {currentPage === 'connection' ? (
            <button
              type="button"
              data-v4-save
              onClick={saveConnection}
              disabled={connField !== 'done'}
              className={[
                'inline-flex items-center gap-1.5 rounded-[5px] px-6 py-2 text-sm font-semibold transition-all duration-300',
                connField === 'done'
                  ? 'bg-[#00A8CF] text-white shadow-sm hover:bg-[#66CAE3]' + (isV2 ? ' animate-ripple-ring' : '')
                  : 'cursor-not-allowed bg-[#00A8CF] text-white opacity-40 shadow-none',
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
              className={[
                'inline-flex items-center gap-1.5 rounded-[5px] px-6 py-2 text-sm font-semibold text-white transition-all duration-300',
                'bg-[#00A8CF] shadow-sm',
                'hover:bg-[#66CAE3]',
                'disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none',
                continueReady && isV2 ? 'animate-ripple-ring' : '',
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
  | 'conn-account-id' | 'conn-username' | 'conn-passphrase' | 'conn-private-key' | 'conn-save'

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
  'conn-account-id': '[data-v4-conn-account-id] input',
  'conn-username': '[data-v4-conn-username] input',
  'conn-passphrase': '[data-v4-conn-passphrase]',
  'conn-private-key': '[data-v4-upload]',
  'conn-save': '[data-v4-save]',
}

function V1RegisterTour({ currentPage, connField }: { currentPage: 'select' | 'prerequisites' | 'connection'; connField: ConnField }) {
  const { selectVariant, selectedDatasource, accountName, downloadClicked, prerequisitesChecked } = useJourneyIntro()
  const [rect, setRect] = useState<OverlayRect | null>(null)
  const [stepIdx, setStepIdx] = useState(0)

  const PAGE_STEPS: Record<string, V1SubStep[]> = {
    select: ['select-platform', 'enter-name', 'click-continue'],
    prerequisites: ['download', 'confirm-check', 'click-continue'],
    connection: ['conn-account-id', 'conn-username', 'conn-passphrase', 'conn-private-key', 'conn-save'],
  }

  const steps = PAGE_STEPS[currentPage] ?? PAGE_STEPS.select
  useEffect(() => { setStepIdx(0) }, [currentPage])

  const sub = steps[Math.min(stepIdx, steps.length - 1)]
  const targetSel = V1_TARGET_SEL[sub]

  const CONN_ORDER: ConnField[] = ['account-id', 'username', 'passphrase', 'private-key', 'done']
  const connIdx = CONN_ORDER.indexOf(connField)

  const isCompleted = (() => {
    if (sub === 'select-platform') return !!selectedDatasource
    if (sub === 'enter-name') return !!accountName.trim()
    if (sub === 'click-continue') return false
    if (sub === 'download') return downloadClicked
    if (sub === 'confirm-check') return prerequisitesChecked
    if (sub === 'conn-account-id') return connIdx > 0
    if (sub === 'conn-username') return connIdx > 1
    if (sub === 'conn-passphrase') return connIdx > 2
    if (sub === 'conn-private-key') return connIdx > 3
    return false
  })()

  const isActionStep = sub === 'click-continue' || sub === 'conn-save'
  const isLastStep = stepIdx >= steps.length - 1

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

  const CW = 300
  const GAP = 14
  const EDGE = 16
  const vh = window.innerHeight
  const vw = window.innerWidth
  const CARD_EST_H = 260

  let cardTop: number
  let cardLeft: number
  const below = vh - (rect.top + rect.height + GAP)
  const above = rect.top - GAP
  const right = vw - (rect.left + rect.width + GAP)

  const preferAbove = sub === 'enter-name'

  if (!preferAbove && right >= CW + EDGE) {
    cardTop = clamp(rect.top, EDGE, vh - CARD_EST_H)
    cardLeft = rect.left + rect.width + GAP
  } else if (preferAbove && above >= CARD_EST_H) {
    cardTop = rect.top - CARD_EST_H - GAP
    cardLeft = clamp(rect.left, EDGE, vw - CW - EDGE)
  } else if (!preferAbove && below >= CARD_EST_H) {
    cardTop = rect.top + rect.height + GAP
    cardLeft = clamp(rect.left, EDGE, vw - CW - EDGE)
  } else if (above >= CARD_EST_H) {
    cardTop = rect.top - CARD_EST_H - GAP
    cardLeft = clamp(rect.left, EDGE, vw - CW - EDGE)
  } else {
    cardTop = clamp(rect.top + rect.height + GAP, EDGE, vh - CARD_EST_H)
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
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
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
          const cardLeft = clamp(dotX + 20, MARGIN, vw - CARD_W - MARGIN)
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
          const cardTop = clamp(r.top - cardH - 14, MARGIN, vh - cardH - MARGIN)
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
          const cardTop = clamp(r.top - cardH - 24, MARGIN, vh - cardH - MARGIN)
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
        const cardTop = clamp(r.top - cardH - 24, MARGIN, vh - cardH - MARGIN)
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
            const cardTop = clamp(r.bottom + 18, MARGIN, vh - 280)
            const cardLeft = clamp(targetX - CARD_W / 2, MARGIN, vw - CARD_W - MARGIN)
            const tailX = clamp(targetX - cardLeft, 28, CARD_W - 28)
            setPos({ cardLeft, cardTop, tailX, tailSide: 'top', target: { x: targetX, y: targetY } })
          } else if (!prerequisitesChecked) {
            const cb = document.querySelector('[data-v4-prereq-checkbox]') as HTMLElement | null
            if (!cb) return
            const r = cb.getBoundingClientRect()
            const targetX = r.left + 28
            const targetY = r.bottom
            const cardTop = clamp(r.bottom + 24, MARGIN, vh - 220)
            const cardLeft = clamp(targetX - 60, MARGIN, vw - CARD_W - MARGIN)
            const tailX = clamp(targetX - cardLeft, 28, CARD_W - 28)
            setPos({ cardLeft, cardTop, tailX, tailSide: 'top', target: { x: targetX, y: targetY } })
          } else {
            const el = document.querySelector('[data-v4-continue]') as HTMLElement | null
            if (!el) return
            const r = el.getBoundingClientRect()
            const targetX = r.left + r.width / 2
            const targetY = r.top
            const cardH = ref.current?.offsetHeight ?? 200
            const cardTop = clamp(r.top - cardH - 14, MARGIN, vh - cardH - MARGIN)
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
            const cardTop = clamp(r.top - cardH - 14, MARGIN, vh - cardH - MARGIN)
            const cardLeft = clamp(targetX - CARD_W / 2, MARGIN, vw - CARD_W - MARGIN)
            const tailX = clamp(targetX - cardLeft, 28, CARD_W - 28)
            setPos({ cardLeft, cardTop, tailX, tailSide: 'bottom', target: { x: targetX, y: targetY } })
            return
          }

          const selectors: Record<Exclude<ConnField, 'done'>, string> = {
            'account-id': '[data-v4-conn-account-id]',
            'username': '[data-v4-conn-username]',
            'passphrase': '[data-v4-conn-passphrase]',
            'private-key': '[data-v4-upload]',
          }
          const el = document.querySelector(selectors[connField]) as HTMLElement | null
          if (!el) return
          const r = el.getBoundingClientRect()

          if (connField === 'account-id') {
            const targetX = r.right
            const targetY = r.top + r.height / 2
            const cardLeft = clamp(r.right + 14, MARGIN, vw - CARD_W - MARGIN)
            const cardTop = clamp(targetY - 60, MARGIN, vh - 280)
            const tailY = clamp(targetY - cardTop, 28, 240)
            setPos({ cardLeft, cardTop, tailX: 0, tailY, tailSide: 'left', target: { x: targetX, y: targetY } })
          } else if (connField === 'username') {
            const targetX = r.right
            const targetY = r.top + r.height / 2
            const cardLeft = clamp(r.right + 14, MARGIN, vw - CARD_W - MARGIN)
            const cardTop = clamp(targetY - 60, MARGIN, vh - 280)
            const tailY = clamp(targetY - cardTop, 28, 240)
            setPos({ cardLeft, cardTop, tailX: 0, tailY, tailSide: 'left', target: { x: targetX, y: targetY } })
          } else if (connField === 'passphrase') {
            const targetX = r.left
            const targetY = r.top + r.height / 2
            const cardLeft = clamp(targetX - CARD_W - 14, MARGIN, vw - CARD_W - MARGIN)
            const cardTop = clamp(targetY - 60, MARGIN, vh - 280)
            const tailY = clamp(targetY - cardTop, 28, 240)
            setPos({ cardLeft, cardTop, tailX: CARD_W, tailY, tailSide: 'right', target: { x: targetX, y: targetY } })
          } else {
            const targetX = r.left + r.width / 2
            const targetY = r.top
            const CARD_H = 220
            const cardTop = clamp(r.top - CARD_H - 14, MARGIN, vh - CARD_H - MARGIN)
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
              { key: 'account-id', done: (['username','passphrase','private-key','done'] as string[]).includes(connField), active: connField === 'account-id' },
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

type ConnField = 'account-id' | 'username' | 'passphrase' | 'private-key' | 'done'

function ConnectionContent({ isV2, onFieldChange }: { isV2: boolean; onFieldChange?: (f: ConnField) => void }) {
  const [authType, setAuthType] = useState<'keypair' | 'basic' | 'oauth'>('keypair')
  const [accountId, setAccountId] = useState('')
  const [userName, setUserName] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [keyUploaded, setKeyUploaded] = useState(false)

  const activeField: ConnField =
    !accountId.trim() ? 'account-id'
    : !userName.trim() ? 'username'
    : !passphrase.trim() ? 'passphrase'
    : !keyUploaded ? 'private-key'
    : 'done'

  useEffect(() => { onFieldChange?.(activeField) }, [activeField, onFieldChange])

  const pulse = (field: ConnField) =>
    isV2 && activeField === field
      ? 'border-brand-500 ring-2 ring-brand-100 animate-ripple-ring'
      : 'border-tlx-border'

  return (
    <div data-v1-register-card className="mt-5 rounded-2xl border border-tlx-border bg-white p-6 shadow-sm">
      <p className="text-sm font-bold text-tlx-text">Connection Configuration</p>
      <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 lg:grid-cols-2">
        <div>
          <div className={['relative rounded-lg border border-[#2D3A50] focus-within:ring-1 focus-within:ring-[#2D3A50]', pulse('account-id')].join(' ')} data-v4-conn-account-id>
            <input type="text" id="v4-conn-account-id" value={accountId} onChange={(e) => setAccountId(e.target.value)} placeholder=" " className="peer block w-full rounded-lg border-0 bg-[#FFFFFF] px-3.5 py-3.5 pr-44 text-sm text-[#20293A] focus:outline-none focus:ring-0" />
            <label htmlFor="v4-conn-account-id" className="pointer-events-none absolute left-3 top-1/2 origin-[0] -translate-y-1/2 bg-white px-1 text-sm text-[#617085] transition-all duration-200 peer-focus:-top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-[#617085] peer-[:not(:placeholder-shown)]:-top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs">Account Identifier</label>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center border-l border-tlx-border px-3 text-xs text-tlx-secondary">.snowflakecomputing.com</span>
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-tlx-secondary">
            <InfoIcon className="h-3.5 w-3.5 text-brand-500" />
            How to obtain the Snowflake <a className="font-semibold text-brand-600 underline decoration-brand-300 underline-offset-2">account identifier</a>?
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-tlx-text">Authentication Type</p>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
            {([['keypair', 'Key Pair Authentication'], ['basic', 'Basic Authentication'], ['oauth', 'OAuth Authentication']] as const).map(([id, label]) => (
              <label key={id} className="flex cursor-pointer items-center gap-2 text-sm text-tlx-text">
                <input type="radio" name="v4-auth-type" checked={authType === id} onChange={() => setAuthType(id)} className="peer sr-only" />
                <span aria-hidden="true" className={['flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors', authType === id ? 'border-brand-500' : 'border-tlx-border'].join(' ')}>
                  {authType === id && <span className="h-2 w-2 rounded-full bg-brand-500" />}
                </span>
                {label}
              </label>
            ))}
          </div>
        </div>
        <div data-v4-conn-username className="relative">
          <input type="text" id="v4-conn-username" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder=" " className={['peer block w-full rounded-lg border bg-[#FFFFFF] px-3.5 py-3.5 text-sm text-[#20293A] focus:border-[#2D3A50] focus:outline-none focus:ring-1 focus:ring-[#2D3A50]', pulse('username')].join(' ')} />
          <label htmlFor="v4-conn-username" className="pointer-events-none absolute left-3 top-1/2 origin-[0] -translate-y-1/2 bg-white px-1 text-sm text-[#617085] transition-all duration-200 peer-focus:-top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-[#617085] peer-[:not(:placeholder-shown)]:-top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs">User Name</label>
        </div>
        <div data-v4-conn-passphrase>
          <div className="relative">
            <input type="password" id="v4-conn-passphrase" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder=" " className={['peer block w-full rounded-lg border bg-[#FFFFFF] px-3.5 py-3.5 text-sm text-[#20293A] focus:border-[#2D3A50] focus:outline-none focus:ring-1 focus:ring-[#2D3A50]', pulse('passphrase')].join(' ')} />
            <label htmlFor="v4-conn-passphrase" className="pointer-events-none absolute left-3 top-1/2 origin-[0] -translate-y-1/2 bg-white px-1 text-sm text-[#617085] transition-all duration-200 peer-focus:-top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-[#617085] peer-[:not(:placeholder-shown)]:-top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs">Passphrase</label>
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-tlx-secondary">
            <InfoIcon className="h-3.5 w-3.5 text-brand-500" />
            Passphrase used to encrypt the RSA private key.
          </p>
        </div>
        <div className="lg:col-span-2" data-v4-conn-private-key>
          <div className={['flex items-center gap-2 rounded-lg border bg-white px-3.5 py-2.5 text-sm', keyUploaded ? 'border-success text-tlx-text' : pulse('private-key'), !keyUploaded ? 'text-tlx-muted' : ''].join(' ')}>
            <span className="flex-1">{keyUploaded ? 'private_key.pem' : 'Private Key'}</span>
            <button type="button" data-v4-upload onClick={() => setKeyUploaded(true)} className={['inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700', isV2 && activeField === 'private-key' ? 'animate-ripple-ring rounded-[5px]' : ''].join(' ')}>
              <UploadIcon className="h-4 w-4" />
              {keyUploaded ? 'Replace' : 'Upload'}
            </button>
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-tlx-secondary">
            <InfoIcon className="h-3.5 w-3.5 text-brand-500" />
            Learn how to generate your Private and Public Key — see the <a className="font-semibold text-brand-600 underline decoration-brand-300 underline-offset-2">Snowflake key-pair authentication docs</a>.
          </p>
        </div>
      </div>
    </div>
  )
}

function PrerequisitesContent({ checked, onCheck, onDownload, downloaded, datasourceLabel }: { checked: boolean; onCheck: (v: boolean) => void; onDownload: () => void; downloaded: boolean; datasourceLabel: string }) {
  return (
    <div data-v1-register-card className="mt-5 rounded-2xl border border-tlx-border bg-white p-6 shadow-sm">
      <p className="text-sm font-bold text-tlx-text">Prerequisite Steps</p>
      <p className="mt-1 text-[13px] text-tlx-secondary">Download and run the {datasourceLabel} setup script before completing the connection step.</p>
      <div className="mt-6 space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-[13px] text-tlx-text">
          <span className="font-semibold text-tlx-secondary">Step 1 –</span>
          <button type="button" data-v4-download onClick={onDownload} className="relative inline-flex items-center gap-1.5 rounded-[5px] border-2 border-brand-500 bg-brand-500 px-4 py-1.5 text-sm font-semibold text-white ring-4 ring-brand-100 animate-ripple-ring">
            <DownloadIcon className="h-4 w-4" />
            Download
          </button>
          <span>and extract the zip file.</span>
        </div>
        <div className="text-[13px] leading-relaxed text-tlx-text">
          <span className="font-semibold text-tlx-secondary">Step 2 –</span>{' '}
          <span className="font-semibold">Using Snowsight or Classic Console:</span> upload the <code className="rounded bg-tlx-surface px-1 text-[12px] text-tlx-text">.ipynb</code> notebook or paste the contents of <code className="rounded bg-tlx-surface px-1 text-[12px] text-tlx-text">tlx_snowflake_pre_requisite_sql_setup.sql</code> into the UI. Replace <code className="rounded bg-tlx-surface px-1 text-[12px] text-tlx-text">&lt;password / RSA_PUBLIC_KEY&gt;</code> with the actual value and execute the script using the <span className="font-semibold">ACCOUNTADMIN</span> role.
        </div>
        <label
          data-v4-prereq-checkbox
          className={['flex cursor-pointer items-start gap-2.5 rounded-lg border px-3.5 py-3 text-[13px] text-tlx-text', downloaded && !checked ? 'border-brand-500 bg-brand-50 animate-ripple-ring' : 'border-tlx-border bg-tlx-surface'].join(' ')}
        >
          <input type="checkbox" checked={checked} onChange={(e) => onCheck(e.target.checked)} className="peer sr-only" />
          <span aria-hidden="true" className={['mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border-2 transition-colors', 'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-200', checked ? 'border-brand-500 bg-brand-500 text-white' : 'border-tlx-border bg-white text-transparent'].join(' ')}>
            <CheckIcon className="h-3 w-3" />
          </span>
          <span>I have run the prerequisite script in my {datasourceLabel} account.</span>
        </label>
      </div>
    </div>
  )
}

const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, viewBox: '0 0 24 24' }
type P = React.SVGProps<SVGSVGElement>

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
