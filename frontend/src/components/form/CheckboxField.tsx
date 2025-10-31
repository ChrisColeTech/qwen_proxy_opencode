import React from 'react';

export interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  disabled?: boolean;
  readonly?: boolean;
  description?: string;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
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
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled || readonly}
          className={`
            mt-0.5 h-4 w-4 rounded border
            text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
            ${hasError
              ? 'border-red-500'
              : 'border-input'
            }
          `}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground cursor-pointer">
            {label}
          </label>
          {description && (
            <span className="text-xs text-muted-foreground">
              {description}
            </span>
          )}
        </div>
      </div>
      {hasError && (
        <span className="text-sm text-red-500 ml-7">{error}</span>
      )}
    </div>
  );
};
