import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/permissions';
import { deleteLeadData } from '@/lib/lgpd/consent';

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { phone } = await request.json();
  if (!phone) return NextResponse.json({ error: 'phone is required' }, { status: 400 });

  const result = await deleteLeadData(user.tenantId, phone);
  return NextResponse.json(result);
}
