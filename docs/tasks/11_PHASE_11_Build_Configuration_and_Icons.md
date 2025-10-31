**Goal:** Configure electron-builder for distribution and create application icons.

## Files to Create:
- `electron-builder.json`
- `electron/assets/icons/win/icon.ico`
- `electron/assets/icons/mac/icon.icns`
- `electron/assets/icons/png/16x16.png`
- `electron/assets/icons/png/32x32.png`
- `electron/assets/icons/png/48x48.png`
- `electron/assets/icons/png/64x64.png`
- `electron/assets/icons/png/128x128.png`
- `electron/assets/icons/png/256x256.png`
- `electron/assets/icons/png/512x512.png`
- `electron/assets/icons/png/1024x1024.png`
- `frontend/src/assets/app-icon.png` (for title bar)

## Files to Modify:
- Root `package.json` (add dist scripts if not done in Phase 1)

## Integration Points:
- electron-builder
- Platform-specific build tools
- Icon generation tools

## Tasks:

**1.) Objective:** design the application icon to be visually appealing and professional.

**2.) Icon Design & Creation:**
*   Create a new, modern SVG icon. 
*   Save the final design as `assets/icon.svg`.

**3.) Icon Conversion:**
*   Convert the `assets/icon.svg` into the necessary formats for a cross-platform Electron application. use a command-line tool like ImageMagick
*   **Required Formats & Locations:**
    *   **PNG:** Generate a set of PNGs (16x16, 32x32, 64x64, 128x128, 256x256, 512x512) and place them in the `assets/icons/` directory.
    *   **ICO (Windows):** Create `assets/icons/icon.ico` from the PNG sizes.
    *   **ICNS (macOS):** Create `assets/icons/icon.icns` from the PNG sizes.

**4.) Application Integration:**
*   **Title Bar:** Update `frontend/src/components/layout/TitleBar.tsx` to display the new `assets/icon.svg` at the beginning of the title bar.
*   **Electron Main Process:** Modify `electron/src/main.ts`. Update the `createWindow` function to use the new `.ico` or `.png` icon for the `BrowserWindow`. Also, update the `createTray` function to use the new icon for the system tray.
*   **Build Configuration:** Update `electron-builder.json` to point to the new icon files in `assets/icons/` for the `win`, `mac`, and `linux` build targets.

**5.) Verification:**
*   Run `npm run build` to ensure the code compiles without errors.


## Common Issues & Fixes:

- **Icon not embedding in Windows executable**
  - Verify icon.ico is actual ICO format (not renamed PNG)
  - Use ImageMagick to create proper ICO
  - electron-builder requires proper ICO structure

- **macOS icon not showing**
  - Verify icon.icns is proper ICNS format
  - Use iconutil or Icon Composer to create ICNS
  - Clear icon cache: `sudo rm -rf /Library/Caches/com.apple.iconservices.store`

- **Build fails with "Cannot find main"**
  - Verify electron-builder.json extraMetadata.main points to correct path
  - Should be: "electron/dist/main.js"

- **Tray icon not found in built app**
  - Verify icon path in main.ts is relative to __dirname
  - Check that assets folder is included in electron-builder files array

## Validation:

- [x] Build succeeds for Windows
- [x] Build succeeds for macOS (if on Mac)
- [x] Build succeeds for Linux
- [x] Installer installs correctly
- [x] App icon shows in taskbar/dock
- [x] Tray icon shows in system tray
- [x] All app features work in built version

## Structure After Phase 9:

```bash
electron/
├── assets/
│   └── icons/
│       ├── win/
│       │   └── icon.ico
│       ├── mac/
│       │   └── icon.icns
│       └── png/
│           ├── 16x16.png
│           ├── 32x32.png
│           ├── 48x48.png
│           ├── 64x64.png
│           ├── 128x128.png
│           ├── 256x256.png
│           ├── 512x512.png
│           └── 1024x1024.png
frontend/
├── public/
│   └── icon-32.png
electron-builder.json
dist/ (build output)
```

