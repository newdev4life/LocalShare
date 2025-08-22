const http = require('http')
const fs = require('fs')
const path = require('path')
const os = require('os')
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
      try {
        const s = fs.statSync(full.path)
        if (s.isDirectory()) {
          type = '文件夹'
        } else {
          sizeCell = this.formatBytes(s.size)
        }
      } catch (_) {}
      return `<tr>
        <td><a href="/${encodeURIComponent(name)}">${this.escapeHtml(name)}</a><div class="type">${type}</div></td>
        <td>${sizeCell}</td>
      </tr>`
    }).join('')

    const content = `
      <table>
        <thead>
          <tr><th>名称</th><th style="width:160px">大小</th></tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="2">暂无共享文件</td></tr>'}</tbody>
      </table>
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
    crumbs.push(`<a href="/${encodeURIComponent(rootName)}">${this.escapeHtml(rootName)}</a>`)
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
      if (e.isFile()) {
        try { sizeCell = this.formatBytes(fs.statSync(entryPath).size) } catch (_) {}
      }
      return `<tr>
        <td><a href="${href}">${this.escapeHtml(e.name)}</a><div class="type">${e.isDirectory() ? '文件夹' : '文件'}</div></td>
        <td>${sizeCell}</td>
      </tr>`
    }).join('')

    const content = `
      <div class="breadcrumb">${crumbs.join(' / ')}</div>
      <table>
        <thead>
          <tr><th>名称</th><th style="width:160px">大小</th></tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="2">空目录</td></tr>'}</tbody>
      </table>
    `
    res.end(renderPage({ title: `浏览 - ${clean}`, content, serverAddress: this.serverAddress }))
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
    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res)
    })

    this.server.listen(this.port, () => {
      this.serverAddress = `${this.getLocalIP()}:${this.port}`
      console.log(`[localshare] server running at http://${this.serverAddress}`)
      
      if (this.onStatusChange) {
        this.onStatusChange({
          status: 'running',
          address: this.serverAddress
        })
      }
    })

    this.server.on('error', (err) => {
      console.error('[localshare] server error:', err)
      
      if (this.onStatusChange) {
        this.onStatusChange({
          status: 'error',
          error: err.message
        })
      }
    })
  }

  // 停止服务器
  stop() {
    if (this.server) {
      this.server.close()
      this.server = null
    }
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
}

module.exports = HttpServer