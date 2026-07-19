import { prisma } from '../../db';
import { WhatsAppClient } from '../../whatsapp/client';
import { BaseAgent } from './base';
import type { LLMMessage } from '../types';

export class PreQualificationAgent extends BaseAgent {
  constructor(tenantId: string) {
    super(tenantId, 'PRE_QUALIFICATION');
  }

  async process(conversationId: string): Promise<void> {
    const config = await this.getConfig();
    if (!config) return;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: { orderBy: { createdAt: 'asc' }, take: 50 },
        whatsappAccount: true,
        lead: true,
      },
    });

    if (!conversation || conversation.status === 'CLOSED') return;

    const tenant = await prisma.tenant.findUnique({ where: { id: this.tenantId } });

    const systemPrompt = this.interpolatePrompt(config.systemPrompt, {
      tenant_name: tenant?.name || '',
      lead_name: conversation.contactName || 'Cliente',
      lead_phone: conversation.contactPhone,
    });

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversation.messages.map((m) => ({
        role: (m.direction === 'INBOUND' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    const response = await this.callLLM(messages);

    const waClient = new WhatsAppClient(
      conversation.whatsappAccount.phoneNumberId,
      conversation.whatsappAccount.accessToken
    );

    const sendResult = await waClient.sendTextMessage(conversation.contactPhone, response.content);

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        waMessageId: sendResult.messages?.[0]?.id || null,
        direction: 'OUTBOUND',
        content: response.content,
        agentGenerated: true,
      },
    });

    const score = this.extractScore(response.content, conversation.messages.length);
    if (score !== null) {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { qualificationScore: score },
      });

      if (conversation.leadId) {
        await prisma.lead.update({
          where: { id: conversation.leadId },
          data: { qualificationScore: score },
        });
      }
    }
  }

  private extractScore(response: string, messageCount: number): number | null {
    const scoreMatch = response.match(/\[SCORE:(\d+)\]/);
    if (scoreMatch) return Math.min(100, Math.max(0, parseInt(scoreMatch[1])));

    if (messageCount >= 4) {
      return 50;
    }
    return null;
  }
}
