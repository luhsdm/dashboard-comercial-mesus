'use client';

import { useState } from 'react';

export default function LgpdSettingsPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleExport() {
    if (!phone.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/lgpd/data-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(JSON.stringify(data, null, 2));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!phone.trim()) return;
    if (!confirm('Tem certeza? Esta ação é irreversível.')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/lgpd/data-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(`Dados deletados: ${data.deleted} leads removidos.`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-bold mb-4">LGPD</h1>

      <div className="card mb-4">
        <div className="text-xs text-brand-50/40 mb-3">
          Gerencie dados de contatos conforme a Lei Geral de Proteção de Dados. Exporte ou exclua dados por telefone.
        </div>
        <div>
          <div className="label">Telefone do contato</div>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+5511999999999"
            className="input"
          />
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={handleExport} disabled={loading} className="btn-secondary flex-1">
            Exportar Dados
          </button>
          <button onClick={handleDelete} disabled={loading} className="btn-primary flex-1 !bg-red-600 hover:!bg-red-700">
            Excluir Dados
          </button>
        </div>
      </div>

      {result && (
        <div className="card">
          <div className="label mb-2">Resultado</div>
          <pre className="text-[10px] text-brand-50/60 overflow-x-auto whitespace-pre-wrap max-h-96">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
