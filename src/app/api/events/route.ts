import { NextResponse } from 'next/server';

const TM_KEY = 'ocG3vDFAcCONwIRC8oUedGQASdNwDFe7';

// Ticketmaster doesn't have crypto/web3 conferences so we use
// broader tech/conference keywords and filter out sports venues
const KEYWORD_MAP: Record<string, string[]> = {
  'crypto':     ['blockchain conference', 'web3 summit', 'crypto conference', 'bitcoin conference', 'ethereum conference'],
  'web3':       ['web3 summit', 'blockchain expo', 'defi conference', 'nft summit'],
  'ai':         ['ai summit', 'artificial intelligence conference', 'machine learning conference'],
  'dev':        ['developer conference', 'hackathon', 'tech summit', 'coding bootcamp'],
  'conference': ['tech conference', 'technology summit', 'innovation summit', 'startup conference'],
  'all':        ['hackathon', 'tech summit', 'blockchain conference', 'developer conference', 'web3 summit'],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || 'all';
  const keywords = KEYWORD_MAP[q.toLowerCase()] || KEYWORD_MAP['all'];

  try {
    const results = await Promise.all(
      keywords.slice(0, 3).map(keyword =>
        fetch(
          `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${encodeURIComponent(keyword)}&size=10&sort=date,asc&apikey=${TM_KEY}`
        ).then(r => r.json())
      )
    );

    const seen = new Set<string>();
    const events: any[] = [];

    for (const result of results) {
      const items = result?._embedded?.events || [];
      for (const event of items) {
        if (!seen.has(event.id)) {
          seen.add(event.id);
          events.push(event);
        }
      }
    }

    // Sort by date
    events.sort((a, b) =>
      new Date(a.dates?.start?.localDate).getTime() - new Date(b.dates?.start?.localDate).getTime()
    );

    return NextResponse.json({ events: events.slice(0, 30) });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
