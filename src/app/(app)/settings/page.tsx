import { requireAuth } from '@/lib/permissions';
import Link from 'next/link';

const SETTINGS_SECTIONS = [
  { name: 'WhatsApp', description: 'Configurar conta WhatsApp Business', href: '/settings/whatsapp' },
  { name: 'Agentes IA', description: 'Configurar agentes de automação', href: '/settings/agents' },
  { name: 'LGPD', description: 'Consentimento, exportação e exclusão de dados', href: '/settings/lgpd' },
];

export default async function SettingsPage() {
  await requireAuth();

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Configurações</h1>
      <div className="space-y-2">
        {SETTINGS_SECTIONS.map((section) => (
          <Link key={section.name} href={section.href}>
            <div className="card hover:border-brand-400/20 transition-colors cursor-pointer">
              <div className="text-sm font-medium">{section.name}</div>
              <div className="text-[10px] text-brand-50/30 mt-1">{section.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
