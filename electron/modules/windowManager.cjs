const { BrowserWindow } = require('electron')
const path = require('path')

class WindowManager {
  constructor() {
    this.mainWindow = null
  }

  // 创建主窗口
  createMainWindow() {
    const isWindows = process.platform === 'win32'
    const isMac = process.platform === 'darwin'
    
    const windowOptions = {
      width: 1000,
      height: 700,
      minWidth: 800,
      minHeight: 600,
      maxWidth: 1400,
      maxHeight: 1000,
      resizable: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload.cjs')
      },
      show: false // 延迟显示，避免白屏
    }

    // 平台特定的窗口配置
    if (isMac) {
      windowOptions.titleBarStyle = 'hiddenInset'
    } else if (isWindows) {
      windowOptions.frame = false // Windows 下使用无边框窗口
      windowOptions.titleBarStyle = 'hidden'
    }

    this.mainWindow = new BrowserWindow(windowOptions)

    // 监听窗口关闭事件，清理引用
    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })

    // 窗口准备就绪后显示
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show()
    })

    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:3000')
      this.mainWindow.webContents.openDevTools()
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
    }

    return this.mainWindow
  }

  // 获取主窗口
  getMainWindow() {
    return this.mainWindow
  }

  // 发送消息到渲染进程
  sendToRenderer(channel, data) {
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send(channel, data)
    }
  }

  // 监听渲染进程准备完成
  onRendererReady(callback) {
    if (this.mainWindow) {
      this.mainWindow.webContents.on('did-finish-load', callback)
    }
  }

  // 窗口控制方法
  minimize() {
    if (this.mainWindow) this.mainWindow.minimize()
  }

  maximize() {
    if (this.mainWindow) {
      if (this.mainWindow.isMaximized()) {
        this.mainWindow.unmaximize()
      } else {
        this.mainWindow.maximize()
      }
    }
  }

  close() {
    if (this.mainWindow) this.mainWindow.close()
  }

  // 销毁窗口
  destroy() {
    if (this.mainWindow) {
      this.mainWindow.destroy()
      this.mainWindow = null
    }
  }
}

module.exports = WindowManager