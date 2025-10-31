import React from 'react';

export interface FormMode {
  mode: 'create' | 'edit' | 'read';
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableAction<T> {
  icon: React.ComponentType<{ className?: string }>;
  onClick: (row: T) => void;
  tooltip?: string;
  variant?: 'default' | 'danger' | 'success';
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}
