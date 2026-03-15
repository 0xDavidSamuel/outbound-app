'use client';

import { useEffect, useState, useMemo } from 'react';
import { getSession } from '@/lib/session';
import PageReveal from '@/components/ui/PageReveal';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface City {
  slug: string;
  name: string;
  image: string | null;
  scores: Record<string, number>;
  overall: number | null;
}

const SCORE_KEYS: Record<string, string> = {
  'Internet Access': 'wifi', 'Cost of Living': 'cost', 'Safety': 'safety',
  'Outdoors & Adventure': 'outdoors', 'Culture & Entertainment': 'culture',
  'Startup Culture': 'startup', 'Travel Connectivity': 'travel', 'Healthcare': 'healthcare',
};

const FILTERS = [
  { label: 'Overall',  key: 'overall' },
  { label: 'WiFi',     key: 'Internet Access' },
  { label: 'Cost',     key: 'Cost of Living' },
  { label: 'Safety',   key: 'Safety' },
  { label: 'Startups', key: 'Startup Culture' },
  { label: 'Outdoors', key: 'Outdoors & Adventure' },
];

function scoreColor(score: number) {
  if (score >= 7) return '#e8553a';
  if (score >= 5) return '#888';
  return '#444';
}

function RateModal({ city, onClose, onSave }: { city: City; onClose: () => void; onSave: (slug: string, ratings: any) => void }) {
  const [ratings, setRatings] = useState({ overall: 0, wifi: 0, cost: 0, safety: 0, community: 0, lifestyle: 0 });
  const [note, setNote] = useState('');
  const labels = [
    { key: 'overall', label: 'Overall' }, { key: 'wifi', label: 'WiFi' },
    { key: 'cost', label: 'Cost of Living' }, { key: 'safety', label: 'Safety' },
    { key: 'community', label: 'Community' }, { key: 'lifestyle', label: 'Lifestyle' },
  ];
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 16, padding: 28, width: '100%', maxWidth: 400, fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.4em', color: '#333', textTransform: 'uppercase', marginBottom: 4 }}>Rate your experience</div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 14, color: '#e8553a' }}>{city.name}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 20 }}>×</button>
        </div>
        {labels.map(({ key, label }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1,2,3,4,5].map(star => (
                <button key={star} onClick={() => setRatings(r => ({ ...r, [key]: star }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: star <= (ratings as any)[key] ? '#e8553a' : '#222', padding: 2, lineHeight: 1 }}>★</button>
              ))}
            </div>
          </div>
        ))}
        <textarea placeholder="Leave a note (optional)..." value={note} onChange={e => setNote(e.target.value)}
          style={{ width: '100%', background: '#111', border: '1px solid #1a1a1a', borderRadius: 8, padding: '10px 14px', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 12, resize: 'none', height: 72, outline: 'none', marginBottom: 16 }} />
        <button onClick={() => onSave(city.slug, { ...ratings, note, city_name: city.name })}
          style={{ width: '100%', background: '#e8553a', color: '#080808', border: 'none', borderRadius: 8, padding: 12, fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500 }}>
          Save Rating
        </button>
      </div>
    </div>
  );
}

