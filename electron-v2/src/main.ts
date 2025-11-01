import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron';
import * as path from 'path';
import Store from 'electron-store';

// Initialize electron-store
const store = new Store();

let mainWindow: BrowserWindow | null = null;
let loginWindow: BrowserWindow | null = null;

// Create a simple main window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // For now, load a simple HTML page
  mainWindow.loadFile(path.join(__dirname, '../index.html'));

  // Open DevTools to debug
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// EXACT COPY FROM POC
function createLoginWindow() {
  if (loginWindow) {
    loginWindow.focus();
    return;
  }

  loginWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    parent: mainWindow || undefined,
    modal: false,
    show: false,
    webPreferences: {
      partition: 'persist:qwen',
      nodeIntegration: false,
      contextIsolation: true
    },
  });

  loginWindow.loadURL('https://chat.qwen.ai');

  loginWindow.once('ready-to-show', () => {
    loginWindow?.show();
  });

  // Monitor navigation to detect login
  loginWindow.webContents.on('did-navigate', async (event, url) => {
    console.log('[Login Window] Navigated to:', url);
    if (url.includes('chat.qwen.ai')) {
      // Wait a bit for cookies to be set
      setTimeout(async () => {
        const credentials = await extractQwenCookies();
        console.log('Extracted credentials:', {
          hasCookieString: !!credentials.cookieString,
          hasToken: credentials.hasToken,
          umidToken: credentials.umidToken
        });

        if (credentials.cookieString && credentials.hasToken) {
          // Credentials extracted successfully
          if (mainWindow) {
            mainWindow.webContents.send('credentials-updated', credentials);
          }
          store.set('qwen-credentials', credentials);
          console.log('Credentials saved!');
        }
      }, 2000);
    }
  });

  loginWindow.on('closed', () => {
    loginWindow = null;
  });
}

// Extract Qwen cookies - only called manually
async function extractQwenCookies() {
  try {
    console.log('[Cookie Extract] Starting extraction...');
    const { session } = require('electron');
    const cookies = await session.fromPartition('persist:qwen').cookies.get({
      domain: '.qwen.ai'
    });

    console.log('[Cookie Extract] Found', cookies.length, 'cookies');
    console.log('[Cookie Extract] Cookie names:', cookies.map((c: any) => c.name));

    // Build cookie string
    const cookieString = cookies
      .map((c: any) => `${c.name}=${c.value}`)
      .join('; ');

    // Find specific cookies
    const tokenCookie = cookies.find((c: any) => c.name === 'token');
    const umidTokenCookie = cookies.find((c: any) => c.name === 'bx-umidtoken');
    const umidToken = umidTokenCookie?.value || '';

    console.log('[Cookie Extract] Has token cookie:', !!tokenCookie);
    console.log('[Cookie Extract] Has umid token cookie:', !!umidTokenCookie);

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

    const credentials = {
      cookieString,
      umidToken,
      hasToken: !!tokenCookie,
      tokenExpiry
    };

    // Save to store
    store.set('qwen-credentials', credentials);
    console.log('[Cookie Extract] Credentials saved to store');

    // Send to main window if it exists
    if (mainWindow) {
      mainWindow.webContents.send('credentials-updated', credentials);
      console.log('[Cookie Extract] Credentials sent to main window');
    }

    return credentials;
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

// IPC Handlers

// Open Qwen login window
ipcMain.handle('qwen:open-login', () => {
  console.log('[IPC] qwen:open-login called');
  createLoginWindow();
  return Promise.resolve();
});

// Manual cookie extraction
ipcMain.handle('qwen:extract-cookies', async () => {
  console.log('[IPC] qwen:extract-cookies called');
  const credentials = await extractQwenCookies();
  return Promise.resolve(credentials);
});

// Get stored credentials
ipcMain.handle('qwen:get-credentials', () => {
  console.log('[IPC] qwen:get-credentials called');
  const credentials = store.get('qwen-credentials', {
    hasToken: false,
    tokenExpiry: undefined
  });
  return Promise.resolve(credentials);
});

// App lifecycle
app.whenReady().then(() => {
  console.log('[App] Ready, creating main window');
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
