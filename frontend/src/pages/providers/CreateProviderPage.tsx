import { useNavigate } from 'react-router-dom';
import { ProviderForm } from '@/components/providers/ProviderForm';
import { useCreateProvider } from '@/hooks/useProviders';
import type { CreateProviderRequest } from '@/types/provider.types';
import { ErrorService } from '@/services/error.service';

/**
 * CreateProviderPage - Page for creating a new provider
 *
 * Features:
 * - Uses ProviderForm component with no initial data
 * - Handles provider creation via useCreateProvider mutation
 * - Navigates to list page on successful creation
 * - Displays error messages on failure
 */
export default function CreateProviderPage() {
  const navigate = useNavigate();
  const createProviderMutation = useCreateProvider();

  const handleSubmit = async (data: CreateProviderRequest) => {
    try {
      await createProviderMutation.mutateAsync(data);
      // On success, navigate to list page
      navigate('/providers');
    } catch (error: any) {
      // Error handling - log error and display user-friendly message
      ErrorService.logError(error, 'CreateProvider');

      // The error will be shown via the mutation's error state
      // which can be displayed in a toast or error banner if needed
      console.error('Failed to create provider:', ErrorService.getUserMessage(error));
    }
  };

  const handleCancel = () => {
    navigate('/providers');
  };

  return (
    <ProviderForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={createProviderMutation.isPending}
    />
  );
}
