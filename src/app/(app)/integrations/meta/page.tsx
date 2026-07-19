import { requireAuth } from '@/lib/permissions';
import { prisma } from '@/lib/db';

export default async function MetaIntegrationPage() {
  const user = await requireAuth();

  const clients = await prisma.client.findMany({
    where: { tenantId: user.tenantId },
    include: { metaAdAccount: { select: { accountId: true, status: true, lastSyncAt: true } } },
  });

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Meta Ads</h1>
      <div className="card mb-4">
        <div className="text-xs text-brand-50/40 mb-3">
          Conecte suas contas do Meta Ads (Facebook/Instagram) para sincronizar campanhas e insights.
        </div>
        <button className="btn-primary text-xs">Conectar via OAuth</button>
      </div>

      {clients.filter((c) => c.metaAdAccount).length > 0 && (
        <div className="card">
          <div className="label mb-3">Contas conectadas</div>
          {clients
            .filter((c) => c.metaAdAccount)
            .map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-brand-400/5 last:border-0">
                <div>
                  <div className="text-xs font-medium">{c.name}</div>
                  <div className="text-[10px] text-brand-50/30">ID: {c.metaAdAccount!.accountId}</div>
                </div>
                <div className="text-[10px] text-brand-50/30">
                  {c.metaAdAccount!.lastSyncAt
                    ? `Sync: ${new Date(c.metaAdAccount!.lastSyncAt).toLocaleString('pt-BR')}`
                    : 'Nunca sincronizado'}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