export default function CitiesPage() {
  const [cities, setCities]           = useState<City[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeFilter, setActiveFilter] = useState(0);
  const [search, setSearch]           = useState('');
  const [view, setView]               = useState<'grid' | 'list'>('grid');
  const [ratingModal, setRatingModal] = useState<City | null>(null);
  const [userId, setUserId]           = useState('');
  const [token, setToken]             = useState('');
  const [userRatings, setUserRatings] = useState<Record<string, any>>({});

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session) {
        setUserId(session.user.id);
        setToken(session.access_token);
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/city_ratings?user_id=eq.${session.user.id}&select=*`,
          { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${session.access_token}` } }
        );
        const ratings = await res.json();
        const map: Record<string, any> = {};
        (Array.isArray(ratings) ? ratings : []).forEach((r: any) => { map[r.city_slug] = r; });
        setUserRatings(map);
      }
      try {
        const res = await fetch('/api/cities');
        const data = await res.json();
        setCities(data.cities || []);
      } catch { setCities([]); }
      setLoading(false);
    })();
  }, []);

  const saveRating = async (slug: string, ratings: any) => {
    if (!userId || !token) return;
    await fetch(`${SUPABASE_URL}/rest/v1/city_ratings`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ user_id: userId, city_slug: slug, city_name: ratings.city_name, overall: ratings.overall, wifi: ratings.wifi, cost: ratings.cost, safety: ratings.safety, community: ratings.community, lifestyle: ratings.lifestyle, note: ratings.note }),
    });
    setUserRatings(prev => ({ ...prev, [slug]: ratings }));
    setRatingModal(null);
  };

  const filtered = useMemo(() => {
    let list = [...cities];
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    const filterKey = FILTERS[activeFilter].key;
    if (filterKey === 'overall') {
      list = list.filter(c => c.overall !== null).sort((a, b) => (b.overall || 0) - (a.overall || 0));
    } else {
      list = list.filter(c => c.scores[filterKey] !== undefined).sort((a, b) => (b.scores[filterKey] || 0) - (a.scores[filterKey] || 0));
    }
    return list.slice(0, 60);
  }, [cities, activeFilter, search]);

  return (
    <PageReveal>
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; color: #fff; font-family: 'DM Sans', sans-serif; }
        .cities-page { min-height: 100vh; padding: 72px 24px 140px; max-width: 1000px; margin: 0 auto; }
        .cities-header { margin-bottom: 32px; }
        .cities-eyebrow { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.5em; color: #333; text-transform: uppercase; margin-bottom: 12px; }
        .cities-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(48px, 7vw, 80px); line-height: 0.9; color: #fff; margin-bottom: 24px; }
        .cities-title em { color: #e8553a; font-style: normal; }
        .controls { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 14px; padding: 16px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 12px; }
        .filter-pills { display: flex; gap: 6px; flex-wrap: wrap; }
        .filter-pill { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; padding: 6px 14px; border-radius: 20px; border: 1px solid #1a1a1a; color: #444; cursor: pointer; transition: all 0.2s; background: transparent; }
        .filter-pill:hover { color: #888; border-color: #333; }
        .filter-pill.active { background: #e8553a; color: #080808; border-color: #e8553a; }
        .controls-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .search-input { flex: 1; min-width: 160px; background: #111; border: 1px solid #1a1a1a; border-radius: 8px; padding: 9px 14px; font-family: 'DM Mono', monospace; font-size: 11px; color: #fff; outline: none; transition: border-color 0.2s; }
        .search-input:focus { border-color: #333; }
        .search-input::placeholder { color: #333; }
        .view-toggle { display: flex; background: #111; border: 1px solid #1a1a1a; border-radius: 8px; overflow: hidden; }
        .view-btn { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; padding: 9px 14px; background: none; border: none; color: #333; cursor: pointer; transition: all 0.2s; }
        .view-btn.active { background: #1a1a1a; color: #fff; }
        .cities-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
        .city-card { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 14px; overflow: hidden; transition: border-color 0.2s, transform 0.15s; display: flex; flex-direction: column; }
        .city-card:hover { border-color: #2a2a2a; transform: translateY(-2px); }
        .city-image { position: relative; height: 150px; overflow: hidden; background: #111; }
        .city-image img { width: 100%; height: 100%; object-fit: cover; }
        .city-image-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: 48px; color: rgba(232,85,58,0.06); letter-spacing: 0.1em; background: linear-gradient(135deg, #0e0e0e, #111); }
        .city-rank { position: absolute; top: 10px; left: 10px; width: 24px; height: 24px; background: rgba(8,8,8,0.8); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-family: 'DM Mono', monospace; font-size: 9px; color: #888; }
        .city-overall { position: absolute; bottom: 10px; left: 10px; background: rgba(8,8,8,0.85); border-radius: 6px; padding: 4px 8px; display: flex; align-items: center; gap: 5px; font-family: 'DM Mono', monospace; font-size: 10px; color: #e8553a; }
        .city-body { padding: 14px; flex: 1; display: flex; flex-direction: column; gap: 10px; }
        .city-name { font-size: 15px; font-weight: 500; color: #fff; }
        .city-scores { display: flex; flex-direction: column; gap: 5px; }
        .city-score-row { display: flex; align-items: center; justify-content: space-between; }
        .city-score-label { font-family: 'DM Mono', monospace; font-size: 9px; color: #333; letter-spacing: 0.1em; text-transform: uppercase; }
        .city-score-val { font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500; }
        .city-score-bar { flex: 1; height: 2px; background: #111; margin: 0 10px; border-radius: 2px; overflow: hidden; }
        .city-score-fill { height: 100%; border-radius: 2px; }
        .city-actions { display: flex; gap: 8px; margin-top: auto; }
        .btn-rate { flex: 1; background: rgba(232,85,58,0.06); border: 1px solid rgba(232,85,58,0.15); color: #e8553a; border-radius: 8px; padding: 8px; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; }
        .btn-rate:hover { background: rgba(232,85,58,0.12); }
        .btn-rate.rated { background: rgba(232,85,58,0.12); }
        .cities-list { display: flex; flex-direction: column; gap: 8px; }
        .city-list-item { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 10px; padding: 14px 16px; display: flex; align-items: center; gap: 16px; transition: border-color 0.2s; cursor: pointer; }
        .city-list-item:hover { border-color: #2a2a2a; }
        .city-list-rank { font-family: 'DM Mono', monospace; font-size: 11px; color: #222; width: 24px; flex-shrink: 0; }
        .city-list-img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; background: #111; flex-shrink: 0; }
        .city-list-name { flex: 1; font-size: 13px; font-weight: 500; color: #fff; }
        .city-list-scores { display: flex; gap: 16px; }
        .city-list-score { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .city-list-score-label { font-family: 'DM Mono', monospace; font-size: 7px; color: #333; letter-spacing: 0.1em; text-transform: uppercase; }
        .city-list-score-val { font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500; }
        .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0; gap: 16px; font-family: 'DM Mono', monospace; font-size: 11px; color: #333; letter-spacing: 0.2em; }
        .loading-dot { width: 6px; height: 6px; border-radius: 50%; background: #e8553a; animation: pulse 1.2s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }
        @media (max-width: 600px) { .cities-page { padding: 64px 16px 140px; } .cities-grid { grid-template-columns: 1fr 1fr; } .city-list-scores { display: none; } }
      `}</style>

      {ratingModal && <RateModal city={ratingModal} onClose={() => setRatingModal(null)} onSave={saveRating} />}

      <div className="cities-page">
        <div className="cities-header">
          <p className="cities-eyebrow">Live · Work · Explore</p>
          <h1 className="cities-title">Find your<br /><em>next city.</em></h1>
        </div>

        <div className="controls">
          <div className="filter-pills">
            {FILTERS.map((f, i) => (
              <button key={f.key} className={`filter-pill${activeFilter === i ? ' active' : ''}`} onClick={() => setActiveFilter(i)}>{f.label}</button>
            ))}
          </div>
          <div className="controls-row">
            <input className="search-input" placeholder="Search cities..." value={search} onChange={e => setSearch(e.target.value)} />
            <div className="view-toggle">
              <button className={`view-btn${view === 'grid' ? ' active' : ''}`} onClick={() => setView('grid')}>Grid</button>
              <button className={`view-btn${view === 'list' ? ' active' : ''}`} onClick={() => setView('list')}>List</button>
            </div>
          </div>
        </div>

        {loading && <div className="loading-state"><div className="loading-dot" />loading cities...</div>}

        {!loading && view === 'grid' && (
          <div className="cities-grid">
            {filtered.map((city, i) => {
              const hasRated = !!userRatings[city.slug];
              return (
                <div key={city.slug} className="city-card">
                  <div className="city-image">
                    {city.image ? <img src={city.image} alt={city.name} /> : <div className="city-image-placeholder">{city.name.slice(0,2).toUpperCase()}</div>}
                    <div className="city-rank">{i + 1}</div>
                    {city.overall && <div className="city-overall">★ {(city.overall / 10).toFixed(1)}</div>}
                  </div>
                  <div className="city-body">
                    <div className="city-name">{city.name}</div>
                    <div className="city-scores">
                      {['Internet Access', 'Cost of Living', 'Safety'].map(key => {
                        const val = city.scores[key];
                        if (!val) return null;
                        return (
                          <div key={key} className="city-score-row">
                            <span className="city-score-label">{SCORE_KEYS[key] || key}</span>
                            <div className="city-score-bar"><div className="city-score-fill" style={{ width: `${val * 10}%`, background: scoreColor(val) }} /></div>
                            <span className="city-score-val" style={{ color: scoreColor(val) }}>{val.toFixed(1)}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="city-actions">
                      <button className={`btn-rate${hasRated ? ' rated' : ''}`} onClick={() => setRatingModal(city)}>
                        {hasRated ? '★ Rated' : '☆ Rate City'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && view === 'list' && (
          <div className="cities-list">
            {filtered.map((city, i) => (
              <div key={city.slug} className="city-list-item" onClick={() => setRatingModal(city)}>
                <span className="city-list-rank">{i + 1}</span>
                {city.image
                  ? <img className="city-list-img" src={city.image} alt={city.name} />
                  : <div className="city-list-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#333' }}>{city.name.slice(0,2)}</div>
                }
                <span className="city-list-name">{city.name}</span>
                <div className="city-list-scores">
                  {city.overall && (
                    <div className="city-list-score">
                      <span className="city-list-score-label">Score</span>
                      <span className="city-list-score-val" style={{ color: scoreColor(city.overall / 10) }}>{(city.overall / 10).toFixed(1)}</span>
                    </div>
                  )}
                  {['Internet Access', 'Cost of Living', 'Safety'].map(key => city.scores[key] ? (
                    <div key={key} className="city-list-score">
                      <span className="city-list-score-label">{SCORE_KEYS[key]}</span>
                      <span className="city-list-score-val" style={{ color: scoreColor(city.scores[key]) }}>{city.scores[key].toFixed(1)}</span>
                    </div>
                  ) : null)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
    </PageReveal>
  );
}
