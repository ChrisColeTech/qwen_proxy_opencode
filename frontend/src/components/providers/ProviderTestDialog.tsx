import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { FormDialog } from '@/components/dialog/FormDialog';
import { useTestProvider } from '@/hooks/useProviders';
import type { Provider } from '@/types/provider.types';
import { cn } from '@/lib/utils';

export interface ProviderTestDialogProps {
  provider: Provider;
  open: boolean;
  onClose: () => void;
}

/**
 * ProviderTestDialog Component
 *
 * Provides an interface for testing provider connectivity and functionality.
 * Features:
 * - Uses FormDialog wrapper for consistent UI
 * - Uses useTestProvider mutation for testing
 * - Displays test results with success/failure indicators
 * - Shows loading spinner during test
 * - Displays formatted response time and error messages
 */
export const ProviderTestDialog: React.FC<ProviderTestDialogProps> = ({
  provider,
  open,
  onClose,
}) => {
  const testProvider = useTestProvider();
  const [autoTest, setAutoTest] = useState(true);

  // Automatically run test when dialog opens
  useEffect(() => {
    if (open && autoTest) {
      testProvider.mutate(provider.id);
      setAutoTest(false);
    }
  }, [open, autoTest, provider.id]);

  // Reset auto-test flag when dialog closes
  useEffect(() => {
    if (!open) {
      setAutoTest(true);
      testProvider.reset();
    }
  }, [open]);

  const handleRetry = () => {
    testProvider.mutate(provider.id);
  };

  const renderContent = () => {
    // Loading state
    if (testProvider.isPending) {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
          <p className="text-lg font-medium text-foreground">Testing provider...</p>
          <p className="text-sm text-muted-foreground">
            Checking connectivity and configuration
          </p>
        </div>
      );
    }

    // Error state (network error, not provider test failure)
    if (testProvider.isError && !testProvider.data) {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900">
            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 dark:text-red-400">
                Test Failed
              </h4>
              <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                {testProvider.error?.message || 'Unable to connect to provider'}
              </p>
            </div>
          </div>
          <button
            onClick={handleRetry}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
          >
            Retry Test
          </button>
        </div>
      );
    }

    // Success state
    if (testProvider.isSuccess && testProvider.data) {
      const result = testProvider.data;
      const isSuccess = result.success;

      return (
        <div className="flex flex-col gap-4">
          {/* Result header */}
          <div
            className={cn(
              'flex items-center gap-3 p-4 rounded-lg border',
              isSuccess
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900'
            )}
          >
            {isSuccess ? (
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h4
                className={cn(
                  'font-semibold',
                  isSuccess
                    ? 'text-green-900 dark:text-green-400'
                    : 'text-red-900 dark:text-red-400'
                )}
              >
                {isSuccess ? 'Test Successful' : 'Test Failed'}
              </h4>
              <p
                className={cn(
                  'text-sm mt-1',
                  isSuccess
                    ? 'text-green-800 dark:text-green-300'
                    : 'text-red-800 dark:text-red-300'
                )}
              >
                {result.message}
              </p>
            </div>
          </div>

          {/* Latency information */}
          {result.latency_ms !== undefined && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 dark:text-blue-400">
                  Response Time
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                  {result.latency_ms.toFixed(2)} ms
                </p>
              </div>
            </div>
          )}

          {/* Error details */}
          {!isSuccess && result.error && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <h4 className="font-semibold text-foreground">Error Details</h4>
              </div>
              <div className="p-4 rounded-lg bg-muted border border-border">
                <pre className="text-sm text-foreground whitespace-pre-wrap break-words font-mono">
                  {result.error}
                </pre>
              </div>
            </div>
          )}

          {/* Provider information */}
          <div className="p-4 rounded-lg bg-muted border border-border">
            <h4 className="font-semibold text-foreground mb-3">Provider Information</h4>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium text-foreground">{provider.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium text-foreground">{provider.type}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="font-medium text-foreground">
                  {provider.enabled ? 'Enabled' : 'Disabled'}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Priority</dt>
                <dd className="font-medium text-foreground">{provider.priority}</dd>
              </div>
            </dl>
          </div>

          {/* Retry button */}
          <button
            onClick={handleRetry}
            className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 font-medium"
          >
            Run Test Again
          </button>
        </div>
      );
    }

    // Initial state (shouldn't happen due to auto-test)
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-lg font-medium text-foreground">Ready to test provider</p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
        >
          Start Test
        </button>
      </div>
    );
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onClose}
      title={`Test Provider: ${provider.name}`}
      description="Testing provider connectivity and configuration"
    >
      {renderContent()}
    </FormDialog>
  );
};
