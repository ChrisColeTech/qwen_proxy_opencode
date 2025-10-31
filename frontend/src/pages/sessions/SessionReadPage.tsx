import { ArrowLeft } from 'lucide-react';
import { FormLayout } from '@/components/layout/FormLayout';
import { useSession } from '@/hooks/useSessions';
import { ErrorService } from '@/services/error.service';
import { formatDate, formatRelativeTime, getTimeUntilExpiration } from '@/utils/date.utils';

interface SessionReadPageProps {
  id?: string;
  onNavigateBack?: () => void;
}

/**
 * SessionReadPage - View session details in read-only mode
 *
 * Features:
 * - NO header at top (golden standard)
 * - Icon-only Back button with tooltip (golden standard)
 * - NO Edit button (read-only)
 * - Loading and error states
 * - Uses FormLayout with bottom action buttons
 * - Displays session details and metadata
 *
 * Actions:
 * - Back: Navigate back to sessions list
 */
export function SessionReadPage({
  id,
  onNavigateBack,
}: SessionReadPageProps) {
  // Fetch session data
  const { data: session, isLoading, error } = useSession(id || '');

  // Handle back action
  const handleBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      console.log('Navigate back');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <FormLayout
        onCancel={handleBack}
        additionalActions={[
          {
            icon: ArrowLeft,
            onClick: handleBack,
            label: 'Back',
          },
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading session details...</p>
          </div>
        </div>
      </FormLayout>
    );
  }

  // Error state
  if (error || !session) {
    return (
      <FormLayout
        onCancel={handleBack}
        additionalActions={[
          {
            icon: ArrowLeft,
            onClick: handleBack,
            label: 'Back',
          },
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <ArrowLeft className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Failed to load session</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error ? ErrorService.getUserMessage(error) : 'Session not found'}
            </p>
          </div>
        </div>
      </FormLayout>
    );
  }

  // Main content with session data
  return (
    <FormLayout
      onCancel={handleBack}
      additionalActions={[
        {
          icon: ArrowLeft,
          onClick: handleBack,
          label: 'Back',
        },
      ]}
    >
      <div className="space-y-8">
        {/* Session Details Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Session Details</h2>
          <div className="space-y-4">
            {/* Session ID */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Session ID
              </label>
              <div className="sm:col-span-2">
                <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md">
                  {session.id}
                </p>
              </div>
            </div>

            {/* Chat ID */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Chat ID
              </label>
              <div className="sm:col-span-2">
                <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md">
                  {session.chat_id}
                </p>
              </div>
            </div>

            {/* Parent ID */}
            {session.parent_id && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Parent ID
                </label>
                <div className="sm:col-span-2">
                  <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md">
                    {session.parent_id}
                  </p>
                </div>
              </div>
            )}

            {/* First User Message */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                First User Message
              </label>
              <div className="sm:col-span-2">
                <p className="text-sm bg-muted px-3 py-2 rounded-md break-words">
                  {session.first_user_message || 'N/A'}
                </p>
              </div>
            </div>

            {/* Message Count */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Message Count
              </label>
              <div className="sm:col-span-2">
                <p className="text-sm font-medium bg-muted px-3 py-2 rounded-md">
                  {session.message_count}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timestamps Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Timestamps</h2>
          <div className="space-y-4">
            {/* Created At */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Created
              </label>
              <div className="sm:col-span-2">
                <p className="text-sm bg-muted px-3 py-2 rounded-md">
                  {formatDate(session.created_at)}
                  <span className="text-xs text-muted-foreground ml-2">
                    ({formatRelativeTime(session.created_at)})
                  </span>
                </p>
              </div>
            </div>

            {/* Last Accessed */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Last Accessed
              </label>
              <div className="sm:col-span-2">
                <p className="text-sm bg-muted px-3 py-2 rounded-md">
                  {formatDate(session.last_accessed)}
                  <span className="text-xs text-muted-foreground ml-2">
                    ({formatRelativeTime(session.last_accessed)})
                  </span>
                </p>
              </div>
            </div>

            {/* Expires At */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Expires
              </label>
              <div className="sm:col-span-2">
                <p className="text-sm bg-muted px-3 py-2 rounded-md">
                  {formatDate(session.expires_at)}
                  <span className="text-xs text-muted-foreground ml-2">
                    ({getTimeUntilExpiration(session.expires_at)})
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Notice */}
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> To view the full conversation history and messages
            for this session, please check the Requests page where you can see all
            API requests and responses associated with this session ID.
          </p>
        </div>
      </div>
    </FormLayout>
  );
}
export default SessionReadPage;
