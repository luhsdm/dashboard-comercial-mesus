import type { LLMConfig, LLMProvider } from './types';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';

export function createProvider(config: LLMConfig): LLMProvider {
  switch (config.provider) {
    case 'openai':
      return new OpenAIProvider(config);
    case 'anthropic':
      return new AnthropicProvider(config);
    case 'custom':
      return new OpenAIProvider({ ...config, baseUrl: config.baseUrl });
    default:
      throw new Error(`Unknown LLM provider: ${config.provider}`);
  }
}
