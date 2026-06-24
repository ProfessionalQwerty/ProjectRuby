export interface GitHubUser {
  login: string
  name: string | null
  avatarUrl: string
}

const STORAGE_KEY = 'prism-github-auth'

interface StoredGitHubAuth {
  user: GitHubUser
  accessToken: string
  signedInAt: string
}

const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID as string | undefined

export function isGitHubSignedIn(): boolean {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY))
  } catch {
    return false
  }
}

export function getGitHubUser(): GitHubUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return (JSON.parse(raw) as StoredGitHubAuth).user
  } catch {
    return null
  }
}

export function signOutGitHub(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getGitHubClientId(): string | null {
  return CLIENT_ID?.trim() || null
}

export async function startGitHubDeviceLogin(): Promise<{
  deviceCode: string
  userCode: string
  verificationUri: string
  interval: number
}> {
  const clientId = getGitHubClientId()
  if (!clientId) {
    throw new Error(
      'GitHub sign-in is not configured. Set VITE_GITHUB_CLIENT_ID when building the desktop app.'
    )
  }

  const res = await fetch('https://github.com/login/device/code', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      scope: 'read:user user:email',
    }),
  })

  if (!res.ok) {
    throw new Error(`GitHub device flow failed (${res.status})`)
  }

  const data = (await res.json()) as {
    device_code: string
    user_code: string
    verification_uri: string
    interval?: number
  }

  return {
    deviceCode: data.device_code,
    userCode: data.user_code,
    verificationUri: data.verification_uri,
    interval: data.interval ?? 5,
  }
}

export async function pollGitHubDeviceToken(
  deviceCode: string,
  intervalSec: number,
  onWaiting?: () => void
): Promise<string> {
  const clientId = getGitHubClientId()
  if (!clientId) throw new Error('GitHub client ID missing')

  const maxAttempts = 120
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      onWaiting?.()
      await sleep(intervalSec * 1000)
    }

    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    })

    const data = (await res.json()) as {
      access_token?: string
      error?: string
    }

    if (data.access_token) return data.access_token
    if (data.error && data.error !== 'authorization_pending' && data.error !== 'slow_down') {
      throw new Error(data.error === 'access_denied' ? 'GitHub authorization was denied' : data.error)
    }

    if (data.error === 'slow_down') intervalSec += 5
  }

  throw new Error('GitHub sign-in timed out. Try again.')
}

export async function completeGitHubDeviceLogin(
  deviceCode: string,
  intervalSec: number,
  onWaiting?: () => void
): Promise<GitHubUser> {
  const token = await pollGitHubDeviceToken(deviceCode, intervalSec, onWaiting)

  const userRes = await fetch('https://api.github.com/user', {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'prism-desktop',
    },
  })

  if (!userRes.ok) throw new Error('Could not load GitHub profile')

  const profile = (await userRes.json()) as {
    login: string
    name: string | null
    avatar_url: string
  }

  const user: GitHubUser = {
    login: profile.login,
    name: profile.name,
    avatarUrl: profile.avatar_url,
  }

  const stored: StoredGitHubAuth = {
    user,
    accessToken: token,
    signedInAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  return user
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
