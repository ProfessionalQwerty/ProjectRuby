import { apiClient } from '../api-config'
import { getDesktopAPI } from './desktop-bridge'
import type { LlmOAuthProviderId } from './models'

export interface LlmOAuthProviderStatus {
  id: LlmOAuthProviderId
  name: string
  signInLabel: string
  connected: boolean
  accountLabel?: string
  redirectUrl?: string | null
  ready?: boolean
}

export async function fetchLlmAuthStatus(): Promise<Record<LlmOAuthProviderId, LlmOAuthProviderStatus>> {
  const res = await apiClient.get<{
    success: boolean
    providers: Record<LlmOAuthProviderId, LlmOAuthProviderStatus>
  }>('/api/llm-auth')
  return res.providers
}

export async function startAnthropicSignIn(): Promise<string> {
  const res = await apiClient.post<{ success: boolean; authorizeUrl: string }>(
    '/api/llm-auth/anthropic/start',
    {}
  )
  return res.authorizeUrl
}

export async function startChatGptSignIn(): Promise<{
  sessionId: string
  userCode: string
  verificationUri: string
}> {
  const res = await apiClient.post<{
    success: boolean
    sessionId: string
    userCode: string
    verificationUri: string
  }>('/api/llm-auth/openai-codex/start', {})
  return {
    sessionId: res.sessionId,
    userCode: res.userCode,
    verificationUri: res.verificationUri,
  }
}

export async function pollChatGptSignIn(sessionId: string): Promise<'pending' | 'complete' | 'error'> {
  const res = await apiClient.get<{
    success: boolean
    status: 'pending' | 'complete' | 'error'
    error?: string
  }>(`/api/llm-auth/openai-codex/poll?sessionId=${encodeURIComponent(sessionId)}`)
  if (res.status === 'error') throw new Error(res.error || 'ChatGPT sign-in failed')
  return res.status
}

export async function openOAuthUrl(url: string): Promise<void> {
  const api = getDesktopAPI()
  if (api?.openExternal) await api.openExternal(url)
  else window.open(url, '_blank', 'noopener,noreferrer')
}

export async function runLlmOAuthSignIn(provider: LlmOAuthProviderId): Promise<void> {
  if (provider === 'anthropic') {
    const url = await startAnthropicSignIn()
    await openOAuthUrl(url)
    for (let i = 0; i < 90; i++) {
      await new Promise((r) => setTimeout(r, 2000))
      const status = await fetchLlmAuthStatus()
      if (status.anthropic?.connected) return
    }
    throw new Error('Claude sign-in timed out — complete login in your browser and try again')
  }

  const { sessionId, userCode, verificationUri } = await startChatGptSignIn()
  await openOAuthUrl(`${verificationUri}?user_code=${encodeURIComponent(userCode)}`)
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 3000))
    const result = await pollChatGptSignIn(sessionId)
    if (result === 'complete') return
  }
  throw new Error('ChatGPT sign-in timed out — enter the code at auth.openai.com and try again')
}
