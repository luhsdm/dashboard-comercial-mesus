import { requireAuth } from '@/lib/permissions';
import { prisma } from '@/lib/db';
import Link from 'next/link';

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Aberta',
  QUALIFIED: 'Qualificado',
  DISQUALIFIED: 'Desqualificado',
  CLOSED: 'Fechada',
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'text-blue-400',
  QUALIFIED: 'text-emerald-400',
  DISQUALIFIED: 'text-red-400',
  CLOSED: 'text-brand-50/30',
};

export default async function ConversationsPage() {
  const user = await requireAuth();

  const conversations = await prisma.conversation.findMany({
    where: { whatsappAccount: { tenantId: user.tenantId } },
    include: { lead: { select: { name: true } }, _count: { select: { messages: true } } },
    orderBy: { lastMessageAt: 'desc' },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Conversas</h1>
      {conversations.length === 0 ? (
        <div className="card text-center py-10 text-brand-50/40">
          Nenhuma conversa ainda. Configure o WhatsApp em Integrações para receber mensagens.
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Link key={conv.id} href={`/conversations/${conv.id}`}>
              <div className="card flex items-center justify-between hover:border-brand-400/20 transition-colors cursor-pointer">
                <div>
                  <div className="text-sm font-medium">
                    {conv.contactName || conv.contactPhone}
                    {conv.lead && (
                      <span className="ml-2 text-[10px] text-brand-50/30">({conv.lead.name})</span>
                    )}
                  </div>
                  <div className="text-[10px] text-brand-50/30 mt-0.5">{conv.contactPhone}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] bg-brand-800/60 px-2 py-0.5 rounded-full">
                    {conv._count.messages} msgs
                  </span>
                  <span className={`text-[10px] font-medium ${STATUS_COLORS[conv.status]}`}>
                    {STATUS_LABELS[conv.status]}
                  </span>
                  {conv.qualificationScore != null && (
                    <span className="text-[10px] text-brand-50/30">Score: {conv.qualificationScore}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