```bash
#!/bin/bash

# Script to generate all required icon formats from SVG using ImageMagick
# Requires ImageMagick to be installed
# Bash(convert --version) WSL
# Bash(magick --version) Windows

SVG_SOURCE="assets/icon.svg"
ICONS_DIR="assets/icons"

# Create directories
mkdir -p "$ICONS_DIR"

# Generate PNG files at various sizes
echo "Generating PNG icons..."
magick "$SVG_SOURCE" -resize 16x16 "$ICONS_DIR/16x16.png"
magick "$SVG_SOURCE" -resize 32x32 "$ICONS_DIR/32x32.png"
magick "$SVG_SOURCE" -resize 48x48 "$ICONS_DIR/48x48.png"
magick "$SVG_SOURCE" -resize 64x64 "$ICONS_DIR/64x64.png"
magick "$SVG_SOURCE" -resize 128x128 "$ICONS_DIR/128x128.png"
magick "$SVG_SOURCE" -resize 256x256 "$ICONS_DIR/256x256.png"
magick "$SVG_SOURCE" -resize 512x512 "$ICONS_DIR/512x512.png"
magick "$SVG_SOURCE" -resize 1024x1024 "$ICONS_DIR/1024x1024.png"

# Generate Windows ICO file (contains multiple sizes)
echo "Generating Windows ICO..."
magick "$ICONS_DIR/16x16.png" "$ICONS_DIR/32x32.png" "$ICONS_DIR/48x48.png" "$ICONS_DIR/64x64.png" "$ICONS_DIR/128x128.png" "$ICONS_DIR/256x256.png" "$ICONS_DIR/icon.ico"

# Generate macOS ICNS file
echo "Generating macOS ICNS..."
# Create iconset directory
ICONSET_DIR="$ICONS_DIR/icon.iconset"
mkdir -p "$ICONSET_DIR"

# Copy PNGs with proper naming for iconset
cp "$ICONS_DIR/16x16.png" "$ICONSET_DIR/icon_16x16.png"
cp "$ICONS_DIR/32x32.png" "$ICONSET_DIR/icon_16x16@2x.png"
cp "$ICONS_DIR/32x32.png" "$ICONSET_DIR/icon_32x32.png"
cp "$ICONS_DIR/64x64.png" "$ICONSET_DIR/icon_32x32@2x.png"
cp "$ICONS_DIR/128x128.png" "$ICONSET_DIR/icon_128x128.png"
cp "$ICONS_DIR/256x256.png" "$ICONS_DIR/icon_128x128@2x.png"
cp "$ICONS_DIR/256x256.png" "$ICONSET_DIR/icon_256x256.png"
cp "$ICONS_DIR/512x512.png" "$ICONSET_DIR/icon_256x256@2x.png"
cp "$ICONS_DIR/512x512.png" "$ICONSET_DIR/icon_512x512.png"
cp "$ICONS_DIR/1024x1024.png" "$ICONSET_DIR/icon_512x512@2x.png"

# Convert iconset to icns (macOS only)
if command -v iconutil &> /dev/null; then
    iconutil -c icns "$ICONSET_DIR" -o "$ICONS_DIR/icon.icns"
    rm -rf "$ICONSET_DIR"
    echo "ICNS file created successfully"
else
    echo "Warning: iconutil not found. ICNS file not created (macOS only)"
    echo "The iconset directory has been left for manual conversion"
fi

# Copy icon for frontend title bar
echo "Copying icon for frontend..."
cp "$ICONS_DIR/32x32.png" "frontend/public/icon-32.png"

echo "Icon generation complete!"
echo "Generated files:"
echo "  - PNG icons: $ICONS_DIR/*.png"
echo "  - Windows ICO: $ICONS_DIR/icon.ico"
echo "  - macOS ICNS: $ICONS_DIR/icon.icns (if on macOS)"
echo "  - Frontend icon: frontend/public/icon-32.png"
```