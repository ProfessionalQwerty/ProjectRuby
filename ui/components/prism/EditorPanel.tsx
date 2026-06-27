import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUp, Bot, Paperclip, Pencil, User } from 'lucide-react'
import { cn } from '../../lib/utils'
import { QUICK_COMMANDS } from '../../lib/commands'
import { ModelLogo } from '../ui/ModelLogo'
import { AgentThinking } from '../ui/AgentThinking'
import { ModelRouter } from './ModelRouter'
import { ModeSelector } from './ModeSelector'
import { getModelOption } from '../../lib/model-router'
import { getWorkspaceModeDefinition } from '../../lib/workspace-modes'
import type { WorkspaceMode } from '../../lib/workspace-modes'
import type { LlmOAuthProviderId } from '../../lib/models'
import type { ModelOption } from '../../lib/model-router'
import type { ChatMessage } from '../../hooks/useWorkspaceState'

interface EditorPanelProps {
  vision: string
  messages: ChatMessage[]
  prompt: string
  isRunning: boolean
  activeAgentId: string | null
  selectedModelId: string
  connectedProviders: Set<string>
  hasAgents: boolean
  workspaceMode: WorkspaceMode
  onWorkspaceModeChange: (mode: WorkspaceMode) => void
  onPromptChange: (v: string) => void
  onSubmit: () => void
  onSaveVision: (v: string) => Promise<void>
  onQuickCommand: (cmd: string) => void
  onSelectModel: (option: ModelOption) => void
  onConnectModel: (providerId: string, oauthProvider?: LlmOAuthProviderId) => void
}

export function EditorPanel({
  vision,
  messages,
  prompt,
  isRunning,
  activeAgentId,
  selectedModelId,
  connectedProviders,
  hasAgents,
  workspaceMode,
  onWorkspaceModeChange,
  onPromptChange,
  onSubmit,
  onSaveVision,
  onQuickCommand,
  onSelectModel,
  onConnectModel,
}: EditorPanelProps) {
  const [editingVision, setEditingVision] = useState(false)
  const [draftVision, setDraftVision] = useState(vision)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => setDraftVision(vision), [vision])
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const saveVision = useCallback(async () => {
    await onSaveVision(draftVision.trim())
    setEditingVision(false)
  }, [draftVision, onSaveVision])

  return (
    <main className="relative flex min-w-0 flex-1 flex-col bg-white text-[16px] dark:bg-neutral-950">
      <div className="relative z-10 border-b border-neutral-200/80 bg-white px-5 py-3.5 dark:border-neutral-800 dark:bg-neutral-950">
        {editingVision ? (
          <div className="flex gap-3">
            <textarea
              value={draftVision}
              onChange={(e) => setDraftVision(e.target.value)}
              className="min-h-[68px] flex-1 resize-none rounded-lg border border-neutral-200 px-3 py-2.5 text-[15px] outline-none focus:border-violet-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => void saveVision()} className="rounded-md bg-neutral-900 px-4 py-2 text-[14px] text-white dark:bg-violet-600">
                Save
              </button>
              <button type="button" onClick={() => setEditingVision(false)} className="rounded-md border px-4 py-2 text-[14px] dark:border-neutral-600">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-neutral-400">Vision</span>
            <p className="min-w-0 flex-1 truncate text-[15px] text-neutral-700 dark:text-neutral-200">{vision}</p>
            <button type="button" onClick={() => setEditingVision(true)} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <Pencil className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-8 py-8">
        {!hasAgents && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="max-w-md rounded-2xl border border-neutral-200 bg-white/90 p-9 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/90">
              <p className="text-[18px] font-medium text-neutral-800 dark:text-neutral-100">Connect a model</p>
              <p className="mt-3 text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                Pick a model below, then use <strong>Connect model</strong> to sign in with ChatGPT or Claude — or add
                API keys in the Connections panel.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) =>
          msg.role === 'user' ? (
            <div key={msg.id} className="mb-8 flex justify-end gap-3">
              <div className="max-w-[78%] rounded-2xl rounded-br-md bg-neutral-200/90 px-5 py-3.5 text-[16px] leading-relaxed text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100">
                {msg.content}
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-300 dark:bg-neutral-600">
                <User className="h-5 w-5 text-neutral-600 dark:text-neutral-200" />
              </div>
            </div>
          ) : (
            <div key={msg.id} className="mb-8 flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm dark:border-neutral-600 dark:bg-neutral-800">
                {activeAgentId ? <ModelLogo provider={activeAgentId} size={18} /> : <Bot className="h-5 w-5" />}
              </div>
              <div className="max-w-[85%]">
                {msg.detail === 'pending' ? (
                  <AgentThinking agentId={activeAgentId} stages={msg.stages} />
                ) : (
                  <p className="text-[16px] leading-relaxed text-neutral-800 dark:text-neutral-100">{msg.content}</p>
                )}
                {msg.detail && msg.detail !== 'pending' && (
                  <p className="mt-2 font-mono text-[13px] text-neutral-400">{msg.detail}</p>
                )}
              </div>
            </div>
          )
        )}
      </div>

      <div className="relative z-10 border-t border-neutral-200/80 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ModeSelector
              mode={workspaceMode}
              onModeChange={onWorkspaceModeChange}
              disabled={isRunning}
              menuPlacement="up"
              compact
            />
            <span className="hidden h-4 w-px bg-neutral-200 dark:bg-neutral-700 sm:block" />
            <ModelRouter
              selectedModelId={selectedModelId}
              connectedProviders={connectedProviders}
              onSelectModel={onSelectModel}
              onConnectModel={onConnectModel}
              disabled={isRunning}
            />
          </div>
          <span className="text-[11px] text-neutral-400">
            {getWorkspaceModeDefinition(workspaceMode).label} · {getModelOption(selectedModelId)?.label || 'Model'}
          </span>
        </div>
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-600 dark:bg-neutral-800">
          <div className="flex items-end gap-2 px-4 py-3">
            <button type="button" className="mb-1 rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700">
              <Paperclip className="h-5 w-5" />
            </button>
            <textarea
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (!isRunning) onSubmit()
                }
              }}
              rows={1}
              placeholder={
                hasAgents
                  ? getWorkspaceModeDefinition(workspaceMode).placeholder
                  : 'Add a model first…'
              }
              className="max-h-44 min-h-[48px] flex-1 resize-none bg-transparent py-2.5 text-[16px] outline-none dark:text-neutral-100"
            />
            <button
              type="button"
              disabled={isRunning || !prompt.trim()}
              onClick={onSubmit}
              className={cn(
                'mb-1 flex h-10 w-10 items-center justify-center rounded-lg',
                prompt.trim() && !isRunning ? 'bg-neutral-900 text-white dark:bg-violet-600' : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-700'
              )}
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(QUICK_COMMANDS).map(([cmd, { hint }]) => (
            <button
              key={cmd}
              type="button"
              title={hint}
              disabled={!hasAgents}
              onClick={() => onQuickCommand(cmd)}
              className="group rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-left hover:border-violet-200 disabled:opacity-40 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:border-violet-700"
            >
              <span className="font-mono text-[13px] font-medium text-violet-700 dark:text-violet-300">{cmd}</span>
              <span className="ml-2 text-[12px] text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300">{hint}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
