import { useParams, useNavigate } from 'react-router-dom';
import { ProviderForm } from '@/components/providers/ProviderForm';
import { useProvider, useUpdateProvider } from '@/hooks/useProviders';
import type { CreateProviderRequest } from '@/types/provider.types';
import { ErrorService } from '@/services/error.service';

/**
 * EditProviderPage - Page for editing an existing provider
 *
 * Features:
 * - Loads existing provider data using useProvider hook
 * - Uses ProviderForm component with initialData
 * - Handles provider update via useUpdateProvider mutation
 * - Navigates back to list page on successful update
 * - Displays error messages on failure
 * - Shows loading state while fetching provider data
 */
export default function EditProviderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: provider, isLoading: isLoadingProvider, error: loadError } = useProvider(id || '');
  const updateProviderMutation = useUpdateProvider();

  const handleSubmit = async (data: CreateProviderRequest) => {
    if (!provider) return;

    try {
      // Only send the fields that can be updated
      await updateProviderMutation.mutateAsync({
        id: provider.id,
        data: {
          name: data.name,
          enabled: data.enabled,
          description: data.description,
          priority: data.priority,
        },
      });

      // On success, navigate back to list page
      navigate('/providers');
    } catch (error: any) {
      // Error handling - log error and display user-friendly message
      ErrorService.logError(error, 'UpdateProvider');

      // The error will be shown via the mutation's error state
      // which can be displayed in a toast or error banner if needed
      console.error('Failed to update provider:', ErrorService.getUserMessage(error));
    }
  };

  const handleCancel = () => {
    navigate('/providers');
  };

  // Handle loading state
  if (isLoadingProvider) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-lg font-medium text-foreground">Loading provider...</div>
          <div className="text-sm text-muted-foreground mt-2">Please wait</div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (loadError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <div className="text-lg font-medium text-destructive mb-2">Error Loading Provider</div>
          <div className="text-sm text-muted-foreground mb-4">
            {ErrorService.getUserMessage(loadError)}
          </div>
          <button
            onClick={() => navigate('/providers')}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Back to Providers
          </button>
        </div>
      </div>
    );
  }

  // Handle not found
  if (!provider) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <div className="text-lg font-medium text-destructive mb-2">Provider Not Found</div>
          <div className="text-sm text-muted-foreground mb-4">
            The requested provider could not be found.
          </div>
          <button
            onClick={() => navigate('/providers')}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Back to Providers
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProviderForm
      initialData={provider}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={updateProviderMutation.isPending}
    />
  );
}
