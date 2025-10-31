import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { DataTable } from '@/components/table/DataTable';
import { useSessions } from '@/hooks/useSessions';
import { formatRelativeTime } from '@/utils/date.utils';
import { ErrorService } from '@/services/error.service';
import type { Session } from '@/types/session.types';
import type { TableColumn, TableAction } from '@/types/common.types';

/**
 * SessionsListPage - Main list page for sessions (READ-ONLY)
 *
 * Features:
 * - Icon-only buttons with tooltips (golden standard)
 * - No header at top (golden standard)
 * - NO FAB (read-only, no create action)
 * - DataTable with sorting and row actions
 * - NO bulk actions (read-only)
 * - NO delete actions (read-only)
 * - Loading, error, and empty states
 *
 * Actions:
 * - View: Navigate to session details page
 */
export default function SessionsListPage() {
  const navigate = useNavigate();

  // Data fetching
  const { data, isLoading, error } = useSessions();
  const sessions = data?.sessions || [];

  // Handle view action
  const handleView = (session: Session) => {
    navigate(`/sessions/${session.id}`);
  };

  // Table columns configuration
  const columns = useMemo<TableColumn<Session>[]>(
    () => [
      {
        key: 'id',
        label: 'Session ID',
        sortable: true,
        render: (value: string) => (
          <span className="font-mono text-xs text-muted-foreground">{value}</span>
        ),
      },
      {
        key: 'chat_id',
        label: 'Chat ID',
        sortable: true,
        render: (value: string) => (
          <span className="font-mono text-xs text-muted-foreground">{value}</span>
        ),
      },
      {
        key: 'first_user_message',
        label: 'First Message',
        sortable: false,
        render: (value: string) => (
          <span className="text-sm truncate max-w-xs block" title={value}>
            {value || 'N/A'}
          </span>
        ),
      },
      {
        key: 'message_count',
        label: 'Messages',
        sortable: true,
        render: (value: number) => (
          <span className="text-sm font-medium">{value}</span>
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
      {
        key: 'last_accessed',
        label: 'Last Accessed',
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

  // Row actions configuration (View only - read-only)
  const actions = useMemo<TableAction<Session>[]>(
    () => [
      {
        icon: Eye,
        onClick: handleView,
        tooltip: 'View session',
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
            <p className="text-sm text-muted-foreground">Loading sessions...</p>
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
            <h3 className="text-lg font-semibold mb-2">Failed to load sessions</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {ErrorService.getUserMessage(error)}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Empty state
  if (sessions.length === 0) {
    return (
      <PageLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-center max-w-md">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Eye className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sessions will appear here as they are created
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Main content with data (NO FAB - read-only)
  return (
    <PageLayout>
      <div className="p-6">
        <DataTable
          data={sessions}
          columns={columns}
          keyField="id"
          selectable={false}
          actions={actions}
          emptyMessage="No sessions found"
        />
      </div>
    </PageLayout>
  );
}
