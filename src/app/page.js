'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { CLIENTS, MONTHS } from './data';

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

function parseCurrency(v) {
  if (!v) return 0;
  const num = parseFloat(String(v).replace(/[R$\s.]/g, '').replace(',', '.'));
  return isNaN(num) ? 0 : num;
}

export default function Home() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ rows: [], total: 0, agend: 0, comp: 0, fech: 0, receita: 0, ticket: 0, taxaConv: 0, gasto: 0, meses_agend: [], meses_comp: [], meses_fech: [], meses_inv: [] });
  const [year, setYear] = useState("Todos");
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const chartRef2 = useRef(null);
  const chartInstance2 = useRef(null);

  const getStatusPipeline = useCallback((row) => {
    const agendou = row[8] || '';
    const compareceu = row[10] || '';
    const ganhou = row[11] || '';
    const receitaC = parseCurrency(row[13]);
    const receitaT = parseCurrency(row[14]);
    const receita = receitaC + receitaT;

    let status = 'lead_novo';
    if (ganhou === 'Ganha') status = 'venda_fechada';
    else if (ganhou === 'Perdida') status = 'perdida';
    else if (compareceu === 'Compareceu') status = 'compareceu';
    else if (agendou === 'Agendado') status = 'agendado';

    return { agendou, compareceu, ganhou, receita, status };
  }, []);

  const fetchData = useCallback(async (client, selectedYear) => {
    if (!client) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/sheets?sid=${client.sid}&sheet=${encodeURIComponent(CRM_SHEET)}`);
      const json = await res.json();
      const rows = json.values || [];

      let filtered = rows.slice(1);

      if (selectedYear && selectedYear !== 'Todos') {
        filtered = filtered.filter(r => String(r[17]) === selectedYear);
      }

      const mesAgend = Array(12).fill(0);
      const mesComp = Array(12).fill(0);
      const mesFech = Array(12).fill(0);
      const mesInv = Array(12).fill(0);

      filtered.forEach(r => {
        const pipeline = getStatusPipeline(r);
        const mes = parseInt(r[16]) - 1;
        if (mes >= 0 && mes < 12) {
          if (pipeline.status === 'agendado' || r[20]) mesAgend[mes]++;
          if (pipeline.status === 'compareceu' || r[21]) mesComp[mes]++;
          if (pipeline.status === 'venda_fechada') {
            mesFech[mes]++;
            mesInv[mes] += pipeline.receita;
          }
        }
      });

      const agend = filtered.filter(r => getStatusPipeline(r).status === 'agendado' || getStatusPipeline(r).status === 'compareceu' || getStatusPipeline(r).status === 'venda_fechada').length;
      const comp = filtered.filter(r => getStatusPipeline(r).status === 'compareceu' || getStatusPipeline(r).status === 'venda_fechada').length;
      const fech = filtered.filter(r => getStatusPipeline(r).status === 'venda_fechada').length;
      const receita = filtered.reduce((s, r) => s + getStatusPipeline(r).receita, 0);
      const ticket = fech > 0 ? receita / fech : 0;
      const taxaConv = agend > 0 ? (fech / agend) * 100 : 0;

      setData({ rows: filtered, total: filtered.length, agend, comp, fech, receita, ticket, taxaConv, gasto: 0, meses_agend: mesAgend, meses_comp: mesComp, meses_fech: mesFech, meses_inv: mesInv });
    } catch (e) {
      console.error(e);
      setData({ rows: [], total: 0, agend: 0, comp: 0, fech: 0, receita: 0, ticket: 0, taxaConv: 0, gasto: 0, meses_agend: Array(12).fill(0), meses_comp: Array(12).fill(0), meses_fech: Array(12).fill(0), meses_inv: Array(12).fill(0) });
    } finally {
      setLoading(false);
    }
  }, [getStatusPipeline]);

  useEffect(() => {
    if (selected) fetchData(selected, year);
  }, [selected, year, fetchData]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('chart.js').then(({ Chart, registerables }) => {
      Chart.register(...registerables);

      if (chartInstance.current) chartInstance.current.destroy();
      if (chartInstance2.current) chartInstance2.current.destroy();

      if (chartRef.current && data.meses_agend.some(v => v > 0)) {
        chartInstance.current = new Chart(chartRef.current, {
          type: 'bar',
          data: {
            labels: MONTHS,
            datasets: [
              { label: 'Agendamentos', data: data.meses_agend, backgroundColor: COLORS[0] + '88', borderColor: COLORS[0], borderWidth: 1 },
              { label: 'Comparecimentos', data: data.meses_comp, backgroundColor: COLORS[1] + '88', borderColor: COLORS[1], borderWidth: 1 },
              { label: 'Vendas', data: data.meses_fech, backgroundColor: COLORS[2] + '88', borderColor: COLORS[2], borderWidth: 1 },
            ],
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#8ba3d4', font: { size: 10 } } } }, scales: { x: { ticks: { color: '#6b7fa3', font: { size: 9 } } }, y: { ticks: { color: '#6b7fa3', font: { size: 9 } } } } },
        });
      }

      if (chartRef2.current && data.meses_inv.some(v => v > 0)) {
        chartInstance2.current = new Chart(chartRef2.current, {
          type: 'line',
          data: {
            labels: MONTHS,
            datasets: [
              { label: 'Receita', data: data.meses_inv, borderColor: COLORS[2], backgroundColor: COLORS[2] + '22', fill: true, tension: 0.3, pointRadius: 2 },
            ],
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#8ba3d4', font: { size: 10 } } } }, scales: { x: { ticks: { color: '#6b7fa3', font: { size: 9 } } }, y: { ticks: { color: '#6b7fa3', font: { size: 9 } } } } },
        });
      }
    });
  }, [data]);

  const uniqueYears = ["Todos", ...new Set(data.rows.map(r => String(r[17])).filter(Boolean))].slice(0, 6);

  return (
    <div style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8f0ff', fontFamily: 'system-ui, sans-serif', width: '100%', maxWidth: '100%' }}>
      <div style={{ padding: '14px 24px', background: '#111827', borderBottom: '1px solid rgba(99,179,237,.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#4f8ef7' }}>Mesus Media</span>
        <span style={{ fontSize: '12px', color: '#6b7fa3' }}>CRM Dashboard {selected ? '— ' + selected.name : ''}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select value={year} onChange={e => setYear(e.target.value)}
            style={{ background: '#141d2e', border: '1px solid rgba(99,179,237,.13)', color: '#6b7fa3', padding: '4px 8px', borderRadius: '7px', fontSize: '10px', cursor: 'pointer', outline: 'none' }}>
            {uniqueYears.map(y => <option key={y} value={y}>{y === 'Todos' ? 'Todos' : y}</option>)}
          </select>
          {selected && <button onClick={() => fetchData(selected, year)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', border: '1px solid rgba(99,179,237,.28)', color: '#38bdf8', padding: '5px 12px', borderRadius: '7px', fontSize: '11px', cursor: 'pointer' }}>&#8635; Atualizar</button>}
        </div>
      </div>

      <div style={{ padding: '20px 24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#6b7fa3', marginBottom: '8px' }}>Selecionar cliente</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
          {CLIENTS.map(c => (
            <button key={c.id} onClick={() => setSelected(c)}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div style={{ background: '#111827', border: '1px solid rgba(99,179,237,.08)', borderRadius: '14px', padding: '20px', height: '260px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#6b7fa3', marginBottom: '12px' }}>Funil Mensal</div>
                <div style={{ height: '200px' }}><canvas ref={chartRef} /></div>
              </div>
              <div style={{ background: '#111827', border: '1px solid rgba(99,179,237,.08)', borderRadius: '14px', padding: '20px', height: '260px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#6b7fa3', marginBottom: '12px' }}>Receita Mensal</div>
                <div style={{ height: '200px' }}><canvas ref={chartRef2} /></div>
              </div>
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
