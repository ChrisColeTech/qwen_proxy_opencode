import React from 'react';
import { Plus, X } from 'lucide-react';

export interface KeyValuePair {
  key: string;
  value: string;
  isSensitive?: boolean;
}

export interface KeyValueEditorProps {
  label: string;
  value: Record<string, { value: string; is_sensitive?: boolean }>;
  onChange: (value: Record<string, { value: string; is_sensitive?: boolean }>) => void;
  error?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  allowSensitive?: boolean;
}

export const KeyValueEditor: React.FC<KeyValueEditorProps> = ({
  label,
  value,
  onChange,
  error,
  disabled = false,
  readonly = false,
  required = false,
  allowSensitive = true,
}) => {
  const hasError = !!error;

  // Convert object to array for display
  const pairs = Object.entries(value).map(([key, val]) => ({
    key,
    value: val.value,
    isSensitive: val.is_sensitive || false,
  }));

  const handleAdd = () => {
    const newPairs = [...pairs, { key: '', value: '', isSensitive: false }];
    updateValue(newPairs);
  };

  const handleRemove = (index: number) => {
    const newPairs = pairs.filter((_, i) => i !== index);
    updateValue(newPairs);
  };

  const handleKeyChange = (index: number, newKey: string) => {
    const newPairs = [...pairs];
    newPairs[index].key = newKey;
    updateValue(newPairs);
  };

  const handleValueChange = (index: number, newValue: string) => {
    const newPairs = [...pairs];
    newPairs[index].value = newValue;
    updateValue(newPairs);
  };

  const handleSensitiveChange = (index: number, isSensitive: boolean) => {
    const newPairs = [...pairs];
    newPairs[index].isSensitive = isSensitive;
    updateValue(newPairs);
  };

  const updateValue = (newPairs: KeyValuePair[]) => {
    const newValue: Record<string, { value: string; is_sensitive?: boolean }> = {};
    newPairs.forEach((pair) => {
      if (pair.key.trim()) {
        newValue[pair.key] = {
          value: pair.value,
          is_sensitive: pair.isSensitive || undefined,
        };
      }
    });
    onChange(newValue);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="flex flex-col gap-2">
        {pairs.map((pair, index) => (
          <div key={index} className="flex gap-2 items-start">
            <input
              type="text"
              value={pair.key}
              onChange={(e) => handleKeyChange(index, e.target.value)}
              placeholder="Key"
              disabled={disabled || readonly}
              className={`
                flex-1 px-3 py-2 rounded-md border
                bg-background text-foreground
                focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
                ${hasError
                  ? 'border-red-500'
                  : 'border-input hover:border-ring'
                }
              `}
            />
            <input
              type={pair.isSensitive ? 'password' : 'text'}
              value={pair.value}
              onChange={(e) => handleValueChange(index, e.target.value)}
              placeholder="Value"
              disabled={disabled || readonly}
              className={`
                flex-1 px-3 py-2 rounded-md border
                bg-background text-foreground
                focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
                ${hasError
                  ? 'border-red-500'
                  : 'border-input hover:border-ring'
                }
              `}
            />
            {allowSensitive && (
              <label className="flex items-center gap-2 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={pair.isSensitive}
                  onChange={(e) => handleSensitiveChange(index, e.target.checked)}
                  disabled={disabled || readonly}
                  className="h-4 w-4 rounded border-input"
                />
                <span className="text-muted-foreground">Secret</span>
              </label>
            )}
            {!readonly && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            )}
          </div>
        ))}
      </div>

      {!readonly && (
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 rounded-md border border-input hover:bg-accent text-sm font-medium disabled:opacity-50"
        >
          <Plus size={16} />
          Add Entry
        </button>
      )}

      {hasError && (
        <span className="text-sm text-red-500">{error}</span>
      )}
    </div>
  );
};
