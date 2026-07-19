import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhook, handleLeadgenWebhook } from '@/lib/meta/webhooks';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode') || '';
  const token = searchParams.get('hub.verify_token') || '';
  const challenge = searchParams.get('hub.challenge') || '';

  const result = verifyWebhook(mode, token, challenge);
  if (result) return new NextResponse(result, { status: 200 });
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  await handleLeadgenWebhook(payload);
  return NextResponse.json({ status: 'ok' });
}
