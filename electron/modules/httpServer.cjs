const http = require('http')
const fs = require('fs')
const path = require('path')
const os = require('os')
const archiver = require('archiver')
const { renderPage, renderPinForm, renderNotFound } = require('./pageRenderer.cjs')

class HttpServer {
  constructor() {
    this.server = null
    this.port = 8080
    this.sharedFiles = new Map()
    this.currentPin = null
    this.pinProtectionEnabled = false
    this.serverAddress = null
    this.onStatusChange = null // 状态变化回调
    
    // 上传功能配置
    this.uploadEnabled = false
    this.uploadPath = process.cwd() // 默认上传到当前目录
    
    // 绑定清理函数到进程退出事件
    this.bindCleanupEvents()
  }

  // 获取本地IP地址
  getLocalIP() {
    const interfaces = os.networkInterfaces()
    for (const name of Object.keys(interfaces)) {
      for (const netInterface of interfaces[name]) {
        if (netInterface.internal || netInterface.family !== 'IPv4') continue
        return netInterface.address
      }
    }
    return 'localhost'
  }

  // 格式化字节大小
  formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0) return '-'
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let value = bytes
    let i = 0
    while (value >= 1024 && i < units.length - 1) {
      value /= 1024
      i++
    }
    return `${value.toFixed(2)} ${units[i]}`
  }

  // 转义HTML
  escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  // 处理请求
  handleRequest(req, res) {
    const urlPath = decodeURIComponent((req.url || '/'))

    // PIN 验证处理
    if (req.method === 'POST' && urlPath === '/verify-pin') {
      this.handlePinVerification(req, res)
      return
    }

    // 处理下载请求
    if (urlPath.startsWith('/download/')) {
      this.handleDownloadRequest(urlPath, res)
      return
    }

    // 处理上传请求
    if (req.method === 'POST' && urlPath === '/upload') {
      this.handleFileUpload(req, res)
      return
    }

    // 检查PIN保护
    if (this.pinProtectionEnabled) {
      const cookies = req.headers.cookie || ''
      const hasValidCookie = cookies.includes('pin-verified=true')
      if (!hasValidCookie) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(renderPinForm())
        return
      }
    }

    // 根路径：列出分享的根条目
    if (urlPath === '/' || urlPath === '') {
      this.handleRootPath(res)
      return
    }

    // 处理文件/文件夹访问
    this.handleFilePath(urlPath, res)
  }

  // 处理PIN验证
  handlePinVerification(req, res) {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => {
      const params = new URLSearchParams(body)
      const pin = params.get('pin')
      if (pin === this.currentPin) {
        res.writeHead(302, { 'Location': '/', 'Set-Cookie': `pin-verified=true; Path=/` })
        res.end()
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(renderPinForm('PIN码错误，请重试'))
      }
    })
  }

  // 处理根路径
  handleRootPath(res) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    const rows = Array.from(this.sharedFiles.entries()).map(([name, meta]) => {
      const full = typeof meta === 'string' ? { path: meta } : meta
      let sizeCell = '-'
      let type = '文件'
      let isDirectory = false
      try {
        const s = fs.statSync(full.path)
        if (s.isDirectory()) {
          type = '文件夹'
          isDirectory = true
        } else {
          sizeCell = this.formatBytes(s.size)
        }
      } catch (_) {}
      
      const downloadUrl = `/download/${encodeURIComponent(name)}`
      const browseUrl = `/${encodeURIComponent(name)}`
      
      return `<tr>
        <td>
          ${isDirectory ? 
            `<a href="${browseUrl}">${this.escapeHtml(name)}</a>` : 
            `<span>${this.escapeHtml(name)}</span>`
          }
          <div class="type">${type}</div>
        </td>
        <td>${sizeCell}</td>
        <td style="width:100px">
          <a href="${downloadUrl}" class="download-btn">下载</a>
        </td>
      </tr>`
    }).join('')

    const uploadForm = this.uploadEnabled ? `
      <div class="upload-section">
        <form class="upload-form" enctype="multipart/form-data">
          <input type="file" name="file" class="file-input" multiple accept="*/*" />
          <button type="submit" class="upload-btn">上传文件</button>
        </form>
        <div class="upload-status" id="uploadStatus"></div>
      </div>
    ` : ''

    const content = `
      ${uploadForm}
      <table>
        <thead>
          <tr><th>名称</th><th style="width:160px">大小</th><th style="width:100px">操作</th></tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="3">暂无共享文件</td></tr>'}</tbody>
      </table>
      <script>
        const uploadFormEl = document.querySelector('.upload-form')
        if (uploadFormEl) uploadFormEl.addEventListener('submit', async (e) => {
          e.preventDefault()
          const formData = new FormData()
          const fileInput = document.querySelector('input[type="file"]')
          const statusDiv = document.getElementById('uploadStatus')
          const submitBtn = document.querySelector('.upload-btn')
          
          if (fileInput.files.length === 0) {
            statusDiv.innerHTML = '<span class="upload-error">请选择文件</span>'
            return
          }
          
          for (let file of fileInput.files) {
            formData.append('file', file)
          }
          
          submitBtn.disabled = true
          submitBtn.textContent = '上传中...'
          statusDiv.innerHTML = '<span>正在上传...</span>'
          
          try {
            const response = await fetch('/upload', {
              method: 'POST',
              body: formData
            })
            
            const result = await response.json()
            
            if (result.success) {
              statusDiv.innerHTML = '<span class="upload-success">' + result.message + '</span>'
              fileInput.value = ''
              // 刷新页面以显示新上传的文件
              setTimeout(() => location.reload(), 1000)
            } else {
              statusDiv.innerHTML = '<span class="upload-error">上传失败: ' + (result.error || '未知错误') + '</span>'
            }
          } catch (error) {
            statusDiv.innerHTML = '<span class="upload-error">上传失败: ' + error.message + '</span>'
          } finally {
            submitBtn.disabled = false
            submitBtn.textContent = '上传文件'
          }
        })
      </script>
    `
    res.end(renderPage({ title: 'LocalShare', content, serverAddress: this.serverAddress }))
  }

  // 处理文件路径
  handleFilePath(urlPath, res) {
    const clean = urlPath.replace(/^\//, '')
    const [rootName, ...rest] = clean.split('/')
    const meta = this.sharedFiles.get(rootName)
    const base = typeof meta === 'string' ? meta : (meta && meta.path)

    if (!base) {
      renderNotFound(res, clean)
      return
    }

    // 目标路径（限制在共享根目录内）
    const subPath = rest.join('/')
    const targetPath = path.resolve(base, subPath)
    const normalizedBase = path.resolve(base)
    if (!targetPath.startsWith(normalizedBase)) {
      res.writeHead(403)
      res.end('Forbidden')
      return
    }

    let stats
    try {
      stats = fs.statSync(targetPath)
    } catch (_) {
      renderNotFound(res, clean)
      return
    }

    if (stats.isDirectory()) {
      this.handleDirectoryBrowsing(targetPath, rootName, subPath, clean, res)
    } else {
      this.handleFileDownload(targetPath, res)
    }
  }

  // 处理目录浏览
  handleDirectoryBrowsing(targetPath, rootName, subPath, clean, res) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    let curRel = subPath
    const crumbs = []
    let acc = ''
    crumbs.push(`
      <a href="/" style="padding-left: 10px;">首页</a>
      <span>/</span>
      <a href="/${encodeURIComponent(rootName)}">${this.escapeHtml(rootName)}</a>`)
    if (curRel) {
      const parts = curRel.split('/')
      for (const part of parts) {
        acc += `/${part}`
        crumbs.push(`<a href="/${encodeURIComponent(rootName)}${acc}">${this.escapeHtml(part)}</a>`)
      }
    }

    const entries = fs.readdirSync(targetPath, { withFileTypes: true })
    const rows = entries.map(e => {
      const entryPath = path.join(targetPath, e.name)
      let sizeCell = '-'
      let href = `/${encodeURIComponent(rootName)}/${subPath ? subPath + '/' : ''}${encodeURIComponent(e.name)}`
      let downloadUrl = `/download/${encodeURIComponent(rootName)}/${subPath ? subPath + '/' : ''}${encodeURIComponent(e.name)}`
      
      if (e.isFile()) {
        try { sizeCell = this.formatBytes(fs.statSync(entryPath).size) } catch (_) {}
      }
      
      return `<tr>
        <td><a href="${href}">${this.escapeHtml(e.name)}</a><div class="type">${e.isDirectory() ? '文件夹' : '文件'}</div></td>
        <td>${sizeCell}</td>
        <td style="width:100px">
          <a href="${downloadUrl}" class="download-btn">下载</a>
        </td>
      </tr>`
    }).join('')

    const content = `
      <div class="breadcrumb">${crumbs.join(' / ')}</div>
      <table>
        <thead>
          <tr><th>名称</th><th style="width:160px">大小</th><th style="width:100px">操作</th></tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="3">空目录</td></tr>'}</tbody>
      </table>
    `
    res.end(renderPage({ title: `浏览 - ${clean}`, content, serverAddress: this.serverAddress }))
  }

  // 处理下载请求
  handleDownloadRequest(urlPath, res) {
    const clean = urlPath.replace(/^\/download\//, '')
    const [rootName, ...rest] = clean.split('/')
    const meta = this.sharedFiles.get(decodeURIComponent(rootName))
    const base = typeof meta === 'string' ? meta : (meta && meta.path)

    if (!base) {
      renderNotFound(res, clean)
      return
    }

    // 目标路径（限制在共享根目录内）
    const subPath = rest.map(part => decodeURIComponent(part)).join('/')
    const targetPath = path.resolve(base, subPath)
    const normalizedBase = path.resolve(base)
    if (!targetPath.startsWith(normalizedBase)) {
      res.writeHead(403)
      res.end('Forbidden')
      return
    }

    let stats
    try {
      stats = fs.statSync(targetPath)
    } catch (_) {
      renderNotFound(res, clean)
      return
    }

    if (stats.isDirectory()) {
      const dirName = path.basename(targetPath)
      this.handleDirectoryDownload(targetPath, dirName, res)
    } else {
      this.handleFileDownload(targetPath, res)
    }
  }

  // 处理文件夹压缩下载
  handleDirectoryDownload(dirPath, dirName, res) {
    const archive = archiver('zip', {
      zlib: { level: 9 } // 设置压缩级别
    })

    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(dirName)}.zip"`
    })

    archive.pipe(res)

    // 递归添加文件夹内容到压缩包
    this.addDirectoryToArchive(archive, dirPath, dirName)

    archive.finalize()
  }

  // 递归添加文件夹内容到压缩包
  addDirectoryToArchive(archive, dirPath, relativePath) {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true })
      
      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name)
        const archivePath = path.join(relativePath, entry.name)
        
        if (entry.isDirectory()) {
          // 递归处理子文件夹
          this.addDirectoryToArchive(archive, entryPath, archivePath)
        } else {
          // 添加文件
          archive.file(entryPath, { name: archivePath })
        }
      }
    } catch (err) {
      console.error('Error adding directory to archive:', err)
    }
  }

  // 处理文件上传
  handleFileUpload(req, res) {
    // 检查上传功能是否启用
    if (!this.uploadEnabled) {
      res.writeHead(403, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: '上传功能未启用' }))
      return
    }

    const { formidable } = require('formidable');

    const form = formidable({
      uploadDir: this.getUploadDir(),
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB 限制
      multiples: true
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Upload error:', err)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: '上传失败' }))
        return
      }

      const uploadedFiles = []
      const fileArray = Array.isArray(files.file) ? files.file : [files.file]

      for (const file of fileArray) {
        if (file && file.filepath) {
          const fileName = file.originalFilename || path.basename(file.filepath)
          const targetPath = path.join(this.getUploadDir(), fileName)
          
          try {
            // 如果文件已存在，添加数字后缀
            let finalPath = targetPath
            let counter = 1
            while (fs.existsSync(finalPath)) {
              const ext = path.extname(targetPath)
              const name = path.basename(targetPath, ext)
              finalPath = path.join(path.dirname(targetPath), `${name}_${counter}${ext}`)
              counter++
            }

            // 移动文件到目标位置
            fs.renameSync(file.filepath, finalPath)
            
            // 添加到共享文件列表
            const relativePath = path.relative(process.cwd(), finalPath)
            this.sharedFiles.set(fileName, relativePath)
            
            uploadedFiles.push({
              name: path.basename(finalPath),
              size: file.size,
              path: relativePath
            })
          } catch (moveErr) {
            console.error('Error moving uploaded file:', moveErr)
          }
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ 
        success: true, 
        files: uploadedFiles,
        message: `成功上传 ${uploadedFiles.length} 个文件`
      }))
    })
  }

  // 获取上传目录
  getUploadDir() {
    // 使用配置的上传路径
    return this.uploadPath
  }

  // 处理文件下载
  handleFileDownload(filePath, res) {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        renderNotFound(res, filePath)
        return
      }

      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(path.basename(filePath))}"`,
        'Content-Length': stats.size
      })

      fs.createReadStream(filePath).pipe(res)
    })
  }

  // 启动服务器
  start() {
    // 如果服务器已经在运行，先停止它
    if (this.server) {
      this.stop()
    }

    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res)
    })

    // 设置服务器选项以避免端口占用问题
    this.server.on('error', (err) => {
      console.error('[localshare] server error:', err)
      
      // 如果是端口被占用错误，尝试使用其他端口
      if (err.code === 'EADDRINUSE') {
        console.log(`[localshare] Port ${this.port} is busy, trying next port...`)
        this.port += 1
        
        // 限制端口范围，避免无限循环
        if (this.port > 8100) {
          console.error('[localshare] No available ports found in range 8080-8100')
          if (this.onStatusChange) {
            this.onStatusChange({
              status: 'error',
              error: 'No available ports found'
            })
          }
          return
        }
        
        // 延迟重试，避免立即重试
        setTimeout(() => {
          this.start()
        }, 1000)
        return
      }
      
      if (this.onStatusChange) {
        this.onStatusChange({
          status: 'error',
          error: err.message
        })
      }
    })

    // 设置 SO_REUSEADDR 选项以允许端口重用
    this.server.on('listening', () => {
      this.serverAddress = `${this.getLocalIP()}:${this.port}`
      console.log(`[localshare] server running at http://${this.serverAddress}`)
      
      if (this.onStatusChange) {
        this.onStatusChange({
          status: 'running',
          address: this.serverAddress
        })
      }
    })

    // 启动服务器并设置端口重用选项
    try {
      this.server.listen({
        port: this.port,
        host: '0.0.0.0'
      })
    } catch (err) {
      console.error('[localshare] Failed to start server:', err)
      if (this.onStatusChange) {
        this.onStatusChange({
          status: 'error',
          error: err.message
        })
      }
    }
  }

  // 停止服务器
  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        console.log('[localshare] Stopping server...')
        
        // 停止接受新连接
        this.server.close((err) => {
          if (err) {
            console.error('[localshare] Error stopping server:', err)
          } else {
            console.log('[localshare] Server stopped successfully')
          }
          
          this.server = null
          this.serverAddress = null
          
          if (this.onStatusChange) {
            this.onStatusChange({
              status: 'stopped'
            })
          }
          
          resolve()
        })
        
        // 强制关闭所有活动连接
        this.server.closeAllConnections?.()
        
        // 如果10秒内没有正常关闭，强制设置为null
        setTimeout(() => {
          if (this.server) {
            console.log('[localshare] Force stopping server')
            this.server = null
            this.serverAddress = null
            resolve()
          }
        }, 10000)
      } else {
        resolve()
      }
    })
  }

  // 更新共享文件
  updateSharedFiles(files) {
    this.sharedFiles.clear()
    files.forEach(file => {
      if (file && file.path) {
        this.sharedFiles.set(file.name, file.path)
      }
    })
  }

  // PIN相关方法
  generatePin() {
    this.currentPin = Math.floor(1000 + Math.random() * 9000).toString()
    this.pinProtectionEnabled = true
    return this.currentPin
  }

  disablePin() {
    this.currentPin = null
    this.pinProtectionEnabled = false
  }

  getPinStatus() {
    return {
      pin: this.currentPin,
      enabled: this.pinProtectionEnabled
    }
  }

  // 上传功能配置方法
  setUploadConfig(enabled, uploadPath) {
    this.uploadEnabled = enabled
    if (uploadPath && uploadPath.trim()) {
      try {
        // 确保上传路径存在
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true })
        }
        this.uploadPath = path.resolve(uploadPath)
      } catch (err) {
        console.error('Error setting upload path:', err)
        return false
      }
    }
    return true
  }

  getUploadConfig() {
    return {
      enabled: this.uploadEnabled,
      path: this.uploadPath
    }
  }

  // 绑定清理事件监听器
  bindCleanupEvents() {
    // 处理进程退出事件
    const cleanup = async () => {
      console.log('[localshare] Cleaning up server on exit...')
      await this.stop()
    }

    // 绑定各种退出信号
    process.on('exit', cleanup)
    process.on('SIGINT', cleanup)  // Ctrl+C
    process.on('SIGTERM', cleanup) // 终止信号
    process.on('SIGUSR1', cleanup) // 用户定义信号1
    process.on('SIGUSR2', cleanup) // 用户定义信号2
    
    // 处理未捕获异常
    process.on('uncaughtException', async (err) => {
      console.error('[localshare] Uncaught exception:', err)
      await cleanup()
      process.exit(1)
    })
    
    // 处理未处理的Promise拒绝
    process.on('unhandledRejection', async (reason, promise) => {
      console.error('[localshare] Unhandled rejection at:', promise, 'reason:', reason)
      await cleanup()
      process.exit(1)
    })
  }

  // 检查端口是否可用
  isPortAvailable(port) {
    return new Promise((resolve) => {
      const testServer = http.createServer()
      
      testServer.listen(port, (err) => {
        if (err) {
          resolve(false)
        } else {
          testServer.close(() => {
            resolve(true)
          })
        }
      })
      
      testServer.on('error', () => {
        resolve(false)
      })
    })
  }

  // 查找可用端口
  async findAvailablePort(startPort = 8080, endPort = 8100) {
    for (let port = startPort; port <= endPort; port++) {
      if (await this.isPortAvailable(port)) {
        return port
      }
    }
    throw new Error(`No available ports found in range ${startPort}-${endPort}`)
  }
}

module.exports = HttpServer