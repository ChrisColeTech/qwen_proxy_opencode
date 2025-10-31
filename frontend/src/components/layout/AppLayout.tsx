import React from 'react';
import { TitleBar } from './TitleBar';
import { StatusBar } from './StatusBar';
import { Sidebar } from './Sidebar';
import { useSettingsStore } from '@/stores/settingsStore';

interface AppLayoutProps {
  children: React.ReactNode;
  statusMessage?: string;
  onNavigate?: (view: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, statusMessage = 'Ready', onNavigate }) => {
  const { sidebarPosition } = useSettingsStore();
  const isLeft = sidebarPosition === 'left';

  return (
    <div className="h-screen flex flex-col">
      <TitleBar />
      <div className="flex-1 flex overflow-hidden">
        {isLeft && <Sidebar onNavigate={onNavigate} position={sidebarPosition} />}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        {!isLeft && <Sidebar onNavigate={onNavigate} position={sidebarPosition} />}
      </div>
      <StatusBar message={statusMessage} />
    </div>
  );
};
