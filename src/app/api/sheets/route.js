import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sid = searchParams.get('sid');
  const range = searchParams.get('range') || 'Sheet1';

  if (!sid) {
    return NextResponse.json({ error: 'Missing sid parameter' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GOOGLE_API_KEY not configured' }, { status: 500 });
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sid}/values/${range}?key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
