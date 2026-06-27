import React from 'react'
import { Check, ShieldCheck, X } from 'lucide-react'
import {
  TELEMETRY_COLLECTED,
  TELEMETRY_NEVER_COLLECTED,
  markTelemetryPrompted,
  setTelemetryOptIn,
} from '../../lib/telemetry-consent'
import { setTelemetryOptInRemote } from '../../lib/team-api'

interface WorldModelConsentModalProps {
  onClose: () => void
}

/**
 * First-run, plain-language consent for the PRISM Intelligence Engine.
 * Default is OFF — closing or declining does not opt the user in.
 */
export function WorldModelConsentModal({ onClose }: WorldModelConsentModalProps) {
  const choose = (enabled: boolean) => {
    setTelemetryOptIn(enabled)
    void setTelemetryOptInRemote(enabled).catch(() => undefined)
    onClose()
  }

  const dismiss = () => {
    markTelemetryPrompted()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex items-start gap-3 border-b border-neutral-200 p-5 dark:border-neutral-800">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-semibold text-neutral-900 dark:text-neutral-50">
              Help build the PRISM Intelligence Engine
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
              PRISM is building a world model of how AI agents work in real software environments — a
              training ground for the next generation of autonomous coding and DevOps agents. You can
              contribute anonymized signals from your sessions. It’s entirely optional and off by default.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              What we collect
            </h3>
            <ul className="space-y-2">
              {TELEMETRY_COLLECTED.map((item) => (
                <li key={item} className="flex gap-2 text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
              What never leaves your device
            </h3>
            <ul className="space-y-2">
              {TELEMETRY_NEVER_COLLECTED.map((item) => (
                <li key={item} className="flex gap-2 text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                  <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-neutral-200 p-5 dark:border-neutral-800 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => choose(false)}
            className="rounded-lg border border-neutral-300 px-4 py-2.5 text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            No thanks
          </button>
          <button
            type="button"
            onClick={() => choose(true)}
            className="rounded-lg bg-violet-600 px-4 py-2.5 text-[13px] font-medium text-white hover:bg-violet-500"
          >
            Contribute anonymized data
          </button>
        </div>
        <p className="px-5 pb-4 text-center text-[11px] text-neutral-400">
          You can change this anytime in Connections. See our Privacy Policy for full details.
        </p>
      </div>
    </div>
  )
}
