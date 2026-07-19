import { requireAuth } from '@/lib/permissions';
import { prisma } from '@/lib/db';

export default async function ClientsPage() {
  const user = await requireAuth();

  const clients = await prisma.client.findMany({
    where: { tenantId: user.tenantId },
    include: { _count: { select: { leads: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Clientes</h1>
      {clients.length === 0 ? (
        <div className="card text-center py-10 text-brand-50/40">Nenhum cliente cadastrado.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-brand-400/10 text-brand-50/40 text-left uppercase tracking-widest text-[9px] font-bold">
                <th className="p-2">Nome</th>
                <th className="p-2">Leads</th>
                <th className="p-2">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-brand-400/5">
                  <td className="p-2 text-brand-300">{client.name}</td>
                  <td className="p-2">{client._count.leads}</td>
                  <td className="p-2 text-brand-50/30">
                    {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
