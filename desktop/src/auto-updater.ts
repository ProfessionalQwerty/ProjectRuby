import { app, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'

export type UpdatePhase =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error'

export type UpdateStatus = {
  phase: UpdatePhase
  currentVersion: string
  latestVersion: string | null
  percent: number | null
  message: string | null
  error: string | null
}

let mainWindow: BrowserWindow | null = null
let status: UpdateStatus = {
  phase: 'idle',
  currentVersion: app.getVersion(),
  latestVersion: null,
  percent: null,
  message: null,
  error: null,
}

function pushStatus(patch: Partial<UpdateStatus>): void {
  status = { ...status, ...patch }
  mainWindow?.webContents.send('app:updateStatus', status)
}

export function attachAutoUpdater(win: BrowserWindow): void {
  mainWindow = win
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    pushStatus({ phase: 'checking', message: 'Checking for updates…', error: null })
  })

  autoUpdater.on('update-available', (info) => {
    pushStatus({
      phase: 'available',
      latestVersion: info.version,
      message: `Update v${info.version} is available`,
      error: null,
    })
  })

  autoUpdater.on('update-not-available', () => {
    pushStatus({
      phase: 'not-available',
      latestVersion: status.latestVersion,
      message: `You're on the latest version (v${app.getVersion()})`,
      error: null,
    })
  })

  autoUpdater.on('download-progress', (progress) => {
    pushStatus({
      phase: 'downloading',
      percent: progress.percent,
      message: `Downloading update… ${Math.round(progress.percent)}%`,
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    pushStatus({
      phase: 'downloaded',
      latestVersion: info.version,
      percent: 100,
      message: `Update v${info.version} ready — restart to install`,
    })
  })

  autoUpdater.on('error', (err) => {
    pushStatus({
      phase: 'error',
      error: err.message,
      message: 'Update failed',
    })
  })
}

export function getUpdateStatus(): UpdateStatus {
  return status
}

export async function checkForAppUpdates(): Promise<UpdateStatus> {
  if (!app.isPackaged) {
    const current = app.getVersion()
    pushStatus({
      phase: 'not-available',
      currentVersion: current,
      message: 'Updates apply to installed desktop builds only',
      error: null,
    })
    return status
  }

  try {
    await autoUpdater.checkForUpdates()
  } catch (err) {
    pushStatus({
      phase: 'error',
      error: err instanceof Error ? err.message : 'Update check failed',
    })
  }
  return status
}

export async function downloadAppUpdate(): Promise<UpdateStatus> {
  if (!app.isPackaged) return status
  try {
    pushStatus({ phase: 'downloading', percent: 0, message: 'Starting download…' })
    await autoUpdater.downloadUpdate()
  } catch (err) {
    pushStatus({
      phase: 'error',
      error: err instanceof Error ? err.message : 'Download failed',
    })
  }
  return status
}

export function installDownloadedUpdate(): void {
  autoUpdater.quitAndInstall(false, true)
}
