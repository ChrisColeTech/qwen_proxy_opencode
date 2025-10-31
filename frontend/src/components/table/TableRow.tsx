import type { TableColumn, TableAction } from '@/types/common.types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TableRowProps<T> {
  row: T;
  columns: TableColumn<T>[];
  selected?: boolean;
  onSelect?: (checked: boolean) => void;
  onClick?: () => void;
  actions?: TableAction<T>[];
}

export function TableRow<T extends Record<string, any>>({
  row,
  columns,
  selected = false,
  onSelect,
  onClick,
  actions = [],
}: TableRowProps<T>) {
  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    // Don't trigger row click if clicking on action buttons or checkbox
    if (
      e.target instanceof HTMLElement &&
      (e.target.closest('button') || e.target.closest('input[type="checkbox"]'))
    ) {
      return;
    }
    onClick?.();
  };

  return (
    <tr
      className={cn(
        'transition-colors',
        onClick && 'cursor-pointer hover:bg-muted/50',
        selected && 'bg-muted/50'
      )}
      onClick={handleRowClick}
    >
      {onSelect !== undefined && (
        <td className="w-12 px-4 py-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
          />
        </td>
      )}
      {columns.map((column) => {
        const value = row[column.key as keyof T];
        const content = column.render ? column.render(value, row) : value;

        return (
          <td
            key={String(column.key)}
            className="px-4 py-3 text-sm text-foreground"
          >
            {content}
          </td>
        );
      })}
      {actions.length > 0 && (
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1">
            {actions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={index}
                  variant={
                    action.variant === 'danger'
                      ? 'destructive'
                      : action.variant === 'success'
                      ? 'default'
                      : 'ghost'
                  }
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(row);
                  }}
                  className="h-8 w-8"
                  title={action.tooltip || 'Action'}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="sr-only">{action.tooltip || 'Action'}</span>
                </Button>
              );
            })}
          </div>
        </td>
      )}
    </tr>
  );
}
