# GitHub Actions 故障排除指南

## 常见问题及解决方案

### 1. 代码块大小警告

**问题**: `Some chunks are larger than 500 kB after minification`

**解决方案**:
- ✅ 已在 `vite.config.ts` 中配置代码分割
- ✅ 增加了 `chunkSizeWarningLimit` 到 1000KB
- ✅ 配置了 `manualChunks` 分离第三方库

### 2. GitHub Token 错误

**问题**: `GitHub Personal Access Token is not set`

**解决方案**:
- ✅ 已在所有构建步骤中添加 `GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`
- ✅ 使用 GitHub 自动提供的 `GITHUB_TOKEN`

### 3. 构建失败

**常见原因**:
1. **依赖安装失败**
   ```bash
   # 解决方案：清除缓存重新安装
   npm cache clean --force
   npm ci
   ```

2. **TypeScript 编译错误**
   ```bash
   # 解决方案：检查类型错误
   npx tsc --noEmit
   ```

3. **图标文件缺失**
   ```bash
   # 解决方案：确保图标文件存在
   ls -la build/icons/
   ```

### 4. 平台特定问题

#### Windows 构建问题
- **问题**: Windows 代码签名错误
- **解决**: 已设置 `"identity": null` 和 `"forceCodeSigning": false`

#### macOS 构建问题
- **问题**: macOS 公证错误
- **解决**: 已设置 `"hardenedRuntime": false`

#### Linux 构建问题
- **问题**: AppImage 构建失败
- **解决**: 确保使用 Ubuntu 最新版本运行器

### 5. 缓存问题

**清理缓存**:
```bash
# 清理 npm 缓存
npm cache clean --force

# 清理 Electron 缓存
rm -rf ~/.cache/electron
rm -rf ~/.cache/electron-builder
```

### 6. 内存不足

**解决方案**:
- 使用 `npm ci` 而不是 `npm install`
- 启用 npm 缓存
- 使用并行构建减少内存使用

## 调试步骤

### 1. 检查构建日志
1. 在 GitHub 仓库页面点击 "Actions"
2. 选择失败的工作流
3. 查看详细的构建日志

### 2. 本地复现问题
```bash
# 安装依赖
npm ci

# 类型检查
npx tsc --noEmit

# 构建前端
npm run build

# 构建 Electron 应用
npm run electron:build:linux
```

### 3. 验证配置
```bash
# 检查 package.json 配置
cat package.json | jq '.build'

# 检查 Vite 配置
cat vite.config.ts

# 检查图标文件
ls -la build/icons/
```

## 性能优化

### 1. 构建时间优化
- 使用 npm 缓存
- 并行构建不同平台
- 使用最新的 Node.js 版本

### 2. 构建产物优化
- 排除不必要的文件
- 压缩构建产物
- 使用代码分割

### 3. 缓存策略
- npm 依赖缓存
- Electron 二进制缓存
- 构建产物缓存

## 联系支持

如果遇到其他问题：
1. 查看 GitHub Actions 日志
2. 检查本故障排除文档
3. 提交 GitHub Issue
4. 提供详细的错误信息和复现步骤 