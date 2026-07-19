import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/payment/stripe';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, name, planType } = body;

  if (!email || !name || !planType) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const priceId = planType === 'subscription'
    ? process.env.STRIPE_SUBSCRIPTION_PRICE_ID!
    : process.env.STRIPE_PRICE_ID!;

  const origin = request.headers.get('origin') || 'http://localhost:3000';

  const session = await createCheckoutSession({
    email,
    name,
    priceId,
    successUrl: `${origin}/obrigado?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/?canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}
