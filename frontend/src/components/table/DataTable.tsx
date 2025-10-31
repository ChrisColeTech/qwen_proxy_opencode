import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { TableColumn } from '@/types/common.types';
import type { SortConfig } from '@/types/common.types';
import { cn } from '@/lib/utils';
import { TableRow } from './TableRow';
import { BulkActions } from './BulkActions';

export interface TableAction<T> {
  icon: React.ComponentType<{ className?: string }>;
  onClick: (row: T) => void;
  tooltip?: string;
  variant?: 'default' | 'danger' | 'success';
}

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyField: keyof T;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  actions?: TableAction<T>[];
  onBulkDelete?: (selectedIds: string[]) => void;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  onRowClick,
  selectable = false,
  actions = [],
  onBulkDelete,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean): void => {
    if (checked) {
      const allIds = data.map((row) => String(row[keyField]));
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  // Handle individual row selection
  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedIds);
    if (checked) {
      newSelectedIds.add(id);
    } else {
      newSelectedIds.delete(id);
    }
    setSelectedIds(newSelectedIds);
  };

  // Handle sorting
  const handleSort = (field: string) => {
    setSortConfig((current) => {
      if (!current || current.field !== field) {
        return { field, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { field, direction: 'desc' };
      }
      return null;
    });
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  const allSelected = data.length > 0 && selectedIds.size === data.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < data.length;

  return (
    <div className="w-full space-y-4">
      {/* Bulk Actions Bar */}
      {selectable && selectedIds.size > 0 && onBulkDelete && (
        <BulkActions
          selectedCount={selectedIds.size}
          onDelete={() => {
            onBulkDelete(Array.from(selectedIds));
            setSelectedIds(new Set());
          }}
        />
      )}

      {/* Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {selectable && (
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = someSelected;
                        }
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      'px-4 py-3 text-left text-sm font-medium text-muted-foreground',
                      column.width && `w-[${column.width}]`,
                      column.sortable && 'cursor-pointer select-none hover:text-foreground'
                    )}
                    onClick={() => column.sortable && handleSort(String(column.key))}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && (
                        <div className="flex flex-col">
                          {sortConfig?.field === column.key ? (
                            sortConfig.direction === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )
                          ) : (
                            <div className="h-4 w-4 text-muted-foreground/30">
                              <ChevronUp className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="w-24 px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                sortedData.map((row) => {
                  const rowId = String(row[keyField]);
                  return (
                    <TableRow
                      key={rowId}
                      row={row}
                      columns={columns}
                      selected={selectedIds.has(rowId)}
                      onSelect={
                        selectable
                          ? (checked) => handleSelectRow(rowId, checked)
                          : undefined
                      }
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      actions={actions}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
