'use client';

import { useState } from 'react';
import KanbanColumn from './KanbanColumn';

interface Stage {
  id: string;
  name: string;
  color: string;
  order: number;
}

interface Lead {
  id: string;
  name: string;
  phone?: string | null;
  campaign?: string | null;
  qualificationScore?: number | null;
  pipelineStageId?: string | null;
}

interface KanbanBoardProps {
  stages: Stage[];
  initialLeads: Lead[];
}

export default function KanbanBoard({ stages, initialLeads }: KanbanBoardProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [moving, setMoving] = useState<string | null>(null);

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  async function handleDrop(leadId: string, stageId: string) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.pipelineStageId === stageId) return;

    setMoving(leadId);
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, pipelineStageId: stageId } : l)));

    try {
      await fetch(`/api/leads/${leadId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId }),
      });
    } catch {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, pipelineStageId: lead.pipelineStageId } : l))
      );
    } finally {
      setMoving(null);
    }
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {sortedStages.map((stage) => (
        <KanbanColumn
          key={stage.id}
          stageId={stage.id}
          name={stage.name}
          color={stage.color}
          leads={leads.filter((l) => l.pipelineStageId === stage.id)}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}
