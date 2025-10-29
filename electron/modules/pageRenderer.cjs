// 转义HTML
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// 渲染页面模板
function renderPage({ title, content, serverAddress = '' }) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root { --bg: #1f2937; --card: #111827; --muted: #94a3b8; --text: #e2e8f0; --accent: #3b82f6; }
    body { margin: 0; font-family: ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu; background: var(--bg); color: var(--text); }
    .container { max-width: 1000px; margin: 32px auto; padding: 0 16px; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .title { font-size: 22px; font-weight: 700; }
    .addr { color: var(--muted); font-size: 13px; }
    .card { background: var(--card); border: 1px solid #1f2937; border-radius: 12px; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th, td { text-align: left; padding: 12px 14px; border-bottom: 1px solid #1f2937; }
    th { color: var(--muted); font-weight: 600; font-size: 13px; background: #0f172a; }
    tr:hover td { background: #0f172a; }
    a { color: var(--accent); text-decoration: none; }
    .type { font-size: 12px; color: var(--muted); }
    td:first-child { word-break: break-all; overflow-wrap: anywhere; }
    .breadcrumb { margin: 16px 0; font-size: 13px; color: var(--muted); }
    .breadcrumb a { color: var(--accent); }
    .empty { padding: 48px; text-align: center; }
    .empty .code { font-size: 48px; font-weight: 800; margin-bottom: 8px; color: #ef4444; }
    .empty .msg { color: var(--muted); margin-bottom: 16px; }
    .pin-form { padding: 48px; text-align: center; }
    .pin-input { padding: 12px; font-size: 18px; width: 120px; text-align: center; margin: 16px 8px; border: 2px solid var(--muted); border-radius: 8px; background: var(--card); color: var(--text); }
    .pin-btn { padding: 12px 24px; background: var(--accent); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; margin: 8px; }
    .pin-error { color: #ef4444; margin-top: 12px; }
    .upload-section { padding: 20px; border-bottom: 1px solid #1f2937; }
    .upload-form { display: flex; align-items: center; gap: 12px; }
    .file-input { flex: 1; padding: 8px; border: 2px dashed var(--muted); border-radius: 6px; background: var(--card); color: var(--text); }
    .upload-btn { padding: 8px 16px; background: var(--accent); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
    .upload-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .upload-status { margin-top: 12px; font-size: 13px; }
    .upload-success { color: #10b981; }
    .upload-error { color: #ef4444; }
    .download-btn { padding: 4px 8px; background: var(--accent); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; text-decoration: none; display: inline-block; white-space: nowrap; }
    
    /* Mobile Responsive Design */
    @media (max-width: 768px) {
      .container { 
        margin: 16px auto; 
        padding: 0 12px; 
      }
      
      .header { 
        flex-direction: column; 
        align-items: flex-start; 
        gap: 8px; 
        margin-bottom: 12px; 
      }
      
      .title { 
        font-size: 20px; 
      }
      
      .addr { 
        font-size: 12px; 
        word-break: break-all; 
      }
      
      .card { 
        border-radius: 8px; 
        margin: 0 -4px; 
      }
      
      table { 
        font-size: 14px; 
      }
      
      th, td { 
        padding: 8px 10px; 
      }
      
      th { 
        font-size: 12px; 
      }
      
      .breadcrumb { 
        margin: 12px 0; 
        font-size: 12px; 
        word-break: break-all; 
      }
      
      .empty { 
        padding: 32px 16px; 
      }
      
      .empty .code { 
        font-size: 36px; 
      }
      
      .pin-form { 
        padding: 32px 16px; 
      }
      
      .pin-input { 
        width: 100px; 
        font-size: 16px; 
        margin: 12px 4px; 
      }
      
      .pin-btn { 
        padding: 10px 20px; 
        font-size: 13px; 
      }
      
      .upload-section { 
        padding: 16px; 
      }
      
      .upload-form { 
        flex-direction: column; 
        align-items: stretch; 
        gap: 8px; 
      }
      
      .file-input { 
        padding: 10px; 
      }
      
      .upload-btn { 
        padding: 10px 16px; 
        align-self: center; 
      }
      
      .download-btn { 
        padding: 6px 10px; 
        font-size: 11px; 
      }
    }
    
    @media (max-width: 480px) {
      .container { 
        padding: 0 8px; 
      }
      
      .title { 
        font-size: 18px; 
      }
      
      .card { 
        border-radius: 6px; 
        border-left: none; 
        border-right: none; 
        margin: 0 -8px; 
      }
      
      table { 
        font-size: 13px; 
      }
      
      th, td { 
        padding: 6px 8px; 
      }

      /* Hide size column on very small screens, emphasize name and action */
      thead th:nth-child(2), tbody td:nth-child(2) {
        display: none;
      }
      thead th:nth-child(3), tbody td:nth-child(3) {
        text-align: right;
      }
      
      .empty { 
        padding: 24px 12px; 
      }
      
      .empty .code { 
        font-size: 28px; 
      }
      
      .pin-form { 
        padding: 24px 12px; 
      }
      
      .pin-input { 
        width: 80px; 
        font-size: 14px; 
      }
      
      .upload-section { 
        padding: 12px; 
      }
    }
    
    /* Touch-friendly improvements */
    @media (hover: none) and (pointer: coarse) {
      .pin-btn, .upload-btn {
        min-height: 44px;
        touch-action: manipulation;
      }
      
      /* keep download button compact on mobile */
      .download-btn {
        touch-action: manipulation;
        min-height: unset;
        line-height: 1.2;
      }
      
      .pin-input {
        min-height: 44px;
      }
      
      a, button {
        touch-action: manipulation;
      }
      
      tr:hover td {
        background: var(--card);
      }
      
      tr:active td {
        background: #0f172a;
      }
    }
  </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="title">LocalShare</div>
        <div class="addr">${escapeHtml(serverAddress ? `http://${serverAddress}` : '')}</div>
      </div>
      <div class="card">
        ${content}
      </div>
    </div>
  </body>
</html>`
}

// 渲染PIN验证表单
function renderPinForm(error = '') {
  return renderPage({ 
    title: 'PIN 验证', 
    content: `
      <div class="pin-form">
        <h3>请输入访问PIN码</h3>
        <form method="post" action="/verify-pin">
          <input type="text" name="pin" class="pin-input" placeholder="****" maxlength="4" pattern="[0-9]{4}" required />
          <br />
          <button type="submit" class="pin-btn">验证</button>
        </form>
        ${error ? `<div class="pin-error">${escapeHtml(error)}</div>` : ''}
      </div>
    `
  })
}

// 渲染404页面
function renderNotFound(res, pathText) {
  try {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
  } catch (_) {}
  const content = `
    <div class="empty">
      <div class="code">404</div>
      <div class="msg">未找到资源：${escapeHtml(pathText || '')}</div>
      <div><a href="/">返回首页</a></div>
    </div>
  `
  res.end(renderPage({ title: '404 Not Found', content }))
}

module.exports = {
  renderPage,
  renderPinForm,
  renderNotFound,
  escapeHtml
}