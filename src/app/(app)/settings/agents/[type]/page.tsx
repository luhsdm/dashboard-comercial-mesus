'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const TYPE_LABELS: Record<string, string> = {
  pre_qualification: 'Pré-Qualificação',
  kanban_mover: 'Kanban Mover',
  instagram: 'Instagram Agent',
};

export default function AgentConfigPage() {
  const params = useParams();
  const type = params.type as string;

  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-4o-mini');
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/settings/agents/${type}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, model, apiKey, prompt, temperature, maxTokens }),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-bold mb-4">{TYPE_LABELS[type] || type}</h1>
      <div className="card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="label">Provider</div>
            <select value={provider} onChange={(e) => setProvider(e.target.value)} className="input">
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="custom">Custom (OpenAI-compatible)</option>
            </select>
          </div>
          <div>
            <div className="label">Modelo</div>
            <input type="text" value={model} onChange={(e) => setModel(e.target.value)} className="input" />
          </div>
        </div>
        <div>
          <div className="label">API Key</div>
          <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="input" />
        </div>
        <div>
          <div className="label">System Prompt</div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={8}
            className="input font-mono text-[11px]"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="label">Temperatura ({temperature})</div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <div className="label">Max Tokens</div>
            <input type="number" value={maxTokens} onChange={(e) => setMaxTokens(parseInt(e.target.value))} className="input" />
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
          {saving ? 'Salvando...' : 'Salvar Configuração'}
        </button>
      </div>
    </div>
  );
}
