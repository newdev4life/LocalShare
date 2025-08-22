const { contextBridge, ipcRenderer } = require('electron')

// 暴露安全的 API 到渲染进程
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, ...args) => {
      ipcRenderer.send(channel, ...args)
    },
    on: (channel, callback) => {
      ipcRenderer.on(channel, (event, ...args) => callback(...args))
    },
    removeAllListeners: (channel) => {
      ipcRenderer.removeAllListeners(channel)
    },
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args)
  },
  platform: process.platform
})