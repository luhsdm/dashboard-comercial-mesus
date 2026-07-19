import { prisma } from '../../db';
import { createProvider } from '../provider';
import type { LLMMessage, LLMResponse, LLMConfig } from '../types';
import type { AgentType } from '@prisma/client';

export abstract class BaseAgent {
  protected tenantId: string;
  protected agentType: AgentType;

  constructor(tenantId: string, agentType: AgentType) {
    this.tenantId = tenantId;
    this.agentType = agentType;
  }

  protected async getConfig() {
    const config = await prisma.agentConfig.findUnique({
      where: { tenantId_type: { tenantId: this.tenantId, type: this.agentType } },
      include: { promptTemplate: true },
    });

    if (!config || !config.active) return null;
    return config;
  }

  protected interpolatePrompt(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return result;
  }

  protected async callLLM(messages: LLMMessage[]): Promise<LLMResponse> {
    const config = await this.getConfig();
    if (!config) throw new Error(`Agent ${this.agentType} not configured for tenant ${this.tenantId}`);

    const llmConfig: LLMConfig = {
      provider: config.llmProvider,
      model: config.llmModel,
      apiKey: config.llmApiKey || '',
      temperature: config.temperature,
      maxTokens: config.maxTokens,
    };

    const provider = createProvider(llmConfig);
    return provider.chat(messages);
  }
}
