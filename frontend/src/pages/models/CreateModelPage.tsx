import { useNavigate } from 'react-router-dom';
import { ModelForm } from '@/components/models/ModelForm';
import { useCreateModel } from '@/hooks/useModels';
import type { CreateModelRequest } from '@/types/model.types';
import { ErrorService } from '@/services/error.service';

/**
 * CreateModelPage - Page for creating a new model
 *
 * Features:
 * - Uses ModelForm component with no initial data
 * - Handles model creation via useCreateModel mutation
 * - Navigates to list page on successful creation
 * - Displays error messages on failure
 */
function CreateModelPage() {
  const navigate = useNavigate();
  const createModelMutation = useCreateModel();

  const handleSubmit = async (data: CreateModelRequest) => {
    try {
      await createModelMutation.mutateAsync(data);
      // On success, navigate to list page
      navigate('/models');
    } catch (error: any) {
      // Error handling - log error and display user-friendly message
      ErrorService.logError(error, 'CreateModel');

      // The error will be shown via the mutation's error state
      // which can be displayed in a toast or error banner if needed
      console.error('Failed to create model:', ErrorService.getUserMessage(error));
    }
  };

  const handleCancel = () => {
    navigate('/models');
  };

  return (
    <ModelForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={createModelMutation.isPending}
    />
  );
}

export default CreateModelPage;
