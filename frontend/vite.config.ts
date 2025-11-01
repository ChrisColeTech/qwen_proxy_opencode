import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'

export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for Electron
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0', // Expose to network
    port: 5173,
    watch: {
      usePolling: true, // Enable polling for WSL/Windows file systems
      interval: 100, // Check for changes every 100ms
    },
    hmr: {
      host: 'localhost',
      protocol: 'ws',
      overlay: true, // Show error overlay on HMR errors
    },
  },
  build: {
    outDir: 'dist',
  },
})
