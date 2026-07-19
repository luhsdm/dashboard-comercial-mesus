import { requireAuth } from '@/lib/permissions';
import Link from 'next/link';

const INTEGRATIONS = [
  { name: 'Meta Ads', description: 'Facebook e Instagram Ads', href: '/integrations/meta', status: 'available' },
  { name: 'Google Ads', description: 'Campanhas do Google Ads', href: '/integrations/google-ads', status: 'available' },
  { name: 'WhatsApp', description: 'API Oficial Meta Cloud', href: '/settings/whatsapp', status: 'available' },
  { name: 'Instagram', description: 'Publicação e Analytics', href: '/instagram', status: 'available' },
];

export default async function IntegrationsPage() {
  await requireAuth();

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Integrações</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {INTEGRATIONS.map((int) => (
          <Link key={int.name} href={int.href}>
            <div className="card hover:border-brand-400/20 transition-colors cursor-pointer">
              <div className="text-sm font-medium">{int.name}</div>
              <div className="text-[10px] text-brand-50/30 mt-1">{int.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
