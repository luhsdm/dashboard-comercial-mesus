'use client';

import { useState } from 'react';

export default function InstagramCreatePage() {
  const [caption, setCaption] = useState('');
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    if (!topic.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/instagram/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, type: 'caption' }),
      });
      if (res.ok) {
        const data = await res.json();
        setCaption(data.suggestion || '');
      }
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-bold mb-4">Criar Post</h1>

      <div className="card mb-4">
        <div className="label">Gerar caption com IA</div>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Tema do post..."
            className="input flex-1"
          />
          <button onClick={handleGenerate} disabled={generating} className="btn-primary">
            {generating ? 'Gerando...' : 'Gerar'}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="label">Caption</div>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={6}
          className="input mt-2"
          placeholder="Escreva ou gere a caption..."
        />
        <div className="flex justify-end mt-3">
          <button className="btn-primary" disabled={!caption.trim()}>
            Agendar Post
          </button>
        </div>
      </div>
    </div>
  );
}
