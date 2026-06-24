import { app, BrowserWindow, dialog, ipcMain, Menu, nativeImage, shell } from 'electron'
import { existsSync } from 'fs'
import { join } from 'path'
import { collectProjectFiles } from './collect-files'
import {
  attachAutoUpdater,
  checkForAppUpdates,
  downloadAppUpdate,
  getUpdateStatus,
  installDownloadedUpdate,
} from './auto-updater'

const isDev = !app.isPackaged && process.env.ELECTRON_DEV === '1'

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
  attachAutoUpdater(win)

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

app.whenReady().then(() => {
  const win = createWindow()

  if (!isDev && app.isPackaged) {
    void (async () => {
      await new Promise((r) => setTimeout(r, 8000))
      const status = await checkForAppUpdates()
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
          await downloadAppUpdate()
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

ipcMain.handle('app:checkForUpdates', () => checkForAppUpdates())

ipcMain.handle('app:downloadUpdate', () => downloadAppUpdate())

ipcMain.handle('app:installUpdate', () => {
  installDownloadedUpdate()
})

ipcMain.handle('app:getUpdateStatus', () => getUpdateStatus())

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
