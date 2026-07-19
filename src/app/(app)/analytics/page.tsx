import { requireAuth } from '@/lib/permissions';
import { prisma } from '@/lib/db';

export default async function AnalyticsPage() {
  const user = await requireAuth();

  const clients = await prisma.client.findMany({
    where: { tenantId: user.tenantId },
    select: { id: true },
  });
  const clientIds = clients.map((c) => c.id);

  const [metaInsights, googleInsights, trackingEvents] = await Promise.all([
    prisma.campaignInsight.findMany({
      where: { metaAccount: { clientId: { in: clientIds } } },
      orderBy: { date: 'desc' },
      take: 100,
    }),
    prisma.googleAdInsight.findMany({
      where: { account: { clientId: { in: clientIds } } },
      orderBy: { date: 'desc' },
      take: 100,
    }),
    prisma.trackingEvent.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
  ]);

  const channels = [
    {
      name: 'Meta Ads',
      leads: metaInsights.reduce((s, i) => s + i.leads, 0),
      spend: metaInsights.reduce((s, i) => s + Number(i.spend), 0),
      clicks: metaInsights.reduce((s, i) => s + i.clicks, 0),
      impressions: metaInsights.reduce((s, i) => s + i.impressions, 0),
    },
    {
      name: 'Google Ads',
      leads: googleInsights.reduce((s, i) => s + i.conversions, 0),
      spend: googleInsights.reduce((s, i) => s + Number(i.spend), 0),
      clicks: googleInsights.reduce((s, i) => s + i.clicks, 0),
      impressions: googleInsights.reduce((s, i) => s + i.impressions, 0),
    },
  ];

  const utmChannels: Record<string, number> = {};
  for (const ev of trackingEvents) {
    const ch = ev.channel || 'direct';
    utmChannels[ch] = (utmChannels[ch] || 0) + 1;
  }

  function fmt(v: number) {
    return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Analítico Multicanal</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        {channels.map((ch) => (
          <div key={ch.name} className="card">
            <div className="text-sm font-bold mb-3">{ch.name}</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="label">Impressões</div>
                <div className="text-brand-300 font-bold">{ch.impressions.toLocaleString('pt-BR')}</div>
              </div>
              <div>
                <div className="label">Cliques</div>
                <div className="text-brand-300 font-bold">{ch.clicks.toLocaleString('pt-BR')}</div>
              </div>
              <div>
                <div className="label">Leads/Conv</div>
                <div className="text-emerald-400 font-bold">{ch.leads}</div>
              </div>
              <div>
                <div className="label">Investimento</div>
                <div className="text-amber-400 font-bold">{fmt(ch.spend)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="text-sm font-bold mb-3">Eventos por Canal (Tracking)</div>
        {Object.keys(utmChannels).length === 0 ? (
          <div className="text-xs text-brand-50/40">Nenhum evento de tracking registrado.</div>
        ) : (
          <div className="space-y-2">
            {Object.entries(utmChannels)
              .sort(([, a], [, b]) => b - a)
              .map(([channel, count]) => (
                <div key={channel} className="flex items-center justify-between text-xs">
                  <span className="text-brand-300">{channel}</span>
                  <span className="text-brand-50/40">{count} eventos</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
