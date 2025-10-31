import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { DataTable } from '@/components/table/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ConfirmDialog } from '@/components/dialog/ConfirmDialog';
import { useModels, useDeleteModel } from '@/hooks/useModels';
import { formatRelativeTime } from '@/utils/date.utils';
import { ErrorService } from '@/services/error.service';
import type { Model } from '@/types/model.types';
import type { TableColumn, TableAction } from '@/types/common.types';

/**
 * ModelsListPage - Main list page for models
 *
 * Features:
 * - Icon-only buttons with tooltips (golden standard)
 * - No header at top (golden standard)
 * - FAB for creating new model (golden standard)
 * - DataTable with sorting and row actions
 * - Bulk delete support
 * - Capabilities displayed as badges
 * - Confirm dialogs for destructive actions
 * - Loading, error, and empty states
 *
 * Actions:
 * - View: Navigate to model details page
 * - Edit: Navigate to model edit page
 * - Delete: Delete single model
 * - Bulk Delete: Delete multiple models
 */
export default function ModelsListPage() {
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Data fetching
  const { data, isLoading, error } = useModels();
  const models = data?.models || [];

  // Mutations
  const deleteModel = useDeleteModel();

  // Display status message temporarily
  const showStatus = (message: string) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Handle create action (FAB)
  const handleCreate = () => {
    navigate('/models/create');
  };

  // Handle view action
  const handleView = (model: Model) => {
    navigate(`/models/${model.id}`);
  };

  // Handle edit action
  const handleEdit = (model: Model) => {
    navigate(`/models/${model.id}/edit`);
  };

  // Handle delete action
  const handleDelete = (model: Model) => {
    setSelectedModel(model);
    setDeleteConfirmOpen(true);
  };

  // Confirm single delete
  const confirmDelete = async () => {
    if (!selectedModel) return;

    try {
      await deleteModel.mutateAsync(selectedModel.id);
      showStatus(`${selectedModel.name} has been deleted`);
      setDeleteConfirmOpen(false);
      setSelectedModel(null);
    } catch (error: any) {
      ErrorService.logError(error, 'DeleteModel');
      showStatus(`Failed to delete model: ${ErrorService.getUserMessage(error)}`);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = (ids: string[]) => {
    setSelectedIds(ids);
    setBulkDeleteConfirmOpen(true);
  };

  // Confirm bulk delete
  const confirmBulkDelete = async () => {
    try {
      // Delete all selected models
      await Promise.all(selectedIds.map(id => deleteModel.mutateAsync(id)));

      showStatus(`${selectedIds.length} model(s) have been deleted`);
      setBulkDeleteConfirmOpen(false);
      setSelectedIds([]);
    } catch (error: any) {
      ErrorService.logError(error, 'BulkDeleteModels');
      showStatus(`Failed to delete models: ${ErrorService.getUserMessage(error)}`);
    }
  };

  // Capabilities renderer
  const renderCapabilities = (capabilities: string[]) => {
    if (!capabilities || capabilities.length === 0) {
      return <span className="text-sm text-muted-foreground">None</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {capabilities.map((capability, index) => (
          <StatusBadge key={index} variant="info" size="sm">
            {capability}
          </StatusBadge>
        ))}
      </div>
    );
  };

  // Table columns configuration
  const columns = useMemo<TableColumn<Model>[]>(
    () => [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        render: (value: string) => (
          <span className="font-medium">{value}</span>
        ),
      },
      {
        key: 'id',
        label: 'Slug/Model ID',
        sortable: true,
        render: (value: string) => (
          <span className="font-mono text-xs text-muted-foreground">{value}</span>
        ),
      },
      {
        key: 'capabilities',
        label: 'Capabilities',
        sortable: false,
        render: (value: string[]) => renderCapabilities(value),
      },
      {
        key: 'created_at',
        label: 'Created',
        sortable: true,
        render: (value: number) => (
          <span className="text-sm text-muted-foreground">
            {formatRelativeTime(value)}
          </span>
        ),
      },
    ],
    []
  );

  // Row actions configuration
  const actions = useMemo<TableAction<Model>[]>(
    () => [
      {
        icon: Eye,
        onClick: handleView,
        tooltip: 'View model',
        variant: 'default',
      },
      {
        icon: Pencil,
        onClick: handleEdit,
        tooltip: 'Edit model',
        variant: 'default',
      },
      {
        icon: Trash2,
        onClick: handleDelete,
        tooltip: 'Delete model',
        variant: 'danger',
      },
    ],
    []
  );

  // Loading state
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading models...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <PageLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-center max-w-md">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Failed to load models</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {ErrorService.getUserMessage(error)}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Empty state
  if (models.length === 0) {
    return (
      <PageLayout
        fab={{
          icon: Plus,
          onClick: handleCreate,
          label: 'Create Model',
        }}
      >
        <div className="flex h-full items-center justify-center">
          <div className="text-center max-w-md">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No models found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by creating your first model
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Main content with data
  return (
    <>
      <PageLayout
        fab={{
          icon: Plus,
          onClick: handleCreate,
          label: 'Create Model',
        }}
      >
        <div className="p-6">
          {/* Status Message Bar */}
          {statusMessage && (
            <div className="mb-4 rounded-md bg-primary/10 px-4 py-3 text-sm text-primary">
              {statusMessage}
            </div>
          )}

          <DataTable
            data={models}
            columns={columns}
            keyField="id"
            selectable
            actions={actions}
            onBulkDelete={handleBulkDelete}
            emptyMessage="No models found"
          />
        </div>
      </PageLayout>

      {/* Single Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Model"
        description={
          selectedModel
            ? `Are you sure you want to delete "${selectedModel.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this model?'
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        variant="danger"
        loading={deleteModel.isPending}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        open={bulkDeleteConfirmOpen}
        onOpenChange={setBulkDeleteConfirmOpen}
        title="Delete Multiple Models"
        description={`Are you sure you want to delete ${selectedIds.length} model(s)? This action cannot be undone.`}
        confirmLabel="Delete All"
        cancelLabel="Cancel"
        onConfirm={confirmBulkDelete}
        variant="danger"
        loading={deleteModel.isPending}
      />
    </>
  );
}
