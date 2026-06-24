import React, { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { isDesktopApp } from '../../lib/desktop-bridge'
import {
  checkForAppUpdate,
  downloadAppUpdate,
  installAppUpdate,
  subscribeToUpdateStatus,
  type AppUpdateStatus,
} from '../../lib/updates'

export function UpdateCheckButton() {
  const [status, setStatus] = useState<AppUpdateStatus | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToUpdateStatus((next) => setStatus(next))
    return () => unsubscribe?.()
  }, [])

  if (!isDesktopApp()) return null

  const onAction = async () => {
    setBusy(true)
    try {
      const current = status || (await checkForAppUpdate())
      setStatus(current)

      if (current.phase === 'downloaded') {
        await installAppUpdate()
        return
      }

      if (current.phase === 'available') {
        const downloaded = await downloadAppUpdate()
        setStatus(downloaded)
        return
      }

      const checked = await checkForAppUpdate()
      setStatus(checked)
      if (checked.phase === 'available') {
        const downloaded = await downloadAppUpdate()
        setStatus(downloaded)
      }
    } finally {
      setBusy(false)
    }
  }

  const label =
    status?.phase === 'downloaded'
      ? 'Restart to update'
      : status?.phase === 'downloading'
        ? `Downloading ${status.percent != null ? `${Math.round(status.percent)}%` : '…'}`
        : status?.phase === 'available'
          ? 'Download update'
          : 'Updates'

  const hint = status?.message || status?.error

  return (
    <div className="flex items-center gap-2">
      {hint && (
        <span className="hidden max-w-[200px] truncate text-[11px] text-neutral-500 sm:inline">{hint}</span>
      )}
      <button
        type="button"
        onClick={() => void onAction()}
        disabled={busy || status?.phase === 'downloading'}
        title="Check for updates"
        className="flex h-8 items-center gap-1.5 rounded-md border border-neutral-300/80 bg-white px-2.5 text-[12px] font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${busy || status?.phase === 'downloading' ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">{label}</span>
      </button>
    </div>
  )
}
