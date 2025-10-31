export interface Request {
  id: number;
  session_id: string;
  request_id: string;
  timestamp: number;
  method: string;
  path: string;
  openai_request: string;
  qwen_request: string;
  model: string;
  stream: boolean;
  created_at: number;
}

export interface Response {
  id: number;
  request_id: number;
  session_id: string;
  response_id: string;
  timestamp: number;
  qwen_response?: string;
  openai_response?: string;
  parent_id?: string;
  completion_tokens?: number;
  prompt_tokens?: number;
  total_tokens?: number;
  finish_reason?: string;
  error?: string;
  duration_ms?: number;
  created_at: number;
}

export interface RequestWithResponse {
  request: Request;
  response?: Response;
}
