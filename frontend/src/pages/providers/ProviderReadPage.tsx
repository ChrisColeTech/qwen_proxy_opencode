import { useParams, useNavigate } from 'react-router-dom';
import { Pencil, ArrowLeft } from 'lucide-react';
import { FormLayout } from '@/components/layout/FormLayout';
import { ProviderForm } from '@/components/providers/ProviderForm';
import { KeyValueEditor } from '@/components/form/KeyValueEditor';
import { useProvider, useProviderConfig } from '@/hooks/useProviders';
import { ErrorService } from '@/services/error.service';

/**
 * ProviderReadPage - View provider details in read-only mode
 *
 * Features:
 * - NO header at top (golden standard)
 * - Icon-only Edit and Back buttons with tooltips (golden standard)
 * - Reuses ProviderForm component in readonly mode
 * - Displays provider configuration in readonly KeyValueEditor
 * - Loading and error states
 * - Uses FormLayout with bottom action buttons
 *
 * Actions:
 * - Edit: Navigate to provider edit page
 * - Back: Navigate back to providers list
 */
export default function ProviderReadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch provider and config data
  const { data: provider, isLoading: providerLoading, error: providerError } = useProvider(id || '');
  const { data: configData, isLoading: configLoading } = useProviderConfig(id || '');

  const isLoading = providerLoading || configLoading;

  // Handle edit action
  const handleEdit = () => {
    if (id) {
      navigate(`/providers/${id}/edit`);
    }
  };

  // Handle back action
  const handleBack = () => {
    navigate('/providers');
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
            <p className="text-sm text-muted-foreground">Loading provider details...</p>
          </div>
        </div>
      </FormLayout>
    );
  }

  // Error state
  if (providerError || !provider) {
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
            <h3 className="text-lg font-semibold mb-2">Failed to load provider</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {providerError ? ErrorService.getUserMessage(providerError) : 'Provider not found'}
            </p>
          </div>
        </div>
      </FormLayout>
    );
  }

  // Main content with provider data
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
        {/* Provider Details Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Provider Details</h2>
          <ProviderForm
            initialData={provider}
            readonly={true}
            standalone={true}
          />
        </div>

        {/* Provider Configuration Section */}
        {configData && configData.config && Object.keys(configData.config).length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Configuration</h2>
            <KeyValueEditor
              label="Config Parameters"
              value={configData.config}
              onChange={() => {}}
              readonly={true}
              allowSensitive={true}
            />
          </div>
        )}
      </div>
    </FormLayout>
  );
}
