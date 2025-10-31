import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface IconButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  tooltip?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  onClick,
  tooltip,
  disabled = false,
  loading = false,
  variant = 'ghost',
  size = 'md',
  className,
  type = 'button',
}) => {
  const [showTooltip, setShowTooltip] = React.useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/80',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
  };

  return (
    <div className="relative inline-block">
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          'inline-flex items-center justify-center rounded-md',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        aria-label={tooltip}
      >
        {loading ? (
          <svg
            className="animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            width={iconSizes[size]}
            height={iconSizes[size]}
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <Icon size={iconSizes[size]} />
        )}
      </button>

      {tooltip && showTooltip && !disabled && !loading && (
        <div
          className={cn(
            'absolute z-50 px-3 py-1.5 text-sm',
            'bg-popover text-popover-foreground',
            'border border-border rounded-md shadow-md',
            'whitespace-nowrap pointer-events-none',
            'bottom-full left-1/2 -translate-x-1/2 mb-2',
            'animate-in fade-in-0 zoom-in-95'
          )}
        >
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-border" />
          </div>
        </div>
      )}
    </div>
  );
};
