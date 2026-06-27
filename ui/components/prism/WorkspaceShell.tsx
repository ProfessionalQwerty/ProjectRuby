import React, { useState } from 'react'
import { EditorPanel } from './EditorPanel'
import { Sidebar } from './Sidebar'
import { RightPanel } from './RightPanel'
import { ConnectProjectModal } from './ConnectProjectModal'
import { ProjectWelcome } from './ProjectWelcome'
import { TitleBar } from './TitleBar'
import { ModeSelector } from './ModeSelector'
import { TokenCapModal } from './TokenCapModal'
import { DaemonBanner } from './DaemonBanner'
import { ChatTabBar } from './ChatTabBar'
import { WorldModelConsentModal } from './WorldModelConsentModal'
import { hasSeenTelemetryPrompt } from '../../lib/telemetry-consent'
import { useWorkspaceState } from '../../hooks/useWorkspaceState'
import { useConnections } from '../../hooks/useConnections'
import { useTheme } from '../../lib/theme'
import type { LlmOAuthProviderId } from '../../lib/models'

export function WorkspaceShell() {
  const ws = useWorkspaceState()
  const connections = useConnections(ws.apiOnline && Boolean(ws.activeProject))
  const { dark, toggle } = useTheme()
  const [connectOpen, setConnectOpen] = useState(false)
  const [sessionsAgentId, setSessionsAgentId] = useState<string | null>(null)
  const [connectionsTabFocus, setConnectionsTabFocus] = useState(false)
  const [consentOpen, setConsentOpen] = useState(false)

  React.useEffect(() => {
    if (!hasSeenTelemetryPrompt()) setConsentOpen(true)
  }, [])

  const viewSessionsAgentId = sessionsAgentId || ws.activeAgentId
  const sessionsForView = viewSessionsAgentId
    ? ws.getSessionsForAgent(viewSessionsAgentId)
    : []

  const handleConnectModel = (providerId: string, oauthProvider?: LlmOAuthProviderId) => {
    setConnectionsTabFocus(true)
    void providerId
    void oauthProvider
  }

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
    <div className="workspace-theme relative flex h-screen flex-col overflow-hidden bg-neutral-50 text-[16px] dark:bg-neutral-950 dark:text-neutral-100">
      {!ws.apiOnline && <DaemonBanner onRetry={() => void ws.retryConnection()} />}

      <TitleBar dark={dark} onToggleTheme={toggle}>
        <ModeSelector
          mode={ws.workspaceMode}
          onModeChange={ws.setWorkspaceMode}
          disabled={ws.isRunning}
          menuPlacement="down"
        />
      </TitleBar>

      <ChatTabBar
        tabs={ws.chatTabs}
        activeTabId={ws.activeChatTabId}
        onSelectTab={ws.selectChatTab}
        onNewTab={ws.startNewChat}
        onCloseTab={ws.closeChatTab}
      />

      <div className="relative z-10 flex min-h-0 flex-1">
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
          selectedModelId={ws.selectedModelId}
          connectedProviders={ws.connectedProviders}
          hasAgents={ws.connectedProviders.size > 0}
          workspaceMode={ws.workspaceMode}
          onWorkspaceModeChange={ws.setWorkspaceMode}
          onPromptChange={ws.setPrompt}
          onSubmit={() => void ws.runPrompt()}
          onSaveVision={ws.saveVision}
          onQuickCommand={ws.runQuickCommand}
          onSelectModel={ws.selectModel}
          onConnectModel={handleConnectModel}
        />

        <RightPanel
          apiOnline={ws.apiOnline}
          activeProjectId={ws.activeProjectId}
          repoPath={ws.activeProject?.repoPath}
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
          focusConnections={connectionsTabFocus}
          onConnectionsFocused={() => setConnectionsTabFocus(false)}
          onAddAgent={ws.addAgent}
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

      <TokenCapModal
        open={Boolean(ws.tokenCapMessage)}
        message={ws.tokenCapMessage || ''}
        onClose={ws.clearTokenCapMessage}
        onOptIn={ws.clearTokenCapMessage}
      />

      {consentOpen && <WorldModelConsentModal onClose={() => setConsentOpen(false)} />}
    </div>
  )
}
