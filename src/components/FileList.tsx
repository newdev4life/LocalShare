import React from 'react';
import { DeleteOutlined, LinkOutlined, FileOutlined, FolderOutlined } from '@ant-design/icons';
import { List, Button, Typography, Space, message } from 'antd';
import type { SharedFile } from '../types';

const { Text } = Typography;

interface FileListProps {
  files: SharedFile[];
  onDelete: (uid: string) => void;
  serverAddress?: string;
}

const FileList: React.FC<FileListProps> = ({ files, onDelete, serverAddress }) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '-';
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    return `${value.toFixed(2)} ${units[unitIndex]}`;
  };

  const handleCopyLink = (fileName: string) => {
    if (!serverAddress) {
      message.warning('服务器未运行');
      return;
    }
    const url = `http://${serverAddress}/${encodeURIComponent(fileName)}`;
    navigator.clipboard.writeText(url);
    message.success('链接已复制到剪贴板');
  };

  const isDirectory = (file: SharedFile) => {
    // 优先使用 isFolder 字段，否则根据文件扩展名判断
    return file.isFolder || (file.size === 0 && !file.name.includes('.'));
  };

  if (files.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        color: '#999',
        fontSize: '13px'
      }}>
        暂无共享文件
      </div>
    );
  }

  return (
    <List
      className="file-list"
      size="small"
      dataSource={files}
      style={{ 
        height: '300px',
        overflow: 'auto',
        border: '1px solid #f0f0f0',
        borderRadius: '6px',
        background: '#fff'
      }}
      renderItem={(file) => (
        <List.Item
          actions={[
            <Button
              key="copy"
              type="text"
              size="small"
              icon={<LinkOutlined />}
              onClick={() => handleCopyLink(file.name)}
              disabled={!serverAddress}
              title="复制下载链接"
            />,
            <Button
              key="delete"
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => onDelete(file.uid)}
              title="移除文件"
              danger
            />
          ]}
        >
          <List.Item.Meta
            avatar={
              isDirectory(file) ? (
                <FolderOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
              ) : (
                <FileOutlined style={{ color: '#666', fontSize: '16px' }} />
              )
            }
            title={
              <Text 
                ellipsis={{ tooltip: file.name }}
                style={{ fontSize: '13px' }}
              >
                {file.name}
              </Text>
            }
            description={
              <Space size="small">
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  {formatBytes(file.size)}
                </Text>
                {isDirectory(file) && (
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    文件夹
                  </Text>
                )}
                <Text type="secondary" style={{ fontSize: '10px' }} ellipsis>
                  {file.path}
                </Text>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default FileList;