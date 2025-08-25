# LocalShare

<div align="center">
  <h1>🚀 LocalShare</h1>
  <p><strong>A simple and easy-to-use local network file sharing tool</strong></p>
  <p>Cross-platform desktop application built with Electron + React + Node.js</p>
  
  ![License](https://img.shields.io/badge/license-MIT-blue.svg)
  ![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
  ![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
</div>

## 📋 Project Overview

LocalShare is a modern local network file sharing tool that allows you to quickly share files between devices on the same network. No complex configuration required - just drag and drop to share, and other devices can access and download files through their browsers.

### ✨ Core Features

- 🌐 **Zero-configuration sharing**: Drag and drop files to share on local network
- 🔒 **PIN code protection**: 4-digit password protection for secure access
- 📱 **Cross-device access**: Any device can access through browser
- 🎨 **Modern interface**: Beautiful desktop application interface based on Ant Design
- 🖥️ **Cross-platform support**: Windows, macOS, Linux full platform support
- 📁 **Folder support**: Share entire folders with directory structure
- 🚀 **Real-time access**: Files remain in original location, no copying or uploading required
- 📤 **Upload functionality**: Optional web-based file upload with configurable storage path

## 🛠️ Technical Architecture

### Frontend Tech Stack
- **React 18** - User interface framework
- **TypeScript** - Type-safe JavaScript
- **Ant Design** - Enterprise-level UI component library
- **Vite** - Modern frontend build tool

### Backend Tech Stack
- **Electron** - Cross-platform desktop application framework
- **Node.js** - JavaScript runtime
- **HTTP Server** - Built-in file server
- **IPC Communication** - Main process and renderer process communication

### Development Tools
- **electron-builder** - Application packaging tool
- **TypeScript** - Type checking and compilation
- **ESLint** - Code quality checking

## 🏗️ Project Structure

```
localshare/
├── src/                          # React frontend source code
│   ├── components/              # React components
│   │   ├── FileDropZone.tsx    # File drag and drop component
│   │   ├── FileList.tsx        # File list component
│   │   └── WindowsControls.tsx # Windows window controls
│   ├── types.ts                # TypeScript type definitions
│   ├── App.tsx                 # Main application component
│   ├── App.css                 # Application styles
│   └── main.tsx               # React entry file
├── electron/                   # Electron main process
│   ├── modules/               # Feature modules
│   │   ├── httpServer.cjs     # HTTP server module
│   │   ├── pageRenderer.cjs   # Page rendering module
│   │   ├── windowManager.cjs  # Window management module
│   │   └── ipcHandlers.cjs    # IPC communication handling
│   ├── main.cjs              # Electron main entry
│   ├── preload.cjs           # Preload script
│   └── fileUtils.cjs         # File utility functions
├── scripts/                  # Build scripts
│   └── dev.js               # Development environment startup script
├── dist/                    # Build output directory
├── package.json            # Project configuration
├── tsconfig.json          # TypeScript configuration
├── tsconfig.node.json     # Node.js TypeScript configuration
├── vite.config.ts         # Vite build configuration
└── README.md             # Project documentation
```

## 🚀 Quick Start

### Requirements
- Node.js 16.0+
- npm or yarn

### Install Dependencies
```bash
npm install
```

### Development Mode
```bash
npm run dev
```

### Build Application
```bash
npm run build
```

### Package Application
```bash
npm run electron:build
```

## 💡 Usage Instructions

### Basic Operations

1. **Start Application**: Double-click to run LocalShare
2. **Add Files**:
   - Drag and drop files/folders to application window
   - Click "Select Files" or "Select Folders" buttons
3. **Set Security**: Click "Enable PIN Protection" to generate 4-digit password
4. **Share Access**: Share the displayed local network address with other devices
5. **Access Files**: Other devices enter address and PIN code in browser

### Interface Navigation

- **File Management**: Add and manage files to share
- **Server**: View server status and security settings
- **About**: Application information and usage instructions
- **Settings**: Application configuration and quick operations

## ✅ Implemented Features

### Core Features
- [x] File and folder drag-and-drop sharing
- [x] Native file picker support
- [x] Local network HTTP server
- [x] Beautiful web file browsing interface
- [x] Online directory structure browsing
- [x] Direct file download
- [x] Custom 404 error page
- [x] File upload functionality with configurable storage path

### Security Features
- [x] 4-digit PIN code protection
- [x] Session management (Cookie)
- [x] Dynamic PIN code generation
- [x] One-click enable/disable protection

### User Experience
- [x] Modern desktop application interface
- [x] Sidebar navigation design
- [x] Ant Design component integration
- [x] Scrollable file list (height limit 300px)
- [x] File operation buttons (copy link, delete)
- [x] Real-time server status display
- [x] Message prompt feedback

### Cross-platform Support
- [x] Windows window control adaptation
- [x] macOS title bar adaptation
- [x] Platform-specific styles
- [x] Window size limits (800x600 ~ 1400x1000)

### Technical Features
- [x] File fingerprint deduplication mechanism
- [x] IPC inter-process communication
- [x] Modular code architecture
- [x] TypeScript type safety
- [x] Responsive layout design

### Upload Features
- [x] Configurable upload functionality switch
- [x] Customizable upload storage path
- [x] Multiple file upload support
- [x] File size limits (100MB per file)
- [x] Automatic directory creation
- [x] File name conflict resolution

## 🔮 Planned Extension Features

### High Priority ⭐⭐⭐
- [ ] **QR Code Sharing**
  - Generate QR codes for access addresses
  - Quick mobile device access via scanning
  - Easy mobile device connection

- [ ] **System Tray Integration**
  - Minimize to system tray
  - Tray menu quick operations
  - Background running mode

### Medium Priority ⭐⭐
- [ ] **User Experience Enhancement**
  - Dark theme mode
  - Multi-language support (English/Chinese)
  - Custom theme colors
  - Access history records

- [ ] **File Management Optimization**
  - Batch file operations
  - File search functionality
  - Group display by type
  - File size sorting

- [ ] **Network Features**
  - Automatic local network device discovery
  - Device connection status display
  - Bandwidth usage limits
  - IPv6 network support

- [ ] **Security Enhancement**
  - Access log recording
  - Temporary access links
  - Guest mode
  - File access permissions

### Low Priority ⭐
- [ ] **Advanced Features**
  - Bidirectional file transfer (upload)
  - Resume broken downloads
  - File compression transmission
  - Cloud storage synchronization

- [ ] **System Integration**
  - Auto-start on boot
  - Right-click menu integration
  - Desktop shortcuts
  - REST API interface

## 🤝 Contributing

Welcome to submit Issues and Pull Requests!

### Development Standards
- Use TypeScript for coding
- Follow ESLint code standards
- Use React Hooks for components
- Use CSS Modules or styled-components for styling

### Commit Standards
- feat: New feature
- fix: Bug fix
- docs: Documentation update
- style: Code format adjustment
- refactor: Code refactoring
- test: Testing related
- chore: Build/tool related

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 🔗 Related Links

- [Electron Official Documentation](https://www.electronjs.org/)
- [React Official Documentation](https://reactjs.org/)
- [Ant Design Component Library](https://ant.design/)
- [Vite Build Tool](https://vitejs.dev/)

## 📧 Contact

If you have questions or suggestions, feel free to contact us through:

- Submit GitHub Issue

---

<div align="center">
  <p>⭐ If this project helps you, please give it a Star!</p>
  <p>Made with ❤️ by LocalShare Team</p>
</div>