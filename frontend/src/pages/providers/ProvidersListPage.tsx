import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Play, Power, Trash2 } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { DataTable } from '@/components/table/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ConfirmDialog } from '@/components/dialog/ConfirmDialog';
import {
  useProviders,
  useDeleteProvider,
  useEnableProvider,
  useDisableProvider,
  useTestProvider,
} from '@/hooks/useProviders';
import { formatRelativeTime } from '@/utils/date.utils';
import { ErrorService } from '@/services/error.service';
import type { Provider } from '@/types/provider.types';
import type { TableColumn, TableAction } from '@/types/common.types';

/**
 * ProvidersListPage - Main list page for providers
 *
 * Features:
 * - Icon-only buttons with tooltips (golden standard)
 * - No header at top (golden standard)
 * - FAB for creating new provider (golden standard)
 * - DataTable with sorting and row actions
 * - Bulk delete support
 * - Status badges for enabled/disabled states
 * - Confirm dialogs for destructive actions
 * - Loading, error, and empty states
 *
 * Actions:
 * - View: Navigate to provider details page
 * - Edit: Navigate to provider edit page
 * - Test: Test provider connection
 * - Enable/Disable: Toggle provider status
 * - Delete: Delete single provider
 * - Bulk Delete: Delete multiple providers
 */
export default function ProvidersListPage() {
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Data fetching
  const { data, isLoading, error } = useProviders();
  const providers = data?.providers || [];

  // Mutations
  const deleteProvider = useDeleteProvider();
  const enableProvider = useEnableProvider();
  const disableProvider = useDisableProvider();
  const testProvider = useTestProvider();

  // Display status message temporarily
  const showStatus = (message: string) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Handle create action (FAB)
  const handleCreate = () => {
    navigate('/providers/create');
  };

  // Handle view action
  const handleView = (provider: Provider) => {
    navigate(`/providers/${provider.id}`);
  };

  // Handle edit action
  const handleEdit = (provider: Provider) => {
    navigate(`/providers/${provider.id}/edit`);
  };

  // Handle test action
  const handleTest = async (provider: Provider) => {
    try {
      const result = await testProvider.mutateAsync(provider.id);
      if (result.success) {
        showStatus(`Test successful: ${result.message}`);
      } else {
        showStatus(`Test failed: ${result.message}`);
      }
    } catch (error: any) {
      ErrorService.logError(error, 'TestProvider');
      showStatus(`Test failed: ${ErrorService.getUserMessage(error)}`);
    }
  };

  // Handle enable/disable action
  const handleToggleEnabled = async (provider: Provider) => {
    try {
      if (provider.enabled) {
        await disableProvider.mutateAsync(provider.id);
        showStatus(`${provider.name} has been disabled`);
      } else {
        await enableProvider.mutateAsync(provider.id);
        showStatus(`${provider.name} has been enabled`);
      }
    } catch (error: any) {
      ErrorService.logError(error, 'ToggleProvider');
      showStatus(`Failed to update provider: ${ErrorService.getUserMessage(error)}`);
    }
  };

  // Handle delete action
  const handleDelete = (provider: Provider) => {
    setSelectedProvider(provider);
    setDeleteConfirmOpen(true);
  };

  // Confirm single delete
  const confirmDelete = async () => {
    if (!selectedProvider) return;

    try {
      await deleteProvider.mutateAsync(selectedProvider.id);
      showStatus(`${selectedProvider.name} has been deleted`);
      setDeleteConfirmOpen(false);
      setSelectedProvider(null);
    } catch (error: any) {
      ErrorService.logError(error, 'DeleteProvider');
      showStatus(`Failed to delete provider: ${ErrorService.getUserMessage(error)}`);
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
      // Delete all selected providers
      await Promise.all(selectedIds.map(id => deleteProvider.mutateAsync(id)));

      showStatus(`${selectedIds.length} provider(s) have been deleted`);
      setBulkDeleteConfirmOpen(false);
      setSelectedIds([]);
    } catch (error: any) {
      ErrorService.logError(error, 'BulkDeleteProviders');
      showStatus(`Failed to delete providers: ${ErrorService.getUserMessage(error)}`);
    }
  };

  // Provider type badge renderer
  const renderTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      'lm-studio': 'LM Studio',
      'qwen-proxy': 'Qwen Proxy',
      'qwen-direct': 'Qwen Direct',
    };

    return (
      <div className="flex items-center gap-2">
        <StatusBadge variant="info" size="sm">
          {typeLabels[type] || type}
        </StatusBadge>
      </div>
    );
  };

  // Table columns configuration
  const columns = useMemo<TableColumn<Provider>[]>(
    () => [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        render: (value: string, row: Provider) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium">{value}</span>
            {renderTypeBadge(row.type)}
          </div>
        ),
      },
      {
        key: 'id',
        label: 'Slug',
        sortable: true,
        render: (value: string) => (
          <span className="font-mono text-xs text-muted-foreground">{value}</span>
        ),
      },
      {
        key: 'enabled',
        label: 'Status',
        sortable: true,
        render: (value: boolean) => (
          <StatusBadge
            variant={value ? 'success' : 'neutral'}
            size="sm"
            dot
          >
            {value ? 'Enabled' : 'Disabled'}
          </StatusBadge>
        ),
      },
      {
        key: 'priority',
        label: 'Priority',
        sortable: true,
        render: (value: number) => (
          <span className="text-sm">{value}</span>
        ),
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
  const actions = useMemo<TableAction<Provider>[]>(
    () => [
      {
        icon: Eye,
        onClick: handleView,
        tooltip: 'View provider',
        variant: 'default',
      },
      {
        icon: Pencil,
        onClick: handleEdit,
        tooltip: 'Edit provider',
        variant: 'default',
      },
      {
        icon: Play,
        onClick: handleTest,
        tooltip: 'Test provider',
        variant: 'success',
      },
      {
        icon: Power,
        onClick: handleToggleEnabled,
        tooltip: 'Toggle enabled/disabled',
        variant: 'default',
      },
      {
        icon: Trash2,
        onClick: handleDelete,
        tooltip: 'Delete provider',
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
            <p className="text-sm text-muted-foreground">Loading providers...</p>
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
            <h3 className="text-lg font-semibold mb-2">Failed to load providers</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {ErrorService.getUserMessage(error)}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Empty state
  if (providers.length === 0) {
    return (
      <PageLayout
        fab={{
          icon: Plus,
          onClick: handleCreate,
          label: 'Create Provider',
        }}
      >
        <div className="flex h-full items-center justify-center">
          <div className="text-center max-w-md">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No providers found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by creating your first provider
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
          label: 'Create Provider',
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
            data={providers}
            columns={columns}
            keyField="id"
            selectable
            actions={actions}
            onBulkDelete={handleBulkDelete}
            emptyMessage="No providers found"
          />
        </div>
      </PageLayout>

      {/* Single Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Provider"
        description={
          selectedProvider
            ? `Are you sure you want to delete "${selectedProvider.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this provider?'
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        variant="danger"
        loading={deleteProvider.isPending}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        open={bulkDeleteConfirmOpen}
        onOpenChange={setBulkDeleteConfirmOpen}
        title="Delete Multiple Providers"
        description={`Are you sure you want to delete ${selectedIds.length} provider(s)? This action cannot be undone.`}
        confirmLabel="Delete All"
        cancelLabel="Cancel"
        onConfirm={confirmBulkDelete}
        variant="danger"
        loading={deleteProvider.isPending}
      />
    </>
  );
}
