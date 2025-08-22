const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

function getFileMd5(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('md5')
        const stream = fs.createReadStream(filePath)
        stream.on('data', (chunk) => {
            hash.update(chunk)
        })
        stream.on('end', () => {
            resolve(hash.digest('hex'))
        })
        stream.on('error', (err) => {
            reject(err)
        })
    });
}

function getFileSize(filePath) {
    return new Promise((resolve, reject) => {
        fs.stat(filePath, (err, stats) => {
            if (err) {
                reject(err)
            } else {
                resolve(stats.size)
            }
        })
    })
}

function getFileFingerprint(filePath) {
    const stats = fs.statSync(filePath);
  
    // 文件基础信息
    const size = stats.size;
    const mtime = stats.mtimeMs; // 修改时间（毫秒）
  
    // 小文件直接做 md5
    if (size < 2048) {
      const buffer = fs.readFileSync(filePath);
      const hash = crypto.createHash('md5').update(buffer).digest('hex');
      return `${size}-${mtime}-${hash}`;
    }
  
    // 大文件只取前后 1KB 内容做 hash
    const fd = fs.openSync(filePath, 'r');
    const bufferStart = Buffer.alloc(1024);
    const bufferEnd = Buffer.alloc(1024);
  
    fs.readSync(fd, bufferStart, 0, 1024, 0); // 前 1KB
    fs.readSync(fd, bufferEnd, 0, 1024, size - 1024); // 后 1KB
    fs.closeSync(fd);
  
    const hash = crypto
      .createHash('md5')
      .update(bufferStart)
      .update(bufferEnd)
      .digest('hex');
  
    return `${size}-${mtime}-${hash}`;
  }

function getFolderMd5(folderPath) {
    //  待实现
    return null
}

function isFolder(filePath) {
    return new Promise((resolve, reject) => {
        fs.stat(filePath, (err, stats) => {
            if (err) {
                reject(err)
            } else {
                resolve(stats.isDirectory())
            }
        })
    })
}

/**
 * 获取文件夹的快速指纹（基于文件大小 + 修改时间）
 * @param {string} folderPath - 文件夹路径
 * @returns {{ totalSize: number, latestMtime: number }}
 */
function getFolderFingerprint(folderPath) {
    let totalSize = 0;
    let latestMtime = 0;
  
    function walk(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
  
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const stats = fs.statSync(fullPath);
  
        if (entry.isDirectory()) {
          walk(fullPath);
        } else {
          totalSize += stats.size;
          if (stats.mtimeMs > latestMtime) {
            latestMtime = stats.mtimeMs;
          }
        }
      }
    }
  
    walk(folderPath);
    // 返回字符串格式的指纹，保持与其他函数一致
    return `folder-${totalSize}-${latestMtime}`;
}

module.exports = {
    getFileMd5,
    getFileSize,
    getFileFingerprint,
    isFolder,
    getFolderFingerprint
}