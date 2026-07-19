import { requireAuth } from '@/lib/permissions';
import { computeKpis, computeDimensions } from '@/lib/kpi';
import { prisma } from '@/lib/db';
import KpiGrid from '@/components/dashboard/KpiGrid';
import DimensionTable from '@/components/dashboard/DimensionTable';
import RevenueChart from '@/components/dashboard/RevenueChart';

export default async function DashboardPage() {
  const user = await requireAuth();
  const clients = await prisma.client.findMany({ where: { tenantId: user.tenantId }, select: { id: true, name: true } });

  const clientId = clients[0]?.id;
  if (!clientId) {
    return (
      <div>
        <h1 className="text-lg font-bold mb-4">Dashboard</h1>
        <div className="card text-center py-10 text-brand-50/40">
          Nenhum cliente cadastrado. Adicione um cliente para ver os KPIs.
        </div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const kpis = await computeKpis(clientId, currentYear);

  const dimensions = ['campaign', 'adSet', 'ad', 'creative', 'sourceId', 'platform'] as const;
  const dimLabels = ['Campanha', 'Conjunto', 'Anuncio', 'Criativo', 'SourceID', 'Plataforma'];
  const groups: Record<string, any[]> = {};
  for (let i = 0; i < dimensions.length; i++) {
    groups[dimLabels[i]] = await computeDimensions(clientId, dimensions[i], currentYear);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">Dashboard</h1>
        <span className="text-xs text-brand-50/40">{clients[0]?.name} — {currentYear}</span>
      </div>
      <KpiGrid data={kpis} />
      <RevenueChart monthlyRevenue={kpis.monthlyRevenue} />
      <DimensionTable groups={groups} />
    </div>
  );
}
