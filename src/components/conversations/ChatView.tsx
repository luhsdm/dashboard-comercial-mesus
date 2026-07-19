'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  content: string;
  agentGenerated: boolean;
  createdAt: string;
}

interface ChatViewProps {
  conversationId: string;
  initialMessages: Message[];
  contactName: string;
}

export default function ChatView({ conversationId, initialMessages, contactName }: ChatViewProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!text.trim() || sending) return;
    setSending(true);

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setText('');
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="border-b border-brand-400/10 pb-3 mb-3">
        <span className="text-sm font-bold">{contactName}</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[70%] rounded-xl px-3 py-2 text-xs ${
                msg.direction === 'OUTBOUND'
                  ? 'bg-brand-500/20 text-brand-200'
                  : 'bg-brand-800/60 text-brand-50'
              }`}
            >
              {msg.content}
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[9px] text-brand-50/20">
                  {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.agentGenerated && <span className="text-[9px] text-brand-400/40">IA</span>}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 mt-3 pt-3 border-t border-brand-400/10">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Digite sua mensagem..."
          className="input flex-1"
          disabled={sending}
        />
        <button onClick={handleSend} disabled={sending} className="btn-primary">
          {sending ? '...' : 'Enviar'}
        </button>
      </div>
    </div>
  );
}
