import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelService } from '@/services/model.service';
import type {
  Model,
  CreateModelRequest,
  UpdateModelRequest,
  LinkModelRequest
} from '@/types/model.types';
import type { ApiError } from '@/types/api.types';

// Query Keys
export const modelKeys = {
  all: ['models'] as const,
  lists: () => [...modelKeys.all, 'list'] as const,
  list: () => [...modelKeys.lists()] as const,
  details: () => [...modelKeys.all, 'detail'] as const,
  detail: (id: string) => [...modelKeys.details(), id] as const,
  providerModels: (providerId: string) => ['providers', providerId, 'models'] as const,
};

// Fetch all models
export const useModels = () => {
  return useQuery({
    queryKey: modelKeys.list(),
    queryFn: () => modelService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch single model
export const useModel = (id: string, enabled = true) => {
  return useQuery({
    queryKey: modelKeys.detail(id),
    queryFn: () => modelService.getById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch provider's linked models
export const useProviderModels = (providerId: string, enabled = true) => {
  return useQuery({
    queryKey: modelKeys.providerModels(providerId),
    queryFn: () => modelService.getProviderModels(providerId),
    enabled: enabled && !!providerId,
    staleTime: 5 * 60 * 1000,
  });
};

// Create model mutation
export const useCreateModel = () => {
  const queryClient = useQueryClient();

  return useMutation<Model, ApiError, CreateModelRequest>({
    mutationFn: (data) => modelService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelKeys.lists() });
    },
  });
};

// Update model mutation
export const useUpdateModel = () => {
  const queryClient = useQueryClient();

  return useMutation<Model, ApiError, { id: string; data: UpdateModelRequest }>({
    mutationFn: ({ id, data }) => modelService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: modelKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: modelKeys.lists() });
    },
  });
};

// Delete model mutation
export const useDeleteModel = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string; id: string }, ApiError, string>({
    mutationFn: (id) => modelService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelKeys.lists() });
    },
  });
};

// Link model to provider mutation
export const useLinkModelToProvider = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; provider_id: string; model_id: string },
    ApiError,
    { providerId: string; data: LinkModelRequest }
  >({
    mutationFn: ({ providerId, data }) => modelService.linkModelToProvider(providerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: modelKeys.providerModels(variables.providerId) });
    },
  });
};

// Unlink model from provider mutation
export const useUnlinkModelFromProvider = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; message: string; id: string },
    ApiError,
    { providerId: string; modelId: string }
  >({
    mutationFn: ({ providerId, modelId }) => modelService.unlinkModelFromProvider(providerId, modelId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: modelKeys.providerModels(variables.providerId) });
    },
  });
};

// Update provider-model config mutation
export const useUpdateProviderModelConfig = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; provider_id: string; model_id: string },
    ApiError,
    { providerId: string; modelId: string; config: Record<string, any> }
  >({
    mutationFn: ({ providerId, modelId, config }) =>
      modelService.updateProviderModelConfig(providerId, modelId, config),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: modelKeys.providerModels(variables.providerId) });
    },
  });
};
