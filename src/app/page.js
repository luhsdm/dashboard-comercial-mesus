'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { CLIENTS, MONTHS } from './data';

const COLORS = ["#4f8ef7", "#f7a84f", "#4fcf7a", "#f74f6f", "#a84ff7"];

function fmt(v) {
  if (v == null || isNaN(v)) return "R$ 0";
  return "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtn(v) {
  if (v == null || isNaN(v)) return "0";
  return Number(v).toLocaleString("pt-BR");
}

export default function Home() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ rows: [], agend: 0, comp: 0, fech: 0, receita: 0, ticket: 0, taxaConv: 0, gasto: 0, meses_agend: [], meses_comp: [], meses_fech: [], meses_gasto: [], meses_inv: [] });
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const chartRef2 = useRef(null);
  const chartInstance2 = useRef(null);

  const fetchData = useCallback(async (client) => {
    if (!client) return;
    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${client.sid}/values/Sheet1?key=${apiKey}`;
      const res = await fetch(url);
      const json = await res.json();
      const rows = json.values || [];

      const agend = rows.filter(r => r[6] === "Agendado" || r[6] === "Confirmado" || r[6] === "Reagendado").length;
      const comp = rows.filter(r => r[6] === "Compareceu" || r[6] === "Venda Fechada").length;
      const fech = rows.filter(r => r[6] === "Venda Fechada").length;
      const receita = rows.filter(r => r[6] === "Venda Fechada").reduce((s, r) => s + (parseFloat(r[7]) || 0), 0);
      const ticket = fech > 0 ? receita / fech : 0;
      const taxaConv = agend > 0 ? (fech / agend) * 100 : 0;
      const gasto = rows.reduce((s, r) => s + (parseFloat(r[8]) || 0), 0);

      const mesesAgend = Array(12).fill(0);
      const mesesComp = Array(12).fill(0);
      const mesesFech = Array(12).fill(0);
      const mesesGasto = Array(12).fill(0);
      const mesesInv = Array(12).fill(0);

      rows.forEach(r => {
        const d = new Date(r[0]);
        const m = d.getMonth();
        const status = r[6];
        if (status === "Agendado" || status === "Confirmado" || status === "Reagendado") mesesAgend[m]++;
        if (status === "Compareceu" || status === "Venda Fechada") mesesComp[m]++;
        if (status === "Venda Fechada") {
          mesesFech[m]++;
          mesesInv[m] += parseFloat(r[7]) || 0;
        }
        mesesGasto[m] += parseFloat(r[8]) || 0;
      });

      setData({ rows, agend, comp, fech, receita, ticket, taxaConv, gasto, meses_agend: mesesAgend, meses_comp: mesesComp, meses_fech: mesesFech, meses_gasto: mesesGasto, meses_inv: mesesInv });
    } catch (e) {
      console.error(e);
      setData({ rows: [], agend: 0, comp: 0, fech: 0, receita: 0, ticket: 0, taxaConv: 0, gasto: 0, meses_agend: Array(12).fill(0), meses_comp: Array(12).fill(0), meses_fech: Array(12).fill(0), meses_gasto: Array(12).fill(0), meses_inv: Array(12).fill(0) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selected) fetchData(selected);
  }, [selected, fetchData]);

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

      if (chartRef2.current && data.meses_gasto.some(v => v > 0)) {
        chartInstance2.current = new Chart(chartRef2.current, {
          type: 'line',
          data: {
            labels: MONTHS,
            datasets: [
              { label: 'Investimento', data: data.meses_gasto, borderColor: COLORS[3], backgroundColor: COLORS[3] + '22', fill: true, tension: 0.3, pointRadius: 2 },
              { label: 'Retorno', data: data.meses_inv, borderColor: COLORS[2], backgroundColor: COLORS[2] + '22', fill: true, tension: 0.3, pointRadius: 2 },
            ],
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#8ba3d4', font: { size: 10 } } } }, scales: { x: { ticks: { color: '#6b7fa3', font: { size: 9 } } }, y: { ticks: { color: '#6b7fa3', font: { size: 9 } } } } },
        });
      }
    });
  }, [data]);

  const handleClientClick = (client) => {
    setSelected(client);
  };

  const totalLeads = data.rows.length;

  return (
    <div style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8f0ff', fontFamily: 'system-ui, sans-serif', width: '100%', maxWidth: '100%' }}>
      <div style={{ padding: '14px 24px', background: '#111827', borderBottom: '1px solid rgba(99,179,237,.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#4f8ef7' }}>Mesus Media</span>
        <span style={{ fontSize: '12px', color: '#6b7fa3' }}>CRM Dashboard {selected ? '— ' + selected.name : ''}</span>
        {selected && <button onClick={() => fetchData(selected)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', border: '1px solid rgba(99,179,237,.28)', color: '#38bdf8', padding: '5px 12px', borderRadius: '7px', fontSize: '11px', cursor: 'pointer' }}>&#8635; Atualizar</button>}
      </div>

      <div style={{ padding: '20px 24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#6b7fa3', marginBottom: '8px' }}>Selecionar cliente</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
          {CLIENTS.map(c => (
            <button key={c.id} onClick={() => handleClientClick(c)}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '7px 12px', background: '#141d2e', border: '1px solid rgba(99,179,237,.12)', borderRadius: '8px', fontSize: '11px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6b7fa3' }}></div>
            <span style={{ color: '#6b7fa3', flex: 1 }}>Selecione um cliente</span>
          </div>
        )}

        {!selected && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '280px', border: '1px dashed rgba(99,179,237,.12)', borderRadius: '14px', color: '#6b7fa3', fontSize: '13px' }}>
            Selecione um cliente para ver o dashboard
          </div>
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
                { label: 'Total Leads', value: fmtn(totalLeads), color: '#4f8ef7' },
                { label: 'Agendamentos', value: fmtn(data.agend), color: '#4f8ef7' },
                { label: 'Comparecimentos', value: fmtn(data.comp), color: '#f7a84f' },
                { label: 'Vendas', value: fmtn(data.fech), color: '#4fcf7a' },
                { label: 'Receita', value: fmt(data.receita), color: '#4fcf7a' },
                { label: 'Ticket Médio', value: fmt(data.ticket), color: '#a84ff7' },
                { label: 'Taxa Conversão', value: data.taxaConv.toFixed(1) + '%', color: '#f7a84f' },
                { label: 'Investimento', value: fmt(data.gasto), color: '#f74f6f' },
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
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#6b7fa3', marginBottom: '12px' }}>Investimento vs Retorno</div>
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
                    {data.rows.slice(0, 20).map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(99,179,237,.04)' }}>
                        <td style={{ padding: '8px 12px', color: '#6b7fa3' }}>{r[0]?.substring(0, 10)}</td>
                        <td style={{ padding: '8px 12px' }}>{r[1]}</td>
                        <td style={{ padding: '8px 12px' }}>{r[6]}</td>
                        <td style={{ padding: '8px 12px', color: r[6] === 'Venda Fechada' ? '#4fcf7a' : '#6b7fa3' }}>{r[7] ? fmt(parseFloat(r[7])) : '-'}</td>
                      </tr>
                    ))}
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
