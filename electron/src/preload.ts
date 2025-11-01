import { contextBridge, ipcRenderer } from 'electron';

// Expose electronAPI to renderer process via contextBridge
contextBridge.exposeInMainWorld('electronAPI', {
  // Clipboard operations
  clipboard: {
    readText: () => ipcRenderer.invoke('clipboard:read'),
    writeText: (text: string) => ipcRenderer.invoke('clipboard:write', text),
  },

  // Window controls
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
  },

  // App controls
  app: {
    quit: () => ipcRenderer.send('app:quit'),
  },

  // History operations
  history: {
    read: () => ipcRenderer.invoke('history:read'),
    add: (entry: any) => ipcRenderer.invoke('history:add', entry),
    clear: () => ipcRenderer.invoke('history:clear'),
  },

  // Qwen authentication
  openLogin: () => ipcRenderer.invoke('qwen:open-login'),
  getCredentials: () => ipcRenderer.invoke('qwen:get-credentials'),
  refreshCredentials: () => ipcRenderer.invoke('qwen:refresh-credentials'),
  onCredentialsUpdated: (callback: (credentials: any) => void) => {
    const subscription = (_event: any, credentials: any) => callback(credentials);
    ipcRenderer.on('credentials-updated', subscription);
    return () => ipcRenderer.removeListener('credentials-updated', subscription);
  },

  // Proxy control
  startProxy: () => ipcRenderer.invoke('proxy:start'),
  stopProxy: () => ipcRenderer.invoke('proxy:stop'),
  getProxyStatus: () => ipcRenderer.invoke('proxy:get-status'),
  onProxyStatusChanged: (callback: (status: any) => void) => {
    const subscription = (_event: any, status: any) => callback(status);
    ipcRenderer.on('proxy-status-changed', subscription);
    return () => ipcRenderer.removeListener('proxy-status-changed', subscription);
  },

  // System utilities
  system: {
    copyToClipboard: (text: string) => ipcRenderer.invoke('clipboard:write', text),
    showNotification: (title: string, body: string) => {
      console.log('Notification:', title, body);
      return Promise.resolve();
    },
    openExternal: (url: string) => {
      console.log('Opening external URL:', url);
      return Promise.resolve();
    },
  },
});
