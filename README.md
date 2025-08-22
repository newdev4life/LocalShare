# LocalShare

<div align="center">
  <h1>🚀 LocalShare</h1>
  <p><strong>一个简单易用的局域网文件分享工具</strong></p>
  <p>基于 Electron + React + Node.js 开发的跨平台桌面应用</p>
  
  ![License](https://img.shields.io/badge/license-MIT-blue.svg)
  ![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
  ![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
</div>

## 📋 项目简介

LocalShare 是一个现代化的局域网文件分享工具，让你可以快速在同一网络内的设备间分享文件。无需复杂配置，拖拽即可分享，其他设备通过浏览器即可访问下载。

### ✨ 核心特性

- 🌐 **零配置分享**：拖拽文件即可在局域网内分享
- 🔒 **PIN 码保护**：4位数字密码保护，确保访问安全
- 📱 **跨设备访问**：任何设备通过浏览器即可访问
- 🎨 **现代化界面**：基于 Ant Design 的美观桌面应用界面
- 🖥️ **跨平台支持**：Windows、macOS、Linux 全平台支持
- 📁 **文件夹支持**：支持分享整个文件夹及其目录结构
- 🚀 **实时访问**：文件保留在原位置，无需复制上传

## 🛠️ 技术架构

### 前端技术栈
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全的 JavaScript
- **Ant Design** - 企业级 UI 组件库
- **Vite** - 现代化前端构建工具

### 后端技术栈
- **Electron** - 跨平台桌面应用框架
- **Node.js** - JavaScript 运行时
- **HTTP Server** - 内置文件服务器
- **IPC 通信** - 主进程与渲染进程通信

### 开发工具
- **electron-builder** - 应用打包工具
- **TypeScript** - 类型检查和编译
- **ESLint** - 代码质量检查

## 🏗️ 项目结构

```
localshare/
├── src/                          # React 前端源码
│   ├── components/              # React 组件
│   │   ├── FileDropZone.tsx    # 文件拖拽组件
│   │   ├── FileList.tsx        # 文件列表组件
│   │   └── WindowsControls.tsx # Windows 窗口控制
│   ├── types.ts                # TypeScript 类型定义
│   ├── App.tsx                 # 主应用组件
│   ├── App.css                 # 应用样式
│   └── main.tsx               # React 入口文件
├── electron/                   # Electron 主进程
│   ├── modules/               # 功能模块
│   │   ├── httpServer.cjs     # HTTP 服务器模块
│   │   ├── pageRenderer.cjs   # 页面渲染模块
│   │   ├── windowManager.cjs  # 窗口管理模块
│   │   └── ipcHandlers.cjs    # IPC 通信处理
│   ├── main.cjs              # Electron 主入口
│   ├── preload.cjs           # 预加载脚本
│   └── fileUtils.cjs         # 文件工具函数
├── scripts/                  # 构建脚本
│   └── dev.js               # 开发环境启动脚本
├── dist/                    # 构建输出目录
├── package.json            # 项目配置
├── tsconfig.json          # TypeScript 配置
├── tsconfig.node.json     # Node.js TypeScript 配置
├── vite.config.ts         # Vite 构建配置
└── README.md             # 项目文档
```

## 🚀 快速开始

### 环境要求
- Node.js 16.0+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建应用
```bash
npm run build
```

### 打包应用
```bash
npm run electron:build
```

## 💡 使用说明

### 基本操作

1. **启动应用**：双击运行 LocalShare
2. **添加文件**：
   - 拖拽文件/文件夹到应用窗口
   - 点击"选择文件"或"选择文件夹"按钮
3. **设置安全**：点击"启用PIN保护"生成4位数字密码
4. **分享访问**：将显示的局域网地址分享给其他设备
5. **访问文件**：其他设备在浏览器中输入地址和PIN码

### 界面导航

- **文件管理**：添加和管理要分享的文件
- **服务器**：查看服务器状态和安全设置
- **关于**：应用信息和使用说明
- **设置**：应用配置和快捷操作

## ✅ 已实现功能

### 核心功能
- [x] 文件和文件夹拖拽分享
- [x] 原生文件选择器支持
- [x] 局域网 HTTP 服务器
- [x] 美观的 Web 文件浏览界面
- [x] 目录结构在线浏览
- [x] 文件直接下载
- [x] 自定义 404 错误页面

### 安全功能
- [x] 4位 PIN 码保护
- [x] 会话管理（Cookie）
- [x] PIN 码动态生成
- [x] 一键开启/关闭保护

### 用户体验
- [x] 现代化桌面应用界面
- [x] 侧边栏导航设计
- [x] Ant Design 组件集成
- [x] 可滚动文件列表（高度限制300px）
- [x] 文件操作按钮（复制链接、删除）
- [x] 实时服务器状态显示
- [x] 消息提示反馈

### 跨平台支持
- [x] Windows 窗口控制适配
- [x] macOS 标题栏适配
- [x] 平台特定样式
- [x] 窗口大小限制（800x600 ~ 1400x1000）

### 技术特性
- [x] 文件指纹去重机制
- [x] IPC 进程间通信
- [x] 模块化代码架构
- [x] TypeScript 类型安全
- [x] 响应式布局设计

## 🔮 规划中的扩展功能

### 高优先级 ⭐⭐⭐
- [ ] **二维码分享**
  - 生成访问地址二维码
  - 手机扫码快速访问
  - 便于移动设备连接

- [ ] **系统托盘集成**
  - 最小化到系统托盘
  - 托盘菜单快捷操作
  - 后台运行模式

### 中优先级 ⭐⭐
- [ ] **用户体验增强**
  - 暗黑主题模式
  - 多语言支持（中英文）
  - 自定义主题配色
  - 访问历史记录

- [ ] **文件管理优化**
  - 批量文件操作
  - 文件搜索功能
  - 按类型分组显示
  - 文件大小排序

- [ ] **网络功能**
  - 自动发现局域网设备
  - 设备连接状态显示
  - 带宽使用限制
  - IPv6 网络支持

- [ ] **安全增强**
  - 访问日志记录
  - 临时访问链接
  - 访客模式
  - 文件访问权限

### 低优先级 ⭐
- [ ] **高级功能**
  - 双向文件传输（上传）
  - 断点续传支持
  - 文件压缩传输
  - 云存储同步

- [ ] **系统集成**
  - 开机自启动
  - 右键菜单集成
  - 桌面快捷方式
  - REST API 接口

- [ ] **企业功能**
  - HTTPS 安全传输
  - 用户认证系统
  - 权限管理
  - 审计日志

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发规范
- 使用 TypeScript 编写代码
- 遵循 ESLint 代码规范
- 组件使用 React Hooks
- 样式使用 CSS Modules 或 styled-components

### 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建/工具相关

## 📄 开源协议

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🔗 相关链接

- [Electron 官方文档](https://www.electronjs.org/)
- [React 官方文档](https://reactjs.org/)
- [Ant Design 组件库](https://ant.design/)
- [Vite 构建工具](https://vitejs.dev/)

## 📧 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 GitHub Issue
- 发送邮件至：[your-email@example.com]

---

<div align="center">
  <p>⭐ 如果这个项目对你有帮助，请给一个 Star！</p>
  <p>Made with ❤️ by LocalShare Team</p>
</div>