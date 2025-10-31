import { useParams } from 'react-router-dom';
import { Pencil, ArrowLeft } from 'lucide-react';
import { FormLayout } from '@/components/layout/FormLayout';
import { ModelForm } from '@/components/models/ModelForm';
import { useModel } from '@/hooks/useModels';
import { ErrorService } from '@/services/error.service';

interface ModelReadPageProps {
  onNavigateToEdit?: (id: string) => void;
  onNavigateBack?: () => void;
}

/**
 * ModelReadPage - View model details in read-only mode
 *
 * Features:
 * - NO header at top (golden standard)
 * - Icon-only Edit and Back buttons with tooltips (golden standard)
 * - Reuses ModelForm component in readonly mode
 * - Loading and error states
 * - Uses FormLayout with bottom action buttons
 *
 * Actions:
 * - Edit: Navigate to model edit page
 * - Back: Navigate back to models list
 */
export function ModelReadPage({
  onNavigateToEdit,
  onNavigateBack,
}: ModelReadPageProps) {
  const { id } = useParams<{ id: string }>();

  // Fetch model data
  const { data: model, isLoading, error } = useModel(id || '');

  // Handle edit action
  const handleEdit = () => {
    if (id && onNavigateToEdit) {
      onNavigateToEdit(id);
    } else {
      console.log('Edit model:', id);
    }
  };

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
            icon: Pencil,
            onClick: handleEdit,
            label: 'Edit',
            disabled: true,
          },
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
            <p className="text-sm text-muted-foreground">Loading model details...</p>
          </div>
        </div>
      </FormLayout>
    );
  }

  // Error state
  if (error || !model) {
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
            <h3 className="text-lg font-semibold mb-2">Failed to load model</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error ? ErrorService.getUserMessage(error) : 'Model not found'}
            </p>
          </div>
        </div>
      </FormLayout>
    );
  }

  // Main content with model data
  return (
    <FormLayout
      onCancel={handleBack}
      additionalActions={[
        {
          icon: Pencil,
          onClick: handleEdit,
          label: 'Edit',
        },
        {
          icon: ArrowLeft,
          onClick: handleBack,
          label: 'Back',
        },
      ]}
    >
      <div className="space-y-8">
        {/* Model Details Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Model Details</h2>
          <ModelForm
            initialData={model}
            readonly={true}
            standalone={true}
          />
        </div>
      </div>
    </FormLayout>
  );
}
export default ModelReadPage;
