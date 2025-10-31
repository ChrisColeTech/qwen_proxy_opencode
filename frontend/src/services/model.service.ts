import { apiService } from './api.service';
import type {
  Model,
  CreateModelRequest,
  UpdateModelRequest,
  ProviderModelView,
  LinkModelRequest
} from '@/types/model.types';
import type { DeleteResponse } from '@/types/api.types';

class ModelService {
  async getAll() {
    return apiService.get<{ models: Model[]; count: number }>('/v1/models');
  }

  async getById(id: string) {
    return apiService.get<Model>(`/v1/models/${id}`);
  }

  async create(data: CreateModelRequest) {
    return apiService.post<Model>('/v1/models', data);
  }

  async update(id: string, data: UpdateModelRequest) {
    return apiService.put<Model>(`/v1/models/${id}`, data);
  }

  async delete(id: string) {
    return apiService.delete<DeleteResponse>(`/v1/models/${id}`);
  }

  // Provider-Model linking methods
  async getProviderModels(providerId: string) {
    return apiService.get<{ models: ProviderModelView[]; count: number }>(
      `/v1/providers/${providerId}/models`
    );
  }

  async linkModelToProvider(providerId: string, data: LinkModelRequest) {
    return apiService.post<{ message: string; provider_id: string; model_id: string }>(
      `/v1/providers/${providerId}/models`,
      data
    );
  }

  async unlinkModelFromProvider(providerId: string, modelId: string) {
    return apiService.delete<DeleteResponse>(
      `/v1/providers/${providerId}/models/${modelId}`
    );
  }

  async updateProviderModelConfig(providerId: string, modelId: string, config: Record<string, any>) {
    return apiService.put<{ message: string; provider_id: string; model_id: string }>(
      `/v1/providers/${providerId}/models/${modelId}`,
      { config }
    );
  }
}

export const modelService = new ModelService();
