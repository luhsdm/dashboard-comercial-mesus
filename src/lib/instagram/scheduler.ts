import { prisma } from '../db';
import { InstagramClient } from './client';

export async function publishDuePosts(): Promise<{ published: number; failed: number }> {
  const now = new Date();
  let published = 0;
  let failed = 0;

  const duePosts = await prisma.scheduledPost.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledAt: { lte: now },
    },
    include: { account: true },
  });

  for (const post of duePosts) {
    try {
      const ig = new InstagramClient(post.account.accessToken, post.account.igUserId);
      let containerId: string;

      if (post.mediaType === 'CAROUSEL' && post.mediaUrls.length > 1) {
        const childIds: string[] = [];
        for (const url of post.mediaUrls) {
          const child = await ig.createCarouselItem(url);
          childIds.push(child.id);
        }
        const container = await ig.createCarouselContainer(childIds, post.caption);
        containerId = container.id;
      } else if (post.mediaType === 'VIDEO') {
        const container = await ig.createVideoContainer(post.mediaUrls[0], post.caption);
        containerId = container.id;
      } else {
        const container = await ig.createMediaContainer(post.mediaUrls[0], post.caption);
        containerId = container.id;
      }

      // Wait for container to be ready (max 60s for videos)
      let ready = false;
      for (let i = 0; i < 12; i++) {
        const status = await ig.checkContainerStatus(containerId);
        if (status.status_code === 'FINISHED') { ready = true; break; }
        if (status.status_code === 'ERROR') throw new Error('Container processing failed');
        await new Promise(r => setTimeout(r, 5000));
      }

      if (!ready) throw new Error('Container processing timeout');

      const result = await ig.publishMedia(containerId);

      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: { status: 'PUBLISHED', publishedAt: new Date(), igMediaId: result.id },
      });
      published++;
    } catch (error) {
      console.error(`Failed to publish post ${post.id}:`, error);
      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: { status: 'FAILED' },
      });
      failed++;
    }
  }

  return { published, failed };
}

export async function syncPostInsights(accountId: string): Promise<number> {
  const account = await prisma.instagramAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) throw new Error('Instagram account not found');

  const ig = new InstagramClient(account.accessToken, account.igUserId);
  const media = await ig.getMedia(50);
  let synced = 0;

  for (const item of media.data || []) {
    try {
      const insights = await ig.getMediaInsights(item.id);
      const metrics: Record<string, number> = {};
      for (const m of insights.data || []) {
        metrics[m.name] = m.values?.[0]?.value || 0;
      }

      await prisma.postInsight.create({
        data: {
          accountId,
          igMediaId: item.id,
          impressions: metrics.impressions || 0,
          reach: metrics.reach || 0,
          likes: metrics.likes || item.like_count || 0,
          comments: metrics.comments || item.comments_count || 0,
          saves: metrics.saves || 0,
          shares: metrics.shares || 0,
          engagement: metrics.reach > 0
            ? ((metrics.likes || 0) + (metrics.comments || 0) + (metrics.saves || 0)) / metrics.reach * 100
            : 0,
        },
      });
      synced++;
    } catch {
      // Some media types don't support insights
    }
  }

  return synced;
}
