import type { WASendMessageResponse } from './types';

const WA_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const BASE_URL = `https://graph.facebook.com/${WA_API_VERSION}`;

export class WhatsAppClient {
  private phoneNumberId: string;
  private accessToken: string;

  constructor(phoneNumberId: string, accessToken: string) {
    this.phoneNumberId = phoneNumberId;
    this.accessToken = accessToken;
  }

  private async request<T>(endpoint: string, body: Record<string, any>): Promise<T> {
    const url = `${BASE_URL}/${this.phoneNumberId}${endpoint}`;

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) return res.json();
      if (res.status === 429) {
        lastError = new Error(`Rate limited (attempt ${attempt + 1})`);
        continue;
      }

      const errBody = await res.text();
      throw new Error(`WhatsApp API error ${res.status}: ${errBody}`);
    }

    throw lastError || new Error('WhatsApp API request failed');
  }

  async sendTextMessage(to: string, text: string): Promise<WASendMessageResponse> {
    return this.request('/messages', {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    });
  }

  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string = 'pt_BR',
    components: any[] = []
  ): Promise<WASendMessageResponse> {
    return this.request('/messages', {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components,
      },
    });
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.request('/messages', {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    });
  }

  async getMediaUrl(mediaId: string): Promise<string> {
    const res = await fetch(`${BASE_URL}/${mediaId}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!res.ok) throw new Error(`Failed to get media URL: ${res.status}`);
    const data = await res.json();
    return data.url;
  }
}
