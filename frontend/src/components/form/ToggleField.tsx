import React from 'react';

export interface ToggleFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  disabled?: boolean;
  readonly?: boolean;
  description?: string;
}

export const ToggleField: React.FC<ToggleFieldProps> = ({
  label,
  checked,
  onChange,
  error,
  disabled = false,
  readonly = false,
  description,
}) => {
  const hasError = !!error;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
          {description && (
            <span className="text-xs text-muted-foreground">
              {description}
            </span>
          )}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => !disabled && !readonly && onChange(!checked)}
          disabled={disabled || readonly}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full
            transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${checked
              ? hasError ? 'bg-red-500' : 'bg-green-500'
              : 'bg-gray-300 dark:bg-gray-700'
            }
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${checked ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
      {hasError && (
        <span className="text-sm text-red-500">{error}</span>
      )}
    </div>
  );
};
