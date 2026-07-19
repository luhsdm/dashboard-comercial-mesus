const META_API_VERSION = 'v21.0';
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export class InstagramClient {
  private accessToken: string;
  private igUserId: string;

  constructor(accessToken: string, igUserId: string) {
    this.accessToken = accessToken;
    this.igUserId = igUserId;
  }

  private async request<T>(endpoint: string, method = 'GET', body?: Record<string, any>): Promise<T> {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.set('access_token', this.accessToken);

    const options: RequestInit = { method };
    if (body && method === 'POST') {
      Object.entries(body).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    }

    const res = await fetch(url.toString(), options);
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Instagram API error ${res.status}: ${errBody}`);
    }
    return res.json();
  }

  async getAccountInfo(): Promise<any> {
    return this.request(`/${this.igUserId}`, 'GET');
  }

  async getMedia(limit = 25): Promise<any> {
    return this.request(`/${this.igUserId}/media?fields=id,caption,media_type,media_url,timestamp,like_count,comments_count&limit=${limit}`);
  }

  async getMediaInsights(mediaId: string): Promise<any> {
    return this.request(`/${mediaId}/insights?metric=impressions,reach,likes,comments,saves,shares`);
  }

  async getAccountInsights(period: 'day' | 'week' | 'days_28' = 'day'): Promise<any> {
    return this.request(`/${this.igUserId}/insights?metric=impressions,reach,profile_views,follower_count&period=${period}`);
  }

  async createMediaContainer(imageUrl: string, caption: string): Promise<{ id: string }> {
    return this.request(`/${this.igUserId}/media`, 'POST', {
      image_url: imageUrl,
      caption,
    });
  }

  async createVideoContainer(videoUrl: string, caption: string): Promise<{ id: string }> {
    return this.request(`/${this.igUserId}/media`, 'POST', {
      video_url: videoUrl,
      caption,
      media_type: 'REELS',
    });
  }

  async createCarouselItem(imageUrl: string): Promise<{ id: string }> {
    return this.request(`/${this.igUserId}/media`, 'POST', {
      image_url: imageUrl,
      is_carousel_item: 'true',
    });
  }

  async createCarouselContainer(childrenIds: string[], caption: string): Promise<{ id: string }> {
    return this.request(`/${this.igUserId}/media`, 'POST', {
      media_type: 'CAROUSEL',
      caption,
      children: childrenIds.join(','),
    });
  }

  async publishMedia(containerId: string): Promise<{ id: string }> {
    return this.request(`/${this.igUserId}/media_publish`, 'POST', {
      creation_id: containerId,
    });
  }

  async checkContainerStatus(containerId: string): Promise<any> {
    return this.request(`/${containerId}?fields=status_code,status`);
  }
}

export async function getInstagramAccountForPage(pageAccessToken: string, pageId: string): Promise<{ id: string; username: string } | null> {
  const res = await fetch(
    `${BASE_URL}/${pageId}?fields=instagram_business_account{id,username}&access_token=${pageAccessToken}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.instagram_business_account || null;
}
