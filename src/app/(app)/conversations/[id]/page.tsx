import { requireAuth } from '@/lib/permissions';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import ChatView from '@/components/conversations/ChatView';

export default async function ConversationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;

  const conversation = await prisma.conversation.findFirst({
    where: { id, whatsappAccount: { tenantId: user.tenantId } },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!conversation) notFound();

  const messages = conversation.messages.map((m) => ({
    id: m.id,
    direction: m.direction,
    content: m.content,
    agentGenerated: m.agentGenerated,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <ChatView
      conversationId={conversation.id}
      initialMessages={messages}
      contactName={conversation.contactName || conversation.contactPhone}
    />
  );
}
