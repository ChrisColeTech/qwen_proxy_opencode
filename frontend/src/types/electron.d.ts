/**
 * Electron API Type Definitions
 * Defines the window.electronAPI interface for TypeScript
 */

export interface QwenCredentials {
  hasToken: boolean;
  tokenExpiry?: number;
  umidToken?: string;
  cookieString?: string;
}

export interface ProxyStatus {
  running: boolean;
  port?: number;
}

export interface ProxyStartResult {
  success: boolean;
  message?: string;
  port?: number;
}

export interface ProxyStopResult {
  success: boolean;
  message?: string;
}

export interface ElectronAPI {
  // Credentials Management
  getCredentials: () => Promise<QwenCredentials>;
  refreshCredentials: () => Promise<QwenCredentials>;
  openLogin: () => Promise<void>;
  onCredentialsUpdated: (callback: (credentials: QwenCredentials) => void) => () => void;

  // Proxy Control
  startProxy: () => Promise<ProxyStartResult>;
  stopProxy: () => Promise<ProxyStopResult>;
  getProxyStatus: () => Promise<ProxyStatus>;
  onProxyStatusChanged: (callback: (status: ProxyStatus) => void) => () => void;

  // Window Controls
  window: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
  };

  // System Utilities
  system: {
    copyToClipboard: (text: string) => Promise<{ success: boolean }>;
    showNotification: (title: string, body: string) => Promise<void>;
    openExternal: (url: string) => Promise<void>;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
