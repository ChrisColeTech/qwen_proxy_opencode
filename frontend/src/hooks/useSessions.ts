import { useQuery } from '@tanstack/react-query';
import { sessionService } from '@/services/session.service';

// Query Keys
export const sessionKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  list: (params?: { limit?: number; offset?: number }) =>
    [...sessionKeys.lists(), { params }] as const,
  details: () => [...sessionKeys.all, 'detail'] as const,
  detail: (id: string) => [...sessionKeys.details(), id] as const,
  byChat: (chatId: string) => [...sessionKeys.all, 'chat', chatId] as const,
};

// Fetch all sessions with pagination
export const useSessions = (params?: { limit?: number; offset?: number }) => {
  return useQuery({
    queryKey: sessionKeys.list(params),
    queryFn: () => sessionService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch single session by ID
export const useSession = (id: string, enabled = true) => {
  return useQuery({
    queryKey: sessionKeys.detail(id),
    queryFn: () => sessionService.getById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch sessions by chat ID
export const useSessionsByChatId = (chatId: string, enabled = true) => {
  return useQuery({
    queryKey: sessionKeys.byChat(chatId),
    queryFn: () => sessionService.getByChatId(chatId),
    enabled: enabled && !!chatId,
    staleTime: 5 * 60 * 1000,
  });
};
