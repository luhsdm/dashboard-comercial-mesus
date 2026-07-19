import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/permissions';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const conversation = await prisma.conversation.findFirst({
    where: { id, whatsappAccount: { tenantId: user.tenantId } },
  });
  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(messages);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { content } = await request.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }

  const conversation = await prisma.conversation.findFirst({
    where: { id, whatsappAccount: { tenantId: user.tenantId } },
    include: { whatsappAccount: true },
  });
  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const message = await prisma.message.create({
    data: {
      conversationId: id,
      direction: 'OUTBOUND',
      content: content.trim(),
      agentGenerated: false,
    },
  });

  await prisma.conversation.update({
    where: { id },
    data: { lastMessageAt: new Date() },
  });

  return NextResponse.json(message, { status: 201 });
}
