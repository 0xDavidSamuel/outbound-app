import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || 'crypto';

  try {
    const res = await fetch(
      `https://www.eventbriteapi.com/v3/events/search/?q=${encodeURIComponent(q)}&expand=venue,logo&sort_by=date`,
      { headers: { Authorization: `Bearer RFOE43KHLUV4VBKHJPAO` } }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
