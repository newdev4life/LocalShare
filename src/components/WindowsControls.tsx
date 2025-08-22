import React from 'react';

const WindowsControls: React.FC = () => {
  const handleMinimize = () => {
    window.electron?.ipcRenderer.send('window-minimize');
  };

  const handleMaximize = () => {
    window.electron?.ipcRenderer.send('window-maximize');
  };

  const handleClose = () => {
    window.electron?.ipcRenderer.send('window-close');
  };

  return (
    <div className="windows-controls">
      <button className="windows-control-btn" onClick={handleMinimize} title="最小化">
        <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
          <rect width="10" height="1"/>
        </svg>
      </button>
      <button className="windows-control-btn" onClick={handleMaximize} title="最大化">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <rect width="10" height="10" stroke="currentColor" strokeWidth="1" fill="none"/>
        </svg>
      </button>
      <button className="windows-control-btn close" onClick={handleClose} title="关闭">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="1"/>
          <line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1"/>
        </svg>
      </button>
    </div>
  );
};

export default WindowsControls;