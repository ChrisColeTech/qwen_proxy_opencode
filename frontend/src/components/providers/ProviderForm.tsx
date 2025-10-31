import React, { useState, useEffect } from 'react';
import { FormLayout } from '@/components/layout/FormLayout';
import { TextField } from '@/components/form/TextField';
import { SelectField } from '@/components/form/SelectField';
import { ToggleField } from '@/components/form/ToggleField';
import { TextArea } from '@/components/form/TextArea';
import type { Provider, CreateProviderRequest, ProviderType } from '@/types/provider.types';
import { getFieldError, validateSlug, validateUrl, validateRequired } from '@/utils/validation.utils';
import { autoSlugify } from '@/utils/text.utils';
import type { SelectOption } from '@/components/form/SelectField';

export interface ProviderFormProps {
  initialData?: Provider;
  onSubmit?: (data: CreateProviderRequest) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  readonly?: boolean;
  standalone?: boolean;
}

interface FormData {
  name: string;
  slug: string;
  type: ProviderType;
  baseUrl: string;
  enabled: boolean;
  description: string;
  priority: number;
}

interface FormErrors {
  name?: string;
  slug?: string;
  type?: string;
  baseUrl?: string;
}

const PROVIDER_TYPE_OPTIONS: SelectOption[] = [
  { value: 'lm-studio', label: 'LM Studio' },
  { value: 'qwen-proxy', label: 'Qwen Proxy' },
  { value: 'qwen-direct', label: 'Qwen Direct' },
];

export const ProviderForm: React.FC<ProviderFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  readonly = false,
  standalone = false,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    slug: initialData?.id || '',
    type: initialData?.type || ('lm-studio' as ProviderType),
    baseUrl: '',
    enabled: initialData?.enabled ?? true,
    description: initialData?.description || '',
    priority: initialData?.priority ?? 0,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [autoSlugEnabled, setAutoSlugEnabled] = useState(!initialData);

  // Auto-generate slug from name when enabled
  useEffect(() => {
    if (autoSlugEnabled && formData.name && !touched.slug) {
      setFormData((prev) => ({
        ...prev,
        slug: autoSlugify(prev.name),
      }));
    }
  }, [formData.name, autoSlugEnabled, touched.slug]);

  const validateField = (field: keyof FormData, value: any): string | null => {
    switch (field) {
      case 'name':
        return getFieldError(value, {
          required: true,
          minLength: 2,
          maxLength: 100,
        });
      case 'slug':
        if (!validateRequired(value)) {
          return 'Slug is required';
        }
        if (!validateSlug(value)) {
          return 'Slug must contain only lowercase letters, numbers, and hyphens';
        }
        return null;
      case 'type':
        return getFieldError(value, {
          required: true,
          custom: (val) => ['lm-studio', 'qwen-proxy', 'qwen-direct'].includes(val),
          customMessage: 'Please select a valid provider type',
        });
      case 'baseUrl':
        if (!validateRequired(value)) {
          return 'Base URL is required';
        }
        if (!validateUrl(value)) {
          return 'Please enter a valid URL (http:// or https://)';
        }
        return null;
      default:
        return null;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.name = validateField('name', formData.name) || undefined;
    newErrors.slug = validateField('slug', formData.slug) || undefined;
    newErrors.type = validateField('type', formData.type) || undefined;
    newErrors.baseUrl = validateField('baseUrl', formData.baseUrl) || undefined;

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleFieldChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Validate field immediately if it has been touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error || undefined }));
    }
  };

  const handleFieldBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate field on blur
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error || undefined }));

    // Disable auto-slug if user manually edits slug field
    if (field === 'slug' && autoSlugEnabled) {
      setAutoSlugEnabled(false);
    }
  };

  const handleSubmit = () => {
    if (readonly || !onSubmit) return;

    // Mark all fields as touched
    setTouched({
      name: true,
      slug: true,
      type: true,
      baseUrl: true,
    });

    if (!validateForm()) {
      return;
    }

    const submitData: CreateProviderRequest = {
      id: formData.slug,
      name: formData.name,
      type: formData.type as ProviderType,
      enabled: formData.enabled,
      description: formData.description,
      priority: formData.priority,
      config: {
        base_url: formData.baseUrl,
      },
    };

    onSubmit(submitData);
  };

  const formContent = (
    <div className="space-y-6">
      {/* Name Field */}
      <TextField
        label="Provider Name"
        value={formData.name}
        onChange={(value) => handleFieldChange('name', value)}
        onBlur={() => handleFieldBlur('name')}
        error={touched.name ? errors.name : undefined}
        disabled={isLoading}
        readonly={readonly}
        required={!readonly}
        placeholder="e.g., My LM Studio Server"
        maxLength={100}
      />

      {/* Slug Field */}
      <TextField
        label="Provider ID (Slug)"
        value={formData.slug}
        onChange={(value) => handleFieldChange('slug', value)}
        onBlur={() => handleFieldBlur('slug')}
        error={touched.slug ? errors.slug : undefined}
        disabled={isLoading || !!initialData}
        readonly={readonly || !!initialData}
        required={!readonly}
        placeholder="e.g., my-lm-studio-server"
        maxLength={50}
      />

      {/* Type Field */}
      <SelectField
        label="Provider Type"
        value={formData.type}
        onChange={(value) => handleFieldChange('type', value)}
        onBlur={() => handleFieldBlur('type')}
        options={PROVIDER_TYPE_OPTIONS}
        error={touched.type ? errors.type : undefined}
        disabled={isLoading || !!initialData}
        readonly={readonly || !!initialData}
        required={!readonly}
        placeholder="Select provider type..."
      />

      {/* Description Field */}
      <TextArea
        label="Description"
        value={formData.description}
        onChange={(value) => handleFieldChange('description', value)}
        disabled={isLoading}
        readonly={readonly}
        placeholder="Optional description"
        rows={3}
      />

      {/* Priority Field */}
      <TextField
        label="Priority"
        value={formData.priority.toString()}
        onChange={(value) => handleFieldChange('priority', parseInt(value) || 0)}
        disabled={isLoading}
        readonly={readonly}
        placeholder="0"
      />

      {/* Base URL Field */}
      <TextField
        label="Base URL"
        value={formData.baseUrl}
        onChange={(value) => handleFieldChange('baseUrl', value)}
        onBlur={() => handleFieldBlur('baseUrl')}
        error={touched.baseUrl ? errors.baseUrl : undefined}
        disabled={isLoading}
        readonly={readonly}
        required={!readonly}
        type="url"
        placeholder="https://example.com/api"
      />

      {/* Enabled Toggle */}
      <ToggleField
        label="Enabled"
        checked={formData.enabled}
        onChange={(value) => handleFieldChange('enabled', value)}
        disabled={isLoading}
        readonly={readonly}
        description={readonly ? undefined : "Enable or disable this provider"}
      />

      {/* Show timestamps in readonly mode */}
      {readonly && initialData && (
        <>
          <TextField
            label="Created At"
            value={new Date(initialData.created_at * 1000).toLocaleString()}
            onChange={() => {}}
            readonly={true}
          />

          <TextField
            label="Updated At"
            value={new Date(initialData.updated_at * 1000).toLocaleString()}
            onChange={() => {}}
            readonly={true}
          />
        </>
      )}
    </div>
  );

  // If standalone, return just the form content
  if (standalone) {
    return formContent;
  }

  // Otherwise, wrap in FormLayout
  return (
    <FormLayout
      onSave={readonly ? undefined : handleSubmit}
      onCancel={onCancel || (() => {})}
      saveDisabled={isLoading}
    >
      {formContent}
    </FormLayout>
  );
};
