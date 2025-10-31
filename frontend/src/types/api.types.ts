export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ListResponse<T> {
  items: T[];
  count: number;
  total?: number;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
  id: string;
}

export interface HealthResponse {
  status: string;
  timestamp: number;
  uptime_seconds: number;
  version: string;
}
