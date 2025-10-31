import React, { useState, useEffect } from 'react';
import { FormLayout } from '@/components/layout/FormLayout';
import { TextField } from '@/components/form/TextField';
import { TextArea } from '@/components/form/TextArea';
import type { Model, CreateModelRequest } from '@/types/model.types';
import { getFieldError, validateSlug, validateRequired } from '@/utils/validation.utils';
import { autoSlugify } from '@/utils/text.utils';

export interface ModelFormProps {
  initialData?: Model;
  onSubmit?: (data: CreateModelRequest) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  readonly?: boolean;
  standalone?: boolean;
}

interface FormData {
  name: string;
  modelId: string;
  capabilities: string;
  description: string;
}

interface FormErrors {
  name?: string;
  modelId?: string;
  capabilities?: string;
}

export const ModelForm: React.FC<ModelFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  readonly = false,
  standalone = false,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    modelId: initialData?.id || '',
    capabilities: initialData?.capabilities?.join(', ') || '',
    description: initialData?.description || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [autoSlugEnabled, setAutoSlugEnabled] = useState(!initialData);

  // Auto-generate modelId from name when enabled
  useEffect(() => {
    if (autoSlugEnabled && formData.name && !touched.modelId) {
      setFormData((prev) => ({
        ...prev,
        modelId: autoSlugify(prev.name),
      }));
    }
  }, [formData.name, autoSlugEnabled, touched.modelId]);

  const validateField = (field: keyof FormData, value: any): string | null => {
    switch (field) {
      case 'name':
        return getFieldError(value, {
          required: true,
          minLength: 2,
          maxLength: 100,
        });
      case 'modelId':
        if (!validateRequired(value)) {
          return 'Model ID is required';
        }
        if (!validateSlug(value)) {
          return 'Model ID must contain only lowercase letters, numbers, and hyphens';
        }
        return null;
      case 'capabilities':
        if (!validateRequired(value)) {
          return 'At least one capability is required';
        }
        // Validate that each capability is a non-empty string
        const caps = value.split(',').map((c: string) => c.trim()).filter((c: string) => c);
        if (caps.length === 0) {
          return 'At least one capability is required';
        }
        return null;
      default:
        return null;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.name = validateField('name', formData.name) || undefined;
    newErrors.modelId = validateField('modelId', formData.modelId) || undefined;
    newErrors.capabilities = validateField('capabilities', formData.capabilities) || undefined;

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

    // Disable auto-slug if user manually edits modelId field
    if (field === 'modelId' && autoSlugEnabled) {
      setAutoSlugEnabled(false);
    }
  };

  const handleSubmit = () => {
    if (readonly || !onSubmit) return;

    // Mark all fields as touched
    setTouched({
      name: true,
      modelId: true,
      capabilities: true,
    });

    if (!validateForm()) {
      return;
    }

    // Parse capabilities from comma-separated string to array
    const capabilitiesArray = formData.capabilities
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c);

    const submitData: CreateModelRequest = {
      id: formData.modelId,
      name: formData.name,
      description: formData.description || undefined,
      capabilities: capabilitiesArray,
    };

    onSubmit(submitData);
  };

  const formContent = (
    <div className="space-y-6">
      {/* Name Field */}
      <TextField
        label="Model Name"
        value={formData.name}
        onChange={(value) => handleFieldChange('name', value)}
        onBlur={() => handleFieldBlur('name')}
        error={touched.name ? errors.name : undefined}
        disabled={isLoading}
        readonly={readonly}
        required={!readonly}
        placeholder="e.g., Qwen 2.5 Coder 7B"
        maxLength={100}
      />

      {/* Model ID (Slug) Field */}
      <TextField
        label="Model ID (Slug)"
        value={formData.modelId}
        onChange={(value) => handleFieldChange('modelId', value)}
        onBlur={() => handleFieldBlur('modelId')}
        error={touched.modelId ? errors.modelId : undefined}
        disabled={isLoading || !!initialData}
        readonly={readonly || !!initialData}
        required={!readonly}
        placeholder="e.g., qwen-2-5-coder-7b"
        maxLength={50}
      />

      {/* Capabilities Field */}
      <TextField
        label="Capabilities (comma-separated)"
        value={formData.capabilities}
        onChange={(value) => handleFieldChange('capabilities', value)}
        onBlur={() => handleFieldBlur('capabilities')}
        error={touched.capabilities ? errors.capabilities : undefined}
        disabled={isLoading}
        readonly={readonly}
        required={!readonly}
        placeholder="e.g., chat, completion, embeddings, code"
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
