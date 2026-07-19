import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/permissions';
import { recordConsent, revokeConsent } from '@/lib/lgpd/consent';

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { phone, leadId, consentType, granted, source } = body;

  if (!consentType) return NextResponse.json({ error: 'consentType is required' }, { status: 400 });

  if (granted === false) {
    await revokeConsent({ tenantId: user.tenantId, phone, leadId, consentType });
  } else {
    await recordConsent({
      tenantId: user.tenantId,
      phone,
      leadId,
      consentType,
      granted: true,
      source: source || 'manual',
    });
  }

  return NextResponse.json({ ok: true });
}
