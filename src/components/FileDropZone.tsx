import React, { useState } from 'react';
import { InboxOutlined, FolderOpenOutlined, FileAddOutlined } from '@ant-design/icons';
import type { SharedFile } from '../types';

interface FileDropZoneProps {
  onFilesAdded: (files: SharedFile[]) => void;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ onFilesAdded }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  // 解析原生 File 列表为 SharedFile（附带真实路径）
  const mapFiles = (files: FileList | File[]) => {
    const arr: SharedFile[] = [];
    for (const file of Array.from(files as any)) {
      const f = file as any;
      arr.push({
        uid: crypto.randomUUID(),
        name: f.name,
        size: f.size ?? 0,
        path: f.path || f.webkitRelativePath || f.name,
        isFolder: false,
        fingerprint: `${f.name}-${f.size}-${f.lastModified}` // 临时指纹
      });
    }
    return arr;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const mapped = mapFiles(e.dataTransfer.files);
    
    // 直接通知父组件，让父组件处理去重逻辑
    if (mapped.length > 0) {
      onFilesAdded(mapped);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleSelectFiles = async () => {
    const paths: string[] = await window.electron?.ipcRenderer.invoke('pick-files');
    if (!paths || paths.length === 0) return;
    
    const mapped: SharedFile[] = await Promise.all(paths.map(async p => ({
      uid: crypto.randomUUID(),
      name: p.split(/[\\/]/).pop() || p,
      size: await window.electron?.ipcRenderer.invoke('get-file-size', p) || 0,
      path: p,
      isFolder: false,
      fingerprint: await window.electron?.ipcRenderer.invoke('get-file-fingerprint', p) || ''
    })));
    
    onFilesAdded(mapped);
  };

  const handleSelectFolders = async () => {
    const paths: string[] = await window.electron?.ipcRenderer.invoke('pick-folders');
    if (!paths || paths.length === 0) return;
    
    const mapped: SharedFile[] = await Promise.all(paths.map(async p => ({
      uid: crypto.randomUUID(),
      name: p.split(/[\\/]/).pop() || p,
      size: 0,
      path: p,
      isFolder: true,
      fingerprint: await window.electron?.ipcRenderer.invoke('get-folder-fingerprint', p) || ''
    })));
    
    onFilesAdded(mapped);
  };

  return (
    <div>
      {/* 拖拽区域 */}
      <div
        className={`desktop-drop-zone ${isDragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleSelectFiles}
        style={{
          borderColor: isDragOver ? '#007acc' : '#c0c0c0',
          backgroundColor: isDragOver ? '#f0f8ff' : '#fafafa',
          cursor: 'pointer'
        }}
      >
        <div className="icon">
          <InboxOutlined />
        </div>
        <div className="text">
          拖拽文件或文件夹到此处，或点击选择
        </div>
        <div className="hint">
          文件不会上传，仅添加到共享列表
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="desktop-buttons">
        <button
          className="desktop-btn"
          onClick={handleSelectFiles}
        >
          <FileAddOutlined style={{ marginRight: '4px' }} />
          选择文件
        </button>
        <button
          className="desktop-btn"
          onClick={handleSelectFolders}
        >
          <FolderOpenOutlined style={{ marginRight: '4px' }} />
          选择文件夹
        </button>
      </div>
    </div>
  );
};

export default FileDropZone;