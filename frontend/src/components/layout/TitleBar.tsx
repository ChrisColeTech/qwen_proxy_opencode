import React from 'react';
import { VscChromeMinimize, VscChromeMaximize, VscChromeClose } from 'react-icons/vsc';
import { Sun, Moon, PanelLeft, PanelRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettingsStore } from '@/stores/settingsStore';

export const TitleBar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { sidebarPosition, setSidebarPosition } = useSettingsStore();

  const toggleSidebarPosition = () => {
    setSidebarPosition(sidebarPosition === 'left' ? 'right' : 'left');
  };

  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.window.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.window.maximize();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.window.close();
    }
  };

  return (
    <div
      className="h-8 bg-background border-b flex items-center justify-between"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center gap-2 pl-2">
        <img src="./icon-32.png" alt="App Icon" className="h-5 w-5" />
        <span className="text-sm font-semibold">Qwen Proxy OpenCode</span>
      </div>

      <div className="flex" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          onClick={toggleSidebarPosition}
          className="h-8 w-12 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors border-0 bg-transparent"
          aria-label="Toggle sidebar position"
          title="Toggle sidebar position"
        >
          {sidebarPosition === 'left' ? <PanelLeft className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
        </button>

        <button
          onClick={toggleTheme}
          className="h-8 w-12 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors border-0 bg-transparent"
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        <button
          onClick={handleMinimize}
          className="h-8 w-12 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors border-0 bg-transparent"
          aria-label="Minimize"
        >
          <VscChromeMinimize className="h-4 w-4" />
        </button>

        <button
          onClick={handleMaximize}
          className="h-8 w-12 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors border-0 bg-transparent"
          aria-label="Maximize"
        >
          <VscChromeMaximize className="h-4 w-4" />
        </button>

        <button
          onClick={handleClose}
          className="h-8 w-12 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors border-0 bg-transparent"
          aria-label="Close"
        >
          <VscChromeClose className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
