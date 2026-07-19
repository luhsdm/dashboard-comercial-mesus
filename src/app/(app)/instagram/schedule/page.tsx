import { requireAuth } from '@/lib/permissions';
import { prisma } from '@/lib/db';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'text-brand-50/40',
  SCHEDULED: 'text-blue-400',
  PUBLISHED: 'text-emerald-400',
  FAILED: 'text-red-400',
};

export default async function InstagramSchedulePage() {
  const user = await requireAuth();

  const clients = await prisma.client.findMany({
    where: { tenantId: user.tenantId },
    include: { instagramAccount: true },
  });

  const accountIds = clients
    .filter((c) => c.instagramAccount)
    .map((c) => c.instagramAccount!.id);

  const posts = await prisma.scheduledPost.findMany({
    where: { accountId: { in: accountIds } },
    orderBy: { scheduledAt: 'desc' },
    take: 50,
    include: { account: { select: { username: true } } },
  });

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Agenda de Posts</h1>
      {posts.length === 0 ? (
        <div className="card text-center py-10 text-brand-50/40">Nenhum post agendado.</div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.id} className="card flex items-center justify-between">
              <div>
                <div className="text-xs font-medium truncate max-w-md">{post.caption}</div>
                <div className="text-[10px] text-brand-50/30 mt-1">
                  @{post.account.username} — {new Date(post.scheduledAt).toLocaleString('pt-BR')}
                  {post.aiGenerated && <span className="ml-2 text-brand-400/40">IA</span>}
                </div>
              </div>
              <span className={`text-[10px] font-medium ${STATUS_COLORS[post.status]}`}>
                {post.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
