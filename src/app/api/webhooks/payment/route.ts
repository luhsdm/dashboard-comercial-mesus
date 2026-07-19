import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/payment/stripe';
import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  let event;
  try {
    event = await verifyWebhookSignature(rawBody, signature);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const email = session.customer_email;
    const name = session.metadata?.name || 'Admin';
    const amount = (session.amount_total || 0) / 100;
    const planType = session.mode === 'subscription' ? 'subscription' : 'one_time';

    const slug = email.split('@')[0].replace(/[^a-z0-9]/gi, '-').toLowerCase();

    const tenant = await prisma.tenant.create({
      data: {
        name: name,
        slug: `${slug}-${Date.now()}`,
        plan: planType === 'subscription' ? 'saas' : 'self-hosted',
        settings: { create: {} },
        pipelineStages: {
          create: [
            { name: 'Lead Novo', slug: 'lead_novo', order: 0, color: '#4f8ef7', isDefault: true },
            { name: 'Agendado', slug: 'agendado', order: 1, color: '#f7a84f' },
            { name: 'Compareceu', slug: 'compareceu', order: 2, color: '#a84ff7' },
            { name: 'Venda Fechada', slug: 'venda_fechada', order: 3, color: '#4fcf7a', isFinal: true },
            { name: 'Perdida', slug: 'perdida', order: 4, color: '#f74f6f', isFinal: true },
          ],
        },
      },
    });

    const hashedPassword = await hash('mudar123', 12);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'AGENCY',
        tenantId: tenant.id,
      },
    });

    await prisma.purchase.create({
      data: {
        email,
        name,
        amount,
        planType,
        status: 'completed',
        externalId: session.id,
        tenantId: tenant.id,
      },
    });
  }

  return NextResponse.json({ received: true });
}
