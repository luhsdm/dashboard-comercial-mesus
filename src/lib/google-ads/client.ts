const GOOGLE_ADS_API_VERSION = 'v17';
const BASE_URL = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;

export class GoogleAdsClient {
  private accessToken: string;
  private developerToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '';
  }

  private async request<T>(endpoint: string, body?: any): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: body ? 'POST' : 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'developer-token': this.developerToken,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google Ads API error ${res.status}: ${err}`);
    }

    return res.json();
  }

  async getAccessibleAccounts(): Promise<any> {
    return this.request('/customers:listAccessibleCustomers');
  }

  async getCampaigns(customerId: string): Promise<any> {
    return this.request(`/customers/${customerId}/googleAds:searchStream`, {
      query: `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type
              FROM campaign
              WHERE campaign.status != 'REMOVED'
              ORDER BY campaign.name`,
    });
  }

  async getInsights(customerId: string, dateFrom: string, dateTo: string): Promise<any> {
    return this.request(`/customers/${customerId}/googleAds:searchStream`, {
      query: `SELECT campaign.id, campaign.name,
                     ad_group.id, ad_group.name,
                     metrics.impressions, metrics.clicks, metrics.cost_micros,
                     metrics.conversions, metrics.cost_per_conversion,
                     segments.date
              FROM ad_group
              WHERE segments.date BETWEEN '${dateFrom}' AND '${dateTo}'
              ORDER BY segments.date DESC`,
    });
  }
}

export async function refreshGoogleToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) throw new Error('Failed to refresh Google token');
  return res.json();
}
