import { app, BrowserWindow, ipcMain, clipboard, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import * as http from 'http';
import { spawn, ChildProcess } from 'child_process';
import Store from 'electron-store';

// Initialize electron-store for history persistence
const store = new Store();

let mainWindow: BrowserWindow | null = null;
let loginWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;
let backendProcess: ChildProcess | null = null;

// Create the main application window
function createWindow() {
  // Set window icon based on platform
  const iconPath = process.platform === 'win32'
    ? path.join(__dirname, '../assets/icons/win/icon.ico')
    : path.join(__dirname, '../assets/icons/png/512x512.png');

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
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  // Add debugging for all navigation events
  loginWindow.webContents.on('will-navigate', (event, url) => {
    console.log('[Login Window] will-navigate:', url);
  });

  loginWindow.webContents.on('did-start-loading', () => {
    console.log('[Login Window] did-start-loading');
  });

  loginWindow.webContents.on('did-stop-loading', () => {
    console.log('[Login Window] did-stop-loading');
  });

  loginWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('[Login Window] did-fail-load:', errorCode, errorDescription, validatedURL);
  });

  loginWindow.webContents.on('dom-ready', () => {
    console.log('[Login Window] dom-ready');
  });

  // Load Qwen chat page
  loginWindow.loadURL('https://chat.qwen.ai');

  // Show when ready
  loginWindow.once('ready-to-show', () => {
    console.log('[Login Window] ready-to-show - showing window');
    loginWindow?.show();
    // Open DevTools in development to debug
    if (process.env.NODE_ENV === 'development') {
      loginWindow?.webContents.openDevTools();
    }
  });

  // Monitor navigation to detect login completion
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

          // Send credentials to backend API
          sendCredentialsToBackend(credentials).catch((error) => {
            // Log error but don't crash the app - credentials are still saved locally
            console.error('[Login Window] Backend integration error (non-fatal):', error.message);
          });
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
      tokenValue: tokenCookie?.value || '',  // The actual JWT token
      umidToken,  // Keep for backward compatibility
      hasToken: !!tokenCookie,
      tokenExpiry
    };
  } catch (error) {
    console.error('[Cookie Extract] Error extracting cookies:', error);
    return {
      cookieString: '',
      tokenValue: '',
      umidToken: '',
      hasToken: false,
      tokenExpiry: undefined
    };
  }
}

// Send credentials to backend API
async function sendCredentialsToBackend(credentials: {
  cookieString: string;
  tokenValue: string;
  umidToken: string;
  hasToken: boolean;
  tokenExpiry?: number;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('[Backend Integration] Sending credentials to backend...');

    const requestData = JSON.stringify({
      token: credentials.tokenValue,  // Send the actual JWT token
      cookies: credentials.cookieString,
      expiresAt: credentials.tokenExpiry
    });

    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/v1/qwen/credentials',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          console.log('[Backend Integration] Credentials sent to backend successfully');
          resolve();
        } else {
          console.error('[Backend Integration] Failed to send credentials to backend: HTTP', res.statusCode, responseData);
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'ECONNREFUSED') {
        console.error('[Backend Integration] Failed to send credentials to backend: Backend server is not running (ECONNREFUSED)');
      } else {
        console.error('[Backend Integration] Failed to send credentials to backend:', error.message);
      }
      reject(error);
    });

    req.write(requestData);
    req.end();
  });
}

