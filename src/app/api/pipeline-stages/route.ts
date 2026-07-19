import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/permissions';
import { prisma } from '@/lib/db';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const stages = await prisma.pipelineStage.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { order: 'asc' },
  });

  return NextResponse.json(stages);
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { name, slug, order, color, isDefault, isFinal } = body;

  if (!name || !slug) {
    return NextResponse.json({ error: 'name and slug are required' }, { status: 400 });
  }

  const stage = await prisma.pipelineStage.create({
    data: {
      tenantId: user.tenantId,
      name,
      slug,
      order: order ?? 0,
      color: color ?? '#4f8ef7',
      isDefault: isDefault ?? false,
      isFinal: isFinal ?? false,
    },
  });

  return NextResponse.json(stage, { status: 201 });
}
