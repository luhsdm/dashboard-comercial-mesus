import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookChallenge, verifySignature } from '@/lib/whatsapp/signature';
import { handleIncomingWebhook } from '@/lib/whatsapp/webhook-handler';
import { prisma } from '@/lib/db';
import { PreQualificationAgent } from '@/lib/ai/agents/pre-qualification';
import { KanbanMoverAgent } from '@/lib/ai/agents/kanban-mover';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode') || '';
  const token = searchParams.get('hub.verify_token') || '';
  const challenge = searchParams.get('hub.challenge') || '';

  const result = verifyWebhookChallenge(mode, token, challenge);
  if (result) return new NextResponse(result, { status: 200 });
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-hub-signature-256') || '';
  const appSecret = process.env.WHATSAPP_APP_SECRET || '';

  if (appSecret && !verifySignature(rawBody, signature, appSecret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  await handleIncomingWebhook(payload);

  // Trigger AI agents for new inbound messages
  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field !== 'messages' || !change.value?.messages?.length) continue;

      const phoneNumberId = change.value.metadata.phone_number_id;
      const waAccount = await prisma.whatsAppAccount.findUnique({
        where: { phoneNumberId },
      });

      if (!waAccount) continue;

      for (const msg of change.value.messages) {
        const conversation = await prisma.conversation.findUnique({
          where: { whatsappAccountId_contactPhone: { whatsappAccountId: waAccount.id, contactPhone: msg.from } },
        });

        if (!conversation) continue;

        try {
          const preQualAgent = new PreQualificationAgent(waAccount.tenantId);
          await preQualAgent.process(conversation.id);

          const kanbanAgent = new KanbanMoverAgent(waAccount.tenantId);
          await kanbanAgent.process(conversation.id);
        } catch (error) {
          console.error('Agent processing error:', error);
        }
      }
    }
  }

  return NextResponse.json({ status: 'ok' });
}
