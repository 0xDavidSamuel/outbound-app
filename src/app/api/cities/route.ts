import { NextResponse } from 'next/server';

// Top nomad/travel cities by Teleport slug
const CITY_SLUGS = [
  'amsterdam', 'barcelona', 'berlin', 'bangkok', 'bali',
  'budapest', 'cape-town', 'chiang-mai', 'dubai', 'hong-kong',
  'istanbul', 'jakarta', 'kuala-lumpur', 'lagos', 'lima',
  'lisbon', 'london', 'madrid', 'medellin', 'melbourne',
  'mexico-city', 'miami', 'milan', 'montreal', 'mumbai',
  'nairobi', 'new-york', 'paris', 'prague', 'san-francisco-bay-area',
  'santiago', 'sao-paulo', 'seoul', 'shanghai', 'singapore',
  'stockholm', 'sydney', 'taipei', 'tel-aviv', 'tokyo',
  'toronto', 'vienna', 'warsaw', 'zurich', 'los-angeles',
  'denver', 'austin', 'seattle', 'boston', 'chicago',
];

async function fetchCity(slug: string) {
  try {
    const [scoresRes, imgRes] = await Promise.all([
      fetch(`https://api.teleport.org/api/urban_areas/slug:${slug}/scores/`, { signal: AbortSignal.timeout(5000) }),
      fetch(`https://api.teleport.org/api/urban_areas/slug:${slug}/images/`, { signal: AbortSignal.timeout(5000) }),
    ]);

    const scores = scoresRes.ok ? await scoresRes.json() : null;
    const imgs = imgRes.ok ? await imgRes.json() : null;

    if (!scores) return null;

    const scoreMap: Record<string, number> = {};
    (scores.categories || []).forEach((s: any) => {
      scoreMap[s.name] = Math.round(s.score_out_of_10 * 10) / 10;
    });

    const image = imgs?.photos?.[0]?.image?.web || null;
    const name = scores._links?.['ua:urban-area']?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

    return {
      slug,
      name,
      image,
      scores: scoreMap,
      overall: scores.teleport_city_score ? Math.round(scores.teleport_city_score) / 10 : null,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    // Fetch in batches of 10 to avoid timeout
    const results = [];
    for (let i = 0; i < CITY_SLUGS.length; i += 10) {
      const batch = CITY_SLUGS.slice(i, i + 10);
      const batchResults = await Promise.all(batch.map(fetchCity));
      results.push(...batchResults.filter(Boolean));
    }

    return NextResponse.json({ cities: results });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}
