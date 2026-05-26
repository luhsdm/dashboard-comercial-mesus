import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sid = searchParams.get('sid');
  const sheet = searchParams.get('sheet');

  if (!sid) {
    return NextResponse.json({ error: 'Missing sid parameter' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GOOGLE_API_KEY not configured' }, { status: 500 });
  }

  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sid}?key=${apiKey}`;
  const metaRes = await fetch(metaUrl);
  const metaData = await metaRes.json();

  if (metaData.error) {
    return NextResponse.json(metaData, { status: 400 });
  }

  const sheets = (metaData.sheets || []).map(s => ({
    title: s.properties.title,
    id: s.properties.sheetId,
    rows: s.properties.gridProperties.rowCount,
    cols: s.properties.gridProperties.columnCount,
  }));

  // If a specific sheet is requested, return its data
  if (sheet) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sid}/values/${encodeURIComponent(sheet)}?key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json({ sheetName: sheet, ...data });
  }

  return NextResponse.json({ sheets });
}
