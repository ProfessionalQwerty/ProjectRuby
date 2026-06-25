import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { apiClient } from '../api-config'
import { checkApiHealth } from '../lib/api-health'
import { QUICK_COMMANDS } from '../lib/commands'
import {
  getCatalogEntry,
  loadUserAgentIds,
  saveUserAgentIds,
  type ModelProviderId,
} from '../lib/models'
import { addProjectAgentId, getProjectAgentIds, removeProjectAgentId } from '../lib/project-agents'
import {
  createChatTab,
  loadChatTabs,
  saveChatTabs,
  titleFromMessages,
  type ChatTab,
} from '../lib/chat-tabs'
import type { ChatMessage } from '../lib/chat-types'
import {
  mergeSessionsForAgent,
  markSessionDeleted,
  upsertArchivedSession,
} from '../lib/session-store'

export interface Project {
  id: string
  name: string
  repoPath: string
  lastOpenedAt?: string
}

export interface AgentInfo {
  agentId: string
  displayName: string
  type: string
  connected: boolean
  status?: { state: string; message?: string }
}

export interface LedgerEntry {
  id: string
  sessionId?: string
  timestamp: string
  summary: string
  agent: string
  agentId?: string
  action: string
  outcome?: string
  prompt?: string
  filesModified?: string[]
  reasoningSummary?: string
}

export interface AgentSession {
  sessionId: string
  timestamp: string
  query: string
  status: string
  duration?: number
}

export type { ChatMessage } from '../lib/chat-types'

export interface ChatTabView {
  id: string
  sessionId: string
  title: string
}

const fallbackVision =
  'Define your product vision here. PRISM will inject this into every agent session as persistent context.'

function ledgerToMessages(entries: LedgerEntry[]): ChatMessage[] {
  const msgs: ChatMessage[] = []
  const sorted = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
  for (const entry of sorted) {
    if (entry.action === 'user_prompt' && entry.prompt) {
      msgs.push({ id: `${entry.id}-user`, role: 'user', content: entry.prompt })
      continue
    }
    if (entry.action === 'response_recorded' && (entry.reasoningSummary || entry.summary)) {
      msgs.push({
        id: `${entry.id}-agent`,
        role: 'agent',
        content: entry.reasoningSummary || entry.summary,
        detail: entry.agent,
      })
      continue
    }
    if (entry.prompt && entry.action !== 'agent_invoked' && entry.action !== 'context_compiled') {
      msgs.push({ id: `${entry.id}-user`, role: 'user', content: entry.prompt })
    }
    if (
      entry.summary &&
      !['agent_invoked', 'context_compiled', 'user_prompt', 'memory_updated'].includes(entry.action)
    ) {
      msgs.push({
        id: `${entry.id}-agent`,
        role: 'agent',
        content: entry.summary,
        detail: entry.agent,
      })
    }
  }
  return msgs
}

