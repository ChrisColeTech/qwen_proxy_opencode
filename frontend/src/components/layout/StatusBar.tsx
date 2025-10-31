import React from 'react';

interface StatusBarProps {
  message?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ message = 'Ready' }) => {
  return (
    <div className="h-6 bg-background border-t flex items-center justify-end px-2">
      <span className="text-xs text-muted-foreground">{message}</span>
    </div>
  );
};
