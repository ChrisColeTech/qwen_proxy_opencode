import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { DataTable } from '@/components/table/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useRequests } from '@/hooks/useRequests';
import { formatRelativeTime, formatDuration } from '@/utils/date.utils';
import { ErrorService } from '@/services/error.service';
import type { RequestWithResponse } from '@/types/request.types';
import type { TableColumn, TableAction } from '@/types/common.types';

/**
 * RequestsListPage - Main list page for request logs
 *
 * Features:
 * - Icon-only buttons with tooltips (golden standard)
 * - No header at top (golden standard)
 * - NO FAB (read-only, no create action)
 * - DataTable with sorting and row actions
 * - NO bulk actions (read-only)
 * - NO delete actions (read-only)
 * - Status badges for HTTP status codes
 * - Loading, error, and empty states
 *
 * Actions:
 * - View: Navigate to request details page (read-only)
 */
export default function RequestsListPage() {
  const navigate = useNavigate();

  // Data fetching
  const { data, isLoading, error } = useRequests();
  const requests = data?.requests || [];

  // Handle view action
  const handleView = (request: RequestWithResponse) => {
    navigate(`/requests/${request.request.id}`);
  };

  // Get HTTP method badge variant
  const getMethodVariant = (method: string): 'success' | 'info' | 'warning' | 'neutral' => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'info';
      case 'POST':
        return 'success';
      case 'PUT':
      case 'PATCH':
        return 'warning';
      case 'DELETE':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  // Get status code badge variant
  const getStatusVariant = (statusCode?: number): 'success' | 'warning' | 'error' | 'neutral' => {
    if (!statusCode) return 'neutral';
    if (statusCode >= 200 && statusCode < 300) return 'success';
    if (statusCode >= 400 && statusCode < 500) return 'warning';
    if (statusCode >= 500) return 'error';
    return 'neutral';
  };

  // Extract status code from response (you may need to adjust based on actual data structure)
  const getStatusCode = (request: RequestWithResponse): number | undefined => {
    // If there's an error, assume 500
    if (request.response?.error) return 500;
    // If there's a response, assume 200
    if (request.response) return 200;
    // No response yet
    return undefined;
  };

  // Truncate path for display
  const truncatePath = (path: string, maxLength: number = 50): string => {
    if (path.length <= maxLength) return path;
    return path.substring(0, maxLength - 3) + '...';
  };

  // Table columns configuration
  const columns = useMemo<TableColumn<RequestWithResponse>[]>(
    () => [
      {
        key: 'method',
        label: 'Method',
        sortable: true,
        render: (_: any, row: RequestWithResponse) => {
          const method = row.request.method || 'UNKNOWN';
          return (
            <StatusBadge variant={getMethodVariant(method)} size="sm">
              {method.toUpperCase()}
            </StatusBadge>
          );
        },
      },
      {
        key: 'path',
        label: 'Endpoint',
        sortable: true,
        render: (_: any, row: RequestWithResponse) => (
          <span className="font-mono text-xs text-muted-foreground">
            {truncatePath(row.request.path || '/')}
          </span>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        sortable: false,
        render: (_: any, row: RequestWithResponse) => {
          const statusCode = getStatusCode(row);
          if (!statusCode) {
            return (
              <StatusBadge variant="neutral" size="sm">
                Pending
              </StatusBadge>
            );
          }
          return (
            <StatusBadge variant={getStatusVariant(statusCode)} size="sm">
              {statusCode}
            </StatusBadge>
          );
        },
      },
      {
        key: 'duration',
        label: 'Duration',
        sortable: true,
        render: (_: any, row: RequestWithResponse) => {
          const duration = row.response?.duration_ms;
          if (!duration) {
            return <span className="text-sm text-muted-foreground">-</span>;
          }
          return (
            <span className="text-sm text-muted-foreground">
              {formatDuration(duration)}
            </span>
          );
        },
      },
      {
        key: 'model',
        label: 'Model',
        sortable: true,
        render: (_: any, row: RequestWithResponse) => {
          const model = row.request.model;
          if (!model) {
            return <span className="text-sm text-muted-foreground">-</span>;
          }
          return (
            <span className="text-sm font-medium">{model}</span>
          );
        },
      },
      {
        key: 'created_at',
        label: 'Created',
        sortable: true,
        render: (_: any, row: RequestWithResponse) => (
          <span className="text-sm text-muted-foreground">
            {formatRelativeTime(row.request.created_at)}
          </span>
        ),
      },
    ],
    []
  );

  // Row actions configuration (only View for read-only)
  const actions = useMemo<TableAction<RequestWithResponse>[]>(
    () => [
      {
        icon: Eye,
        onClick: handleView,
        tooltip: 'View request details',
        variant: 'default',
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
            <p className="text-sm text-muted-foreground">Loading request logs...</p>
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
              <Eye className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Failed to load request logs</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {ErrorService.getUserMessage(error)}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Empty state
  if (requests.length === 0) {
    return (
      <PageLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-center max-w-md">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Eye className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No request logs found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Request logs will appear here once API requests are made
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Main content with data
  return (
    <PageLayout>
      <div className="p-6">
        <DataTable
          data={requests}
          columns={columns}
          keyField="request"
          selectable={false}
          actions={actions}
          emptyMessage="No request logs found"
        />
      </div>
    </PageLayout>
  );
}
