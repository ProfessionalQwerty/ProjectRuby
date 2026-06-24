export type AppUpdateStatus = {
  phase: string
  currentVersion: string
  latestVersion: string | null
  percent: number | null
  message: string | null
  error: string | null
}

export interface PrismDesktopAPI {
  getAppVersion: () => Promise<string>
  checkForUpdates: () => Promise<AppUpdateStatus>
  downloadUpdate: () => Promise<AppUpdateStatus>
  installUpdate: () => Promise<void>
  getUpdateStatus: () => Promise<AppUpdateStatus>
  onUpdateStatus: (listener: (status: AppUpdateStatus) => void) => () => void
  pickFolder: () => Promise<string | null>
  pickFolderAndCollect: () => Promise<{
    name: string
    folder: string
    files: Array<{ path: string; content: string }>
  } | null>
  openExternal: (url: string) => Promise<boolean>
}

declare global {
  interface Window {
    prismDesktop?: boolean
    prismAPI?: PrismDesktopAPI
  }
}

export {}
