import { app, BrowserWindow, ipcMain, clipboard, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import Store from 'electron-store';

// Initialize electron-store for history persistence
const store = new Store();

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

// Create the main application window
function createWindow() {
  // Set window icon based on platform
  const iconPath = process.platform === 'win32'
    ? path.join(__dirname, '../../assets/icons/win/icon.ico')
    : path.join(__dirname, '../../assets/icons/png/512x512.png');

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    frame: false, // Frameless window
    show: false, // Don't show until ready
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Load the frontend
  if (process.env.NODE_ENV === 'development') {
    // Development mode: load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode: load from built files
    mainWindow.loadFile(path.join(__dirname, '../../frontend/dist/index.html'));
  }

  // Handle window close - minimize to tray instead
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create system tray
function createTray() {
  // Platform-specific icon loading
  let iconPath: string;

  // Try to load the icon from assets directory
  const assetsIconPath = path.join(__dirname, '../../assets/icons/png/16x16.png');

  // For now, use a simple approach - attempt to load from assets, fallback to empty
  try {
    iconPath = assetsIconPath;
    tray = new Tray(iconPath);
  } catch (error) {
    // Fallback to empty icon if file doesn't exist
    console.warn('Tray icon not found at', assetsIconPath, '- using empty icon');
    const icon = nativeImage.createEmpty();
    tray = new Tray(icon);
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: 'Hide App',
      click: () => {
        mainWindow?.hide();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Qwen Proxy OpenCode');
  tray.setContextMenu(contextMenu);

  // Toggle window visibility on tray icon click
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

// IPC Handlers

// Window control handlers (using ipcMain.on for one-way communication)
ipcMain.on('window:minimize', () => {
  // Minimize to tray instead of taskbar
  mainWindow?.hide();
});

ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('window:close', () => {
  mainWindow?.close();
});

// App control handlers
ipcMain.on('app:quit', () => {
  isQuitting = true;
  app.quit();
});

// Clipboard handlers (using ipcMain.handle for async operations)
ipcMain.handle('clipboard:read', () => {
  return clipboard.readText();
});

ipcMain.handle('clipboard:write', (_event, text: string) => {
  clipboard.writeText(text);
  return true;
});

// History persistence handlers
ipcMain.handle('history:read', () => {
  return store.get('history', []);
});

ipcMain.handle('history:add', (_event, item: any) => {
  const history = store.get('history', []) as any[];
  history.unshift(item);
  // Keep only last 100 items
  const updatedHistory = history.slice(0, 100);
  store.set('history', updatedHistory);
  return updatedHistory;
});

ipcMain.handle('history:clear', () => {
  store.delete('history');
  return true;
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
    }
  });
});

// Don't quit when all windows are closed - keep running in tray
app.on('window-all-closed', () => {
  // Keep app running in tray on all platforms
  // User must explicitly quit from tray menu
});

app.on('before-quit', () => {
  isQuitting = true;
});
