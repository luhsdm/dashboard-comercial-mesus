'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PRODUCT_NAME, PRODUCT_TAGLINE } from '@/lib/config';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/kanban', label: 'Kanban', icon: '📋' },
  { href: '/conversations', label: 'Conversas', icon: '💬' },
  { href: '/instagram', label: 'Instagram', icon: '📸' },
  { href: '/clients', label: 'Clientes', icon: '👥' },
  { href: '/analytics', label: 'Analitico', icon: '📈' },
  { href: '/prompts', label: 'Prompts', icon: '🧠' },
  { href: '/integrations', label: 'Integrações', icon: '🔗' },
  { href: '/settings', label: 'Configurações', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-brand-800 border-r border-brand-400/10 min-h-screen flex flex-col">
      <div className="p-4 border-b border-brand-400/10">
        <span className="text-[10px] font-bold tracking-[.15em] uppercase text-brand-400">
          {PRODUCT_NAME}
        </span>
        <span className="text-[8px] text-brand-50/30 block mt-0.5">{PRODUCT_TAGLINE}</span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                active
                  ? 'bg-brand-400/10 text-brand-300'
                  : 'text-brand-50/40 hover:text-brand-300 hover:bg-brand-400/5'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-brand-400/10">
        <div className="text-[9px] text-brand-50/20 text-center">{PRODUCT_NAME} v2.0</div>
      </div>
    </aside>
  );
}
