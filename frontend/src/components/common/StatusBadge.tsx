import React from 'react';
import { cn } from '@/lib/utils';

export interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className,
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  const dotSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
  };

  const variantClasses = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };

  const dotColors = {
    success: 'bg-green-600 dark:bg-green-400',
    warning: 'bg-yellow-600 dark:bg-yellow-400',
    error: 'bg-red-600 dark:bg-red-400',
    info: 'bg-blue-600 dark:bg-blue-400',
    neutral: 'bg-gray-600 dark:bg-gray-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        'font-medium rounded-full',
        'transition-colors duration-150',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'rounded-full',
            dotSizes[size],
            dotColors[variant]
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};
