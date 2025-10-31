import type { ApiError } from '@/types/api.types';

export class ErrorService {
  static getUserMessage(error: ApiError): string {
    const errorMessages: Record<string, string> = {
      'INVALID_INPUT': 'Please check your input and try again.',
      'NOT_FOUND': 'The requested resource was not found.',
      'DUPLICATE': 'A resource with this name or ID already exists.',
      'DATABASE_ERROR': 'A database error occurred. Please try again.',
      'PROVIDER_ERROR': 'Failed to communicate with provider.',
      'NETWORK_ERROR': 'Unable to connect to the server.',
    };

    return errorMessages[error.code || ''] || error.message;
  }

  static logError(error: ApiError, ctx?: string) {
    console.error('[' + (ctx || 'API') + ']', error);
  }
}
