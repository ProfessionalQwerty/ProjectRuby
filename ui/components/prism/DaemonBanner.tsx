import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { API_URL } from '../../api-config'
import { isDesktopApp } from '../../lib/desktop-bridge'

interface DaemonBannerProps {
  onRetry: () => void
}

export function DaemonBanner({ onRetry }: DaemonBannerProps) {
  const isDesktop = isDesktopApp()

  return (
    <div className="flex items-start gap-3 border-b border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1 space-y-2">
        {isDesktop ? (
          <>
            <p>
              <span className="font-medium">Cloud engine offline.</span> PRISM could not reach the hosted
              intelligence engine. Check your internet connection and click Retry.
            </p>
            {API_URL ? (
              <p className="text-[12px] text-amber-800">
                Engine URL:{' '}
                <code className="rounded bg-amber-100/80 px-1.5 py-0.5 font-mono text-[11px]">{API_URL}</code>
              </p>
            ) : null}
            <p className="text-[12px] text-amber-800">
              If this persists, the Hugging Face Space may still be starting — wait a minute and retry, or install
              a newer build from the website.
            </p>
          </>
        ) : (
          <>
            <p>
              <span className="font-medium">Engine offline.</span> Local dev needs the PRISM daemon on port{' '}
              <strong>19991</strong>.
            </p>
            <p className="text-[12px] text-amber-800">
              <span className="font-medium">Terminal 1</span> — start the engine from{' '}
              <code className="rounded bg-amber-100/80 px-1 font-mono text-[11px]">prism-engine</code>:
            </p>
            <code className="block rounded bg-amber-100/80 px-2 py-1.5 font-mono text-[11px] leading-relaxed">
              cd prism-engine
              <br />
              npm run start
            </code>
            <p className="text-[12px] text-amber-800">
              <span className="font-medium">Terminal 2</span> — UI dev server:
            </p>
            <code className="block rounded bg-amber-100/80 px-2 py-1.5 font-mono text-[11px]">
              cd prism-app
              <br />
              npm run dev
            </code>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="flex shrink-0 items-center gap-1.5 rounded-md border border-amber-300 bg-white px-2.5 py-1 text-[12px] font-medium hover:bg-amber-100"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Retry
      </button>
    </div>
  )
}
