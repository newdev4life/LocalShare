# 手动发布指南

如果 GitHub Actions 自动发布失败，可以按照以下步骤手动创建 Release。

## 🔧 准备工作

### 1. 安装 GitHub CLI
```bash
# macOS
brew install gh

# Windows
winget install GitHub.cli

# Linux
sudo apt install gh
```

### 2. 登录 GitHub CLI
```bash
gh auth login
```

## 📦 手动发布步骤

### 1. 构建应用
```bash
# 安装依赖
npm ci

# 构建前端
npm run build

# 构建 Electron 应用
npm run electron:build:win   # Windows
npm run electron:build:mac   # macOS
npm run electron:build:linux # Linux
```

### 2. 创建标签
```bash
# 创建标签
git tag v1.0.3

# 推送标签
git push origin v1.0.3
```

### 3. 创建 Release
```bash
# 创建 Release
gh release create v1.0.3 \
  --title "LocalShare v1.0.3" \
  --notes "## 🚀 LocalShare Release v1.0.3

### 📦 Downloads
- **Windows**: \`.exe\` installer
- **macOS**: \`.dmg\` disk image
- **Linux**: \`.AppImage\` portable app

### 🔧 Installation
1. Download the appropriate file for your platform
2. Run the installer or mount the disk image
3. Follow the installation instructions

### 📋 Changes
See the commit history for detailed changes." \
  --draft=false \
  --prerelease=false
```

### 4. 上传构建产物
```bash
# 上传 Windows 文件
gh release upload v1.0.3 release/*.exe
gh release upload v1.0.3 release/*.zip

# 上传 macOS 文件
gh release upload v1.0.3 release/*.dmg

# 上传 Linux 文件
gh release upload v1.0.3 release/*.AppImage
```

## 🔍 故障排除

### 权限问题
如果遇到权限错误：
1. 检查是否已登录 GitHub CLI
2. 确认有仓库的写入权限
3. 检查仓库设置中的 Actions 权限

### 构建问题
如果构建失败：
1. 检查 Node.js 版本
2. 确认所有依赖已安装
3. 检查图标文件是否存在

### 上传问题
如果上传失败：
1. 确认文件路径正确
2. 检查文件大小是否超过限制
3. 确认网络连接正常

## 📋 检查清单

- [ ] 代码已提交并推送
- [ ] 标签已创建并推送
- [ ] 应用已成功构建
- [ ] Release 已创建
- [ ] 构建产物已上传
- [ ] Release 说明已完善

## 🚀 自动化建议

为了避免手动发布的麻烦，建议：

1. **检查 GitHub 仓库设置**
   - 确保 Actions 权限已启用
   - 确认工作流可以写入内容

2. **使用 GitHub CLI 工作流**
   - 避免第三方 Action 的权限问题
   - 使用官方支持的 GitHub CLI

3. **测试发布流程**
   - 在测试仓库中验证工作流
   - 确保所有步骤都能正常工作 