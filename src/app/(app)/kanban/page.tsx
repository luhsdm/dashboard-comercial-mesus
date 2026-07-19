import { requireAuth } from '@/lib/permissions';
import { prisma } from '@/lib/db';
import KanbanBoard from '@/components/kanban/KanbanBoard';

export default async function KanbanPage() {
  const user = await requireAuth();

  const stages = await prisma.pipelineStage.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { order: 'asc' },
  });

  const clients = await prisma.client.findMany({
    where: { tenantId: user.tenantId },
    select: { id: true },
  });

  const leads = await prisma.lead.findMany({
    where: { clientId: { in: clients.map((c) => c.id) } },
    select: { id: true, name: true, phone: true, campaign: true, qualificationScore: true, pipelineStageId: true },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  if (stages.length === 0) {
    return (
      <div>
        <h1 className="text-lg font-bold mb-4">Kanban</h1>
        <div className="card text-center py-10 text-brand-50/40">
          Nenhum estágio de pipeline configurado. Vá em Configurações para criar seu pipeline.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Kanban</h1>
      <KanbanBoard stages={stages} initialLeads={leads} />
    </div>
  );
}