export function useWorkspaceState() {
  const [apiOnline, setApiOnline] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [bootstrapComplete, setBootstrapComplete] = useState(false)
  const [restorationMessage, setRestorationMessage] = useState<string | null>(null)
  const [activeTaskTitle, setActiveTaskTitle] = useState<string | null>(null)

  const [userAgentIds, setUserAgentIds] = useState<string[]>(() => loadUserAgentIds())
  const [registeredAgents, setRegisteredAgents] = useState<AgentInfo[]>([])
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [projectAgentIds, setProjectAgentIds] = useState<string[]>([])

  const [vision, setVision] = useState(fallbackVision)
  const [repoFiles, setRepoFiles] = useState<string[]>([])
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([])
  const [agentSessions, setAgentSessions] = useState<AgentSession[]>([])
  const [sessionsByAgent, setSessionsByAgent] = useState<Record<string, AgentSession[]>>({})
  const [sessionsRevision, setSessionsRevision] = useState(0)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [prompt, setPrompt] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  const [chatTabs, setChatTabs] = useState<ChatTab[]>([])
  const [activeChatTabId, setActiveChatTabId] = useState<string | null>(null)

  const chatTabsRef = useRef(chatTabs)
  const activeChatTabIdRef = useRef(activeChatTabId)
  const messagesRef = useRef(messages)
  const sessionIdRef = useRef(sessionId)
  chatTabsRef.current = chatTabs
  activeChatTabIdRef.current = activeChatTabId
  messagesRef.current = messages
  sessionIdRef.current = sessionId

  const flushActiveTab = useCallback(() => {
    const agentId = activeAgentId
    const tabId = activeChatTabIdRef.current
    if (!agentId || !tabId) return
    const msgs = messagesRef.current
    const sid = sessionIdRef.current
    setChatTabs((prev) => {
      const next = prev.map((t) =>
        t.id === tabId
          ? {
              ...t,
              messages: msgs,
              sessionId: sid || t.sessionId,
              title: titleFromMessages(msgs),
              updatedAt: new Date().toISOString(),
            }
          : t
      )
      saveChatTabs(activeProjectId, agentId, next)
      return next
    })
  }, [activeAgentId, activeProjectId])

  const loadTabsForAgent = useCallback(
    (agentId: string) => {
      const tabs = loadChatTabs(activeProjectId, agentId)
      const active = tabs[tabs.length - 1] || tabs[0]
      setChatTabs(tabs)
      setActiveChatTabId(active?.id ?? null)
      setMessages(active?.messages ?? [])
      setSessionId(active?.sessionId)
      setActiveSessionId(active?.sessionId ?? null)
    },
    [activeProjectId]
  )

  const projectModels = useMemo(() => {
    const ids = new Set<string>([...projectAgentIds, ...userAgentIds])
    ledgerEntries.forEach((e) => {
      if (e.agentId) ids.add(e.agentId)
    })
    return Array.from(ids)
  }, [ledgerEntries, projectAgentIds, userAgentIds])

  const refreshAgents = useCallback(async () => {
    try {
      const res = await apiClient.get<{ success: boolean; agents: AgentInfo[] }>('/api/agents/list')
      setRegisteredAgents(res.agents)
      return res.agents
    } catch {
      setRegisteredAgents([])
      return []
    }
  }, [])

  const refreshProjects = useCallback(async (options?: { applyActive?: boolean }) => {
    const applyActive = options?.applyActive !== false
    try {
      const res = await apiClient.get<{
        success: boolean
        projects: Project[]
        activeProjectId: string | null
      }>('/api/projects')
      setProjects(res.projects)
      const active =
        res.projects.find((p) => p.id === res.activeProjectId) || res.projects[0] || null
      if (applyActive) {
        setActiveProjectId(res.activeProjectId)
        setActiveProject(active)
      }
      return { projects: res.projects, active: applyActive ? active : null }
    } catch {
      return { projects: [], active: null as Project | null }
    }
  }, [])

  const mapLedgerEntries = (entries: Array<Record<string, unknown>>): LedgerEntry[] =>
    entries.map((e) => {
      const actor = e.actor as { agentId?: string; displayName?: string } | undefined
      const trigger = e.trigger as { prompt?: string } | undefined
      return {
        id: String(e.id),
        sessionId: e.sessionId ? String(e.sessionId) : undefined,
        timestamp:
          typeof e.timestamp === 'string'
            ? e.timestamp
            : new Date(e.timestamp as string).toISOString(),
        summary: String(e.summary || ''),
        agent: String(e.agent || actor?.displayName || actor?.agentId || 'system'),
        agentId: actor?.agentId,
        action: String(e.action || ''),
        outcome: e.outcome ? String(e.outcome) : undefined,
        prompt: trigger?.prompt || (e.trigger as { prompt?: string } | undefined)?.prompt,
        filesModified: Array.isArray(e.filesModified)
          ? (e.filesModified as string[])
          : Array.isArray(e.files_modified)
            ? (e.files_modified as string[])
            : undefined,
        reasoningSummary: e.reasoningSummary ? String(e.reasoningSummary) : undefined,
      }
    })

  const refreshWorkspaceData = useCallback(async () => {
    const online = await checkApiHealth()
    if (!online) {
      setApiOnline(false)
      return
    }

    try {
      const [visionRes, graphRes, ledgerRes] = await Promise.all([
        apiClient.get<{ success: boolean; vision: { content: string } }>(
          '/api/repository-memory/vision'
        ),
        apiClient.get<{
          success: boolean
          stats: { topFiles?: { file: string }[] }
        }>('/api/graph'),
        apiClient.get<{ success: boolean; entries: Array<Record<string, unknown>> }>(
          '/api/ledger?action=file_modified&limit=50'
        ),
      ])

      setVision(visionRes.vision.content || fallbackVision)
      setRepoFiles(graphRes.stats?.topFiles?.map((f) => f.file) || [])
      setLedgerEntries(mapLedgerEntries(ledgerRes.entries || []))
      setApiOnline(true)
    } catch {
      // Engine is reachable; workspace data may be empty until a project is connected.
    }
  }, [])

  const loadAgentSessions = useCallback(async (agentId: string) => {
    try {
      const res = await apiClient.get<{
        success: boolean
        sessions: AgentSession[]
      }>(`/api/agents/${agentId}/history?limit=50`)
      const mapped = (res.sessions || []).map((s) => ({
        ...s,
        timestamp:
          typeof s.timestamp === 'string' ? s.timestamp : new Date(s.timestamp).toISOString(),
      }))
      setSessionsByAgent((prev) => ({ ...prev, [agentId]: mapped }))
      if (agentId === activeAgentId) setAgentSessions(mapped)
    } catch {
      setSessionsByAgent((prev) => ({ ...prev, [agentId]: [] }))
      if (agentId === activeAgentId) setAgentSessions([])
    }
  }, [activeAgentId])

  const openProject = useCallback(async (projectId: string, projectList?: Project[]) => {
    try {
      const res = await apiClient.post<{
        success: boolean
        restoration: { message: string; activeTaskTitle?: string }
      }>(`/api/projects/${projectId}/open`, {})
      setRestorationMessage(res.restoration.message)
      setActiveTaskTitle(res.restoration.activeTaskTitle || null)
      setActiveProjectId(projectId)
      const list = projectList ?? (await refreshProjects()).projects
      const project = list.find((p) => p.id === projectId)
      if (project) setActiveProject(project)
      const pAgents = getProjectAgentIds(projectId)
      setProjectAgentIds(pAgents)
      if (pAgents.length > 0) {
        const nextAgent = pAgents[0]
        setActiveAgentId(nextAgent)
        loadTabsForAgent(nextAgent)
        void loadAgentSessions(nextAgent)
      } else {
        setMessages([])
        setSessionId(undefined)
        setActiveSessionId(null)
        setChatTabs([])
        setActiveChatTabId(null)
      }
      const stored = loadUserAgentIds()
      setUserAgentIds(stored)
      setApiOnline(true)
      await refreshWorkspaceData()
      await refreshAgents()
    } catch {
      // Project open failed — engine may still be online
    }
  }, [refreshProjects, loadTabsForAgent, loadAgentSessions, refreshWorkspaceData, refreshAgents])

  const connectProject = useCallback(
    async (repoPath: string, name?: string) => {
      const res = await apiClient.post<{ success: boolean; project: Project }>(
        '/api/projects/connect',
        { repoPath, name }
      )
      const { projects: updated } = await refreshProjects()
      await openProject(res.project.id, updated)
      return res.project
    },
    [openProject, refreshProjects]
  )

  const connectProjectUpload = useCallback(
    async (name: string, files: Array<{ path: string; content: string }>) => {
      const res = await apiClient.post<{ success: boolean; project: Project }>(
        '/api/projects/connect-upload',
        { name, files }
      )
      const { projects: updated } = await refreshProjects()
      await openProject(res.project.id, updated)
      return res.project
    },
    [openProject, refreshProjects]
  )

  const loadSession = useCallback(
    async (sid: string) => {
      const existingTab = chatTabsRef.current.find((t) => t.sessionId === sid)
      if (existingTab) {
        flushActiveTab()
        setActiveChatTabId(existingTab.id)
        setMessages(existingTab.messages)
        setSessionId(existingTab.sessionId)
        setActiveSessionId(existingTab.sessionId)
        return
      }
      try {
        const res = await apiClient.get<{ success: boolean; entries: Array<Record<string, unknown>> }>(
          `/api/ledger?sessionId=${encodeURIComponent(sid)}&limit=100`
        )
        const entries = mapLedgerEntries(res.entries || [])
        const loaded = ledgerToMessages(entries)
        flushActiveTab()
        const tab: ChatTab = {
          id: sid,
          sessionId: sid,
          title: titleFromMessages(loaded),
          messages: loaded,
          updatedAt: new Date().toISOString(),
        }
        setChatTabs((prev) => {
          const next = [...prev, tab]
          if (activeAgentId) saveChatTabs(activeProjectId, activeAgentId, next)
          return next
        })
        setActiveChatTabId(tab.id)
        setMessages(loaded)
        setSessionId(sid)
        setActiveSessionId(sid)
        if (activeAgentId) {
          upsertArchivedSession(activeProjectId, activeAgentId, {
            sessionId: sid,
            query: tab.title,
            timestamp: tab.updatedAt,
            status: 'success',
          })
          setSessionsRevision((v) => v + 1)
        }
      } catch {
        // Session load failed — keep engine online
      }
    },
    [activeAgentId, activeProjectId, flushActiveTab]
  )

  const selectAgent = useCallback(
    (agentId: string) => {
      if (agentId === activeAgentId) return
      flushActiveTab()
      setActiveAgentId(agentId)
      loadTabsForAgent(agentId)
      void loadAgentSessions(agentId)
    },
    [activeAgentId, flushActiveTab, loadAgentSessions, loadTabsForAgent]
  )

  const selectChatTab = useCallback(
    (tabId: string) => {
      if (tabId === activeChatTabId) return
      flushActiveTab()
      const tab = chatTabsRef.current.find((t) => t.id === tabId)
      if (!tab) return
      setActiveChatTabId(tabId)
      setMessages(tab.messages)
      setSessionId(tab.sessionId)
      setActiveSessionId(tab.sessionId)
    },
    [activeChatTabId, flushActiveTab]
  )

  const startNewChat = useCallback(() => {
    flushActiveTab()
    const tab = createChatTab()
    setChatTabs((prev) => {
      const next = [...prev, tab]
      if (activeAgentId) saveChatTabs(activeProjectId, activeAgentId, next)
      return next
    })
    setActiveChatTabId(tab.id)
    setMessages([])
    setSessionId(tab.sessionId)
    setActiveSessionId(tab.sessionId)
  }, [activeAgentId, activeProjectId, flushActiveTab])

  const closeChatTab = useCallback(
    (tabId: string) => {
      flushActiveTab()
      setChatTabs((prev) => {
        let next = prev.filter((t) => t.id !== tabId)
        if (next.length === 0) next = [createChatTab()]
        if (activeAgentId) saveChatTabs(activeProjectId, activeAgentId, next)
        if (tabId === activeChatTabIdRef.current) {
          const tab = next[next.length - 1]
          setActiveChatTabId(tab.id)
          setMessages(tab.messages)
          setSessionId(tab.sessionId)
          setActiveSessionId(tab.messages.length ? tab.sessionId : null)
        }
        return next
      })
    },
    [activeAgentId, activeProjectId, flushActiveTab]
  )

  const bootstrap = useCallback(async () => {
    const online = await checkApiHealth()
    setApiOnline(online)

    try {
      if (online) {
        await refreshAgents()
        await refreshProjects({ applyActive: false })
      }
    } catch {
      // Bootstrap data failed — health check above already set engine status
    } finally {
      setBootstrapComplete(true)
    }
  }, [refreshAgents, refreshProjects])

  const bootstrapStarted = useRef(false)
  useEffect(() => {
    if (bootstrapStarted.current) return
    bootstrapStarted.current = true
    void bootstrap()
  }, [bootstrap])

  useEffect(() => {
    if (!apiOnline) return
    const id = window.setInterval(() => {
      void refreshWorkspaceData()
    }, 15000)
    return () => window.clearInterval(id)
  }, [apiOnline, refreshWorkspaceData])

  useEffect(() => {
    if (activeAgentId && apiOnline) {
      void loadAgentSessions(activeAgentId)
    }
  }, [activeAgentId, apiOnline, loadAgentSessions])

  useEffect(() => {
    if (!activeAgentId || !activeChatTabId) return
    setChatTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === activeChatTabId)
      if (idx < 0) return prev
      const current = prev[idx]
      const updated: ChatTab = {
        ...current,
        messages,
        sessionId: sessionId || current.sessionId,
        title: titleFromMessages(messages),
        updatedAt: new Date().toISOString(),
      }
      if (
        updated.messages === current.messages &&
        updated.sessionId === current.sessionId &&
        updated.title === current.title
      ) {
        return prev
      }
      const next = [...prev]
      next[idx] = updated
      saveChatTabs(activeProjectId, activeAgentId, next)
      return next
    })
  }, [messages, sessionId, activeChatTabId, activeAgentId, activeProjectId])

  const addAgent = useCallback(
    async (
      modelId: ModelProviderId,
      options?: {
        apiKey?: string
        authType?: 'oauth' | 'api_key'
        local?: { port?: number; model?: string }
      }
    ) => {
      const online = await checkApiHealth()
      if (!online) {
        throw new Error('PRISM engine is offline. Start the daemon on port 19991 first.')
      }

      const catalog = getCatalogEntry(modelId)
      if (!catalog) throw new Error('Unknown model')

      const config: Record<string, unknown> = { enabled: true }
      if (options?.authType === 'oauth' && catalog.oauthProvider) {
        config.authType = 'oauth'
        config.oauthProvider = catalog.oauthProvider
      } else if (options?.apiKey) {
        config.apiKey = options.apiKey
        config.authType = 'api_key'
      }
      if (modelId === 'local-model') {
        config.port = options?.local?.port || 11434
        config.service = 'ollama'
        config.model = options?.local?.model || 'llama3.2'
        config.host = 'localhost'
      }

      await apiClient.post('/api/agents/register', { agentId: modelId, config })

      const nextIds = [...new Set([...loadUserAgentIds(), modelId])]
      saveUserAgentIds(nextIds)
      setUserAgentIds(nextIds)

      const projectId = activeProjectId
      if (projectId) {
        addProjectAgentId(projectId, modelId)
        setProjectAgentIds(getProjectAgentIds(projectId))
      } else {
        setProjectAgentIds((prev) => [...new Set([...prev, modelId])])
      }

      selectAgent(modelId)
      await refreshAgents()
      setApiOnline(true)
    },
    [activeProjectId, refreshAgents, selectAgent]
  )

  const removeAgent = useCallback(
    async (agentId: string) => {
      try {
        await apiClient.post(`/api/agents/${agentId}/unregister`, {})
      } catch {
        /* ignore */
      }
      const nextIds = loadUserAgentIds().filter((id) => id !== agentId)
      saveUserAgentIds(nextIds)
      setUserAgentIds(nextIds)
      if (activeProjectId) {
        removeProjectAgentId(activeProjectId, agentId)
        setProjectAgentIds(getProjectAgentIds(activeProjectId))
      }
      if (activeAgentId === agentId) {
        const remaining = projectModels.filter((id) => id !== agentId)
        if (remaining[0]) selectAgent(remaining[0])
        else {
          setActiveAgentId(null)
          setMessages([])
          setAgentSessions([])
        }
      }
      await refreshAgents()
    },
    [activeAgentId, activeProjectId, projectModels, refreshAgents, selectAgent]
  )

  const saveVision = useCallback(async (content: string) => {
    const res = await apiClient.post<{ success: boolean; vision: { content: string } }>(
      '/api/repository-memory/vision',
      { content }
    )
    setVision(res.vision.content)
    setApiOnline(true)
  }, [])

  const runPrompt = useCallback(
    async (queryOverride?: string) => {
      const query = (queryOverride || prompt).trim()
      if (!query || isRunning) return
      if (!activeAgentId) {
        setMessages((m) => [
          ...m,
          {
            id: `err-${Date.now()}`,
            role: 'agent',
            content: 'Add an AI model using the + button before sending prompts.',
          },
        ])
        return
      }

      const registered = registeredAgents.find((a) => a.agentId === activeAgentId)
      if (registered && !registered.connected) {
        setMessages((m) => [
          ...m,
          {
            id: `err-${Date.now()}`,
            role: 'agent',
            content: `${getCatalogEntry(activeAgentId)?.name || activeAgentId} is not connected. Open the + menu and add your API key.`,
          },
        ])
        return
      }

      setPrompt('')
      setIsRunning(true)
      const activeSession = sessionId || crypto.randomUUID()
      if (!sessionId) setSessionId(activeSession)

      const pendingId = `pending-${Date.now()}`
      setMessages((current) => [
        ...current,
        { id: `user-${Date.now()}`, role: 'user', content: query },
        {
          id: pendingId,
          role: 'agent',
          content: '',
          detail: 'pending',
        },
      ])

      try {
        const catalog = getCatalogEntry(activeAgentId)
        const response = await apiClient.post<{
          success: boolean
          result: {
            sessionId: string
            provider: string
            agentId: string
            answer: string
            context: { totalTokens: number; files: string[] }
          }
        }>('/api/orchestrator/run', {
          query,
          agentId: activeAgentId,
          provider: catalog?.providerLabel || activeAgentId,
          tokenBudget: 8000,
          sessionId: activeSession,
        })

        setSessionId(response.result.sessionId)
        setActiveSessionId(response.result.sessionId)
        upsertArchivedSession(activeProjectId, activeAgentId, {
          sessionId: response.result.sessionId,
          query,
          timestamp: new Date().toISOString(),
          status: 'success',
        })
        setSessionsRevision((v) => v + 1)
        setMessages((current) => [
          ...current.filter((m) => m.detail !== 'pending'),
          {
            id: `agent-${response.result.sessionId}`,
            role: 'agent',
            content: response.result.answer,
            detail: `${response.result.provider} · ${response.result.context.totalTokens} tokens · ${response.result.context.files.length} files`,
          },
        ])
        if (activeProjectId) {
          addProjectAgentId(activeProjectId, activeAgentId)
          setProjectAgentIds(getProjectAgentIds(activeProjectId))
        }
        await refreshWorkspaceData()
        await loadAgentSessions(activeAgentId)
        setApiOnline(true)
      } catch (err) {
        setMessages((current) => [
          ...current.filter((m) => m.detail !== 'pending'),
          {
            id: `err-${Date.now()}`,
            role: 'agent',
            content: `Error: ${(err as Error).message}`,
          },
        ])
      } finally {
        setIsRunning(false)
      }
    },
    [
      activeAgentId,
      isRunning,
      loadAgentSessions,
      prompt,
      refreshWorkspaceData,
      registeredAgents,
      sessionId,
    ]
  )

  const runQuickCommand = useCallback(
    (cmd: string) => {
      const def = QUICK_COMMANDS[cmd]
      void runPrompt(def?.prompt ?? cmd)
    },
    [runPrompt]
  )

  const getSessionsForAgent = useCallback(
    (agentId: string): AgentSession[] => {
      void sessionsRevision
      return mergeSessionsForAgent(activeProjectId, agentId, sessionsByAgent[agentId] || [])
    },
    [activeProjectId, sessionsByAgent, sessionsRevision]
  )

  const deleteSession = useCallback(
    (agentId: string, sessionId: string) => {
      markSessionDeleted(activeProjectId, agentId, sessionId)
      setSessionsRevision((v) => v + 1)
      setChatTabs((prev) => {
        const next = prev.filter((t) => t.sessionId !== sessionId)
        if (next.length === 0 && activeAgentId === agentId) {
          const fresh = createChatTab()
          setActiveChatTabId(fresh.id)
          setMessages([])
          setSessionId(fresh.sessionId)
          setActiveSessionId(fresh.sessionId)
          return [fresh]
        }
        if (activeChatTabIdRef.current && prev.find((t) => t.id === activeChatTabIdRef.current)?.sessionId === sessionId) {
          const tab = next[next.length - 1] || createChatTab()
          setActiveChatTabId(tab.id)
          setMessages(tab.messages)
          setSessionId(tab.sessionId)
          setActiveSessionId(tab.sessionId)
        }
        if (activeAgentId) saveChatTabs(activeProjectId, activeAgentId, next.length ? next : [createChatTab()])
        return next.length ? next : [createChatTab()]
      })
    },
    [activeAgentId, activeProjectId]
  )

  return {
    apiOnline,
    bootstrapComplete,
    projects,
    activeProject,
    activeProjectId,
    restorationMessage,
    activeTaskTitle,
    connectProject,
    connectProjectUpload,
    openProject,
    userAgentIds,
    projectModels,
    registeredAgents,
    activeAgentId,
    selectAgent,
    addAgent,
    removeAgent,
    vision,
    saveVision,
    repoFiles,
    ledgerEntries,
    agentSessions,
    getSessionsForAgent,
    loadAgentSessions,
    deleteSession,
    activeSessionId,
    loadSession,
    chatTabs: chatTabs.map((t) => ({ id: t.id, sessionId: t.sessionId, title: t.title })),
    activeChatTabId,
    selectChatTab,
    closeChatTab,
    startNewChat,
    messages,
    prompt,
    setPrompt,
    isRunning,
    runPrompt,
    runQuickCommand,
    refreshProjects,
    retryConnection: bootstrap,
  }
}
