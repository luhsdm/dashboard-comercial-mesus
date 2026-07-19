import type { MetaWebhookPayload } from './types';
import { prisma } from '../db';
import { MetaApiClient } from './client';

export function verifyWebhook(mode: string, token: string, challenge: string): string | null {
  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return challenge;
  }
  return null;
}

export async function handleLeadgenWebhook(payload: MetaWebhookPayload): Promise<void> {
  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.field !== 'leadgen') continue;

      const { leadgen_id, ad_id } = change.value;

      const metaAccount = await prisma.metaAdAccount.findFirst({
        where: { status: 'active' },
        include: { client: true },
      });

      if (!metaAccount) continue;

      const client = new MetaApiClient(metaAccount.accessToken);
      const leadData = await client.getLeadgenLeads(leadgen_id);

      for (const lead of leadData.data || []) {
        const fields: Record<string, string> = {};
        for (const fd of lead.field_data || []) {
          fields[fd.name] = fd.values?.[0] || '';
        }

        const now = new Date(lead.created_time);

        await prisma.lead.create({
          data: {
            clientId: metaAccount.clientId,
            date: now,
            name: fields.full_name || fields.nome || 'Lead Meta',
            phone: fields.phone_number || fields.telefone || null,
            status: 'LEAD_NOVO',
            campaign: null,
            ad: ad_id || null,
            platform: 'facebook',
            sourceId: leadgen_id,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
          },
        });
      }
    }
  }
}
