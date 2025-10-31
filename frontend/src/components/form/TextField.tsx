import React from 'react';

export interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'url';
  autoComplete?: string;
  maxLength?: number;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  value,
  onChange,
  error,
  disabled = false,
  readonly = false,
  placeholder,
  required = false,
  type = 'text',
  autoComplete,
  maxLength,
}) => {
  const hasError = !!error;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        readOnly={readonly}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        className={`
          px-3 py-2 rounded-md border
          bg-background text-foreground
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          readonly:bg-muted readonly:cursor-default
          transition-colors
          ${hasError
            ? 'border-red-500 focus:ring-red-500'
            : 'border-input hover:border-ring'
          }
        `}
      />
      {hasError && (
        <span className="text-sm text-red-500">{error}</span>
      )}
    </div>
  );
};
