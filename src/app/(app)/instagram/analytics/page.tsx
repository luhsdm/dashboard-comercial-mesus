import { requireAuth } from '@/lib/permissions';
import { prisma } from '@/lib/db';

export default async function InstagramAnalyticsPage() {
  const user = await requireAuth();

  const clients = await prisma.client.findMany({
    where: { tenantId: user.tenantId },
    include: { instagramAccount: true },
  });

  const accountIds = clients.filter((c) => c.instagramAccount).map((c) => c.instagramAccount!.id);

  const insights = await prisma.postInsight.findMany({
    where: { accountId: { in: accountIds } },
    orderBy: { fetchedAt: 'desc' },
    take: 30,
  });

  const totals = insights.reduce(
    (acc, i) => ({
      impressions: acc.impressions + i.impressions,
      reach: acc.reach + i.reach,
      likes: acc.likes + i.likes,
      comments: acc.comments + i.comments,
      saves: acc.saves + i.saves,
      shares: acc.shares + i.shares,
    }),
    { impressions: 0, reach: 0, likes: 0, comments: 0, saves: 0, shares: 0 }
  );

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Instagram Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {[
          { label: 'Impressões', value: totals.impressions },
          { label: 'Alcance', value: totals.reach },
          { label: 'Likes', value: totals.likes },
          { label: 'Comentários', value: totals.comments },
          { label: 'Salvos', value: totals.saves },
          { label: 'Compartilhados', value: totals.shares },
        ].map((kpi) => (
          <div key={kpi.label} className="card">
            <div className="label">{kpi.label}</div>
            <div className="text-lg font-bold text-brand-300">{kpi.value.toLocaleString('pt-BR')}</div>
          </div>
        ))}
      </div>

      {insights.length === 0 && (
        <div className="card text-center py-10 text-brand-50/40">Nenhum insight disponível.</div>
      )}
    </div>
  );
}
