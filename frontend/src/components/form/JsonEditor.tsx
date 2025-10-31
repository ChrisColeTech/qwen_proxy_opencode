import React, { useState, useEffect } from 'react';

export interface JsonEditorProps {
  label: string;
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  error?: string;
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  label,
  value,
  onChange,
  error,
  disabled = false,
  readonly = false,
  placeholder = '{\n  "key": "value"\n}',
  required = false,
  rows = 8,
}) => {
  const [textValue, setTextValue] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Initialize text value from object
  useEffect(() => {
    try {
      setTextValue(JSON.stringify(value, null, 2));
    } catch (err) {
      setTextValue('{}');
    }
  }, []);

  const handleChange = (newText: string) => {
    setTextValue(newText);
    setJsonError(null);

    // Try to parse and update parent
    if (newText.trim() === '') {
      onChange({});
      return;
    }

    try {
      const parsed = JSON.parse(newText);
      onChange(parsed);
    } catch (err) {
      setJsonError('Invalid JSON format');
    }
  };

  const handleBlur = () => {
    // Try to auto-format on blur
    if (textValue.trim() && !jsonError) {
      try {
        const parsed = JSON.parse(textValue);
        const formatted = JSON.stringify(parsed, null, 2);
        setTextValue(formatted);
      } catch {
        // Keep as is if invalid
      }
    }
  };

  const hasError = !!error || !!jsonError;
  const displayError = error || jsonError;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        value={textValue}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        disabled={disabled}
        readOnly={readonly}
        placeholder={placeholder}
        rows={rows}
        className={`
          px-3 py-2 rounded-md border font-mono text-sm
          bg-background text-foreground
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          readonly:bg-muted readonly:cursor-default
          resize-vertical
          transition-colors
          ${hasError
            ? 'border-red-500 focus:ring-red-500'
            : 'border-input hover:border-ring'
          }
        `}
      />
      {hasError && (
        <span className="text-sm text-red-500">{displayError}</span>
      )}
      {!hasError && !readonly && (
        <span className="text-xs text-muted-foreground">
          Enter valid JSON. It will be auto-formatted when you click away.
        </span>
      )}
    </div>
  );
};
