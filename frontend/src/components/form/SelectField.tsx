import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string;
  required?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  error,
  disabled = false,
  readonly = false,
  placeholder = 'Select an option...',
  required = false,
}) => {
  const hasError = !!error;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || readonly}
        className={`
          px-3 py-2 rounded-md border
          bg-background text-foreground
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          ${hasError
            ? 'border-red-500 focus:ring-red-500'
            : 'border-input hover:border-ring'
          }
        `}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {hasError && (
        <span className="text-sm text-red-500">{error}</span>
      )}
    </div>
  );
};
