# Electron 应用瘦包优化指南

## 📊 当前包大小分析

### macOS 版本
- **DMG**: ~92MB
- **ZIP**: ~88MB

### Windows 版本
- **EXE**: ~168MB
- **Setup**: ~74MB

### Linux 版本
- **AppImage**: ~101MB

## 🎯 已实施的优化

### 1. **electron-builder 优化**
```json
{
  "compression": "maximum",        // 最大压缩
  "removePackageScripts": true,    // 移除 package.json scripts
  "removePackageKeywords": true,   // 移除 package.json keywords
  "asar": true                     // 启用 asar 打包
}
```

### 2. **Vite 构建优化**
```javascript
{
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,          // 移除 console 语句
      drop_debugger: true,         // 移除 debugger 语句
      pure_funcs: ['console.log']  // 移除特定函数调用
    }
  }
}
```

### 3. **代码分割优化**
```javascript
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'antd-vendor': ['antd', '@ant-design/icons'],
  'vendor': ['electron']
}
```

## 🚀 进一步优化建议

### 1. **移除不必要的 Electron 模块**
```javascript
// 在 electron/main.cjs 中添加
app.commandLine.appendSwitch('disable-features', 'VizDisplayCompositor')
app.commandLine.appendSwitch('disable-software-rasterizer')
app.commandLine.appendSwitch('disable-gpu')
app.commandLine.appendSwitch('disable-gpu-sandbox')
```

### 2. **优化图标文件**
- 当前图标文件较大：
  - `icon.ico`: 353KB
  - `icon.icns`: 157KB
- 建议压缩到 50KB 以下

### 3. **使用更小的依赖**
- 考虑用更轻量的 UI 库替代 Ant Design
- 移除未使用的依赖

### 4. **启用 Tree Shaking**
```javascript
// 在 vite.config.ts 中
build: {
  rollupOptions: {
    treeshake: true
  }
}
```

## 📈 预期优化效果

### 优化前 vs 优化后
| 平台 | 优化前 | 优化后 | 减少 |
|------|--------|--------|------|
| macOS DMG | ~92MB | ~70MB | ~24% |
| Windows EXE | ~168MB | ~120MB | ~29% |
| Linux AppImage | ~101MB | ~75MB | ~26% |

## 🔧 使用方法

### 1. 分析包大小
```bash
npm run analyze
```

### 2. 构建优化版本
```bash
# 构建所有平台
npm run electron:build

# 构建特定平台
npm run electron:build:win
npm run electron:build:mac
npm run electron:build:linux
```

### 3. 对比优化效果
```bash
# 构建前分析
npm run analyze

# 构建后分析
npm run analyze
```

## ⚠️ 注意事项

1. **功能测试**: 优化后务必测试所有功能
2. **兼容性**: 确保在不同系统版本上正常运行
3. **性能**: 监控应用启动时间和运行性能
4. **用户体验**: 确保优化不影响用户体验

## 📋 优化检查清单

- [ ] 启用最大压缩
- [ ] 移除 console 语句
- [ ] 配置代码分割
- [ ] 启用 asar 打包
- [ ] 优化图标文件大小
- [ ] 移除不必要的依赖
- [ ] 测试所有功能
- [ ] 验证性能表现 