interface ElectronAPI {
  clipboard: {
    readText: () => Promise<string>;
    writeText: (text: string) => Promise<void>;
  };
  window: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
  };
  app: {
    quit: () => void;
  };
  history: {
    read: () => Promise<any[]>;
    add: (entry: any) => Promise<any[]>;
    clear: () => Promise<boolean>;
  };
}

interface Window {
  electronAPI?: ElectronAPI;
}
