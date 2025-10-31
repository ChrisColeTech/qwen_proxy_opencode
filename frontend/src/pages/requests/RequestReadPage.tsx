import { ArrowLeft } from 'lucide-react';
import { FormLayout } from '@/components/layout/FormLayout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useRequest } from '@/hooks/useRequests';
import { formatDate, formatDuration } from '@/utils/date.utils';
import { ErrorService } from '@/services/error.service';

interface RequestReadPageProps {
  id?: number;
  onNavigateBack?: () => void;
}

/**
 * RequestReadPage - View request/response details in read-only mode
 *
 * Features:
 * - NO header at top (golden standard)
 * - Icon-only Back button with tooltip (golden standard)
 * - NO Edit button (read-only data)
 * - Displays request and response details
 * - JSON display for request/response bodies
 * - Loading and error states
 * - Uses FormLayout with bottom action buttons
 *
 * Actions:
 * - Back: Navigate back to requests list
 */
export function RequestReadPage({
  id,
  onNavigateBack,
}: RequestReadPageProps) {
  // Fetch request and response data
  const { data, isLoading, error } = useRequest(id || 0, !!id);

  // Handle back action
  const handleBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      console.log('Navigate back');
    }
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

  // Extract status code from response
  const getStatusCode = (): number | undefined => {
    if (!data) return undefined;
    // If there's an error, assume 500
    if (data.response?.error) return 500;
    // If there's a response, assume 200
    if (data.response) return 200;
    // No response yet
    return undefined;
  };

  // Format JSON for display
  const formatJSON = (jsonString?: string): string => {
    if (!jsonString) return '';
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
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
            <p className="text-sm text-muted-foreground">Loading request details...</p>
          </div>
        </div>
      </FormLayout>
    );
  }

  // Error state
  if (error || !data) {
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
            <h3 className="text-lg font-semibold mb-2">Failed to load request</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error ? ErrorService.getUserMessage(error) : 'Request not found'}
            </p>
          </div>
        </div>
      </FormLayout>
    );
  }

  const { request, response } = data;
  const statusCode = getStatusCode();

  // Main content with request data
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
        {/* Request Overview Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Request Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Method</label>
              <div>
                <StatusBadge variant={getMethodVariant(request.method)} size="md">
                  {request.method.toUpperCase()}
                </StatusBadge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Status Code</label>
              <div>
                {statusCode ? (
                  <StatusBadge variant={getStatusVariant(statusCode)} size="md">
                    {statusCode}
                  </StatusBadge>
                ) : (
                  <StatusBadge variant="neutral" size="md">
                    Pending
                  </StatusBadge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Endpoint</label>
              <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md break-all">
                {request.path}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Duration</label>
              <p className="text-sm px-3 py-2">
                {response?.duration_ms ? formatDuration(response.duration_ms) : '-'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Model</label>
              <p className="text-sm px-3 py-2">
                {request.model || '-'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Stream</label>
              <p className="text-sm px-3 py-2">
                {request.stream ? 'Yes' : 'No'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Session ID</label>
              <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md break-all">
                {request.session_id}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Request ID</label>
              <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md break-all">
                {request.request_id}
              </p>
            </div>
          </div>
        </div>

        {/* Request Details Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Request Details</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">OpenAI Request</label>
              <pre className="text-xs font-mono bg-muted px-4 py-3 rounded-md overflow-x-auto max-h-96 overflow-y-auto">
                {formatJSON(request.openai_request)}
              </pre>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Qwen Request</label>
              <pre className="text-xs font-mono bg-muted px-4 py-3 rounded-md overflow-x-auto max-h-96 overflow-y-auto">
                {formatJSON(request.qwen_request)}
              </pre>
            </div>
          </div>
        </div>

        {/* Response Details Section */}
        {response && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Response Details</h2>

            <div className="space-y-4">
              {/* Response Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Response ID</label>
                  <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md break-all">
                    {response.response_id}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Finish Reason</label>
                  <p className="text-sm px-3 py-2">
                    {response.finish_reason || '-'}
                  </p>
                </div>

                {response.completion_tokens !== undefined && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Completion Tokens</label>
                    <p className="text-sm px-3 py-2">
                      {response.completion_tokens}
                    </p>
                  </div>
                )}

                {response.prompt_tokens !== undefined && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Prompt Tokens</label>
                    <p className="text-sm px-3 py-2">
                      {response.prompt_tokens}
                    </p>
                  </div>
                )}

                {response.total_tokens !== undefined && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Total Tokens</label>
                    <p className="text-sm px-3 py-2">
                      {response.total_tokens}
                    </p>
                  </div>
                )}
              </div>

              {/* Response Bodies */}
              {response.qwen_response && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Qwen Response</label>
                  <pre className="text-xs font-mono bg-muted px-4 py-3 rounded-md overflow-x-auto max-h-96 overflow-y-auto">
                    {formatJSON(response.qwen_response)}
                  </pre>
                </div>
              )}

              {response.openai_response && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">OpenAI Response</label>
                  <pre className="text-xs font-mono bg-muted px-4 py-3 rounded-md overflow-x-auto max-h-96 overflow-y-auto">
                    {formatJSON(response.openai_response)}
                  </pre>
                </div>
              )}

              {/* Error */}
              {response.error && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-destructive">Error</label>
                  <pre className="text-xs font-mono bg-destructive/10 text-destructive px-4 py-3 rounded-md overflow-x-auto">
                    {response.error}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timestamps Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Timestamps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Request Created</label>
              <p className="text-sm px-3 py-2">
                {formatDate(request.created_at)}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Request Timestamp</label>
              <p className="text-sm px-3 py-2">
                {formatDate(request.timestamp)}
              </p>
            </div>

            {response && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Response Created</label>
                  <p className="text-sm px-3 py-2">
                    {formatDate(response.created_at)}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Response Timestamp</label>
                  <p className="text-sm px-3 py-2">
                    {formatDate(response.timestamp)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </FormLayout>
  );
}
export default RequestReadPage;
