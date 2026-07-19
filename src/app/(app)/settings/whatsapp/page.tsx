'use client';

import { useState } from 'react';

export default function WhatsAppSettingsPage() {
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [wabaId, setWabaId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!phoneNumberId || !wabaId || !accessToken) return;
    setSaving(true);
    try {
      const res = await fetch('/api/settings/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumberId, wabaId, accessToken }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-bold mb-4">WhatsApp Business</h1>
      <div className="card space-y-4">
        <div className="text-xs text-brand-50/40 mb-2">
          Configure sua conta da API oficial do WhatsApp Cloud (Meta Business).
        </div>
        <div>
          <div className="label">Phone Number ID</div>
          <input type="text" value={phoneNumberId} onChange={(e) => setPhoneNumberId(e.target.value)} className="input" />
        </div>
        <div>
          <div className="label">WABA ID</div>
          <input type="text" value={wabaId} onChange={(e) => setWabaId(e.target.value)} className="input" />
        </div>
        <div>
          <div className="label">Access Token</div>
          <input type="password" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} className="input" />
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
          {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar'}
        </button>
      </div>
    </div>
  );
}