// Create system tray
function createTray() {
  // Platform-specific icon loading
  let iconPath: string;

  // Try to load the icon from assets directory
  const assetsIconPath = path.join(__dirname, '../assets/icons/png/16x16.png');

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
  const credentials = await extractQwenCookies();

  if (credentials.cookieString && credentials.hasToken) {
    // Save credentials locally
    store.set('qwen-credentials', credentials);

    // Send credentials to backend API
    sendCredentialsToBackend(credentials).catch((error) => {
      // Log error but don't crash the app - credentials are still saved locally
      console.error('[Manual Extract] Backend integration error (non-fatal):', error.message);
    });
  }

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

  try {
    // Check if already running
    if (backendProcess && isProcessRunning(backendProcess.pid)) {
      console.log('Proxy server is already running');
      return Promise.resolve({
        success: false,
        message: 'Proxy server is already running',
        port: 8000
      });
    }

    // Determine the backend directory path (relative to electron directory)
    const backendDir = path.join(__dirname, '../../backend/provider-router');

    console.log('Backend directory:', backendDir);

    // Spawn the backend process
    // Use npm run dev command in the backend/provider-router directory
    const isWindows = process.platform === 'win32';
    const npmCmd = isWindows ? 'npm.cmd' : 'npm';

    backendProcess = spawn(npmCmd, ['run', 'dev'], {
      cwd: backendDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: isWindows,
      env: { ...process.env }
    });

    // Log stdout from backend
    if (backendProcess.stdout) {
      backendProcess.stdout.on('data', (data) => {
        console.log('[Backend]', data.toString().trim());
      });
    }

    // Log stderr from backend
    if (backendProcess.stderr) {
      backendProcess.stderr.on('data', (data) => {
        console.error('[Backend Error]', data.toString().trim());
      });
    }

    // Handle process exit
    backendProcess.on('exit', (code, signal) => {
      console.log(`Backend process exited with code ${code} and signal ${signal}`);
      backendProcess = null;
    });

    // Handle process errors
    backendProcess.on('error', (error) => {
      console.error('Failed to start backend process:', error);
      backendProcess = null;
    });

    console.log('Proxy server started with PID:', backendProcess.pid);

    return Promise.resolve({
      success: true,
      message: 'Proxy server started',
      port: 8000,
      pid: backendProcess.pid
    });
  } catch (error: any) {
    console.error('Error starting proxy server:', error);
    backendProcess = null;
    return Promise.resolve({
      success: false,
      message: `Failed to start proxy server: ${error.message}`,
      port: 8000
    });
  }
});

// Proxy control - stop proxy
ipcMain.handle('proxy:stop', () => {
  console.log('Stopping proxy server...');

  try {
    if (!backendProcess) {
      console.log('No backend process to stop');
      return Promise.resolve({
        success: false,
        message: 'Proxy server is not running'
      });
    }

    // Check if process is actually running
    if (!isProcessRunning(backendProcess.pid)) {
      console.log('Backend process is not running');
      backendProcess = null;
      return Promise.resolve({
        success: false,
        message: 'Proxy server is not running'
      });
    }

    // Try graceful shutdown first
    const killed = backendProcess.kill('SIGTERM');

    if (killed) {
      console.log('Sent SIGTERM to backend process');

      // Set a timeout to force kill if graceful shutdown fails
      setTimeout(() => {
        if (backendProcess && isProcessRunning(backendProcess.pid)) {
          console.log('Graceful shutdown timed out, force killing...');
          backendProcess.kill('SIGKILL');
        }
      }, 5000);

      backendProcess = null;

      return Promise.resolve({
        success: true,
        message: 'Proxy server stopped'
      });
    } else {
      console.error('Failed to kill backend process');
      return Promise.resolve({
        success: false,
        message: 'Failed to stop proxy server'
      });
    }
  } catch (error: any) {
    console.error('Error stopping proxy server:', error);
    backendProcess = null;
    return Promise.resolve({
      success: false,
      message: `Failed to stop proxy server: ${error.message}`
    });
  }
});

// Get proxy status
ipcMain.handle('proxy:get-status', () => {
  const running = backendProcess !== null && isProcessRunning(backendProcess.pid);

  console.log('Proxy status check:', {
    hasProcess: backendProcess !== null,
    pid: backendProcess?.pid,
    running
  });

  return Promise.resolve({
    running,
    port: 8000,
    pid: backendProcess?.pid
  });
});

// Helper function to check if a process is running
function isProcessRunning(pid: number | undefined): boolean {
  if (!pid) {
    return false;
  }

  try {
    // Sending signal 0 checks if process exists without actually sending a signal
    process.kill(pid, 0);
    return true;
  } catch (error: any) {
    // ESRCH means no such process
    // EPERM means process exists but we don't have permission (still running)
    return error.code === 'EPERM';
  }
}

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

  // Stop backend process if it's running
  if (backendProcess && isProcessRunning(backendProcess.pid)) {
    console.log('Stopping backend process before quit...');
    try {
      backendProcess.kill('SIGTERM');
      // Give it a moment for graceful shutdown, then force kill if needed
      setTimeout(() => {
        if (backendProcess && isProcessRunning(backendProcess.pid)) {
          backendProcess.kill('SIGKILL');
        }
      }, 2000);
    } catch (error) {
      console.error('Error stopping backend process:', error);
    }
  }
});
