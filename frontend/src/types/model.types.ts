export type ModelCapability = 'chat' | 'completion' | 'vision' | 'code' | 'tools' | string;

export interface Model {
  id: string;
  name: string;
  description?: string;
  capabilities: string[];
  created_at: number;
  updated_at: number;
}

export interface CreateModelRequest {
  id: string;
  name: string;
  description?: string;
  capabilities?: string[];
}

export interface UpdateModelRequest {
  name?: string;
  description?: string;
  capabilities?: string[];
}

export interface ProviderModel {
  id: number;
  provider_id: string;
  model_id: string;
  is_default: boolean;
  config?: string;
  created_at: number;
  updated_at: number;
}

export interface ProviderModelView {
  model_id: string;
  model_name: string;
  is_default: boolean;
  config?: Record<string, any>;
}

export interface LinkModelRequest {
  model_id: string;
  is_default?: boolean;
  config?: Record<string, any>;
}
