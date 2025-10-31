import { apiService } from './api.service';
import type {
  Provider,
  CreateProviderRequest,
  UpdateProviderRequest,
  ProviderConfig,
  ProviderTestResult
} from '@/types/provider.types';
import type { DeleteResponse } from '@/types/api.types';

class ProviderService {
  async getAll(filters?: { type?: string; enabled?: boolean }) {
    return apiService.get<{ providers: Provider[]; count: number }>('/v1/providers', filters);
  }

  async getById(id: string) {
    return apiService.get<Provider>(`/v1/providers/${id}`);
  }

  async create(data: CreateProviderRequest) {
    return apiService.post<Provider>('/v1/providers', data);
  }

  async update(id: string, data: UpdateProviderRequest) {
    return apiService.put<Provider>(`/v1/providers/${id}`, data);
  }

  async delete(id: string) {
    return apiService.delete<DeleteResponse>(`/v1/providers/${id}`);
  }

  async enable(id: string) {
    return apiService.post<{ message: string; id: string; enabled: true }>(
      `/v1/providers/${id}/enable`
    );
  }

  async disable(id: string) {
    return apiService.post<{ message: string; id: string; enabled: false }>(
      `/v1/providers/${id}/disable`
    );
  }

  async test(id: string) {
    return apiService.post<ProviderTestResult>(
      `/v1/providers/${id}/test`
    );
  }

  async getConfig(id: string) {
    return apiService.get<ProviderConfig>(`/v1/providers/${id}/config`);
  }

  async updateConfig(id: string, config: Record<string, any>) {
    return apiService.put<ProviderConfig>(`/v1/providers/${id}/config`, { config });
  }
}

export const providerService = new ProviderService();
