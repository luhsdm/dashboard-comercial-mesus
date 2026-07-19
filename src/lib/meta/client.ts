const META_API_VERSION = 'v21.0';
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export class MetaApiClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${META_BASE_URL}${endpoint}`);
    url.searchParams.set('access_token', this.accessToken);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));

      const res = await fetch(url.toString());
      if (res.ok) return res.json();

      if (res.status === 429) {
        lastError = new Error(`Rate limited (attempt ${attempt + 1})`);
        continue;
      }

      const body = await res.text();
      throw new Error(`Meta API error ${res.status}: ${body}`);
    }

    throw lastError || new Error('Meta API request failed');
  }

  async getAdAccounts(): Promise<any> {
    return this.request('/me/adaccounts', {
      fields: 'id,account_id,name,currency,account_status',
    });
  }

  async getCampaigns(accountId: string): Promise<any> {
    return this.request(`/${accountId}/campaigns`, {
      fields: 'id,name,status,objective,daily_budget,lifetime_budget',
      limit: '100',
    });
  }

  async getInsights(accountId: string, dateFrom: string, dateTo: string): Promise<any> {
    return this.request(`/${accountId}/insights`, {
      fields: 'campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,impressions,clicks,spend,reach,actions',
      time_range: JSON.stringify({ since: dateFrom, until: dateTo }),
      level: 'ad',
      limit: '500',
    });
  }

  async getLeadgenLeads(leadgenId: string): Promise<any> {
    return this.request(`/${leadgenId}/leads`, {
      fields: 'id,created_time,field_data',
    });
  }
}

export function getOAuthUrl(redirectUri: string): string {
  const appId = process.env.META_APP_ID;
  const scopes = [
    'ads_management',
    'ads_read',
    'leads_retrieval',
    'pages_show_list',
    'pages_read_engagement',
    'instagram_basic',
    'instagram_content_publish',
    'instagram_manage_insights',
  ].join(',');

  return `https://www.facebook.com/${META_API_VERSION}/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code`;
}

export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch(
    `${META_BASE_URL}/oauth/access_token?client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`
  );
  if (!res.ok) throw new Error('Failed to exchange code for token');
  return res.json();
}

export async function getLongLivedToken(shortToken: string): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch(
    `${META_BASE_URL}/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&fb_exchange_token=${shortToken}`
  );
  if (!res.ok) throw new Error('Failed to get long-lived token');
  return res.json();
}
