'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { CLIENTS, MONTHS, monthIndex } from './data';

const COLORS = ["#4f8ef7", "#f7a84f", "#4fcf7a", "#f74f6f", "#a84ff7"];
const CRM_SHEET = "🧙🏻‍♂️ CRM";
const DB_SHEET = "🧬 Db_CRM";

function fmt(v) {
  if (v == null || isNaN(v)) return "R$ 0";
  return "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtn(v) {
  if (v == null || isNaN(v)) return "0";
  return Number(v).toLocaleString("pt-BR");
}

function fmtpct(v) {
  if (v == null || isNaN(v)) return "0%";
  return v.toFixed(1) + "%";
}

function parseCurrency(v) {
  if (!v) return 0;
  const num = parseFloat(String(v).replace(/[R$\s.]/g, '').replace(',', '.'));
  return isNaN(num) ? 0 : num;
}

export default function Home() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ rows: [], total: 0, agend: 0, comp: 0, fech: 0, receita: 0, ticket: 0, taxaConv: 0, gasto: 0, meses_agend: [], meses_comp: [], meses_fech: [], meses_inv: [] });
  const [allRows, setAllRows] = useState([]); // todas as linhas sem filtro — fonte dos dropdowns
  const [year, setYear] = useState("Todos");
  const [month, setMonth] = useState("Todos");
  const [dim, setDim] = useState("Campanha");
  const chartRef = useRef(null);

  const getStatusPipeline = useCallback((row) => {
    const agendou = row[10] || '';
    const compareceu = row[12] || '';
    const ganhou = row[13] || '';
    const receitaC = parseCurrency(row[16]);
    const receitaT = parseCurrency(row[17]);
    const receita = receitaC + receitaT;

    let status = 'lead_novo';
    if (ganhou === 'Ganha') status = 'venda_fechada';
    else if (ganhou === 'Perdida') status = 'perdida';
    else if (compareceu === 'Compareceu') status = 'compareceu';
    else if (agendou === 'Agendado') status = 'agendado';

    return { agendou, compareceu, ganhou, receita, status };
  }, []);

  const fetchData = useCallback(async (client, selectedYear, selectedMonth) => {
    if (!client) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/sheets?sid=${client.sid}&sheet=${encodeURIComponent(CRM_SHEET)}`);
      const json = await res.json();
      let rows = json.values || [];
      rows = rows.slice(1);

      // Salva todas as linhas antes de filtrar — usado para popular os dropdowns
      setAllRows(rows);

      if (selectedYear && selectedYear !== 'Todos') {
        rows = rows.filter(r => String(r[26] || r[0]?.match(/\b(20\d{2})\b/)?.[1] || "") === selectedYear);
      }
      if (selectedMonth && selectedMonth !== 'Todos') {
        const monthAbbr = MONTHS[parseInt(selectedMonth) - 1].toLowerCase().substring(0, 3) + ".";
        rows = rows.filter(r => (r[8] || "").toLowerCase().trim() === monthAbbr);
      }

      const allMesAgend = Array(12).fill(0);
      const allMesComp = Array(12).fill(0);
      const allMesFech = Array(12).fill(0);
      const allMesInv = Array(12).fill(0);

      rows.forEach(r => {
        const pipeline = getStatusPipeline(r);
        const mes = monthIndex(r);
        if (mes >= 0) {
          if (pipeline.status === 'agendado') allMesAgend[mes]++;
          if (pipeline.status === 'compareceu') allMesComp[mes]++;
          if (pipeline.status === 'venda_fechada') {
            allMesFech[mes]++;
            allMesInv[mes] += pipeline.receita;
          }
        }
      });

      const agend = rows.filter(r => getStatusPipeline(r).status === 'agendado' || getStatusPipeline(r).status === 'compareceu' || getStatusPipeline(r).status === 'venda_fechada').length;
      const comp = rows.filter(r => getStatusPipeline(r).status === 'compareceu' || getStatusPipeline(r).status === 'venda_fechada').length;
      const fech = rows.filter(r => getStatusPipeline(r).status === 'venda_fechada').length;
      const receita = rows.reduce((s, r) => s + getStatusPipeline(r).receita, 0);
      const ticket = fech > 0 ? receita / fech : 0;
      const taxaConv = agend > 0 ? (fech / agend) * 100 : 0;

      setData({ rows, total: rows.length, agend, comp, fech, receita, ticket, taxaConv, gasto: 0, meses_agend: allMesAgend, meses_comp: allMesComp, meses_fech: allMesFech, meses_inv: allMesInv });
    } catch (e) {
      console.error(e);
      setData({ rows: [], total: 0, agend: 0, comp: 0, fech: 0, receita: 0, ticket: 0, taxaConv: 0, gasto: 0, meses_agend: Array(12).fill(0), meses_comp: Array(12).fill(0), meses_fech: Array(12).fill(0), meses_inv: Array(12).fill(0) });
    } finally {
      setLoading(false);
    }
  }, [getStatusPipeline]);

  useEffect(() => {
    if (selected) fetchData(selected, year, month);
  }, [selected, year, month, fetchData]);

  useEffect(() => {
    if (typeof window === 'undefined' || !chartRef.current) return;
    import('chart.js').then(({ Chart, registerables }) => {
      Chart.register(...registerables);
      if (chartRef._chart) chartRef._chart.destroy();
      if (!data.meses_inv.some(v => v > 0)) return;
      chartRef._chart = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: MONTHS,
          datasets: [
            { label: 'Receita', data: data.meses_inv, borderColor: COLORS[2], backgroundColor: COLORS[2] + '22', fill: true, tension: 0.3, pointRadius: 2 },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#8ba3d4', font: { size: 10 } } } }, scales: { x: { ticks: { color: '#6b7fa3', font: { size: 9 } } }, y: { ticks: { color: '#6b7fa3', font: { size: 9 } } } } },
      });
    });
  }, [data]);

  // Usa allRows (dados completos sem filtro) para que os dropdowns
  // mostrem TODAS as opções do cliente, independente do filtro ativo.
  const uniqueYears = ["Todos", ...new Set(allRows.map(r => String(r[26] || r[0]?.match(/\b(20\d{2})\b/)?.[1] || "")).filter(Boolean))].slice(0, 6);
  const uniqueMonths = ["Todos", ...new Set(allRows.map(r => monthIndex(r) + 1).filter(m => m > 0))].sort((a, b) => {
    if (a === 'Todos') return -1; if (b === 'Todos') return 1;
    return a - b;
  });

  return (
    <div style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8f0ff', fontFamily: 'system-ui, sans-serif', width: '100%', maxWidth: '100%' }}>
      <div style={{ padding: '14px 24px', background: '#111827', borderBottom: '1px solid rgba(99,179,237,.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#4f8ef7' }}>Mesus Media</span>
        <span style={{ fontSize: '12px', color: '#6b7fa3' }}>CRM Dashboard {selected ? '— ' + selected.name : ''}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select value={year} onChange={e => setYear(e.target.value)}
            style={{ background: '#141d2e', border: '1px solid rgba(99,179,237,.13)', color: '#6b7fa3', padding: '4px 8px', borderRadius: '7px', fontSize: '10px', cursor: 'pointer', outline: 'none' }}>
            {uniqueYears.map(y => <option key={y} value={y}>{y === 'Todos' ? 'Todos os Anos' : y}</option>)}
          </select>
          <select value={month} onChange={e => setMonth(e.target.value)}
            style={{ background: '#141d2e', border: '1px solid rgba(99,179,237,.13)', color: '#6b7fa3', padding: '4px 8px', borderRadius: '7px', fontSize: '10px', cursor: 'pointer', outline: 'none' }}>
            {uniqueMonths.map(m => <option key={m} value={m}>{m === 'Todos' ? 'Todos os Meses' : MONTHS[parseInt(m) - 1] || m}</option>)}
          </select>
          {selected && <button onClick={() => fetchData(selected, year, month)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', border: '1px solid rgba(99,179,237,.28)', color: '#38bdf8', padding: '5px 12px', borderRadius: '7px', fontSize: '11px', cursor: 'pointer' }}>&#8635; Atualizar</button>}
        </div>
      </div>

      <div style={{ padding: '20px 24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#6b7fa3', marginBottom: '8px' }}>Selecionar cliente</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
          {CLIENTS.map(c => (
            <button key={c.id} onClick={() => {
              if (c.id !== selected?.id) {
                // Reseta os filtros ao trocar de cliente para evitar
                // que filtros do cliente anterior causem resultado zerado
                setYear("Todos");
                setMonth("Todos");
                setAllRows([]);
              }
              setSelected(c);
            }}
              style={{
                padding: '4px 10px', borderRadius: '18px', fontSize: '10px', fontWeight: 500, cursor: 'pointer', transition: 'all .15s', flexShrink: 0,
                background: selected?.id === c.id ? '#1e2d4a' : '#141d2e',
                border: selected?.id === c.id ? '1px solid rgba(79,142,247,.4)' : '1px solid rgba(99,179,237,.13)',
                color: selected?.id === c.id ? '#8bb8ff' : '#6b7fa3'
              }}>
              {c.name}
            </button>
          ))}
        </div>

        {!selected && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '7px 12px', background: '#141d2e', border: '1px solid rgba(99,179,237,.12)', borderRadius: '8px', fontSize: '11px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6b7fa3' }}></div>
              <span style={{ color: '#6b7fa3', flex: 1 }}>Selecione um cliente</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '280px', border: '1px dashed rgba(99,179,237,.12)', borderRadius: '14px', color: '#6b7fa3', fontSize: '13px' }}>
              Selecione um cliente para ver o dashboard
            </div>
          </>
        )}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#6b7fa3' }}>
            Carregando dados...
          </div>
        )}

        {selected && !loading && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Total Leads', value: fmtn(data.total), color: '#4f8ef7' },
                { label: 'Agendamentos', value: fmtn(data.agend), color: '#4f8ef7' },
                { label: 'Comparecimentos', value: fmtn(data.comp), color: '#f7a84f' },
                { label: 'Vendas', value: fmtn(data.fech), color: '#4fcf7a' },
                { label: 'Receita', value: fmt(data.receita), color: '#4fcf7a' },
                { label: 'Ticket Médio', value: fmt(data.ticket), color: '#a84ff7' },
                { label: 'Taxa Conversão', value: data.taxaConv.toFixed(1) + '%', color: '#f7a84f' },
              ].map(kpi => (
                <div key={kpi.label} style={{ background: '#111827', border: '1px solid rgba(99,179,237,.08)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#6b7fa3', marginBottom: '8px' }}>{kpi.label}</div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#6b7fa3' }}>Desempenho por</span>
              {["Campanha", "Conjunto", "Anúncio", "Criativo", "SourceID", "Plataforma"].map(d => (
                <button key={d} onClick={() => setDim(d)}
                  style={{
                    padding: '3px 10px', borderRadius: '14px', fontSize: '10px', fontWeight: 500, cursor: 'pointer',
                    background: dim === d ? '#1e2d4a' : '#141d2e',
                    border: dim === d ? '1px solid rgba(79,142,247,.4)' : '1px solid rgba(99,179,237,.13)',
                    color: dim === d ? '#8bb8ff' : '#6b7fa3'
                  }}>
                  {d}
                </button>
              ))}
            </div>
            {(() => {
              const DIM_COL = { Campanha: 18, Conjunto: 19, Anúncio: 20, Criativo: 21, SourceID: 22, Plataforma: 23 };
              const groups = {};
              data.rows.forEach(r => {
                const val = (r[DIM_COL[dim]] || "").trim();
                if (!val) return;
                if (!groups[val]) groups[val] = { leads: 0, agend: 0, comp: 0, vendas: 0, receita: 0 };
                groups[val].leads++;
                const p = getStatusPipeline(r);
                if (p.status === 'agendado' || p.status === 'compareceu' || p.status === 'venda_fechada') groups[val].agend++;
                if (p.status === 'compareceu' || p.status === 'venda_fechada') groups[val].comp++;
                if (p.status === 'venda_fechada') { groups[val].vendas++; groups[val].receita += p.receita; }
              });
              const sorted = Object.entries(groups).sort((a, b) => b[1].leads - a[1].leads);
              if (sorted.length === 0) return null;
              return (
                <div style={{ background: '#111827', border: '1px solid rgba(99,179,237,.08)', borderRadius: '14px', padding: '16px', overflowX: 'auto', marginBottom: '20px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(99,179,237,.08)', color: '#6b7fa3', fontSize: '9px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', textAlign: 'left' }}>
                        <th style={{ padding: '6px 10px' }}>{dim}</th>
                        <th style={{ padding: '6px 10px' }}>Leads</th>
                        <th style={{ padding: '6px 10px' }}>Agend.</th>
                        <th style={{ padding: '6px 10px' }}>Comp.</th>
                        <th style={{ padding: '6px 10px' }}>Vendas</th>
                        <th style={{ padding: '6px 10px' }}>Receita</th>
                        <th style={{ padding: '6px 10px' }}>Tx Agend</th>
                        <th style={{ padding: '6px 10px' }}>Tx Comp</th>
                        <th style={{ padding: '6px 10px' }}>Tx Conv</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map(([name, g]) => (
                        <tr key={name} style={{ borderBottom: '1px solid rgba(99,179,237,.04)' }}>
                          <td style={{ padding: '6px 10px', color: '#8bb8ff', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={name}>{name}</td>
                          <td style={{ padding: '6px 10px' }}>{fmtn(g.leads)}</td>
                          <td style={{ padding: '6px 10px' }}>{fmtn(g.agend)}</td>
                          <td style={{ padding: '6px 10px' }}>{fmtn(g.comp)}</td>
                          <td style={{ padding: '6px 10px', color: g.vendas > 0 ? '#4fcf7a' : '#6b7fa3' }}>{fmtn(g.vendas)}</td>
                          <td style={{ padding: '6px 10px', color: g.receita > 0 ? '#4fcf7a' : '#6b7fa3' }}>{fmt(g.receita)}</td>
                          <td style={{ padding: '6px 10px' }}>{g.leads > 0 ? fmtpct(g.agend / g.leads * 100) : '-'}</td>
                          <td style={{ padding: '6px 10px' }}>{g.agend > 0 ? fmtpct(g.comp / g.agend * 100) : '-'}</td>
                          <td style={{ padding: '6px 10px' }}>{g.comp > 0 ? fmtpct(g.vendas / g.comp * 100) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
            <div style={{ background: '#111827', border: '1px solid rgba(99,179,237,.08)', borderRadius: '14px', padding: '20px', height: '260px', marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#6b7fa3', marginBottom: '12px' }}>Receita Mensal</div>
              <div style={{ height: '200px' }}><canvas ref={chartRef} /></div>
            </div>

            {data.rows.length > 0 && (
              <div style={{ background: '#111827', border: '1px solid rgba(99,179,237,.08)', borderRadius: '14px', padding: '20px', overflowX: 'auto' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#6b7fa3', marginBottom: '12px' }}>Leads Recentes</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(99,179,237,.08)', color: '#6b7fa3', fontSize: '9px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px' }}>Data</th>
                      <th style={{ padding: '8px 12px' }}>Nome</th>
                      <th style={{ padding: '8px 12px' }}>Status</th>
                      <th style={{ padding: '8px 12px' }}>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.slice(0, 30).map((r, i) => {
                      const pipeline = getStatusPipeline(r);
                      const statusLabel = { lead_novo: 'Lead Novo', agendado: 'Agendado', compareceu: 'Compareceu', venda_fechada: 'Venda', perdida: 'Perdida' }[pipeline.status] || 'Lead Novo';
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(99,179,237,.04)' }}>
                          <td style={{ padding: '8px 12px', color: '#6b7fa3' }}>{r[0]?.substring(0, 10)}</td>
                          <td style={{ padding: '8px 12px' }}>{r[2]}</td>
                          <td style={{ padding: '8px 12px' }}>{statusLabel}</td>
                          <td style={{ padding: '8px 12px', color: pipeline.status === 'venda_fechada' ? '#4fcf7a' : '#6b7fa3' }}>{pipeline.receita > 0 ? fmt(pipeline.receita) : '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
