export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage: { inputTokens: number; outputTokens: number };
}

export interface LLMConfig {
  provider: string;
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  baseUrl?: string;
}

export interface LLMProvider {
  chat(messages: LLMMessage[]): Promise<LLMResponse>;
}

export interface QualificationResult {
  score: number;
  answers: Record<string, string>;
  shouldAdvancePipeline: boolean;
  nextStage?: string;
  responseText: string;
}
