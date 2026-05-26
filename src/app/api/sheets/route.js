import { NextResponse } from 'next/server';

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

  // First, get the metadata to find all sheet names
  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sid}?key=${apiKey}`;
  const metaRes = await fetch(metaUrl);
  const metaData = await metaRes.json();

  if (metaData.error) {
    return NextResponse.json(metaData, { status: 400 });
  }

  const sheetNames = (metaData.sheets || []).map(s => s.properties.title);
  const sheetIds = (metaData.sheets || []).map(s => s.properties.sheetId);

  // Find the first sheet with data
  for (const sheetName of sheetNames) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sid}/values/${encodeURIComponent(sheetName)}?key=${apiKey}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.values && data.values.length > 0) {
        return NextResponse.json({
          sheetName,
          sheetId: sheetIds[sheetNames.indexOf(sheetName)],
          headers: data.values[0],
          totalRows: data.values.length,
          sample: data.values.slice(0, 3),
        });
      }
    } catch {}
  }

  return NextResponse.json({ values: [], sheetNames });
}
