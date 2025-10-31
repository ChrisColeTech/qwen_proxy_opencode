import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, Activity, Settings } from 'lucide-react';

interface SidebarProps {
  position?: 'left' | 'right';
}

export const Sidebar: React.FC<SidebarProps> = ({ position = 'left' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const topNavItems = [
    { id: 'home', path: '/', icon: Home, label: 'Home' },
    { id: 'activity', path: '/activity', icon: Activity, label: 'Activity' },
    { id: 'logs', path: '/logs', icon: FileText, label: 'Logs' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const isLeft = position === 'left';

  const renderButton = (path: string, Icon: any, label: string) => {
    const active = isActive(path);
    return (
      <button
        key={path}
        onClick={() => handleNavigate(path)}
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
        {topNavItems.map((item) => renderButton(item.path, item.icon, item.label))}
      </div>

      {/* Settings fixed at bottom */}
      <div className="border-t border-border">
        {renderButton('/settings', Settings, 'Settings')}
      </div>
    </div>
  );
};
