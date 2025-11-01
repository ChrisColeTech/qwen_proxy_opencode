import { app, BrowserWindow, ipcMain, clipboard, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import Store from 'electron-store';

// Initialize electron-store for history persistence
const store = new Store();

let mainWindow: BrowserWindow | null = null;
let loginWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

// Create the main application window
function createWindow() {
  // Set window icon based on platform
  const iconPath = process.platform === 'win32'
    ? path.join(__dirname, '../../assets/icons/win/icon.ico')
    : path.join(__dirname, '../../assets/icons/png/512x512.png');

  mainWindow = new BrowserWindow({
 
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

// Create Qwen login window
function createLoginWindow() {
  if (loginWindow) {
    loginWindow.focus();
    return;
  }

  loginWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    parent: mainWindow || undefined,
    modal: false,
    show: false,
    webPreferences: {
      partition: 'persist:qwen', // Persistent session for cookies
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load Qwen chat page
  loginWindow.loadURL('https://chat.qwen.ai');

  // Show when ready
  loginWindow.once('ready-to-show', () => {
    loginWindow?.show();
    // Open DevTools in development to debug
    if (process.env.NODE_ENV === 'development') {
      loginWindow?.webContents.openDevTools();
    }
  });

  // Monitor navigation to detect login (same as POC)
  loginWindow.webContents.on('did-navigate', async (event, url) => {
    console.log('[Login Window] Navigated to:', url);

    if (url.includes('chat.qwen.ai')) {
      // Wait a bit for cookies to be set (same as POC)
      setTimeout(async () => {
        const credentials = await extractQwenCookies();
        console.log('[Login Window] Extracted credentials:', {
          hasCookieString: !!credentials.cookieString,
          hasToken: credentials.hasToken,
          umidToken: credentials.umidToken ? credentials.umidToken.substring(0, 20) + '...' : 'none'
        });

        if (credentials.cookieString && credentials.hasToken) {
          // Credentials extracted successfully
          console.log('[Login Window] Credentials extracted successfully!');
          mainWindow?.webContents.send('credentials-updated', credentials);
          store.set('qwen-credentials', credentials);

          // Don't auto-close - let user close manually
          // loginWindow?.close();
        }
      }, 2000);
    }
  });

  // Clean up when closed
  loginWindow.on('closed', () => {
    loginWindow = null;
  });
}

// Extract Qwen cookies from login session (based on POC)
async function extractQwenCookies() {
  try {
    const { session } = require('electron');
    const cookies = await session.fromPartition('persist:qwen').cookies.get({
      domain: '.qwen.ai'
    });

    // Log all cookie names for debugging
    console.log('[Cookie Extract] All cookies found:', cookies.map((c: any) => c.name));

    // Build cookie string
    const cookieString = cookies
      .map((c: any) => `${c.name}=${c.value}`)
      .join('; ');

    // Find specific cookies (same as POC)
    const tokenCookie = cookies.find((c: any) => c.name === 'token');
    const umidTokenCookie = cookies.find((c: any) => c.name === 'bx-umidtoken');
    const umidToken = umidTokenCookie?.value || '';

    console.log('[Cookie Extract] token cookie found:', !!tokenCookie);
    console.log('[Cookie Extract] bx-umidtoken cookie found:', !!umidTokenCookie);

    // Decode JWT to get expiration
    let tokenExpiry: number | undefined;
    if (tokenCookie) {
      try {
        const base64Url = tokenCookie.value.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(Buffer.from(base64, 'base64').toString());
        tokenExpiry = decoded.exp;
        if (tokenExpiry) {
          console.log('[Cookie Extract] Token expires at:', new Date(tokenExpiry * 1000).toLocaleString());
        }
      } catch (error) {
        console.error('[Cookie Extract] Failed to decode token:', error);
      }
    }

    return {
      cookieString,
      umidToken,
      hasToken: !!tokenCookie,
      tokenExpiry
    };
  } catch (error) {
    console.error('[Cookie Extract] Error extracting cookies:', error);
    return {
      cookieString: '',
      umidToken: '',
      hasToken: false,
      tokenExpiry: undefined
    };
  }
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

// Dashboard IPC handlers

// Qwen login - open embedded browser
ipcMain.handle('qwen:open-login', () => {
  console.log('Opening Qwen login window...');
  createLoginWindow();
  return Promise.resolve();
});

// Manual cookie extraction (for debugging)
ipcMain.handle('qwen:extract-cookies', async () => {
  console.log('Manual cookie extraction requested...');
  await extractQwenCookies();
  return Promise.resolve();
});

// Get Qwen credentials status
ipcMain.handle('qwen:get-credentials', () => {
  // Get from electron-store
  const credentials = store.get('qwen-credentials', {
    hasToken: false,
    tokenExpiry: undefined
  });
  return Promise.resolve(credentials);
});

// Refresh Qwen credentials
ipcMain.handle('qwen:refresh-credentials', async () => {
  console.log('Refreshing credentials...');
  const credentials = await extractQwenCookies();

  // Save to store
  store.set('qwen-credentials', credentials);

  // Send update to renderer
  mainWindow?.webContents.send('credentials-updated', credentials);

  return Promise.resolve(credentials);
});

// Proxy control - start proxy
ipcMain.handle('proxy:start', () => {
  console.log('Starting proxy server...');
  // TODO: Spawn backend process
  // TODO: Return success status
  return Promise.resolve({
    success: true,
    message: 'Proxy server started',
    port: 8000
  });
});

// Proxy control - stop proxy
ipcMain.handle('proxy:stop', () => {
  console.log('Stopping proxy server...');
  // TODO: Stop backend process gracefully
  return Promise.resolve({
    success: true,
    message: 'Proxy server stopped'
  });
});

// Get proxy status
ipcMain.handle('proxy:get-status', () => {
  // TODO: Check if backend process is running
  return Promise.resolve({
    running: false,
    port: 8000
  });
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
