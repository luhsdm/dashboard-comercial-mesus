import { requireAuth } from '@/lib/permissions';
import { prisma } from '@/lib/db';
import Link from 'next/link';

const AGENT_TYPES = [
  { type: 'PRE_QUALIFICATION', label: 'Pré-Qualificação', description: 'Qualifica leads automaticamente via WhatsApp' },
  { type: 'KANBAN_MOVER', label: 'Kanban Mover', description: 'Move leads no pipeline baseado na qualificação' },
  { type: 'INSTAGRAM', label: 'Instagram Agent', description: 'Gera captions e sugestões de conteúdo' },
];

export default async function AgentsSettingsPage() {
  const user = await requireAuth();

  const configs = await prisma.agentConfig.findMany({
    where: { tenantId: user.tenantId },
  });

  const configMap = new Map(configs.map((c) => [c.type, c]));

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Agentes IA</h1>
      <div className="space-y-3">
        {AGENT_TYPES.map((agent) => {
          const config = configMap.get(agent.type as any);
          return (
            <Link key={agent.type} href={`/settings/agents/${agent.type.toLowerCase()}`}>
              <div className="card flex items-center justify-between hover:border-brand-400/20 transition-colors cursor-pointer">
                <div>
                  <div className="text-sm font-medium">{agent.label}</div>
                  <div className="text-[10px] text-brand-50/30 mt-1">{agent.description}</div>
                  {config && (
                    <div className="text-[10px] text-brand-50/20 mt-1">
                      {config.llmProvider}/{config.llmModel}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {config ? (
                    <span className={`text-[10px] font-medium ${config.active ? 'text-emerald-400' : 'text-brand-50/30'}`}>
                      {config.active ? 'Ativo' : 'Inativo'}
                    </span>
                  ) : (
                    <span className="text-[10px] text-brand-50/20">Não configurado</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
