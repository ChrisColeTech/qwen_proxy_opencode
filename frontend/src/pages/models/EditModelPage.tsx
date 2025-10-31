import { useNavigate, useParams } from 'react-router-dom';
import { ModelForm } from '@/components/models/ModelForm';
import { useModel, useUpdateModel } from '@/hooks/useModels';
import type { CreateModelRequest } from '@/types/model.types';
import { ErrorService } from '@/services/error.service';

/**
 * EditModelPage - Page for editing an existing model
 *
 * Features:
 * - Loads existing model data using useModel hook
 * - Uses ModelForm component with initialData
 * - Handles model update via useUpdateModel mutation
 * - Navigates back to list page on successful update
 * - Displays error messages on failure
 * - Shows loading state while fetching model data
 */
function EditModelPage() {
  const navigate = useNavigate();
  const { id: modelId } = useParams<{ id: string }>();
  const { data: model, isLoading: isLoadingModel, error: loadError } = useModel(modelId || '');
  const updateModelMutation = useUpdateModel();

  const handleSubmit = async (data: CreateModelRequest) => {
    if (!model) return;

    try {
      // Only send the fields that can be updated
      await updateModelMutation.mutateAsync({
        id: model.id,
        data: {
          name: data.name,
          description: data.description,
          capabilities: data.capabilities,
        },
      });

      // On success, navigate back to list page
      navigate('/models');
    } catch (error: any) {
      // Error handling - log error and display user-friendly message
      ErrorService.logError(error, 'UpdateModel');

      // The error will be shown via the mutation's error state
      // which can be displayed in a toast or error banner if needed
      console.error('Failed to update model:', ErrorService.getUserMessage(error));
    }
  };

  const handleCancel = () => {
    navigate('/models');
  };

  // Handle loading state
  if (isLoadingModel) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-lg font-medium text-foreground">Loading model...</div>
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
          <div className="text-lg font-medium text-destructive mb-2">Error Loading Model</div>
          <div className="text-sm text-muted-foreground mb-4">
            {ErrorService.getUserMessage(loadError)}
          </div>
          <button
            onClick={() => navigate('/models')}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Back to Models
          </button>
        </div>
      </div>
    );
  }

  // Handle not found
  if (!model) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <div className="text-lg font-medium text-destructive mb-2">Model Not Found</div>
          <div className="text-sm text-muted-foreground mb-4">
            The requested model could not be found.
          </div>
          <button
            onClick={() => navigate('/models')}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Back to Models
          </button>
        </div>
      </div>
    );
  }

  return (
    <ModelForm
      initialData={model}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={updateModelMutation.isPending}
    />
  );
}

export default EditModelPage;
