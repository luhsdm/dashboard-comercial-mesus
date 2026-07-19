import { prisma } from '../../db';
import { BaseAgent } from './base';
import type { LLMMessage } from '../types';

export class KanbanMoverAgent extends BaseAgent {
  constructor(tenantId: string) {
    super(tenantId, 'KANBAN_MOVER');
  }

  async process(conversationId: string): Promise<void> {
    const config = await this.getConfig();
    if (!config) return;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: { orderBy: { createdAt: 'asc' }, take: 20 },
        lead: { include: { pipelineStage: true } },
      },
    });

    if (!conversation?.leadId || !conversation.lead) return;

    const stages = await prisma.pipelineStage.findMany({
      where: { tenantId: this.tenantId },
      orderBy: { order: 'asc' },
    });

    const stageList = stages.map((s) => `${s.slug}: ${s.name}`).join(', ');
    const currentStage = conversation.lead.pipelineStage?.slug || 'lead_novo';

    const systemPrompt = this.interpolatePrompt(config.systemPrompt, {
      stages: stageList,
      current_stage: currentStage,
      score: String(conversation.qualificationScore || 0),
      lead_name: conversation.lead.name,
    });

    const conversationSummary = conversation.messages
      .slice(-10)
      .map((m) => `${m.direction === 'INBOUND' ? 'Cliente' : 'Agente'}: ${m.content}`)
      .join('\n');

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Analise a conversa e decida se o lead deve mudar de etapa.\n\nConversa:\n${conversationSummary}\n\nScore atual: ${conversation.qualificationScore || 'N/A'}\nEtapa atual: ${currentStage}\n\nResponda APENAS com o slug da nova etapa ou "manter" se nao deve mudar.`,
      },
    ];

    const response = await this.callLLM(messages);
    const suggestedStage = response.content.trim().toLowerCase();

    if (suggestedStage === 'manter' || suggestedStage === currentStage) return;

    const targetStage = stages.find((s) => s.slug === suggestedStage);
    if (!targetStage) return;

    await prisma.lead.update({
      where: { id: conversation.leadId },
      data: { pipelineStageId: targetStage.id },
    });
  }
}
