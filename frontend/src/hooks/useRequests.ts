import { useQuery } from '@tanstack/react-query';
import { requestService } from '@/services/request.service';

// Query Keys
export const requestKeys = {
  all: ['requests'] as const,
  lists: () => [...requestKeys.all, 'list'] as const,
  list: (params?: { limit?: number; offset?: number; session_id?: string }) =>
    [...requestKeys.lists(), { params }] as const,
  details: () => [...requestKeys.all, 'detail'] as const,
  detail: (id: number) => [...requestKeys.details(), id] as const,
  bySession: (sessionId: string, params?: { limit?: number; offset?: number }) =>
    [...requestKeys.all, 'session', sessionId, { params }] as const,
  requestDetail: (id: number) => [...requestKeys.all, 'request', id] as const,
  response: (requestId: number) => [...requestKeys.all, 'response', requestId] as const,
};

// Fetch all requests with pagination
export const useRequests = (params?: { limit?: number; offset?: number; session_id?: string }) => {
  return useQuery({
    queryKey: requestKeys.list(params),
    queryFn: () => requestService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch single request with response by ID
export const useRequest = (id: number, enabled = true) => {
  return useQuery({
    queryKey: requestKeys.detail(id),
    queryFn: () => requestService.getById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch requests by session ID with pagination
export const useRequestsBySession = (
  sessionId: string,
  params?: { limit?: number; offset?: number },
  enabled = true
) => {
  return useQuery({
    queryKey: requestKeys.bySession(sessionId, params),
    queryFn: () => requestService.getBySessionId(sessionId, params),
    enabled: enabled && !!sessionId,
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch request detail (request only)
export const useRequestDetail = (id: number, enabled = true) => {
  return useQuery({
    queryKey: requestKeys.requestDetail(id),
    queryFn: () => requestService.getRequestById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch response by request ID
export const useResponseByRequestId = (requestId: number, enabled = true) => {
  return useQuery({
    queryKey: requestKeys.response(requestId),
    queryFn: () => requestService.getResponseByRequestId(requestId),
    enabled: enabled && !!requestId,
    staleTime: 5 * 60 * 1000,
  });
};
