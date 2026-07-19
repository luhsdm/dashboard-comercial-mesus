import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/permissions';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { phoneNumberId, wabaId, accessToken } = await request.json();

  if (!phoneNumberId || !wabaId || !accessToken) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  }

  await prisma.whatsAppAccount.upsert({
    where: { phoneNumberId },
    update: { wabaId, accessToken },
    create: {
      tenantId: user.tenantId,
      phoneNumberId,
      displayPhone: phoneNumberId,
      wabaId,
      accessToken,
    },
  });

  return NextResponse.json({ ok: true });
}
