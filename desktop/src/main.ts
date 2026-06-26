import { app, BrowserWindow, dialog, ipcMain, Menu, nativeImage, shell } from 'electron'
import { existsSync } from 'fs'
import { join } from 'path'
import { collectProjectFiles } from './collect-files'
import type * as AutoUpdaterApi from './auto-updater'

const isDev = !app.isPackaged && process.env.ELECTRON_DEV === '1'

function loadAutoUpdaterApi(): typeof AutoUpdaterApi | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('./auto-updater') as typeof AutoUpdaterApi
  } catch (err) {
    console.warn('[PRISM] Auto-updater module unavailable:', (err as Error).message)
    return null
  }
}

function resolveAppIcon(): Electron.NativeImage | undefined {
  const candidates = [
    join(app.getAppPath(), 'build/icon.png'),
    join(app.getAppPath(), 'ui/dist/prism-logo.png'),
    join(__dirname, '../../build/icon.png'),
  ]
  for (const iconPath of candidates) {
    if (existsSync(iconPath)) {
      return nativeImage.createFromPath(iconPath)
    }
  }
  return undefined
}

function resolveIndexHtml(): string {
  return join(app.getAppPath(), 'ui/dist/index.html')
}

function createWindow(): BrowserWindow {
  Menu.setApplicationMenu(null)

  const icon = resolveAppIcon()
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    title: 'PRISM',
    frame: false,
    autoHideMenuBar: true,
    ...(icon ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  win.setMenuBarVisibility(false)

  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error('[PRISM] did-fail-load', { errorCode, errorDescription, validatedURL })
  })

  win.webContents.on('console-message', (_event, _level, message) => {
    if (message.includes('Error') || message.includes('error')) {
      console.log('[PRISM renderer]', message)
    }
  })

  if (isDev) {
    void win.loadURL('http://localhost:5173')
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    const indexPath = resolveIndexHtml()
    console.log('[PRISM] Loading index from', indexPath)
    void win.loadFile(indexPath)
  }

  return win
}

function unavailableUpdateStatus() {
  return {
    phase: 'error' as const,
    currentVersion: app.getVersion(),
    latestVersion: null,
    percent: null,
    message: null,
    error: 'Auto-updater not available',
  }
}

app.whenReady().then(() => {
  const win = createWindow()
  void (async () => {
    try {
      const { registerPtyHandlers } = await import('./pty-host')
      const terminalReady = registerPtyHandlers()
      if (!terminalReady) {
        console.warn('[PRISM] Packaged terminal unavailable — run npm run rebuild:native && npm run dist')
      }
    } catch (err) {
      console.warn('[PRISM] PTY host failed to load:', (err as Error).message)
    }
  })()
  const autoUpdaterApi = loadAutoUpdaterApi()
  autoUpdaterApi?.attachAutoUpdater(win)

  if (!isDev && app.isPackaged && autoUpdaterApi) {
    void (async () => {
      await new Promise((r) => setTimeout(r, 8000))
      const status = await autoUpdaterApi.checkForAppUpdates()
      if (status.phase === 'available' && status.latestVersion) {
        const { response } = await dialog.showMessageBox(win, {
          type: 'info',
          title: 'Update available',
          message: `PRISM v${status.latestVersion} is available (you have v${app.getVersion()}).`,
          detail: 'Download in the background and restart when ready?',
          buttons: ['Download update', 'Later'],
          defaultId: 0,
          cancelId: 1,
        })
        if (response === 0) {
          await autoUpdaterApi.downloadAppUpdate()
        }
      }
    })()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('app:version', () => app.getVersion())

ipcMain.handle('app:checkForUpdates', () => {
  const api = loadAutoUpdaterApi()
  return api ? api.checkForAppUpdates() : Promise.resolve(unavailableUpdateStatus())
})

ipcMain.handle('app:downloadUpdate', () => {
  const api = loadAutoUpdaterApi()
  return api ? api.downloadAppUpdate() : Promise.resolve(unavailableUpdateStatus())
})

ipcMain.handle('app:installUpdate', () => {
  loadAutoUpdaterApi()?.installDownloadedUpdate()
})

ipcMain.handle('app:getUpdateStatus', () => {
  const api = loadAutoUpdaterApi()
  return api ? api.getUpdateStatus() : unavailableUpdateStatus()
})

ipcMain.handle('dialog:pickFolder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  })
  if (result.canceled || result.filePaths.length === 0) return null
  return result.filePaths[0]
})

ipcMain.handle('project:pickAndCollect', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  })
  if (result.canceled || result.filePaths.length === 0) return null
  const folder = result.filePaths[0]
  const name = folder.split(/[/\\]/).pop() || 'Project'
  const files = collectProjectFiles(folder)
  return { name, folder, files }
})

ipcMain.handle('shell:openExternal', (_event, url: string) => {
  if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
    return shell.openExternal(url)
  }
  return false
})

ipcMain.handle('window:minimize', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize()
})

ipcMain.handle('window:toggleMaximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win) return
  if (win.isMaximized()) win.unmaximize()
  else win.maximize()
})

ipcMain.handle('window:close', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close()
})
