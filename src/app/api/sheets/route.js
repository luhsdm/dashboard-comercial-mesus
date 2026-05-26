import { NextResponse } from 'next/server';

const SHEET_NAMES = ['Sheet1', 'Página1', 'Leads', 'Dados', 'Sheet', 'Planilha1'];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sid = searchParams.get('sid');

  if (!sid) {
    return NextResponse.json({ error: 'Missing sid parameter' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GOOGLE_API_KEY not configured' }, { status: 500 });
  }

  for (const sheet of SHEET_NAMES) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sid}/values/${sheet}?key=${apiKey}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.values && data.values.length > 0) {
        return NextResponse.json(data);
      }
    } catch {}
  }

  return NextResponse.json({ values: [] });
}
