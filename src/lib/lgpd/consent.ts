import { prisma } from '../db';

export async function recordConsent(params: {
  tenantId: string;
  leadId?: string;
  phone?: string;
  consentType: string;
  granted: boolean;
  source: string;
  ipAddress?: string;
}): Promise<void> {
  await prisma.consentRecord.create({ data: params });
}

export async function checkConsent(params: {
  tenantId: string;
  phone?: string;
  leadId?: string;
  consentType: string;
}): Promise<boolean> {
  const record = await prisma.consentRecord.findFirst({
    where: {
      tenantId: params.tenantId,
      consentType: params.consentType,
      revokedAt: null,
      granted: true,
      ...(params.phone ? { phone: params.phone } : {}),
      ...(params.leadId ? { leadId: params.leadId } : {}),
    },
    orderBy: { grantedAt: 'desc' },
  });

  return !!record;
}

export async function revokeConsent(params: {
  tenantId: string;
  phone?: string;
  leadId?: string;
  consentType: string;
}): Promise<void> {
  await prisma.consentRecord.updateMany({
    where: {
      tenantId: params.tenantId,
      consentType: params.consentType,
      revokedAt: null,
      ...(params.phone ? { phone: params.phone } : {}),
      ...(params.leadId ? { leadId: params.leadId } : {}),
    },
    data: { revokedAt: new Date() },
  });
}

export async function exportLeadData(tenantId: string, phone: string): Promise<Record<string, any>> {
  const leads = await prisma.lead.findMany({ where: { phone, client: { tenantId } } });
  const conversations = await prisma.conversation.findMany({
    where: { contactPhone: phone, whatsappAccount: { tenantId } },
    include: { messages: true },
  });
  const consents = await prisma.consentRecord.findMany({ where: { tenantId, phone } });
  const tracking = await prisma.trackingEvent.findMany({
    where: { tenantId, leadId: { in: leads.map((l) => l.id) } },
  });

  return { leads, conversations, consents, tracking, exportedAt: new Date().toISOString() };
}

export async function deleteLeadData(tenantId: string, phone: string): Promise<{ deleted: number }> {
  const leads = await prisma.lead.findMany({ where: { phone, client: { tenantId } } });
  const leadIds = leads.map((l) => l.id);

  await prisma.trackingEvent.deleteMany({ where: { tenantId, leadId: { in: leadIds } } });
  await prisma.consentRecord.deleteMany({ where: { tenantId, phone } });

  const conversations = await prisma.conversation.findMany({
    where: { contactPhone: phone, whatsappAccount: { tenantId } },
  });
  for (const conv of conversations) {
    await prisma.message.deleteMany({ where: { conversationId: conv.id } });
  }
  await prisma.conversation.deleteMany({
    where: { contactPhone: phone, whatsappAccount: { tenantId } },
  });

  await prisma.lead.deleteMany({ where: { id: { in: leadIds } } });

  return { deleted: leadIds.length };
}
