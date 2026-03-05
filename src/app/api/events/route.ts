import { NextResponse } from 'next/server';

const TM_KEY = 'ocG3vDFAcCONwIRC8oUedGQASdNwDFe7';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('q') || 'crypto';

  try {
    const res = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${encodeURIComponent(keyword)}&classificationName=miscellaneous&size=20&sort=date,asc&apikey=${TM_KEY}`
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
