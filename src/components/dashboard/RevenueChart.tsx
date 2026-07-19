'use client';

import { useEffect, useRef } from 'react';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function RevenueChart({ monthlyRevenue }: { monthlyRevenue: number[] }) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !chartRef.current) return;

    import('chart.js').then(({ Chart, registerables }) => {
      Chart.register(...registerables);
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
      if (!monthlyRevenue.some((v) => v > 0)) return;

      chartInstanceRef.current = new Chart(chartRef.current!, {
        type: 'line',
        data: {
          labels: MONTHS,
          datasets: [
            {
              label: 'Receita',
              data: monthlyRevenue,
              borderColor: '#4fcf7a',
              backgroundColor: 'rgba(79,207,122,0.08)',
              fill: true,
              tension: 0.3,
              pointRadius: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#8ba3d4', font: { size: 10 } } } },
          scales: {
            x: { ticks: { color: '#6b7fa3', font: { size: 9 } }, grid: { color: 'rgba(99,179,237,0.06)' } },
            y: { ticks: { color: '#6b7fa3', font: { size: 9 } }, grid: { color: 'rgba(99,179,237,0.06)' } },
          },
        },
      });
    });

    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, [monthlyRevenue]);

  return (
    <div className="card mb-5">
      <div className="label">Receita Mensal</div>
      <div className="h-[200px]">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
}
