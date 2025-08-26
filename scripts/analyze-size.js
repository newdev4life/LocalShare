#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📊 包大小分析...\n');

// 分析 release 目录
const releaseDir = path.join(__dirname, '..', 'release');
if (!fs.existsSync(releaseDir)) {
  console.log('❌ release 目录不存在，请先构建应用');
  process.exit(1);
}

// 获取所有文件
const files = fs.readdirSync(releaseDir);
const fileStats = [];

files.forEach(file => {
  const filePath = path.join(releaseDir, file);
  const stats = fs.statSync(filePath);
  
  if (stats.isFile()) {
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    fileStats.push({
      name: file,
      size: stats.size,
      sizeInMB: parseFloat(sizeInMB)
    });
  }
});

// 按大小排序
fileStats.sort((a, b) => b.size - a.size);

console.log('📦 构建产物大小分析:');
console.log('─'.repeat(60));
fileStats.forEach(file => {
  const sizeStr = file.sizeInMB >= 1 ? `${file.sizeInMB} MB` : `${(file.size / 1024).toFixed(1)} KB`;
  console.log(`${file.name.padEnd(40)} ${sizeStr.padStart(10)}`);
});

// 分析 dist 目录
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  console.log('\n📁 前端构建产物分析:');
  console.log('─'.repeat(60));
  
  function analyzeDir(dir, prefix = '') {
    const items = fs.readdirSync(dir);
    let totalSize = 0;
    
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isFile()) {
        const sizeInKB = (stats.size / 1024).toFixed(1);
        console.log(`${prefix}${item.padEnd(30)} ${sizeInKB.padStart(8)} KB`);
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        console.log(`${prefix}${item}/`);
        totalSize += analyzeDir(itemPath, prefix + '  ');
      }
    });
    
    return totalSize;
  }
  
  const totalDistSize = analyzeDir(distDir);
  console.log(`\n📊 前端构建总大小: ${(totalDistSize / (1024 * 1024)).toFixed(2)} MB`);
}

// 优化建议
console.log('\n💡 瘦包优化建议:');
console.log('─'.repeat(60));
console.log('1. ✅ 已启用最大压缩 (compression: "maximum")');
console.log('2. ✅ 已移除 package.json 中的 scripts 和 keywords');
console.log('3. ✅ 已启用 Terser 压缩和 console 移除');
console.log('4. ✅ 已配置代码分割 (manualChunks)');
console.log('5. 🔄 考虑使用 electron-builder 的 asar 打包');
console.log('6. 🔄 考虑移除不必要的 Electron 模块');
console.log('7. 🔄 考虑使用更小的图标文件');
console.log('8. 🔄 考虑启用 tree-shaking 移除未使用的代码');

// 检查是否有大文件
const largeFiles = fileStats.filter(f => f.sizeInMB > 50);
if (largeFiles.length > 0) {
  console.log('\n⚠️  大文件警告 (>50MB):');
  largeFiles.forEach(file => {
    console.log(`   - ${file.name}: ${file.sizeInMB} MB`);
  });
} 