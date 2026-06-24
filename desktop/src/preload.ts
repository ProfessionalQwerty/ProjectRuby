import { contextBridge, ipcRenderer } from 'electron'

export type UpdateStatusPayload = {
  phase: string
  currentVersion: string
  latestVersion: string | null
  percent: number | null
  message: string | null
  error: string | null
}

contextBridge.exposeInMainWorld('prismDesktop', true)

contextBridge.exposeInMainWorld('prismAPI', {
  getAppVersion: () => ipcRenderer.invoke('app:version') as Promise<string>,

  checkForUpdates: () => ipcRenderer.invoke('app:checkForUpdates') as Promise<UpdateStatusPayload>,

  downloadUpdate: () => ipcRenderer.invoke('app:downloadUpdate') as Promise<UpdateStatusPayload>,

  installUpdate: () => ipcRenderer.invoke('app:installUpdate') as Promise<void>,

  getUpdateStatus: () => ipcRenderer.invoke('app:getUpdateStatus') as Promise<UpdateStatusPayload>,

  onUpdateStatus: (listener: (status: UpdateStatusPayload) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, status: UpdateStatusPayload) => listener(status)
    ipcRenderer.on('app:updateStatus', handler)
    return () => ipcRenderer.removeListener('app:updateStatus', handler)
  },

  pickFolder: () => ipcRenderer.invoke('dialog:pickFolder') as Promise<string | null>,

  pickFolderAndCollect: () =>
    ipcRenderer.invoke('project:pickAndCollect') as Promise<{
      name: string
      folder: string
      files: Array<{ path: string; content: string }>
    } | null>,

  openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url) as Promise<boolean>,
})
