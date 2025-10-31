import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BulkActionsProps {
  selectedCount: number;
  onDelete: () => void;
}

export function BulkActions({ selectedCount, onDelete }: BulkActionsProps) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-muted/50 px-4 py-3">
      <div className="text-sm font-medium">
        {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="destructive"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8"
          title="Delete selected items"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete selected items</span>
        </Button>
      </div>
    </div>
  );
}
