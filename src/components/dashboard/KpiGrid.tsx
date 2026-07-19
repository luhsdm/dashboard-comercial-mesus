'use client';

interface KpiData {
  total: number;
  agend: number;
  comp: number;
  fech: number;
  receita: number;
  ticket: number;
  taxaConv: number;
}

function fmt(v: number): string {
  if (isNaN(v)) return 'R$ 0';
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtn(v: number): string {
  if (isNaN(v)) return '0';
  return v.toLocaleString('pt-BR');
}

export default function KpiGrid({ data }: { data: KpiData }) {
  const kpis = [
    { label: 'Total Leads', value: fmtn(data.total), color: 'text-blue-400' },
    { label: 'Agendamentos', value: fmtn(data.agend), color: 'text-blue-400' },
    { label: 'Comparecimentos', value: fmtn(data.comp), color: 'text-amber-400' },
    { label: 'Vendas', value: fmtn(data.fech), color: 'text-emerald-400' },
    { label: 'Receita', value: fmt(data.receita), color: 'text-emerald-400' },
    { label: 'Ticket Medio', value: fmt(data.ticket), color: 'text-purple-400' },
    { label: 'Taxa Conversao', value: data.taxaConv.toFixed(1) + '%', color: 'text-amber-400' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-5">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="card">
          <div className="label">{kpi.label}</div>
          <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
        </div>
      ))}
    </div>
  );
}
