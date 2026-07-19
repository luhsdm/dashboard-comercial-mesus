import { prisma } from '../../db';
import { BaseAgent } from './base';
import type { LLMMessage } from '../types';

export class InstagramAgent extends BaseAgent {
  constructor(tenantId: string) {
    super(tenantId, 'INSTAGRAM');
  }

  async generateCaption(context: {
    topic: string;
    tone?: string;
    industry?: string;
    hashtags?: boolean;
  }): Promise<string> {
    const config = await this.getConfig();
    if (!config) throw new Error('Instagram agent not configured');

    const tenant = await prisma.tenant.findUnique({ where: { id: this.tenantId } });

    const systemPrompt = this.interpolatePrompt(config.systemPrompt, {
      tenant_name: tenant?.name || '',
      industry: context.industry || 'geral',
    });

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Gere uma caption para Instagram sobre: ${context.topic}\nTom: ${context.tone || 'profissional e acessivel'}\n${context.hashtags !== false ? 'Inclua hashtags relevantes.' : 'Sem hashtags.'}`,
      },
    ];

    const response = await this.callLLM(messages);
    return response.content;
  }

  async suggestContent(accountId: string): Promise<Array<{ type: string; topic: string; reason: string }>> {
    const config = await this.getConfig();
    if (!config) return this.getDefaultSuggestions();

    const recentInsights = await prisma.postInsight.findMany({
      where: { accountId },
      orderBy: { fetchedAt: 'desc' },
      take: 20,
    });

    const topPerformers = recentInsights
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5);

    const insightSummary = topPerformers.length > 0
      ? `Posts com melhor engagement recente: ${topPerformers.map((p) => `likes=${p.likes}, saves=${p.saves}, engagement=${p.engagement.toFixed(1)}%`).join('; ')}`
      : 'Sem dados de engagement anteriores.';

    const messages: LLMMessage[] = [
      { role: 'system', content: config.systemPrompt },
      {
        role: 'user',
        content: `Com base nos dados de performance do Instagram, sugira 5 ideias de conteudo.\n\n${insightSummary}\n\nResponda em JSON: [{"type": "carrossel|reels|imagem", "topic": "...", "reason": "..."}]`,
      },
    ];

    try {
      const response = await this.callLLM(messages);
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch {
      // Fall back to defaults
    }

    return this.getDefaultSuggestions();
  }

  async analyzeBestTimes(accountId: string): Promise<Array<{ day: string; hour: number; reason: string }>> {
    const insights = await prisma.postInsight.findMany({
      where: { accountId },
      orderBy: { engagement: 'desc' },
      take: 50,
    });

    if (insights.length < 5) {
      return [
        { day: 'Terca', hour: 10, reason: 'Horario com maior engajamento medio no Brasil' },
        { day: 'Quinta', hour: 11, reason: 'Alto volume de usuarios ativos' },
        { day: 'Quarta', hour: 14, reason: 'Pico de consumo pos-almoco' },
      ];
    }

    const config = await this.getConfig();
    if (!config) return [];

    const messages: LLMMessage[] = [
      { role: 'system', content: 'Voce e um analista de Instagram. Analise dados e recomende horarios.' },
      {
        role: 'user',
        content: `Dados de ${insights.length} posts. Melhores engagements: ${insights.slice(0, 10).map((i) => `eng=${i.engagement.toFixed(1)}%, likes=${i.likes}, saves=${i.saves}`).join('; ')}. Sugira 3 melhores horarios em JSON: [{"day":"...", "hour":N, "reason":"..."}]`,
      },
    ];

    try {
      const response = await this.callLLM(messages);
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch {
      // Fallback
    }

    return [];
  }

  private getDefaultSuggestions() {
    return [
      { type: 'carrossel', topic: 'Dicas praticas para o seu publico', reason: 'Carrosseis geram 3x mais salvamentos' },
      { type: 'reels', topic: 'Bastidores do dia a dia', reason: 'Conteudo autentico aumenta alcance' },
      { type: 'imagem', topic: 'Resultado ou case de sucesso', reason: 'Prova social converte seguidores' },
      { type: 'carrossel', topic: 'Antes e depois', reason: 'Alta taxa de compartilhamento' },
      { type: 'reels', topic: 'Dica rapida em 30 segundos', reason: 'Retencao alta = mais alcance' },
    ];
  }
}
