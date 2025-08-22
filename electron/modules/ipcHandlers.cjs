const { ipcMain, dialog } = require('electron')
const { getFileSize, getFileFingerprint, getFolderFingerprint, isFolder } = require('../fileUtils.cjs')

class IpcHandlers {
  constructor(httpServer, windowManager) {
    this.httpServer = httpServer
    this.windowManager = windowManager
    this.registerHandlers()
  }

  registerHandlers() {
    // 文件更新
    ipcMain.on('update-files', (_event, files) => {
      this.httpServer.updateSharedFiles(files)
    })

    // 文件选择
    ipcMain.handle('pick-paths', async () => {
      const result = await dialog.showOpenDialog({
        properties: ['openFile', 'openDirectory', 'multiSelections']
      })
      if (result.canceled) return []
      return result.filePaths
    })

    ipcMain.handle('pick-files', async () => {
      const result = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections']
      })
      if (result.canceled) return []
      return result.filePaths
    })

    ipcMain.handle('pick-folders', async () => {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory', 'multiSelections']
      })
      if (result.canceled) return []
      return result.filePaths
    })

    // 文件信息获取
    ipcMain.handle('get-folder-fingerprint', async (event, folderPath) => {
      return getFolderFingerprint(folderPath)
    })

    ipcMain.handle('get-file-fingerprint', async (event, filePath) => {
      return getFileFingerprint(filePath)
    })

    ipcMain.handle('get-file-size', async (event, filePath) => {
      return getFileSize(filePath)
    })

    ipcMain.handle('is-folder', async (event, filePath) => {
      return isFolder(filePath)
    })

    // 服务器状态
    ipcMain.handle('get-server-status', async () => {
      const pinStatus = this.httpServer.getPinStatus()
      return {
        status: this.httpServer.serverAddress ? 'running' : 'starting',
        address: this.httpServer.serverAddress,
        pin: pinStatus.pin,
        pinEnabled: pinStatus.enabled
      }
    })

    // PIN 相关操作
    ipcMain.handle('generate-pin', async () => {
      return this.httpServer.generatePin()
    })

    ipcMain.handle('disable-pin', async () => {
      this.httpServer.disablePin()
      return true
    })

    ipcMain.handle('get-pin', async () => {
      return this.httpServer.getPinStatus()
    })

    // Windows 窗口控制
    ipcMain.on('window-minimize', () => {
      this.windowManager.minimize()
    })

    ipcMain.on('window-maximize', () => {
      this.windowManager.maximize()
    })

    ipcMain.on('window-close', () => {
      this.windowManager.close()
    })
  }

  // 清理所有处理器
  cleanup() {
    // 清理 ipcMain.on 注册的监听器
    ipcMain.removeAllListeners('update-files')
    ipcMain.removeAllListeners('window-minimize')
    ipcMain.removeAllListeners('window-maximize')
    ipcMain.removeAllListeners('window-close')
    
    // 清理 ipcMain.handle 注册的处理器
    try {
      ipcMain.removeHandler('pick-paths')
      ipcMain.removeHandler('pick-files')
      ipcMain.removeHandler('pick-folders')
      ipcMain.removeHandler('get-folder-fingerprint')
      ipcMain.removeHandler('get-file-fingerprint')
      ipcMain.removeHandler('get-file-size')
      ipcMain.removeHandler('is-folder')
      ipcMain.removeHandler('get-server-status')
      ipcMain.removeHandler('generate-pin')
      ipcMain.removeHandler('disable-pin')
      ipcMain.removeHandler('get-pin')
    } catch (error) {
      // 忽略已经移除或不存在的处理器错误
      console.warn('清理 IPC 处理器时出现警告:', error.message)
    }
  }
}

module.exports = IpcHandlers