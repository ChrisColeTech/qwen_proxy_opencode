import { create } from 'zustand';

interface SettingsState {
  sidebarPosition: 'left' | 'right';
  theme: 'light' | 'dark' | 'system';
  setSidebarPosition: (position: 'left' | 'right') => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  sidebarPosition: 'left',
  theme: 'system',

  setSidebarPosition: async (position) => {
    set({ sidebarPosition: position });
    await get().saveSettings();
  },

  setTheme: async (theme) => {
    set({ theme });
    await get().saveSettings();
  },

  loadSettings: async () => {
    try {
      // Try to load from Electron store if available
      if (window.electronAPI?.history) {
        const settings = await window.electronAPI.history.read();
        if (settings && typeof settings === 'object') {
          const settingsObj = settings as { sidebarPosition?: 'left' | 'right'; theme?: 'light' | 'dark' | 'system' };
          if (settingsObj.sidebarPosition) {
            set({ sidebarPosition: settingsObj.sidebarPosition });
          }
          if (settingsObj.theme) {
            set({ theme: settingsObj.theme });
          }
        }
      } else {
        // Fallback to localStorage if Electron is not available
        const stored = localStorage.getItem('app-settings');
        if (stored) {
          const settings = JSON.parse(stored);
          set({
            sidebarPosition: settings.sidebarPosition || 'left',
            theme: settings.theme || 'system',
          });
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },

  saveSettings: async () => {
    try {
      const state = get();
      const settings = {
        sidebarPosition: state.sidebarPosition,
        theme: state.theme,
      };

      // Try to save to Electron store if available
      if (window.electronAPI?.history) {
        await window.electronAPI.history.add(settings as any);
      } else {
        // Fallback to localStorage
        localStorage.setItem('app-settings', JSON.stringify(settings));
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },
}));
