import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  completeGitHubDeviceLogin,
  getGitHubClientId,
  startGitHubDeviceLogin,
  type GitHubUser,
} from '../../lib/github-auth'
import { getDesktopAPI } from '../../lib/desktop-bridge'

interface SignInGateProps {
  onSignedIn: (user: GitHubUser) => void
}

export function SignInGate({ onSignedIn }: SignInGateProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userCode, setUserCode] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const startSignIn = async () => {
    setBusy(true)
    setError(null)
    setStatus(null)
    try {
      const flow = await startGitHubDeviceLogin()
      setUserCode(flow.userCode)
      setStatus('Waiting for GitHub authorization…')

      const api = getDesktopAPI()
      if (api?.openExternal) {
        await api.openExternal(flow.verificationUri)
      } else {
        window.open(flow.verificationUri, '_blank', 'noopener,noreferrer')
      }

      const user = await completeGitHubDeviceLogin(flow.deviceCode, flow.interval, () => {
        setStatus('Waiting for you to approve in the browser…')
      })
      onSignedIn(user)
    } catch (err) {
      setError((err as Error).message)
      setUserCode(null)
      setStatus(null)
    } finally {
      setBusy(false)
    }
  }

  const clientConfigured = Boolean(getGitHubClientId())

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#ececec] p-6 dark:bg-neutral-950">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
        <h1 className="text-center text-2xl font-semibold text-neutral-900 dark:text-neutral-50">PRISM</h1>
        <p className="mt-2 text-center text-[14px] text-neutral-500 dark:text-neutral-400">
          Sign in with your GitHub account to use the desktop app. Your session is stored locally on this device.
        </p>

        {!clientConfigured && (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
            GitHub OAuth is not configured in this build. Rebuild with{' '}
            <code className="font-mono">VITE_GITHUB_CLIENT_ID</code> set in CI secrets.
          </p>
        )}

        {userCode && (
          <div className="mt-4 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 text-center dark:border-violet-800 dark:bg-violet-950">
            <p className="text-[12px] text-violet-700 dark:text-violet-300">Enter this code on GitHub:</p>
            <p className="mt-1 font-mono text-2xl font-bold tracking-widest text-violet-900 dark:text-violet-100">
              {userCode}
            </p>
          </div>
        )}

        {status && (
          <p className="mt-3 flex items-center justify-center gap-2 text-[13px] text-neutral-500">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {status}
          </p>
        )}

        {error && <p className="mt-3 text-center text-[12px] text-red-600">{error}</p>}

        <button
          type="button"
          disabled={busy || !clientConfigured}
          onClick={() => void startSignIn()}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-3 text-[14px] font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-violet-600"
        >
          {busy ? 'Signing in…' : 'Sign in with GitHub'}
        </button>
      </div>
    </div>
  )
}
