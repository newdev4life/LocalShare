# GitHub Actions 配置说明

本项目配置了完整的 GitHub Actions 工作流，用于自动化构建和发布 Electron 应用。

## 📋 工作流概览

### 1. **build-platforms.yml** (推荐使用)
- **功能**: 为 Windows、macOS、Linux 三个平台分别构建应用
- **触发**: 推送到 main/master 分支或创建标签
- **优势**: 并行构建，效率更高，构建产物更清晰

### 2. **release.yml** (发布专用)
- **功能**: 专门用于创建 GitHub Release
- **触发**: 推送标签 (如 `v1.0.0`)
- **优势**: 下载构建产物并创建 Release

### 3. **manual-release.yml** (手动触发)
- **功能**: 手动触发构建和发布
- **触发**: 手动触发，可选择平台和版本
- **优势**: 灵活控制，支持选择性构建

### 4. **build.yml** 
- **功能**: 矩阵构建，支持多个 Node.js 版本
- **触发**: 推送到 main/master 分支或创建标签
- **优势**: 测试多个 Node.js 版本的兼容性

### 5. **test.yml**
- **功能**: 代码质量检查和测试
- **触发**: 推送到 main/master 分支或 Pull Request
- **包含**: TypeScript 检查、构建测试、ESLint 检查

### 6. **quick-build.yml**
- **功能**: 快速构建测试
- **触发**: 推送到 main/master 分支或 Pull Request
- **优势**: 快速验证构建是否成功

## 🚀 使用方法

### 自动构建
1. 推送代码到 `main` 或 `master` 分支
2. GitHub Actions 会自动触发构建
3. 在 Actions 页面查看构建状态

### 发布新版本
1. 创建并推送标签：
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
2. GitHub Actions 会自动构建所有平台版本
3. 自动创建 GitHub Release 并上传构建产物

### 手动触发
1. 在 GitHub 仓库页面点击 "Actions"
2. 选择要运行的工作流
3. 点击 "Run workflow" 按钮

## 📦 构建产物

### Windows
- `.exe` - Windows 安装程序
- `.zip` - 便携版压缩包

### macOS  
- `.dmg` - macOS 磁盘镜像
- `.zip` - 便携版压缩包

### Linux
- `.AppImage` - Linux 便携应用
- `.zip` - 便携版压缩包

## ⚙️ 配置说明

### 环境变量
- `NODE_ENV=production` - 生产环境构建
- `ELECTRON_CACHE` - Electron 缓存目录
- `ELECTRON_BUILDER_CACHE` - Electron Builder 缓存目录

### 缓存策略
- npm 依赖缓存
- Electron 二进制文件缓存
- 构建产物保留 30 天

## 🔧 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本兼容性
   - 确认所有依赖已正确安装
   - 查看构建日志获取详细错误信息

2. **缓存问题**
   - 清除 GitHub Actions 缓存
   - 重新安装依赖

3. **平台特定问题**
   - Windows: 检查 Windows 特定配置
   - macOS: 确认代码签名设置
   - Linux: 检查 AppImage 构建依赖

### 调试步骤
1. 查看 Actions 页面中的构建日志
2. 检查 `package.json` 中的构建脚本
3. 确认 `electron-builder` 配置正确
4. 验证图标文件路径是否正确

## 📝 自定义配置

### 修改构建目标
编辑 `.github/workflows/build-platforms.yml` 中的 `runs-on` 配置

### 添加新的构建步骤
在相应工作流的 `steps` 部分添加新的步骤

### 修改触发条件
编辑工作流文件顶部的 `on` 部分

## 🎯 最佳实践

1. **使用标签发布**: 创建语义化版本标签触发发布
2. **并行构建**: 使用 `build-platforms.yml` 提高构建效率
3. **缓存优化**: 合理使用缓存减少构建时间
4. **错误处理**: 在构建脚本中添加适当的错误处理
5. **文档更新**: 及时更新构建配置文档 