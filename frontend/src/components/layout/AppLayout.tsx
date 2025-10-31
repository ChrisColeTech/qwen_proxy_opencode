import React from 'react';
import { Outlet } from 'react-router-dom';
import { TitleBar } from './TitleBar';
import { StatusBar } from './StatusBar';
import { Sidebar } from './Sidebar';
import { useSettingsStore } from '@/stores/settingsStore';

interface AppLayoutProps {
  children?: React.ReactNode;
  statusMessage?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, statusMessage = 'Ready' }) => {
  const { sidebarPosition } = useSettingsStore();
  const isLeft = sidebarPosition === 'left';

  return (
    <div className="h-screen flex flex-col">
      <TitleBar />
      <div className="flex-1 flex overflow-hidden">
        {isLeft && <Sidebar position={sidebarPosition} />}
        <main className="flex-1 overflow-auto">
          {children || <Outlet />}
        </main>
        {!isLeft && <Sidebar position={sidebarPosition} />}
      </div>
      <StatusBar message={statusMessage} />
    </div>
  );
};
