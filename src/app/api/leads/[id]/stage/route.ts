import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/permissions';
import { prisma } from '@/lib/db';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { stageId } = await request.json();

  const stage = await prisma.pipelineStage.findFirst({
    where: { id: stageId, tenantId: user.tenantId },
  });
  if (!stage) return NextResponse.json({ error: 'Stage not found' }, { status: 404 });

  const lead = await prisma.lead.findFirst({
    where: { id, client: { tenantId: user.tenantId } },
  });
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const updated = await prisma.lead.update({
    where: { id },
    data: { pipelineStageId: stageId },
  });

  return NextResponse.json(updated);
}
