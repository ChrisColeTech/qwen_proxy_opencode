import React, { useState } from 'react';
import { Home, FileText, Activity, Settings } from 'lucide-react';

interface SidebarProps {
  onNavigate?: (view: string) => void;
  position?: 'left' | 'right';
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, position = 'left' }) => {
  const [activeView, setActiveView] = useState('home');

  const handleNavigate = (view: string) => {
    setActiveView(view);
    onNavigate?.(view);
  };

  const topNavItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'activity', icon: Activity, label: 'Activity' },
    { id: 'logs', icon: FileText, label: 'Logs' },
  ];

  const isActive = (id: string) => activeView === id;
  const isLeft = position === 'left';

  const renderButton = (id: string, Icon: any, label: string) => {
    const active = isActive(id);
    return (
      <button
        key={id}
        onClick={() => handleNavigate(id)}
        className={`
          h-12 w-12 flex items-center justify-center
          transition-colors relative group
          ${active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}
        `}
        aria-label={label}
        title={label}
      >
        {active && (
          <div
            className={`absolute ${isLeft ? 'left-0' : 'right-0'} w-0.5 h-8 bg-primary`}
          />
        )}
        <Icon className="h-5 w-5" />
      </button>
    );
  };

  return (
    <div className={`w-12 bg-secondary/30 ${isLeft ? 'border-r' : 'border-l'} border-border flex flex-col`}>
      {/* Top navigation items */}
      <div className="flex-1">
        {topNavItems.map((item) => renderButton(item.id, item.icon, item.label))}
      </div>

      {/* Settings fixed at bottom */}
      <div className="border-t border-border">
        {renderButton('settings', Settings, 'Settings')}
      </div>
    </div>
  );
};
