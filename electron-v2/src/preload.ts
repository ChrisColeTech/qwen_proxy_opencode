import { contextBridge, ipcRenderer } from 'electron';

console.log('[Preload] Script is running');

// Expose safe APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Qwen authentication
  openQwenLogin: () => ipcRenderer.invoke('qwen:open-login'),
  extractCookies: () => ipcRenderer.invoke('qwen:extract-cookies'),
  getCredentials: () => ipcRenderer.invoke('qwen:get-credentials'),

  // Listen for credential updates
  onCredentialsUpdated: (callback: (credentials: any) => void) => {
    ipcRenderer.on('credentials-updated', (_event, credentials) => callback(credentials));
  }
});

console.log('[Preload] electronAPI exposed to window');
