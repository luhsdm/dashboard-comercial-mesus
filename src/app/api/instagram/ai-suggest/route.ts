import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/permissions';
import { prisma } from '@/lib/db';
import { InstagramAgent } from '@/lib/ai/agents/instagram';

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { topic, type } = await request.json();

  const agent = new InstagramAgent(user.tenantId);

  if (type === 'caption') {
    const suggestion = await agent.generateCaption({
      topic: topic || 'general',
      tone: 'professional',
      industry: 'general',
      hashtags: true,
    });
    return NextResponse.json({ suggestion });
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}
