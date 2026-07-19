import { prisma } from '../db';
import { MetaApiClient } from './client';

export async function syncAccountInsights(metaAccountId: string): Promise<{ synced: number }> {
  const account = await prisma.metaAdAccount.findUnique({
    where: { id: metaAccountId },
  });

  if (!account) throw new Error('Meta account not found');

  const client = new MetaApiClient(account.accessToken);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const dateFrom = thirtyDaysAgo.toISOString().split('T')[0];
  const dateTo = now.toISOString().split('T')[0];

  const insightsResponse = await client.getInsights(account.accountId, dateFrom, dateTo);
  const insights = insightsResponse.data || [];
  let synced = 0;

  for (const insight of insights) {
    const leadActions = (insight.actions || []).find(
      (a: any) => a.action_type === 'lead' || a.action_type === 'onsite_conversion.lead_grouped'
    );

    await prisma.campaignInsight.upsert({
      where: {
        metaAccountId_date_campaignId_adSetId_adId: {
          metaAccountId: account.id,
          date: new Date(insight.date_start),
          campaignId: insight.campaign_id,
          adSetId: insight.adset_id || '',
          adId: insight.ad_id || '',
        },
      },
      create: {
        metaAccountId: account.id,
        date: new Date(insight.date_start),
        campaignId: insight.campaign_id,
        campaignName: insight.campaign_name,
        adSetId: insight.adset_id || null,
        adSetName: insight.adset_name || null,
        adId: insight.ad_id || null,
        adName: insight.ad_name || null,
        impressions: parseInt(insight.impressions) || 0,
        clicks: parseInt(insight.clicks) || 0,
        spend: parseFloat(insight.spend) || 0,
        leads: parseInt(leadActions?.value || '0'),
        reach: parseInt(insight.reach) || 0,
      },
      update: {
        campaignName: insight.campaign_name,
        adSetName: insight.adset_name || null,
        adName: insight.ad_name || null,
        impressions: parseInt(insight.impressions) || 0,
        clicks: parseInt(insight.clicks) || 0,
        spend: parseFloat(insight.spend) || 0,
        leads: parseInt(leadActions?.value || '0'),
        reach: parseInt(insight.reach) || 0,
      },
    });
    synced++;
  }

  await prisma.metaAdAccount.update({
    where: { id: metaAccountId },
    data: { lastSyncAt: new Date() },
  });

  return { synced };
}

export async function syncAllAccounts(): Promise<void> {
  const accounts = await prisma.metaAdAccount.findMany({
    where: { status: 'active' },
  });

  for (const account of accounts) {
    try {
      await syncAccountInsights(account.id);
    } catch (error) {
      console.error(`Sync failed for account ${account.id}:`, error);
    }
  }
}
