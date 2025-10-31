import { apiService } from './api.service';
import type { Session } from '@/types/session.types';

class SessionService {
  async getAll(params?: { limit?: number; offset?: number }) {
    return apiService.get<{ sessions: Session[]; count: number; total: number }>(
      '/v1/sessions',
      params
    );
  }

  async getById(id: string) {
    return apiService.get<Session>(`/v1/sessions/${id}`);
  }

  async getByChatId(chatId: string) {
    return apiService.get<{ sessions: Session[]; count: number }>(
      `/v1/sessions/chat/${chatId}`
    );
  }
}

export const sessionService = new SessionService();
