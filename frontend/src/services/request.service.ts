import { apiService } from './api.service';
import type { Request, Response, RequestWithResponse } from '@/types/request.types';

class RequestService {
  async getAll(params?: { limit?: number; offset?: number; session_id?: string }) {
    return apiService.get<{ requests: RequestWithResponse[]; count: number; total: number }>(
      '/v1/requests',
      params
    );
  }

  async getById(id: number) {
    return apiService.get<RequestWithResponse>(`/v1/requests/${id}`);
  }

  async getBySessionId(sessionId: string, params?: { limit?: number; offset?: number }) {
    return apiService.get<{ requests: RequestWithResponse[]; count: number; total: number }>(
      `/v1/requests/session/${sessionId}`,
      params
    );
  }

  async getRequestById(id: number) {
    return apiService.get<Request>(`/v1/requests/${id}`);
  }

  async getResponseByRequestId(requestId: number) {
    return apiService.get<Response>(`/v1/responses/request/${requestId}`);
  }
}

export const requestService = new RequestService();
