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
});
