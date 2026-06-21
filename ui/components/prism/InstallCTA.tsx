import React, { useCallback, useState } from 'react'
import { Check, Copy, Download } from 'lucide-react'
import { Button } from '../ui/button'
import { ButtonColorful } from '../ui/button-colorful'
import { cn } from '../../lib/utils'
import {
  ALL_PLATFORM_DOWNLOADS,
  NPM_INSTALL_COMMAND,
  copyNpmInstallCommand,
  detectPlatformAsset,
  downloadInstaller,
  getDownloadButtonLabel,
  getInstallHint,
  getNpmInstallLabel,
  getWindowsInstallWarning,
} from '../../lib/downloads'

interface InstallCTAProps {
  className?: string
  showAllPlatforms?: boolean
  copied?: boolean
  onCopy?: () => void
  centered?: boolean
  /** wide = full-width npm + button row (for hero/footer); compact = stacked for narrow cards */
  layout?: 'stacked' | 'wide' | 'compact'
  compactNotes?: boolean
}

export function InstallCTA({
  className = '',
  showAllPlatforms = false,
  copied,
  onCopy,
  centered = true,
  layout = 'stacked',
  compactNotes = false,
}: InstallCTAProps) {
  const [localCopied, setLocalCopied] = useState(false)
  const isCopied = copied ?? localCopied
  const isWide = layout === 'wide'

  const copy = useCallback(async () => {
    if (onCopy) {
      onCopy()
      return
    }
    const ok = await copyNpmInstallCommand()
    if (ok) {
      setLocalCopied(true)
      window.setTimeout(() => setLocalCopied(false), 2000)
    }
  }, [onCopy])

  const npmLabel = isCopied ? 'Copied!' : getNpmInstallLabel()
  const primary = detectPlatformAsset()
  const alignStart = !centered || layout === 'compact'

  const npmBar = (
    <button
      type="button"
      onClick={() => void copy()}
      className={cn(
        'group flex w-full min-w-0 items-center gap-3 rounded-xl border border-neutral-300 bg-neutral-900 px-4 py-3 text-left font-mono text-[13px] text-neutral-100 shadow-sm transition hover:border-neutral-400 sm:text-[14px]',
        !isWide && !alignStart && 'max-w-md'
      )}
    >
      <span className="min-w-0 flex-1 truncate">{NPM_INSTALL_COMMAND}</span>
      {isCopied ? (
        <Check className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
      ) : (
        <Copy className="h-4 w-4 shrink-0 text-neutral-400 group-hover:text-neutral-200" aria-hidden />
      )}
    </button>
  )

  const actionButtons = (
    <div className={cn('flex flex-wrap gap-2', alignStart ? 'justify-start' : 'justify-center')}>
      <ButtonColorful label={npmLabel} onClick={() => void copy()} className="h-10 shrink-0 px-5 text-[13px]" />
      {!showAllPlatforms ? (
        <Button
          variant="landingOutline"
          size="default"
          onClick={() => void downloadInstaller()}
          className="h-10 shrink-0"
        >
          <Download className="mr-2 h-4 w-4" />
          {getDownloadButtonLabel()}
        </Button>
      ) : (
        ALL_PLATFORM_DOWNLOADS.map((p) => (
          <Button
            key={p.id}
            variant="landingOutline"
            size="default"
            className="h-10 shrink-0 whitespace-nowrap px-4"
            onClick={() => void downloadInstaller(p.filename)}
          >
            <Download className="mr-1.5 h-4 w-4 shrink-0" />
            {p.label}
          </Button>
        ))
      )}
    </div>
  )

  const notes = !compactNotes && (
    <div
      className={cn(
        'space-y-2 text-[12px] leading-relaxed text-neutral-500',
        alignStart ? 'text-left' : 'mx-auto max-w-md text-center'
      )}
    >
      <p>{getInstallHint()}</p>
      {(showAllPlatforms || primary.id === 'windows') && (
        <p className="text-amber-800/90">{getWindowsInstallWarning()}</p>
      )}
      <p className="text-neutral-400">
        Windows installers are code-signed through the{' '}
        <a href="https://signpath.org/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-neutral-600">
          SignPath Foundation
        </a>{' '}
        when configured in CI.
      </p>
    </div>
  )

  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-col gap-3',
        !alignStart && 'items-center text-center',
        className
      )}
    >
      {npmBar}
      {actionButtons}
      {notes && <div className="border-t border-neutral-200/80 pt-3">{notes}</div>}
    </div>
  )
}
