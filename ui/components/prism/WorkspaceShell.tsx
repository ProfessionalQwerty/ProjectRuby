import React, { useState } from 'react'
import { AgentBar } from './AgentBar'
import { Sidebar } from './Sidebar'
import { EditorPanel } from './EditorPanel'
import { RightPanel } from './RightPanel'
import { ConnectProjectModal } from './ConnectProjectModal'
import { ProjectWelcome } from './ProjectWelcome'
import { DaemonBanner } from './DaemonBanner'
import { ChatTabBar, ThemeToggle } from './ChatTabBar'
import { UpdateCheckButton } from './UpdateCheckButton'
import { useWorkspaceState } from '../../hooks/useWorkspaceState'
import { useConnections } from '../../hooks/useConnections'
import { useTheme } from '../../lib/theme'

export function WorkspaceShell() {
  const ws = useWorkspaceState()
  const connections = useConnections(ws.apiOnline && Boolean(ws.activeProject))
  const { dark, toggle } = useTheme()
  const [connectOpen, setConnectOpen] = useState(false)
  const [sessionsAgentId, setSessionsAgentId] = useState<string | null>(null)

  const viewSessionsAgentId = sessionsAgentId || ws.activeAgentId
  const sessionsForView = viewSessionsAgentId
    ? ws.getSessionsForAgent(viewSessionsAgentId)
    : []

  if (!ws.activeProject) {
    return (
      <ProjectWelcome
        apiOnline={ws.apiOnline}
        bootstrapComplete={ws.bootstrapComplete}
        projects={ws.projects}
        dark={dark}
        onToggleTheme={toggle}
        onRetryConnection={() => void ws.retryConnection()}
        onOpenProject={ws.openProject}
        onConnectUpload={ws.connectProjectUpload}
      />
    )
  }

  return (
    <div className="workspace-theme flex h-screen flex-col overflow-hidden bg-[#ececec] text-[16px] dark:bg-neutral-950 dark:text-neutral-100">
      {!ws.apiOnline && <DaemonBanner onRetry={() => void ws.retryConnection()} />}

      <div className="prism-titlebar flex h-11 shrink-0 items-center border-b border-neutral-300/80 bg-[#f3f3f3] pr-3 dark:border-neutral-700 dark:bg-neutral-900">
        <AgentBar
            apiOnline={ws.apiOnline}
            activeAgentId={ws.activeAgentId}
            projectModels={ws.projectModels}
            onSelectAgent={ws.selectAgent}
            onAddAgent={ws.addAgent}
            onRemoveAgent={ws.removeAgent}
          />
        <UpdateCheckButton />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      {ws.activeAgentId && (
        <ChatTabBar
          tabs={ws.chatTabs}
          activeTabId={ws.activeChatTabId}
          onSelectTab={ws.selectChatTab}
          onNewTab={ws.startNewChat}
          onCloseTab={ws.closeChatTab}
        />
      )}

      <div className="flex min-h-0 flex-1">
        <Sidebar
          activeProject={ws.activeProject}
          projects={ws.projects}
          repoFiles={ws.repoFiles}
          restorationMessage={ws.restorationMessage}
          activeTaskTitle={ws.activeTaskTitle}
          onSelectProject={(id) => void ws.openProject(id)}
          onConnectProject={() => setConnectOpen(true)}
        />

        <EditorPanel
          vision={ws.vision}
          messages={ws.messages}
          prompt={ws.prompt}
          isRunning={ws.isRunning}
          activeAgentId={ws.activeAgentId}
          hasAgents={ws.projectModels.length > 0}
          onPromptChange={ws.setPrompt}
          onSubmit={() => void ws.runPrompt()}
          onSaveVision={ws.saveVision}
          onQuickCommand={ws.runQuickCommand}
        />

        <RightPanel
          apiOnline={ws.apiOnline}
          ledgerEntries={ws.ledgerEntries}
          projectModels={ws.projectModels}
          sessionsAgentId={viewSessionsAgentId}
          onSessionsAgentChange={setSessionsAgentId}
          sessions={sessionsForView}
          onLoadSessionsForAgent={ws.loadAgentSessions}
          activeSessionId={ws.activeSessionId}
          onSelectSession={(id) => {
            if (viewSessionsAgentId && viewSessionsAgentId !== ws.activeAgentId) {
              ws.selectAgent(viewSessionsAgentId)
            }
            void ws.loadSession(id)
          }}
          onDeleteSession={ws.deleteSession}
          onNewChat={() => {
            if (viewSessionsAgentId && viewSessionsAgentId !== ws.activeAgentId) {
              ws.selectAgent(viewSessionsAgentId)
            }
            ws.startNewChat()
          }}
          connections={connections}
        />
      </div>

      {connectOpen && (
        <ConnectProjectModal
          onClose={() => setConnectOpen(false)}
          onConnect={async (path, name) => {
            await ws.connectProject(path, name)
          }}
          onConnectUpload={async (name, files) => {
            await ws.connectProjectUpload(name, files)
          }}
        />
      )}
    </div>
  )
}
