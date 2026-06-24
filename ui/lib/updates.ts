import { getDesktopAPI } from './desktop-bridge'

export type AppUpdateStatus = {
  phase: string
  currentVersion: string
  latestVersion: string | null
  percent: number | null
  message: string | null
  error: string | null
}

export type AppUpdateInfo = AppUpdateStatus

export async function checkForAppUpdate(): Promise<AppUpdateStatus> {
  const api = getDesktopAPI()
  if (api?.checkForUpdates) {
    return api.checkForUpdates()
  }
  return {
    phase: 'error',
    currentVersion: '0.0.0',
    latestVersion: null,
    percent: null,
    message: null,
    error: 'Not running in desktop app',
  }
}

export async function downloadAppUpdate(): Promise<AppUpdateStatus> {
  const api = getDesktopAPI()
  if (api?.downloadUpdate) return api.downloadUpdate()
  throw new Error('Updates are only available in the desktop app')
}

export async function installAppUpdate(): Promise<void> {
  const api = getDesktopAPI()
  if (api?.installUpdate) {
    await api.installUpdate()
    return
  }
  throw new Error('Updates are only available in the desktop app')
}

export function subscribeToUpdateStatus(
  listener: (status: AppUpdateStatus) => void
): (() => void) | null {
  const api = getDesktopAPI()
  if (api?.onUpdateStatus) return api.onUpdateStatus(listener)
  return null
}
