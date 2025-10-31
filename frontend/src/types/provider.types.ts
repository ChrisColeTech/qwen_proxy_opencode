export type ProviderType = 'lm-studio' | 'qwen-proxy' | 'qwen-direct';

export interface Provider {
  id: string;
  name: string;
  type: ProviderType;
  enabled: boolean;
  priority: number;
  description?: string;
  created_at: number;
  updated_at: number;
}

export interface CreateProviderRequest {
  id: string;
  name: string;
  type: ProviderType;
  enabled?: boolean;
  priority?: number;
  description?: string;
  config?: Record<string, any>;
}

export interface UpdateProviderRequest {
  name?: string;
  enabled?: boolean;
  priority?: number;
  description?: string;
}

export interface ProviderConfig {
  provider_id: string;
  config: Record<string, ConfigValue>;
}

export interface ConfigValue {
  value: string;
  is_sensitive?: boolean;
}

export interface ProviderTestResult {
  success: boolean;
  message: string;
  latency_ms?: number;
  error?: string;
}
