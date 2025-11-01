# Electron Qwen Login Window Fix

## Problem
The Qwen login window was displaying a blank page when users tried to sign in. The page would load initially, but when clicking on a sign-in option, it would go blank and DevTools would disconnect.

## Root Cause
**Electron 28 has a compatibility issue with qwen.ai's website.** The site uses JavaScript or browser APIs that don't work correctly in Electron 28's rendering engine.

## Solution
Downgrade from **Electron 28** to **Electron 27**.

## Changes Made

### 1. `/electron/package.json`
Changed:
```json
"electron": "^28.0.0"
```
To:
```json
"electron": "^27.0.0"
```

### 2. Reinstall dependencies
```bash
cd electron
npm install
```

## Verification
After the fix, the login window should:
1. ✅ Load chat.qwen.ai successfully
2. ✅ Display sign-in options
3. ✅ Allow clicking sign-in without going blank
4. ✅ Complete the OAuth flow
5. ✅ Automatically extract cookies when navigation completes

## Technical Details

The original implementation was correct - the issue was purely the Electron version. The working configuration:

```typescript
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

loginWindow.webContents.on('did-navigate', async (event, url) => {
  if (url.includes('chat.qwen.ai')) {
    setTimeout(async () => {
      const credentials = await extractQwenCookies();
      // ... save credentials
    }, 2000);
  }
});
```

This configuration works perfectly in Electron 27 but fails in Electron 28.

## Future Considerations

If you need to upgrade Electron in the future:
1. Test the Qwen login flow thoroughly
2. Check Electron release notes for WebView/BrowserWindow changes
3. Consider alternative approaches if issues persist:
   - Use Playwright/Puppeteer for login
   - Implement manual cookie input
   - Use BrowserView instead of BrowserWindow

## Testing
To verify the fix works:
```bash
cd /Users/chris/Projects/qwen_proxy_opencode
npm run dev
```

Then:
1. Click "Open Qwen Login" in the app
2. The login window should open and display the Qwen page
3. Click a sign-in option (Google, email, etc.)
4. The page should remain functional (not go blank)
5. Complete the login flow
6. Cookies will be extracted automatically
