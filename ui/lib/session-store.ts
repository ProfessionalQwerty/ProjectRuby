export interface SessionRecord {
  sessionId: string
  query: string
  timestamp: string
  status: string
  duration?: number
}

export interface ArchivedSession {
  sessionId: string
  query: string
  timestamp: string
  status: string
}

function archiveKey(projectId: string | null, agentId: string): string {
  return `prism-session-archive:${projectId || 'default'}:${agentId}`
}

function deletedKey(projectId: string | null, agentId: string): string {
  return `prism-session-deleted:${projectId || 'default'}:${agentId}`
}

export function loadArchivedSessions(
  projectId: string | null,
  agentId: string
): ArchivedSession[] {
  try {
    const raw = localStorage.getItem(archiveKey(projectId, agentId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as ArchivedSession[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function upsertArchivedSession(
  projectId: string | null,
  agentId: string,
  session: ArchivedSession
): void {
  const existing = loadArchivedSessions(projectId, agentId)
  const idx = existing.findIndex((s) => s.sessionId === session.sessionId)
  const next =
    idx >= 0
      ? existing.map((s, i) => (i === idx ? { ...s, ...session } : s))
      : [session, ...existing]
  localStorage.setItem(archiveKey(projectId, agentId), JSON.stringify(next))
}

export function loadDeletedSessionIds(projectId: string | null, agentId: string): Set<string> {
  try {
    const raw = localStorage.getItem(deletedKey(projectId, agentId))
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as string[]
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

export function markSessionDeleted(
  projectId: string | null,
  agentId: string,
  sessionId: string
): void {
  const deleted = loadDeletedSessionIds(projectId, agentId)
  deleted.add(sessionId)
  localStorage.setItem(deletedKey(projectId, agentId), JSON.stringify([...deleted]))

  const archived = loadArchivedSessions(projectId, agentId).filter((s) => s.sessionId !== sessionId)
  localStorage.setItem(archiveKey(projectId, agentId), JSON.stringify(archived))
}

export function mergeSessionsForAgent(
  projectId: string | null,
  agentId: string,
  serverSessions: SessionRecord[]
): SessionRecord[] {
  const deleted = loadDeletedSessionIds(projectId, agentId)
  const byId = new Map<string, SessionRecord>()

  for (const session of serverSessions) {
    if (!deleted.has(session.sessionId)) {
      byId.set(session.sessionId, session)
    }
  }

  for (const archived of loadArchivedSessions(projectId, agentId)) {
    if (deleted.has(archived.sessionId)) continue
    if (!byId.has(archived.sessionId)) {
      byId.set(archived.sessionId, {
        sessionId: archived.sessionId,
        query: archived.query,
        timestamp: archived.timestamp,
        status: archived.status,
      })
    }
  }

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}
