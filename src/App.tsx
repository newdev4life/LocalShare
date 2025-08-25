import React, { useState, useEffect } from 'react';
import type { SharedFile } from './types';
import FileDropZone from './components/FileDropZone';
import FileList from './components/FileList';
import WindowsControls from './components/WindowsControls';
import { 
  FileTextOutlined, 
  SettingOutlined, 
  InfoCircleOutlined,
  ShareAltOutlined 
} from '@ant-design/icons';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import './App.css';

type PageType = 'files' | 'server' | 'about' | 'settings';

const App: React.FC = () => {
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [serverAddress, setServerAddress] = useState<string>('');
  const [serverStatus, setServerStatus] = useState<'starting' | 'running' | 'error'>('starting');
  const [currentPin, setCurrentPin] = useState<string>('');
  const [pinEnabled, setPinEnabled] = useState<boolean>(false);
  const [platform, setPlatform] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<PageType>('files');
  
  // 上传功能配置状态
  const [uploadEnabled, setUploadEnabled] = useState<boolean>(false);
  const [uploadPath, setUploadPath] = useState<string>('');

  useEffect(() => {
    // 确保 electron 对象存在
    if (window.electron) {
      // 获取平台信息
      setPlatform(window.electron.platform);
      // 监听服务器状态推送
      window.electron.ipcRenderer.on('server-status', (status: any) => {
        setServerStatus(status.status);
        if (status.address) {
          setServerAddress(status.address);
        }
      });

      // 主动获取一次当前状态，避免首次事件错过
      window.electron.ipcRenderer.invoke('get-server-status')
        .then((status: any) => {
          if (!status) return;
          setServerStatus(status.status);
          if (status.address) {
            setServerAddress(status.address);
          }
          if (status.pin) {
            setCurrentPin(status.pin);
          }
          setPinEnabled(status.pinEnabled || false);
        })
        .catch(() => {});

      // 获取上传配置
      window.electron.ipcRenderer.invoke('get-upload-config')
        .then((config: any) => {
          if (config) {
            setUploadEnabled(config.enabled);
            setUploadPath(config.path);
          }
        })
        .catch(() => {});

      // 组件卸载时清理监听器
      return () => {
        window.electron.ipcRenderer.removeAllListeners('server-status');
      };
    }
  }, []);

  const handleFilesAdded = (newFiles: SharedFile[]) => {
    setFiles(prev => {
      const combined = [...prev, ...newFiles];
      // 去重
      const unique = combined.filter((file, index, self) =>
        index === self.findIndex(f => f.fingerprint === file.fingerprint)
      );
      // 通知主进程新的文件列表
      window.electron?.ipcRenderer.send('update-files', unique);
      return unique;
    });
  };

  const handleDelete = (uid: string) => {
    setFiles(prev => {
      const updated = prev.filter(file => file.uid !== uid);
      // 通知主进程更新后的文件列表
      window.electron?.ipcRenderer.send('update-files', updated);
      return updated;
    });
  };

  const handleGeneratePin = async () => {
    const pin = await window.electron?.ipcRenderer.invoke('generate-pin');
    if (pin) {
      setCurrentPin(pin);
      setPinEnabled(true);
    }
  };

  const handleDisablePin = async () => {
    await window.electron?.ipcRenderer.invoke('disable-pin');
    setCurrentPin('');
    setPinEnabled(false);
  };

  // 上传功能配置处理
  const handleUploadToggle = async (enabled: boolean) => {
    const result = await window.electron?.ipcRenderer.invoke('set-upload-config', {
      enabled,
      uploadPath: uploadPath || ''
    });
    if (result?.success) {
      setUploadEnabled(enabled);
    }
  };

  const handleUploadPathChange = async (newPath: string) => {
    const result = await window.electron?.ipcRenderer.invoke('set-upload-config', {
      enabled: uploadEnabled,
      uploadPath: newPath
    });
    if (result?.success) {
      setUploadPath(newPath);
    }
  };

  const handlePickUploadDirectory = async () => {
    const selectedPath = await window.electron?.ipcRenderer.invoke('pick-upload-directory');
    if (selectedPath) {
      await handleUploadPathChange(selectedPath);
    }
  };

  const isMac = platform === 'darwin';
  const isWindows = platform === 'win32';
  const isLinux = platform === 'linux';

  // 侧边栏菜单项
  const menuItems: MenuProps['items'] = [
    {
      key: 'files',
      icon: <FileTextOutlined />,
      label: '文件管理',
    },
    {
      key: 'server',
      icon: <ShareAltOutlined />,
      label: '服务器',
    },
    {
      key: 'about',
      icon: <InfoCircleOutlined />,
      label: '关于',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    setCurrentPage(e.key as PageType);
  };

  // 渲染不同页面的内容
  const renderPageContent = () => {
    switch (currentPage) {
      case 'files':
        return (
          <>
            {/* 文件添加区域 */}
            <div className="desktop-card">
              <div className="desktop-card-header">添加文件和文件夹</div>
              <div className="desktop-card-body">
                <FileDropZone onFilesAdded={handleFilesAdded} />
              </div>
            </div>

            {/* 文件列表 */}
            <div className="desktop-card">
              <div className="desktop-card-header">共享文件列表 ({files.length} 个文件)</div>
              <div className="desktop-card-body">
                <FileList
                  files={files}
                  onDelete={handleDelete}
                  serverAddress={serverStatus === 'running' ? serverAddress : undefined}
                />
              </div>
            </div>
          </>
        );

      case 'server':
        return (
          <>
            {/* 服务器状态 */}
            <div className="desktop-card">
              <div className="desktop-card-header">服务器状态</div>
              <div className="desktop-card-body">
                <div className="server-status-section">
                  <div className={`status-indicator ${serverStatus}`}>
                    <div className={`status-dot ${serverStatus}`}></div>
                    <span className="status-text">
                      {serverStatus === 'running' ? '服务器运行中' : 
                       serverStatus === 'starting' ? '服务器启动中...' : '服务器错误'}
                    </span>
                  </div>
                  
                  {serverStatus === 'running' && serverAddress && (
                    <div className="server-info">
                      <div className="server-address">
                        <strong>访问地址:</strong> http://{serverAddress}
                      </div>
                      <div className="server-tip">
                        在同一网络的其他设备上打开浏览器，输入上述地址即可访问
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PIN 保护设置 */}
            <div className="desktop-card">
              <div className="desktop-card-header">安全设置</div>
              <div className="desktop-card-body">
                <div className="pin-settings">
                  <div className="setting-item">
                    <div className="setting-label">
                      <strong>PIN 保护</strong>
                      <div className="setting-desc">启用 4 位数字密码保护，防止未授权访问</div>
                    </div>
                    <div className="setting-control">
                      {pinEnabled ? (
                        <div className="pin-enabled">
                          <div className="current-pin">当前 PIN: <strong>{currentPin}</strong></div>
                          <button className="pin-btn danger" onClick={handleDisablePin}>
                            关闭保护
                          </button>
                        </div>
                      ) : (
                        <button className="pin-btn primary" onClick={handleGeneratePin}>
                          启用 PIN 保护
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 'about':
        return (
          <div className="desktop-card">
            <div className="desktop-card-header">📁 关于 LocalShare</div>
            <div className="desktop-card-body">
              <div className="about-content">
                <div className="app-info">
                  <h3>LocalShare</h3>
                  <p className="app-version">版本 1.0.0</p>
                  <p className="app-description">
                    LocalShare 是一个简单易用的局域网文件分享工具，让你可以快速在同一网络内的设备间分享文件。
                  </p>
                </div>

                <div className="features-grid">
                  <div className="feature-item">
                    <h4>✨ 功能特点</h4>
                    <ul>
                      <li>无需上传，文件保留在本地</li>
                      <li>支持文件和文件夹分享</li>
                      <li>PIN码保护，安全可控</li>
                      <li>跨平台支持 (Windows/macOS/Linux)</li>
                    </ul>
                  </div>

                  <div className="feature-item">
                    <h4>🔄 传输方式</h4>
                    <ul>
                      <li><strong>单向下载：</strong>其他设备只能下载文件</li>
                      <li><strong>实时访问：</strong>直接访问本地文件</li>
                      <li><strong>目录浏览：</strong>支持在线浏览文件夹</li>
                    </ul>
                  </div>
                </div>

                <div className="usage-guide">
                  <h4>📋 使用步骤</h4>
                  <ol>
                    <li>在"文件管理"页面添加要分享的文件或文件夹</li>
                    <li>在"服务器"页面启用PIN保护（推荐）</li>
                    <li>将访问地址分享给局域网内的其他设备</li>
                    <li>其他设备通过浏览器访问，输入PIN码下载文件</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="desktop-card">
            <div className="desktop-card-header">⚙️ 设置</div>
            <div className="desktop-card-body">
              <div className="settings-content">
                <div className="setting-group">
                  <h4>应用信息</h4>
                  <div className="setting-item">
                    <span className="setting-label">运行平台:</span>
                    <span className="setting-value">
                      {platform === 'darwin' ? 'macOS' : 
                       platform === 'win32' ? 'Windows' : 
                       platform === 'linux' ? 'Linux' : '未知'}
                    </span>
                  </div>
                  <div className="setting-item">
                    <span className="setting-label">共享文件数:</span>
                    <span className="setting-value">{files.length} 个</span>
                  </div>
                </div>

                <div className="setting-group">
                  <h4>上传功能设置</h4>
                  <div className="setting-item">
                    <div className="setting-label">
                      <strong>启用上传功能</strong>
                      <div className="setting-desc">允许其他设备通过网页界面上传文件到指定目录</div>
                    </div>
                    <div className="setting-control">
                      <button 
                        className={`toggle-btn ${uploadEnabled ? 'enabled' : 'disabled'}`}
                        onClick={() => handleUploadToggle(!uploadEnabled)}
                      >
                        {uploadEnabled ? '已启用' : '已禁用'}
                      </button>
                    </div>
                  </div>
                  
                  {uploadEnabled && (
                    <div className="setting-item">
                      <div className="setting-label">
                        <strong>上传目录</strong>
                        <div className="setting-desc">设置文件上传的目标目录</div>
                      </div>
                      <div className="setting-control">
                        <div className="path-input-group">
                          <input
                            type="text"
                            className="path-input"
                            value={uploadPath}
                            onChange={(e) => setUploadPath(e.target.value)}
                            placeholder="选择上传目录..."
                            readOnly
                          />
                          <button 
                            className="browse-btn"
                            onClick={handlePickUploadDirectory}
                          >
                            浏览
                          </button>
                        </div>
                        <div className="path-display">
                          当前路径: {uploadPath || '未设置'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="setting-group">
                  <h4>快捷操作</h4>
                  <div className="quick-actions">
                    <button className="action-btn" onClick={() => setCurrentPage('files')}>
                      <FileTextOutlined /> 管理文件
                    </button>
                    <button className="action-btn" onClick={() => setCurrentPage('server')}>
                      <ShareAltOutlined /> 服务器设置
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="desktop-app">
      {/* 标题栏 */}
      <div className={`title-bar ${isMac ? 'mac' : isWindows ? 'windows' : 'linux'}`}>
        <h1>LocalShare</h1>
        <div className="title-info">
          {serverStatus === 'running' && serverAddress && (
            <span className="server-indicator">
              <div className="status-dot success"></div>
              运行中
            </span>
          )}
        </div>
        {/* Windows 控制按钮 */}
        {isWindows && <WindowsControls />}
      </div>

      {/* 主体布局 */}
      <div className="app-body">
        {/* 侧边栏 */}
        <div className="sidebar">
          <Menu
            mode="inline"
            selectedKeys={[currentPage]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              height: '100%',
              borderRight: 0,
              background: '#f8f9fa',
            }}
          />
        </div>

        {/* 主内容区域 */}
        <div className="main-content">
          {renderPageContent()}
        </div>
      </div>

      {/* 状态栏 */}
      <div className="status-bar">
        <div className="status-left">
          <span className="current-page-info">
            {currentPage === 'files' && `${files.length} 个文件已共享`}
            {currentPage === 'server' && (serverStatus === 'running' ? '服务器运行中' : '服务器未运行')}
            {currentPage === 'about' && 'LocalShare v1.0.0'}
            {currentPage === 'settings' && '应用设置'}
          </span>
        </div>
        <div className="status-right">
          {serverStatus === 'running' && serverAddress && (
            <span className="status-address">
              http://{serverAddress}
              {pinEnabled && <span className="pin-indicator"> 🔒 PIN: {currentPin}</span>}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;