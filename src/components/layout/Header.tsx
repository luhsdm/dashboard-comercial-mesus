'use client';

import { signOut, useSession } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="h-12 bg-brand-800 border-b border-brand-400/10 flex items-center justify-between px-5">
      <div className="text-xs text-brand-50/40">
        {(session?.user as any)?.tenantName || 'Dashboard'}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-brand-50/40">{session?.user?.name}</span>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-[10px] text-brand-50/30 hover:text-red-400 transition-colors"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
