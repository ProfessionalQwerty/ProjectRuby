import React, { useState } from 'react'
import {
  Cloud,
  Globe,
  Link2,
  Play,
  Rocket,
  Square,
  Unplug,
} from 'lucide-react'
import { GitHubIcon } from '../ui/GitHubIcon'
import { cn } from '../../lib/utils'
import type { useConnections } from '../../hooks/useConnections'
import { MODEL_CATALOG, type ModelProviderId } from '../../lib/models'
import { ModelLogo } from '../ui/ModelLogo'
import {
  isTelemetryOptedIn,
  setTelemetryOptIn,
  TELEMETRY_COLLECTED,
  TELEMETRY_NEVER_COLLECTED,
} from '../../lib/telemetry-consent'
import { runLlmOAuthSignIn } from '../../lib/llm-auth'
import { setTelemetryOptInRemote } from '../../lib/team-api'

type ConnectionsApi = ReturnType<typeof useConnections>

interface ConnectionsPanelProps {
  apiOnline: boolean
  connections: ConnectionsApi
  canManageModels?: boolean
  onAddAgent: (
    modelId: ModelProviderId,
    options?: { apiKey?: string; authType?: 'oauth' | 'api_key' }
  ) => Promise<void>
}

export function ConnectionsPanel({ apiOnline, connections, canManageModels = true, onAddAgent }: ConnectionsPanelProps) {
  const [vercelToken, setVercelToken] = useState('')
  const [llmBusy, setLlmBusy] = useState<string | null>(null)
  const [telemetryOn, setTelemetryOn] = useState(() => isTelemetryOptedIn())
  const { connections: state, gitStatus, preview, deployLog, busy, error, githubOAuth, needsProject } =
    connections

  if (!apiOnline) {
    return (
      <EmptyBlock text="Connect to the PRISM engine to manage GitHub, Vercel, and deployments." />
    )
  }

  if (!state) {
    return <EmptyBlock text="Loading connections…" />
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {needsProject ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Connect a project in the sidebar first — deploy and preview need an open project folder.
        </p>
      ) : null}

      {githubOAuth && !githubOAuth.ready ? (
        <p className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-[12px] text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
          {githubOAuth.hint || 'GitHub OAuth is not configured on the engine yet.'}
          {githubOAuth.redirectUrl ? (
            <>
              {' '}
              Callback URL for your GitHub OAuth app:{' '}
              <code className="break-all font-mono text-[11px]">{githubOAuth.redirectUrl}</code>
            </>
          ) : null}
        </p>
      ) : null}

      <section className="space-y-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          AI models
        </h3>
        <p className="text-[12px] text-neutral-600 dark:text-neutral-400">
          {canManageModels
            ? 'Connect with OAuth (ChatGPT / Claude subscriptions) or API keys for other providers. Team leads manage models in team workspaces.'
            : 'Models are managed by your team lead. You can use connected models for chat but cannot change credentials.'}
        </p>
        <div className="space-y-2">
          {MODEL_CATALOG.filter((m) => !m.hidden).map((model) => (
            <div
              key={model.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
            >
              <div className="flex min-w-0 items-center gap-2">
                <ModelLogo provider={model.id} size={18} />
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-neutral-800 dark:text-neutral-100">{model.name}</div>
                  <div className="truncate text-[11px] text-neutral-500">{model.description}</div>
                </div>
              </div>
              {model.authMethod === 'oauth' && model.oauthProvider ? (
                <button
                  type="button"
                  disabled={busy || llmBusy === model.id || !canManageModels}
                  onClick={() => {
                    void (async () => {
                      setLlmBusy(model.id)
                      try {
                        await runLlmOAuthSignIn(model.oauthProvider!)
                        await onAddAgent(model.id, { authType: 'oauth' })
                      } finally {
                        setLlmBusy(null)
                      }
                    })()
                  }}
                  className={actionBtnClass}
                >
                  {llmBusy === model.id ? '…' : 'Sign in'}
                </button>
              ) : model.authMethod === 'api_key' ? (
                <span className="text-[10px] text-neutral-400">API key</span>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onAddAgent(model.id)}
                  className={actionBtnClass}
                >
                  Add
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          Connections
        </h3>
        <ConnectionCard
          icon={<Cloud className="h-4 w-4" />}
          title="PRISM Cloud Engine"
          subtitle={state.engine.account || 'Hosted intelligence'}
          connected
        />
        <ConnectionCard
          icon={<GitHubIcon className="h-4 w-4" />}
          title="GitHub"
          subtitle={state.github.account || 'Push code without the terminal'}
          connected={state.github.connected}
          action={
            state.github.connected ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void connections.disconnect('github')}
                className={actionBtnClass}
              >
                <Unplug className="h-3 w-3" />
                Disconnect
              </button>
            ) : (
              <button
                type="button"
                disabled={busy || githubOAuth?.ready === false}
                onClick={() => void connections.connectGitHub()}
                className={actionBtnClass}
                title={
                  githubOAuth?.ready === false
                    ? githubOAuth.hint || 'GitHub OAuth not configured on engine'
                    : undefined
                }
              >
                <Link2 className="h-3 w-3" />
                Connect
              </button>
            )
          }
        />
        <ConnectionCard
          icon={<Globe className="h-4 w-4" />}
          title="Vercel"
          subtitle={state.vercel.account || 'Deploy and get a live URL'}
          connected={state.vercel.connected}
          action={
            state.vercel.connected ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void connections.disconnect('vercel')}
                className={actionBtnClass}
              >
                <Unplug className="h-3 w-3" />
                Disconnect
              </button>
            ) : (
              <div className="flex w-full flex-col gap-2">
                <input
                  type="password"
                  value={vercelToken}
                  onChange={(e) => setVercelToken(e.target.value)}
                  placeholder="Vercel token (vercel.com/account/tokens)"
                  className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-[12px] dark:border-neutral-600 dark:bg-neutral-800"
                />
                <button
                  type="button"
                  disabled={busy || !vercelToken.trim()}
                  onClick={() => void connections.connectVercel(vercelToken.trim())}
                  className={actionBtnClass}
                >
                  <Link2 className="h-3 w-3" />
                  Connect Vercel
                </button>
              </div>
            )
          }
        />
      </section>

      <section className="space-y-2 rounded-lg border border-neutral-300/80 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800/50">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          Local preview
        </h3>
        <p className="text-[12px] text-neutral-600 dark:text-neutral-400">
          Runs your dev server inside PRISM and opens a browser preview — no terminal needed.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void connections.startPreview()}
            className={actionBtnClass}
          >
            <Play className="h-3 w-3" />
            Start preview
          </button>
          {preview?.running ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void connections.stopPreview()}
              className={actionBtnClass}
            >
              <Square className="h-3 w-3" />
              Stop
            </button>
          ) : null}
        </div>
        {preview ? (
          <div className="rounded-md bg-neutral-100 p-2 font-mono text-[11px] dark:bg-neutral-900">
            <div>{preview.command}</div>
            <div className="text-emerald-600">{preview.url}</div>
            {preview.logs.slice(-6).map((line) => (
              <div key={line} className="truncate text-neutral-500">
                {line}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="space-y-2 rounded-lg border border-neutral-300/80 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800/50">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          Deploy
        </h3>
        {gitStatus ? (
          <p className="text-[12px] text-neutral-600 dark:text-neutral-400">
            {gitStatus.hasRepo ? (
              <>
                Branch <code className="font-mono">{gitStatus.branch || 'main'}</code>
                {gitStatus.changed.length + gitStatus.untracked.length > 0
                  ? ` · ${gitStatus.changed.length + gitStatus.untracked.length} changed file(s)`
                  : ' · clean'}
              </>
            ) : (
              'Git will be initialized on first deploy.'
            )}
          </p>
        ) : null}
        <button
          type="button"
          disabled={
            busy || !state.github.connected || !state.vercel.connected
          }
          onClick={() => void connections.deploy()}
          className={cn(
            actionBtnClass,
            'w-full justify-center bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900'
          )}
        >
          <Rocket className="h-3.5 w-3.5" />
          Deploy to Vercel
        </button>
        {deployLog ? (
          <p className="text-[12px] text-neutral-600 dark:text-neutral-400">{deployLog}</p>
        ) : null}
      </section>

      <section className="space-y-2 rounded-lg border border-violet-200/80 bg-violet-50/50 p-3 dark:border-violet-900 dark:bg-violet-950/20">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-300">
          PRISM Intelligence Engine
        </h3>
        <p className="text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-400">
          Contribute anonymized, abstracted signals from your sessions to help train a world model of how
          AI agents work in real software environments. Off by default — your source code never leaves your device.
        </p>

        <details className="group rounded-md border border-violet-200/60 bg-white/50 p-2 dark:border-violet-900/60 dark:bg-neutral-900/40">
          <summary className="cursor-pointer list-none text-[12px] font-medium text-violet-700 dark:text-violet-300">
            What exactly is shared?
          </summary>
          <div className="mt-2 space-y-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                Collected
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                {TELEMETRY_COLLECTED.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
                Never collected
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                {TELEMETRY_NEVER_COLLECTED.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </details>

        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-neutral-700 dark:text-neutral-200">
          <input
            type="checkbox"
            checked={telemetryOn}
            onChange={(e) => {
              setTelemetryOptIn(e.target.checked)
              setTelemetryOn(e.target.checked)
              void setTelemetryOptInRemote(e.target.checked).catch(() => undefined)
            }}
            className="rounded border-neutral-300"
          />
          Join the PRISM Intelligence Engine
        </label>
      </section>
    </div>
  )
}

const actionBtnClass =
  'inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-[12px] font-medium hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700'

function ConnectionCard({
  icon,
  title,
  subtitle,
  connected,
  action,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  connected: boolean
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-neutral-300/80 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800/50">
      <div className="flex items-start justify-between gap-2">
        <div className="flex gap-2">
          <div className="mt-0.5 text-neutral-500">{icon}</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium">{title}</span>
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  connected ? 'bg-emerald-500' : 'bg-amber-400'
                )}
              />
            </div>
            <p className="text-[12px] text-neutral-500">{subtitle}</p>
          </div>
        </div>
      </div>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  )
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="flex flex-1 items-center justify-center p-6 text-center text-[13px] text-neutral-500">
      {text}
    </div>
  )
}
