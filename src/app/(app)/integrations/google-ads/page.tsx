import { requireAuth } from '@/lib/permissions';
import { prisma } from '@/lib/db';

export default async function GoogleAdsIntegrationPage() {
  const user = await requireAuth();

  const clients = await prisma.client.findMany({
    where: { tenantId: user.tenantId },
    include: { googleAdAccount: { select: { customerId: true, status: true, lastSyncAt: true } } },
  });

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Google Ads</h1>
      <div className="card mb-4">
        <div className="text-xs text-brand-50/40 mb-3">
          Conecte suas contas do Google Ads para acompanhar campanhas, cliques e conversões.
        </div>
        <button className="btn-primary text-xs">Conectar via OAuth</button>
      </div>

      {clients.filter((c) => c.googleAdAccount).length > 0 && (
        <div className="card">
          <div className="label mb-3">Contas conectadas</div>
          {clients
            .filter((c) => c.googleAdAccount)
            .map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-brand-400/5 last:border-0">
                <div>
                  <div className="text-xs font-medium">{c.name}</div>
                  <div className="text-[10px] text-brand-50/30">Customer ID: {c.googleAdAccount!.customerId}</div>
                </div>
                <div className="text-[10px] text-brand-50/30">
                  {c.googleAdAccount!.lastSyncAt
                    ? `Sync: ${new Date(c.googleAdAccount!.lastSyncAt).toLocaleString('pt-BR')}`
                    : 'Nunca sincronizado'}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
