import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providerService } from '@/services/provider.service';
import type {
  Provider,
  CreateProviderRequest,
  UpdateProviderRequest
} from '@/types/provider.types';
import type { ApiError } from '@/types/api.types';

// Query Keys
export const providerKeys = {
  all: ['providers'] as const,
  lists: () => [...providerKeys.all, 'list'] as const,
  list: (filters?: { type?: string; enabled?: boolean }) =>
    [...providerKeys.lists(), { filters }] as const,
  details: () => [...providerKeys.all, 'detail'] as const,
  detail: (id: string) => [...providerKeys.details(), id] as const,
  config: (id: string) => [...providerKeys.detail(id), 'config'] as const,
};

// Fetch all providers
export const useProviders = (filters?: { type?: string; enabled?: boolean }) => {
  return useQuery({
    queryKey: providerKeys.list(filters),
    queryFn: () => providerService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch single provider
export const useProvider = (id: string, enabled = true) => {
  return useQuery({
    queryKey: providerKeys.detail(id),
    queryFn: () => providerService.getById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch provider config
export const useProviderConfig = (id: string, enabled = true) => {
  return useQuery({
    queryKey: providerKeys.config(id),
    queryFn: () => providerService.getConfig(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Create provider mutation
export const useCreateProvider = () => {
  const queryClient = useQueryClient();

  return useMutation<Provider, ApiError, CreateProviderRequest>({
    mutationFn: (data) => providerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerKeys.lists() });
    },
  });
};

// Update provider mutation
export const useUpdateProvider = () => {
  const queryClient = useQueryClient();

  return useMutation<Provider, ApiError, { id: string; data: UpdateProviderRequest }>({
    mutationFn: ({ id, data }) => providerService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: providerKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: providerKeys.lists() });
    },
  });
};

// Delete provider mutation
export const useDeleteProvider = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string; id: string }, ApiError, string>({
    mutationFn: (id) => providerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerKeys.lists() });
    },
  });
};

// Enable provider mutation
export const useEnableProvider = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; id: string; enabled: true }, ApiError, string>({
    mutationFn: (id) => providerService.enable(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: providerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: providerKeys.lists() });
    },
  });
};

// Disable provider mutation
export const useDisableProvider = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; id: string; enabled: false }, ApiError, string>({
    mutationFn: (id) => providerService.disable(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: providerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: providerKeys.lists() });
    },
  });
};

// Test provider mutation
export const useTestProvider = () => {
  return useMutation<{ success: boolean; message: string; latency_ms?: number; error?: string }, ApiError, string>({
    mutationFn: (id) => providerService.test(id),
  });
};

// Update provider config mutation
export const useUpdateProviderConfig = () => {
  const queryClient = useQueryClient();

  return useMutation<any, ApiError, { id: string; config: Record<string, any> }>({
    mutationFn: ({ id, config }) => providerService.updateConfig(id, config),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: providerKeys.config(variables.id) });
      queryClient.invalidateQueries({ queryKey: providerKeys.detail(variables.id) });
    },
  });
};
