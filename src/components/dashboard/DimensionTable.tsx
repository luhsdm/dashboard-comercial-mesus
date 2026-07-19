'use client';

import { useState } from 'react';

interface DimensionData {
  name: string;
  leads: number;
  agend: number;
  comp: number;
  vendas: number;
  receita: number;
}

const DIMENSIONS = ['Campanha', 'Conjunto', 'Anuncio', 'Criativo', 'SourceID', 'Plataforma'] as const;

function fmt(v: number) {
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pct(num: number, den: number) {
  return den > 0 ? (num / den * 100).toFixed(1) + '%' : '-';
}

export default function DimensionTable({ groups }: { groups: Record<string, DimensionData[]> }) {
  const [dim, setDim] = useState<string>('Campanha');
  const data = groups[dim] || [];

  return (
    <div className="mb-5">
      <div className="flex gap-2 items-center mb-3">
        <span className="label !mb-0">Desempenho por</span>
        {DIMENSIONS.map((d) => (
          <button
            key={d}
            onClick={() => setDim(d)}
            className={`px-3 py-1 rounded-full text-[10px] font-medium transition-colors border ${
              dim === d
                ? 'bg-brand-700/40 border-brand-400/40 text-brand-300'
                : 'bg-brand-900/60 border-brand-400/10 text-brand-50/40 hover:text-brand-300'
            }`}
          >
            {d}
          </button>
        ))}
      </div>
      {data.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-brand-400/10 text-brand-50/40 text-left uppercase tracking-widest text-[9px] font-bold">
                <th className="p-2">{dim}</th>
                <th className="p-2">Leads</th>
                <th className="p-2">Agend.</th>
                <th className="p-2">Comp.</th>
                <th className="p-2">Vendas</th>
                <th className="p-2">Receita</th>
                <th className="p-2">Tx Agend</th>
                <th className="p-2">Tx Comp</th>
                <th className="p-2">Tx Conv</th>
              </tr>
            </thead>
            <tbody>
              {data.map((g) => (
                <tr key={g.name} className="border-b border-brand-400/5">
                  <td className="p-2 text-brand-300 max-w-[200px] truncate" title={g.name}>{g.name}</td>
                  <td className="p-2">{g.leads}</td>
                  <td className="p-2">{g.agend}</td>
                  <td className="p-2">{g.comp}</td>
                  <td className={`p-2 ${g.vendas > 0 ? 'text-emerald-400' : ''}`}>{g.vendas}</td>
                  <td className={`p-2 ${g.receita > 0 ? 'text-emerald-400' : ''}`}>{fmt(g.receita)}</td>
                  <td className="p-2">{pct(g.agend, g.leads)}</td>
                  <td className="p-2">{pct(g.comp, g.agend)}</td>
                  <td className="p-2">{pct(g.vendas, g.comp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
