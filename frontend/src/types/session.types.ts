export interface Session {
  id: string;
  chat_id: string;
  parent_id?: string;
  first_user_message: string;
  message_count: number;
  created_at: number;
  last_accessed: number;
  expires_at: number;
}
