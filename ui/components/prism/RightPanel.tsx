import React, { useEffect, useState } from 'react'
import { ChevronDown, Link2, MessageSquare, Plus, ScrollText, Trash2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { ModelLogo } from '../ui/ModelLogo'
import { getCatalogEntry } from '../../lib/models'
import type { AgentSession, LedgerEntry } from '../../hooks/useWorkspaceState'
import { ConnectionsPanel } from './ConnectionsPanel'
import { ConfirmDialog } from './ConfirmDialog'
import type { useConnections } from '../../hooks/useConnections'

type PanelTab = 'datalog' | 'sessions' | 'connections'

interface RightPanelProps {
  apiOnline: boolean
  ledgerEntries: LedgerEntry[]
  projectModels: string[]
  sessionsAgentId: string | null
  onSessionsAgentChange: (agentId: string) => void
  sessions: AgentSession[]
  onLoadSessionsForAgent: (agentId: string) => void
  activeSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onDeleteSession: (agentId: string, sessionId: string) => void
  onNewChat: () => void
  connections: ReturnType<typeof useConnections>
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function RightPanel({
  apiOnline,
  ledgerEntries,
  projectModels,
  sessionsAgentId,
  onSessionsAgentChange,
  sessions,
  onLoadSessionsForAgent,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat,
  connections,
}: RightPanelProps) {
  const [tab, setTab] = useState<PanelTab>('sessions')
  const [agentMenuOpen, setAgentMenuOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<AgentSession | null>(null)

  const viewAgentId = sessionsAgentId || projectModels[0] || null
  const agentName = viewAgentId ? getCatalogEntry(viewAgentId)?.name || viewAgentId : null

  useEffect(() => {
    if (tab === 'sessions' && viewAgentId) {
      onLoadSessionsForAgent(viewAgentId)
    }
  }, [tab, viewAgentId, onLoadSessionsForAgent])

  return (
    <aside className="flex w-[360px] shrink-0 flex-col border-l border-neutral-300/80 bg-[#f3f3f3] dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex h-12 items-center justify-between border-b border-neutral-300/80 px-3 dark:border-neutral-700">
        <div className="flex gap-1">
          <TabBtn active={tab === 'datalog'} onClick={() => setTab('datalog')} icon={<ScrollText className="h-3.5 w-3.5" />} label="Datalog" />
          <TabBtn active={tab === 'sessions'} onClick={() => setTab('sessions')} icon={<MessageSquare className="h-3.5 w-3.5" />} label="Sessions" />
          <TabBtn active={tab === 'connections'} onClick={() => setTab('connections')} icon={<Link2 className="h-3.5 w-3.5" />} label="Connections" />
        </div>
        <span className="flex items-center gap-1.5 text-[12px] text-neutral-500 dark:text-neutral-400">
          <span className={cn('h-2 w-2 rounded-full', apiOnline ? 'bg-emerald-500' : 'bg-amber-500')} />
          {apiOnline ? 'Live' : 'Offline'}
        </span>
      </div>

      {tab === 'datalog' ? (
        <div className="flex-1 overflow-y-auto p-3">
          {ledgerEntries.length === 0 ? (
            <EmptyState
              online={apiOnline}
              text="Code changes (files created or edited by agents) will appear here."
            />
          ) : (
            <div className="space-y-2">
              {ledgerEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    'rounded-lg border bg-white px-3 py-2.5 dark:bg-neutral-800',
                    entry.outcome === 'error' || entry.outcome === 'failure'
                      ? 'border-red-200'
                      : 'border-neutral-200 dark:border-neutral-700'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {entry.agentId && <ModelLogo provider={entry.agentId} size={14} />}
                      <span className="truncate text-[12px] font-medium text-neutral-800 dark:text-neutral-100">
                        {entry.agent}
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] text-neutral-400">{formatTime(entry.timestamp)}</span>
                  </div>
                  <div className="mt-1.5 text-[13px] font-medium leading-snug text-neutral-800 dark:text-neutral-100">
                    {entry.summary}
                  </div>
                  {entry.filesModified && entry.filesModified.length > 0 && (
                    <div className="mt-1.5 text-[11px] text-blue-600">{entry.filesModified.join(', ')}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : tab === 'connections' ? (
        <ConnectionsPanel apiOnline={apiOnline} connections={connections} />
      ) : (
        <>
          <div className="relative border-b border-neutral-300/60 px-3 py-2 dark:border-neutral-700">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setAgentMenuOpen((v) => !v)}
                disabled={projectModels.length === 0}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left hover:bg-neutral-200/60 disabled:opacity-40 dark:hover:bg-neutral-800"
              >
                {viewAgentId && <ModelLogo provider={viewAgentId} size={16} />}
                <span className="truncate text-[12px] font-medium text-neutral-700 dark:text-neutral-200">
                  {agentName || 'Select agent'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
              </button>
              <button
                type="button"
                onClick={onNewChat}
                disabled={!viewAgentId}
                className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-[11px] text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
              >
                <Plus className="h-3 w-3" />
                New
              </button>
            </div>

            {agentMenuOpen && projectModels.length > 0 && (
              <div className="absolute left-2 right-2 top-full z-40 mt-1 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                {projectModels.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      onSessionsAgentChange(id)
                      setAgentMenuOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] hover:bg-neutral-50 dark:hover:bg-neutral-800',
                      id === viewAgentId && 'bg-violet-50 text-violet-900 dark:bg-violet-950 dark:text-violet-100'
                    )}
                  >
                    <ModelLogo provider={id} size={14} />
                    {getCatalogEntry(id)?.name || id}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {!viewAgentId ? (
              <EmptyState online={apiOnline} text="Add a model with the + button to view its sessions." />
            ) : sessions.length === 0 ? (
              <EmptyState online={apiOnline} text="No sessions yet for this agent. Start a new chat or run /catchup." />
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className={cn(
                      'group flex items-stretch rounded-lg border transition-colors',
                      activeSessionId === session.sessionId
                        ? 'border-violet-300 bg-violet-50 dark:border-violet-700 dark:bg-violet-950'
                        : 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectSession(session.sessionId)}
                      className="min-w-0 flex-1 px-3 py-2.5 text-left hover:bg-neutral-50/80 dark:hover:bg-neutral-700/50"
                    >
                      <div className="flex items-center gap-2">
                        {viewAgentId && <ModelLogo provider={viewAgentId} size={14} />}
                        <span className="truncate text-[13px] font-medium text-neutral-800 dark:text-neutral-100">
                          {session.query || 'Untitled session'}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-500">
                        <span>{formatTime(session.timestamp)}</span>
                        <span
                          className={cn(
                            session.status === 'success' || session.status === 'local'
                              ? 'text-emerald-600'
                              : session.status === 'draft'
                                ? 'text-violet-600'
                                : 'text-neutral-400'
                          )}
                        >
                          {session.status === 'draft' ? 'new' : session.status}
                        </span>
                      </div>
                    </button>
                    <button
                      type="button"
                      title="Delete session"
                      onClick={() => setPendingDelete(session)}
                      className="flex w-9 shrink-0 items-center justify-center border-l border-neutral-200 text-neutral-400 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100 dark:border-neutral-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {pendingDelete && viewAgentId && (
        <ConfirmDialog
          title="Delete session?"
          message={`This permanently removes "${pendingDelete.query || 'Untitled session'}" from your session history. Open chat tabs are not affected unless this was the only copy.`}
          confirmLabel="Delete session"
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            onDeleteSession(viewAgentId, pendingDelete.sessionId)
            setPendingDelete(null)
          }}
        />
      )}
    </aside>
  )
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors',
        active
          ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-neutral-100'
          : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function EmptyState({ online, text }: { online: boolean; text: string }) {
  return (
    <p className="px-2 py-10 text-center text-[13px] leading-relaxed text-neutral-400">
      {!online && 'Engine offline — '}
      {text}
    </p>
  )
}
