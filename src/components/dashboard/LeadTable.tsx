'use client';

interface LeadRow {
  id: string;
  date: string;
  name: string;
  status: string;
  receita: number;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  LEAD_NOVO: { label: 'Lead Novo', color: 'text-blue-400' },
  AGENDADO: { label: 'Agendado', color: 'text-amber-400' },
  COMPARECEU: { label: 'Compareceu', color: 'text-purple-400' },
  VENDA_FECHADA: { label: 'Venda', color: 'text-emerald-400' },
  PERDIDA: { label: 'Perdida', color: 'text-red-400' },
};

function fmt(v: number) {
  if (!v) return '-';
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function LeadTable({ leads }: { leads: LeadRow[] }) {
  if (leads.length === 0) return null;

  return (
    <div className="card overflow-x-auto">
      <div className="label">Leads Recentes</div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-brand-400/10 text-brand-50/40 text-left uppercase tracking-widest text-[9px] font-bold">
            <th className="p-2">Data</th>
            <th className="p-2">Nome</th>
            <th className="p-2">Status</th>
            <th className="p-2">Valor</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const s = STATUS_LABELS[lead.status] || STATUS_LABELS.LEAD_NOVO;
            return (
              <tr key={lead.id} className="border-b border-brand-400/5">
                <td className="p-2 text-brand-50/40">{lead.date}</td>
                <td className="p-2">{lead.name}</td>
                <td className={`p-2 ${s.color}`}>{s.label}</td>
                <td className={`p-2 ${lead.receita > 0 ? 'text-emerald-400' : 'text-brand-50/40'}`}>{fmt(lead.receita)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
