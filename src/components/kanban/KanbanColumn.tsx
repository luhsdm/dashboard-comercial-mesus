'use client';

import KanbanCard from './KanbanCard';

interface Lead {
  id: string;
  name: string;
  phone?: string | null;
  campaign?: string | null;
  qualificationScore?: number | null;
}

interface KanbanColumnProps {
  stageId: string;
  name: string;
  color: string;
  leads: Lead[];
  onDrop: (leadId: string, stageId: string) => void;
}

export default function KanbanColumn({ stageId, name, color, leads, onDrop }: KanbanColumnProps) {
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.currentTarget.classList.add('bg-brand-700/20');
  }

  function handleDragLeave(e: React.DragEvent) {
    e.currentTarget.classList.remove('bg-brand-700/20');
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-brand-700/20');
    const leadId = e.dataTransfer.getData('text/plain');
    if (leadId) onDrop(leadId, stageId);
  }

  return (
    <div
      className="flex-shrink-0 w-64 bg-brand-900/40 border border-brand-400/10 rounded-xl flex flex-col max-h-[calc(100vh-10rem)]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-3 border-b border-brand-400/10 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-bold text-brand-50/70 uppercase tracking-wider">{name}</span>
        <span className="ml-auto text-[10px] text-brand-50/30 bg-brand-800/60 px-2 py-0.5 rounded-full">
          {leads.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {leads.map((lead) => (
          <div
            key={lead.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', lead.id)}
          >
            <KanbanCard {...lead} />
          </div>
        ))}
        {leads.length === 0 && (
          <div className="text-center text-[10px] text-brand-50/20 py-6">Nenhum lead</div>
        )}
      </div>
    </div>
  );
}
