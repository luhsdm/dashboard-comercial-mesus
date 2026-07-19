import { requireAuth } from '@/lib/permissions';
import { prisma } from '@/lib/db';

const AGENT_TYPE_LABELS: Record<string, string> = {
  PRE_QUALIFICATION: 'Pré-Qualificação',
  KANBAN_MOVER: 'Kanban Mover',
  INSTAGRAM: 'Instagram',
};

export default async function PromptsPage() {
  const user = await requireAuth();

  const templates = await prisma.promptTemplate.findMany({
    orderBy: [{ isBuiltIn: 'desc' }, { name: 'asc' }],
  });

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Biblioteca de Prompts</h1>
      {templates.length === 0 ? (
        <div className="card text-center py-10 text-brand-50/40">
          Nenhum template de prompt disponível. Execute o seed para carregar os templates padrão.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((t) => (
            <div key={t.id} className="card">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">{t.name}</span>
                {t.isBuiltIn && (
                  <span className="text-[9px] bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full">
                    Built-in
                  </span>
                )}
              </div>
              {t.description && <div className="text-[10px] text-brand-50/40 mb-2">{t.description}</div>}
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-brand-400">{AGENT_TYPE_LABELS[t.agentType] || t.agentType}</span>
                {t.industry && <span className="text-brand-50/30">— {t.industry}</span>}
                <span className="ml-auto text-brand-50/20">v{t.version}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
