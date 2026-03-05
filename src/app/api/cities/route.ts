import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  try {
    if (slug) {
      // Get scores for a specific city
      const [scoresRes, detailsRes] = await Promise.all([
        fetch(`https://api.teleport.org/api/urban_areas/slug:${slug}/scores/`),
        fetch(`https://api.teleport.org/api/urban_areas/slug:${slug}/details/`),
      ]);
      const scores = await scoresRes.json();
      const details = await detailsRes.json();
      return NextResponse.json({ scores, details });
    }

    // Get all urban areas
    const res = await fetch('https://api.teleport.org/api/urban_areas/?embed=ua:images&embed=ua:scores');
    const data = await res.json();
    const areas = data?._embedded?.['ua:item'] || [];

    const cities = areas.map((area: any) => {
      const scores = area?._embedded?.['ua:scores']?.categories || [];
      const image = area?._embedded?.['ua:images']?.photos?.[0]?.image?.web || null;
      const scoreMap: Record<string, number> = {};
      scores.forEach((s: any) => {
        scoreMap[s.name] = Math.round(s.score_out_of_10 * 10) / 10;
      });

      return {
        slug: area.ua_prefix?.replace('slug:', '') || area.full_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: area.full_name,
        image,
        scores: scoreMap,
        overall: area?._embedded?.['ua:scores']?.teleport_city_score
          ? Math.round(area._embedded['ua:scores'].teleport_city_score) / 10
          : null,
      };
    }).filter((c: any) => c.name);

    return NextResponse.json({ cities });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}
