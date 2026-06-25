import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { LogIn, Plus } from 'lucide-react'
import { cn } from '../../lib/utils'
import { ModelLogo } from '../ui/ModelLogo'
import { PrismGlyph } from './PrismGlyph'
import { MODEL_CATALOG, getCatalogEntry, type ModelProviderId } from '../../lib/models'
import { runLlmOAuthSignIn } from '../../lib/llm-auth'

interface AgentBarProps {
  apiOnline: boolean
  activeAgentId: string | null
  projectModels: string[]
  onSelectAgent: (id: string) => void
  onAddAgent: (
    modelId: ModelProviderId,
    options?: { apiKey?: string; authType?: 'oauth' | 'api_key'; local?: { port?: number; model?: string } }
  ) => Promise<void>
  onRemoveAgent: (id: string) => Promise<void>
}

export function AgentBar({
  apiOnline,
  activeAgentId,
  projectModels,
  onSelectAgent,
  onAddAgent,
  onRemoveAgent,
}: AgentBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [adding, setAdding] = useState<ModelProviderId | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [showAdvancedKey, setShowAdvancedKey] = useState(false)
  const [ollamaModel, setOllamaModel] = useState('llama3.2')
  const [ollamaPort, setOllamaPort] = useState('11434')
  const [submitting, setSubmitting] = useState(false)
  const [signingIn, setSigningIn] = useState(false)
  const [deviceCode, setDeviceCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const addButtonRef = useRef<HTMLButtonElement>(null)

  const availableToAdd = MODEL_CATALOG.filter((m) => !projectModels.includes(m.id))

  const updateMenuPosition = () => {
    if (!addButtonRef.current) return
    const rect = addButtonRef.current.getBoundingClientRect()
    setMenuPos({ top: rect.bottom + 4, left: rect.left })
  }

  useLayoutEffect(() => {
    if (menuOpen) updateMenuPosition()
  }, [menuOpen, adding])

  useEffect(() => {
    if (!menuOpen) return
    const onResize = () => updateMenuPosition()
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
    }
  }, [menuOpen])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (menuRef.current?.contains(target) || addButtonRef.current?.contains(target)) return
      setMenuOpen(false)
      setAdding(null)
      setShowAdvancedKey(false)
      setDeviceCode(null)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const resetForm = () => {
    setMenuOpen(false)
    setAdding(null)
    setApiKey('')
    setShowAdvancedKey(false)
    setDeviceCode(null)
  }

  const handleOAuthSignIn = async () => {
    const entry = adding ? getCatalogEntry(adding) : null
    if (!entry?.oauthProvider) return
    if (!apiOnline) {
      setError('PRISM engine is offline. Start the daemon first (see banner above).')
      return
    }
    setSigningIn(true)
    setError(null)
    try {
      if (entry.oauthProvider === 'openai-codex') {
        const { startChatGptSignIn, openOAuthUrl, pollChatGptSignIn } = await import('../../lib/llm-auth')
        const started = await startChatGptSignIn()
        setDeviceCode(started.userCode)
        await openOAuthUrl(
          `${started.verificationUri}?user_code=${encodeURIComponent(started.userCode)}`
        )
        for (let i = 0; i < 120; i++) {
          await new Promise((r) => setTimeout(r, 3000))
          const result = await pollChatGptSignIn(started.sessionId)
          if (result === 'complete') {
            await onAddAgent(adding!, { authType: 'oauth' })
            resetForm()
            return
          }
        }
        throw new Error('ChatGPT sign-in timed out')
      }
      await runLlmOAuthSignIn(entry.oauthProvider)
      await onAddAgent(adding!, { authType: 'oauth' })
      resetForm()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSigningIn(false)
    }
  }

  const handleAdd = async () => {
    if (!adding) return
    if (!apiOnline) {
      setError('PRISM engine is offline. Start the daemon first (see banner above).')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const entry = getCatalogEntry(adding)!
      if (entry.authMethod === 'api_key' && !apiKey.trim()) {
        setError('API key is required')
        return
      }
      if (entry.authMethod === 'oauth' && showAdvancedKey && !apiKey.trim()) {
        setError('Enter an API key or use web sign-in')
        return
      }
      await onAddAgent(
        adding,
        entry.authMethod === 'oauth' && showAdvancedKey
          ? { authType: 'api_key', apiKey: apiKey.trim() }
          : entry.authMethod === 'api_key'
            ? { authType: 'api_key', apiKey: apiKey.trim() }
            : adding === 'local-model'
              ? { local: { port: Number(ollamaPort), model: ollamaModel } }
              : undefined
      )
      resetForm()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const addingEntry = adding ? getCatalogEntry(adding) : null

  const menuPanel = menuOpen ? (
    <div
      ref={menuRef}
      style={{ top: menuPos.top, left: menuPos.left }}
      className="fixed z-[9999] w-80 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
    >
      {!adding ? (
        <>
          <div className="border-b border-neutral-100 px-4 py-2.5 text-[12px] font-medium uppercase tracking-wide text-neutral-500">
            Add model to project
          </div>
          {!apiOnline && (
            <p className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-[12px] text-amber-900">
              Engine offline — start the daemon before adding models.
            </p>
          )}
          <div className="max-h-72 overflow-y-auto p-1.5">
            {availableToAdd.length === 0 ? (
              <p className="px-3 py-4 text-[13px] text-neutral-500">All models added</p>
            ) : (
              availableToAdd.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    setAdding(model.id)
                    setError(null)
                    setShowAdvancedKey(false)
                    setDeviceCode(null)
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <ModelLogo provider={model.id} size={22} />
                  <div>
                    <div className="text-[14px] font-medium text-neutral-800 dark:text-neutral-100">
                      {model.name}
                    </div>
                    <div className="text-[12px] text-neutral-500">{model.description}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <ModelLogo provider={adding} size={22} />
            <span className="text-[14px] font-medium">{addingEntry?.name}</span>
          </div>

          {addingEntry?.authMethod === 'oauth' && !showAdvancedKey && (
            <div className="mb-3 space-y-2">
              <p className="text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                Use your existing subscription — no API keys, no PRISM AI credits. Sign in with the
                provider you already pay for.
              </p>
              {deviceCode ? (
                <div className="rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-center dark:border-violet-900 dark:bg-violet-950/40">
                  <p className="text-[11px] uppercase tracking-wide text-violet-700 dark:text-violet-300">
                    Your device code
                  </p>
                  <p className="mt-1 font-mono text-[18px] font-semibold tracking-widest text-violet-900 dark:text-violet-100">
                    {deviceCode}
                  </p>
                  <p className="mt-1 text-[11px] text-violet-800 dark:text-violet-200">
                    Enter this at auth.openai.com if prompted
                  </p>
                </div>
              ) : null}
              <button
                type="button"
                disabled={signingIn || submitting}
                onClick={() => void handleOAuthSignIn()}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-neutral-900 py-2.5 text-[13px] font-medium text-white disabled:opacity-50 dark:bg-violet-600"
              >
                <LogIn className="h-4 w-4" />
                {signingIn ? 'Waiting for sign-in…' : addingEntry.oauthSignInLabel || 'Sign in'}
              </button>
              {addingEntry.supportsApiKeyFallback ? (
                <button
                  type="button"
                  className="w-full text-[12px] text-neutral-500 underline-offset-2 hover:underline"
                  onClick={() => setShowAdvancedKey(true)}
                >
                  Advanced: use API key instead
                </button>
              ) : null}
            </div>
          )}

          {(addingEntry?.authMethod === 'api_key' ||
            (addingEntry?.authMethod === 'oauth' && showAdvancedKey)) && (
            <label className="mb-3 block">
              <span className="mb-1 block text-[12px] text-neutral-600">
                {addingEntry?.apiKeyLabel || 'API Key'}
              </span>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                autoFocus
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-[14px] outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </label>
          )}

          {adding === 'local-model' && (
            <div className="mb-3 space-y-2">
              <input
                value={ollamaModel}
                onChange={(e) => setOllamaModel(e.target.value)}
                placeholder="Model name"
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-[14px] dark:border-neutral-700 dark:bg-neutral-800"
              />
              <input
                value={ollamaPort}
                onChange={(e) => setOllamaPort(e.target.value)}
                placeholder="Port"
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-[14px] dark:border-neutral-700 dark:bg-neutral-800"
              />
            </div>
          )}

          {error && <p className="mb-2 text-[12px] text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setAdding(null)
                setShowAdvancedKey(false)
                setDeviceCode(null)
              }}
              className="flex-1 rounded-md border py-2 text-[13px]"
            >
              Back
            </button>
            {(addingEntry?.authMethod !== 'oauth' || showAdvancedKey) && adding !== 'local-model' ? (
              <button
                type="button"
                disabled={submitting || signingIn}
                onClick={() => void handleAdd()}
                className="flex-1 rounded-md bg-neutral-900 py-2 text-[13px] font-medium text-white disabled:opacity-50"
              >
                {submitting ? 'Adding…' : 'Add'}
              </button>
            ) : adding === 'local-model' ? (
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleAdd()}
                className="flex-1 rounded-md bg-neutral-900 py-2 text-[13px] font-medium text-white disabled:opacity-50"
              >
                {submitting ? 'Adding…' : 'Add'}
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  ) : null

  return (
    <div className="prism-titlebar flex h-full min-w-0 flex-1 items-stretch select-none">
      <div className="flex h-full items-center gap-3 border-r border-neutral-300/80 px-4 dark:border-neutral-700">
        <PrismGlyph className="h-7 w-7 shrink-0" />
        <span className="text-[15px] font-semibold tracking-wide text-neutral-800 dark:text-neutral-100">
          PRISM
        </span>
      </div>

      <div className="flex h-full min-w-0 flex-1 items-stretch overflow-x-auto overflow-y-visible px-1">
        {projectModels.length === 0 && (
          <span className="flex items-center px-3 text-[13px] text-neutral-500 dark:text-neutral-400">
            No models on this project yet
          </span>
        )}
        {projectModels.map((agentId) => (
          <div key={agentId} className="group relative flex shrink-0 items-stretch">
            <button
              type="button"
              onClick={() => onSelectAgent(agentId)}
              className={cn(
                'flex items-center gap-2 border-r border-neutral-300/60 px-4 text-[14px] transition-colors dark:border-neutral-700',
                activeAgentId === agentId
                  ? 'bg-white font-medium text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-neutral-100'
                  : 'text-neutral-600 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-neutral-800/60'
              )}
            >
              <ModelLogo provider={agentId} size={18} />
              {getCatalogEntry(agentId)?.name || agentId}
            </button>
            <button
              type="button"
              title="Remove from project"
              onClick={() => void onRemoveAgent(agentId)}
              className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-neutral-600 text-[10px] text-white group-hover:flex"
            >
              ×
            </button>
          </div>
        ))}

        <div className="relative flex shrink-0 items-center">
          <button
            ref={addButtonRef}
            type="button"
            onClick={() => {
              setMenuOpen((v) => !v)
              setAdding(null)
              setError(null)
            }}
            className="flex h-full items-center px-3 text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            title="Add AI model"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {menuPanel && createPortal(menuPanel, document.body)}
    </div>
  )
}
