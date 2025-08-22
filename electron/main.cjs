const { app } = require('electron')
const HttpServer = require('./modules/httpServer.cjs')
const WindowManager = require('./modules/windowManager.cjs')
const IpcHandlers = require('./modules/ipcHandlers.cjs')

class LocalShareApp {
  constructor() {
    this.httpServer = new HttpServer()
    this.windowManager = new WindowManager()
    this.ipcHandlers = null
    this.initialized = false
  }

  // 初始化应用
  async initialize() {
    // 只在第一次初始化时设置回调和IPC处理器
    if (!this.initialized) {
      // 设置服务器状态变化回调
      this.httpServer.onStatusChange = (status) => {
        this.windowManager.sendToRenderer('server-status', status)
      }

      // 注册 IPC 处理器
      this.ipcHandlers = new IpcHandlers(this.httpServer, this.windowManager)

      // 启动 HTTP 服务器
      this.httpServer.start()

      this.initialized = true
    }

    // 创建主窗口（每次都可以创建新窗口）
    const mainWindow = this.windowManager.createMainWindow()

    // 监听渲染进程准备完成，同步状态
    this.windowManager.onRendererReady(() => {
      const status = {
        status: this.httpServer.serverAddress ? 'running' : 'starting',
        address: this.httpServer.serverAddress,
        ...this.httpServer.getPinStatus()
      }
      this.windowManager.sendToRenderer('server-status', status)
    })
  }

  // 只创建窗口（用于 macOS activate 事件）
  createWindow() {
    if (!this.windowManager.getMainWindow()) {
      this.windowManager.createMainWindow()

      // 监听渲染进程准备完成，同步状态
      this.windowManager.onRendererReady(() => {
        const status = {
          status: this.httpServer.serverAddress ? 'running' : 'starting',
          address: this.httpServer.serverAddress,
          ...this.httpServer.getPinStatus()
        }
        this.windowManager.sendToRenderer('server-status', status)
      })
    }
  }

  // 清理资源
  cleanup() {
    if (this.httpServer) {
      this.httpServer.stop()
    }
    if (this.ipcHandlers) {
      this.ipcHandlers.cleanup()
    }
    if (this.windowManager) {
      this.windowManager.destroy()
    }
  }
}

// 创建应用实例
const localShareApp = new LocalShareApp()

// Electron 应用事件处理
app.whenReady().then(() => {
  localShareApp.initialize()

  app.on('activate', function () {
    // macOS 特定行为：dock 图标被点击时重新创建窗口
    // 但不重复初始化应用
    localShareApp.createWindow()
  })
})

app.on('window-all-closed', function () {
  // macOS 上关闭窗口不退出应用，只清理窗口相关资源
  if (process.platform !== 'darwin') {
    localShareApp.cleanup()
    app.quit()
  }
})

// 应用退出时清理
app.on('before-quit', () => {
  localShareApp.cleanup()
})