import { prisma } from '../db';
import type { WAWebhookPayload, WAInboundMessage } from './types';

export async function handleIncomingWebhook(payload: WAWebhookPayload): Promise<void> {
  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.field !== 'messages') continue;

      const { metadata, contacts, messages } = change.value;
      if (!messages?.length) continue;

      const waAccount = await prisma.whatsAppAccount.findUnique({
        where: { phoneNumberId: metadata.phone_number_id },
        include: { tenant: true },
      });

      if (!waAccount) continue;

      for (const msg of messages) {
        await processMessage(waAccount, msg, contacts?.[0]?.profile?.name);
      }
    }
  }
}

async function processMessage(
  waAccount: { id: string; tenantId: string },
  msg: WAInboundMessage,
  contactName?: string
): Promise<void> {
  const content = extractContent(msg);
  if (!content) return;

  const conversation = await prisma.conversation.upsert({
    where: {
      whatsappAccountId_contactPhone: {
        whatsappAccountId: waAccount.id,
        contactPhone: msg.from,
      },
    },
    create: {
      whatsappAccountId: waAccount.id,
      contactPhone: msg.from,
      contactName: contactName || null,
      status: 'OPEN',
      lastMessageAt: new Date(),
    },
    update: {
      contactName: contactName || undefined,
      lastMessageAt: new Date(),
    },
  });

  await prisma.message.upsert({
    where: { waMessageId: msg.id },
    create: {
      conversationId: conversation.id,
      waMessageId: msg.id,
      direction: 'INBOUND',
      content,
      mediaUrl: null,
      agentGenerated: false,
    },
    update: {},
  });

  if (!conversation.leadId) {
    const existingLead = await prisma.lead.findFirst({
      where: { phone: msg.from },
    });

    if (existingLead) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { leadId: existingLead.id },
      });
    }
  }

  // AI Agent hook point — called from the API route after message is stored
}

function extractContent(msg: WAInboundMessage): string | null {
  switch (msg.type) {
    case 'text': return msg.text?.body || null;
    case 'image': return msg.image?.caption || '[Imagem]';
    case 'video': return msg.video?.caption || '[Video]';
    case 'audio': return '[Audio]';
    case 'document': return `[Documento: ${msg.document?.filename || 'arquivo'}]`;
    default: return null;
  }
}
