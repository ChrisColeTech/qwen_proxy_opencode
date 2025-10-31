import React, { useRef, useState } from 'react';
import { Upload, X, File } from 'lucide-react';

export interface FileUploadProps {
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  accept?: string;
  maxSizeMB?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  value,
  onChange,
  error,
  disabled = false,
  readonly = false,
  required = false,
  accept,
  maxSizeMB = 10,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const hasError = !!error;

  const handleFile = (file: File | null) => {
    if (!file) {
      onChange(null);
      return;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      onChange(null);
      return;
    }

    onChange(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || readonly) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled && !readonly) {
      inputRef.current?.click();
    }
  };

  const handleClear = () => {
    if (!disabled && !readonly) {
      onChange(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        accept={accept}
        disabled={disabled || readonly}
        className="hidden"
      />

      {value ? (
        <div
          className={`
            flex items-center justify-between gap-3 px-4 py-3 rounded-md border
            ${hasError
              ? 'border-red-500'
              : 'border-input'
            }
          `}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <File className="flex-shrink-0 text-muted-foreground" size={20} />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{value.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatFileSize(value.size)}
              </span>
            </div>
          </div>
          {!readonly && (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="flex-shrink-0 p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 disabled:opacity-50"
            >
              <X size={20} />
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            flex flex-col items-center justify-center gap-2 px-6 py-8
            rounded-md border-2 border-dashed
            transition-colors cursor-pointer
            ${dragActive
              ? 'border-primary bg-accent'
              : hasError
                ? 'border-red-500'
                : 'border-input hover:border-ring hover:bg-accent'
            }
            ${disabled || readonly
              ? 'opacity-50 cursor-not-allowed'
              : ''
            }
          `}
        >
          <Upload
            className={dragActive ? 'text-primary' : 'text-muted-foreground'}
            size={32}
          />
          <div className="text-center">
            <p className="text-sm font-medium">
              {dragActive ? 'Drop file here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {accept ? `Accepts: ${accept}` : 'Any file type'}
              {' • '}
              Max size: {maxSizeMB}MB
            </p>
          </div>
        </div>
      )}

      {hasError && (
        <span className="text-sm text-red-500">{error}</span>
      )}
    </div>
  );
};
