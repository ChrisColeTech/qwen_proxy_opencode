import { useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { useSettingsStore } from '@/stores/settingsStore';

function App() {
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  useEffect(() => {
    // Load settings from Electron store or localStorage on mount
    loadSettings();
  }, [loadSettings]);

  return (
    <ThemeProvider>
      <AppLayout statusMessage="Ready">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Welcome to Qwen Proxy OpenCode</h1>
          <p className="mt-2 text-muted-foreground">
            Your application is ready. Use the sidebar to navigate.
          </p>
        </div>
      </AppLayout>
    </ThemeProvider>
  );
}

export default App;
