# Qwen Proxy OpenCode - Electron V2

This is a clean, simplified Electron implementation that fixes the blank page issue with the Qwen login window.

## Key Differences from V1

### The Problem in V1
The original implementation had automatic navigation monitoring that would trigger cookie extraction every time the page navigated. This caused:
- Multiple overlapping setTimeout calls
- Interference with the page loading process
- The page going blank after loading

### The Solution in V2
- **No automatic monitoring**: The login window simply loads the page without any interference
- **Manual cookie extraction**: User clicks a button when ready to extract cookies
- **Minimal event listeners**: Only logging for debugging, no business logic tied to navigation events
- **Clean separation**: Login window and cookie extraction are completely decoupled

## How to Use

1. **Install dependencies**:
   ```bash
   cd electron-v2
   npm install
   ```

2. **Run the app**:
   ```bash
   npm run dev
   ```

3. **Login workflow**:
   - Click "Open Qwen Login" button
   - A new window opens with chat.qwen.ai
   - Log in to your Qwen account (the page works normally, no blanking!)
   - After successful login, click "Extract Cookies" in the main window
   - Check the status to verify credentials were extracted

## Architecture

### Files
- `src/main.ts` - Main Electron process with window management and IPC handlers
- `src/preload.ts` - Preload script that exposes safe APIs to renderer
- `index.html` - Simple UI for testing the login flow

### Key Features
- Persistent session for Qwen cookies using `partition: 'persist:qwen'`
- Manual cookie extraction via IPC
- Credential storage using electron-store
- Clean logging for debugging

## Why This Works

The login window configuration is minimal:
```typescript
loginWindow = new BrowserWindow({
  width: 1200,
  height: 800,
  webPreferences: {
    partition: 'persist:qwen',
    nodeIntegration: false,
    contextIsolation: true,
  },
});

loginWindow.loadURL('https://chat.qwen.ai');
```

No automatic event handlers that interfere with navigation. The page loads and works exactly as it would in a normal browser.

Cookie extraction only happens when explicitly requested by the user via the "Extract Cookies" button.

## Next Steps

To integrate this into your full application:
1. Copy the `createLoginWindow()` function to your main process
2. Use the manual extraction approach instead of automatic monitoring
3. Add a UI button for users to trigger cookie extraction after login
