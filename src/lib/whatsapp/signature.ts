import { createHmac } from 'crypto';

export function verifySignature(payload: string, signature: string, appSecret: string): boolean {
  const expectedSig = createHmac('sha256', appSecret).update(payload).digest('hex');
  return signature === `sha256=${expectedSig}`;
}

export function verifyWebhookChallenge(
  mode: string,
  token: string,
  challenge: string
): string | null {
  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return challenge;
  }
  return null;
}
