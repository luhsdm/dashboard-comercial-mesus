import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/permissions';
import { prisma } from '@/lib/db';

const TYPE_MAP: Record<string, string> = {
  pre_qualification: 'PRE_QUALIFICATION',
  kanban_mover: 'KANBAN_MOVER',
  instagram: 'INSTAGRAM',
};

export async function PUT(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { type } = await params;
  const agentType = TYPE_MAP[type];
  if (!agentType) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

  const { provider, model, apiKey, prompt, temperature, maxTokens } = await request.json();

  await prisma.agentConfig.upsert({
    where: { tenantId_type: { tenantId: user.tenantId, type: agentType as any } },
    update: {
      llmProvider: provider,
      llmModel: model,
      ...(apiKey ? { llmApiKey: apiKey } : {}),
      systemPrompt: prompt || '',
      temperature: temperature ?? 0.7,
      maxTokens: maxTokens ?? 1024,
    },
    create: {
      tenantId: user.tenantId,
      name: type,
      type: agentType as any,
      llmProvider: provider || 'openai',
      llmModel: model || 'gpt-4o-mini',
      llmApiKey: apiKey,
      systemPrompt: prompt || '',
      temperature: temperature ?? 0.7,
      maxTokens: maxTokens ?? 1024,
    },
  });

  return NextResponse.json({ ok: true });
}
