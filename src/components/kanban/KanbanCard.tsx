'use client';

interface KanbanCardProps {
  id: string;
  name: string;
  phone?: string | null;
  campaign?: string | null;
  qualificationScore?: number | null;
}

export default function KanbanCard({ name, phone, campaign, qualificationScore }: KanbanCardProps) {
  return (
    <div className="bg-brand-800/80 border border-brand-400/10 rounded-lg p-3 mb-2 cursor-grab active:cursor-grabbing hover:border-brand-400/20 transition-colors">
      <div className="text-xs font-medium text-brand-50 truncate">{name}</div>
      {phone && <div className="text-[10px] text-brand-50/40 mt-1">{phone}</div>}
      {campaign && <div className="text-[10px] text-brand-50/30 mt-1 truncate">{campaign}</div>}
      {qualificationScore != null && (
        <div className="mt-2 flex items-center gap-1">
          <div className="h-1 flex-1 bg-brand-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-400 rounded-full transition-all"
              style={{ width: `${Math.min(qualificationScore * 10, 100)}%` }}
            />
          </div>
          <span className="text-[9px] text-brand-50/30">{qualificationScore}/10</span>
        </div>
      )}
    </div>
  );
}
