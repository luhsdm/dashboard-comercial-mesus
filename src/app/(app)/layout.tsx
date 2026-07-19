import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/permissions';
import SessionProvider from '@/components/providers/SessionProvider';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  return (
    <SessionProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-5 overflow-auto">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
