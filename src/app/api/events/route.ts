import { NextResponse } from 'next/server';

const KEYWORD_MAP: Record<string, string[]> = {
  all:        ['crypto', 'blockchain', 'web3', 'ai', 'hack', 'defi', 'nft', 'ethereum', 'bitcoin'],
  crypto:     ['crypto', 'blockchain', 'bitcoin', 'ethereum', 'defi', 'nft', 'web3'],
  web3:       ['web3', 'blockchain', 'defi', 'nft', 'solidity', 'ethereum'],
  ai:         ['ai', 'machine learning', 'artificial intelligence', 'llm', 'ml'],
  dev:        ['developer', 'hackathon', 'hack', 'coding', 'engineer'],
  conference: ['summit', 'conference', 'expo', 'forum'],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || 'all').toLowerCase();
  const keywords = KEYWORD_MAP[q] || KEYWORD_MAP['all'];

  try {
    const res = await fetch('https://developers.events/all-events.json');
    const allEvents: any[] = await res.json();

    const now = Date.now();

    const filtered = allEvents
      .filter(event => {
        const startTs = Array.isArray(event.date) ? event.date[0] : null;
        if (!startTs || startTs < now) return false;
        const name = (event.name || '').toLowerCase();
        const tags = Array.isArray(event.tags) ? event.tags.join(' ').toLowerCase() : '';
        return keywords.some(kw => name.includes(kw) || tags.includes(kw));
      })
      .sort((a, b) => a.date[0] - b.date[0])
      .slice(0, 40)
      .map(event => ({
        name: event.name,
        url: event.hyperlink,
        startDate: new Date(event.date[0]).toISOString().split('T')[0],
        endDate: event.date[1] ? new Date(event.date[1]).toISOString().split('T')[0] : null,
        city: event.city,
        country: event.country,
        location: event.location,
        tags: event.tags || [],
      }));

    return NextResponse.json({ events: filtered });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
