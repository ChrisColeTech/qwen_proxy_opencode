import { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { KeyValueEditor } from '@/components/form/KeyValueEditor';
import { IconButton } from '@/components/common/IconButton';
import { useProviderConfig, useUpdateProviderConfig } from '@/hooks/useProviders';

export interface ProviderConfigEditorProps {
  providerId: string;
  readonly?: boolean;
}

/**
 * ProviderConfigEditor Component
 *
 * Provides an interface for viewing and editing provider configuration.
 * Features:
 * - Loads provider config using useProviderConfig hook
 * - Displays config using KeyValueEditor with sensitivity flags
 * - Allows saving/resetting changes when not readonly
 * - Handles loading and error states
 */
export const ProviderConfigEditor: React.FC<ProviderConfigEditorProps> = ({
  providerId,
  readonly = false,
}) => {
  const { data: configData, isLoading, error } = useProviderConfig(providerId);
  const updateConfig = useUpdateProviderConfig();

  const [config, setConfig] = useState<Record<string, { value: string; is_sensitive?: boolean }>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize config when data is loaded
  useEffect(() => {
    if (configData?.config) {
      setConfig(configData.config);
      setHasChanges(false);
    }
  }, [configData]);

  const handleConfigChange = (newConfig: Record<string, { value: string; is_sensitive?: boolean }>) => {
    setConfig(newConfig);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateConfig.mutateAsync({
        id: providerId,
        config,
      });
      setHasChanges(false);
    } catch (err) {
      // Error is handled by the mutation hook
      console.error('Failed to update config:', err);
    }
  };

  const handleReset = () => {
    if (configData?.config) {
      setConfig(configData.config);
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20 p-4">
        <p className="text-sm text-red-800 dark:text-red-400">
          Failed to load configuration: {error.message || 'Unknown error'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <KeyValueEditor
        label="Configuration"
        value={config}
        onChange={handleConfigChange}
        readonly={readonly}
        disabled={updateConfig.isPending}
        allowSensitive={true}
      />

      {!readonly && (
        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <IconButton
            icon={RotateCcw}
            onClick={handleReset}
            tooltip="Reset changes"
            disabled={!hasChanges || updateConfig.isPending}
            variant="ghost"
          />
          <IconButton
            icon={Save}
            onClick={handleSave}
            tooltip="Save configuration"
            disabled={!hasChanges}
            loading={updateConfig.isPending}
            variant="primary"
          />
        </div>
      )}

      {updateConfig.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20 p-3">
          <p className="text-sm text-red-800 dark:text-red-400">
            Failed to save configuration: {updateConfig.error?.message || 'Unknown error'}
          </p>
        </div>
      )}

      {updateConfig.isSuccess && !hasChanges && (
        <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20 p-3">
          <p className="text-sm text-green-800 dark:text-green-400">
            Configuration saved successfully
          </p>
        </div>
      )}
    </div>
  );
};
