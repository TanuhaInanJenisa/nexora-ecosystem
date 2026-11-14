export type AIModelProvider = 'openai' | 'gemini' | 'anthropic';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIConversationSession {
  id: string;
  user_id: string;
  title: string;
  provider: AIModelProvider;
  model: string;
  token_usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  created_at: string;
  updated_at: string;
}

export interface AIChatRequest {
  session_id?: string;
  message: string;
  context?: Record<string, unknown>;
}

export interface AIChatResponse {
  session_id: string;
  reply: string;
  suggestions?: string[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

