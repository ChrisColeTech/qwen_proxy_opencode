export interface ElectronAPI {
  openQwenLogin: () => Promise<void>;
  extractCookies: () => Promise<any>;
  getCredentials: () => Promise<any>;
  onCredentialsUpdated: (callback: (credentials: any) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
