import { requireAuth } from '@/lib/permissions';
import { prisma } from '@/lib/db';
import Link from 'next/link';

export default async function InstagramPage() {
  const user = await requireAuth();

  const clients = await prisma.client.findMany({
    where: { tenantId: user.tenantId },
    include: { instagramAccount: true },
  });

  const connectedAccounts = clients.filter((c) => c.instagramAccount);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">Instagram</h1>
        <div className="flex gap-2">
          <Link href="/instagram/create" className="btn-primary text-xs">Novo Post</Link>
          <Link href="/instagram/schedule" className="btn-secondary text-xs">Agenda</Link>
          <Link href="/instagram/analytics" className="btn-secondary text-xs">Analytics</Link>
        </div>
      </div>

      {connectedAccounts.length === 0 ? (
        <div className="card text-center py-10 text-brand-50/40">
          Nenhuma conta Instagram conectada. Vá em Integrações para conectar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {connectedAccounts.map((c) => (
            <div key={c.id} className="card">
              <div className="text-sm font-medium">@{c.instagramAccount!.username}</div>
              <div className="text-[10px] text-brand-50/30 mt-1">{c.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
