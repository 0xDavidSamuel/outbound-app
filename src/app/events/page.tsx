'use client';

import { useEffect, useState } from 'react';
import NavBar from '@/components/ui/NavBar';
import { createClient } from '@/lib/supabase';

interface TMEvent {
  id: string;
  name: string;
  url: string;
  dates: { start: { localDate: string } };
  images: { url: string; width: number }[];
  _embedded?: {
    venues?: { name: string; city: { name: string }; country: { name: string } }[];
  };
}

const CATEGORIES = [
  { label: 'All',        query: 'all' },
  { label: 'Crypto',     query: 'crypto' },
  { label: 'Web3',       query: 'web3' },
  { label: 'AI',         query: 'ai' },
  { label: 'Dev',        query: 'dev' },
  { label: 'Conference', query: 'conference' },
];

export default function EventsPage() {
  const [events, setEvents] = useState<TMEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(0);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.from('profiles').select('username, avatar_url').eq('id', session.user.id).single();
        setUser(data);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = CATEGORIES[activeCategory].query;
        const res = await fetch(`/api/events?q=${q}`);
        const data = await res.json();
        setEvents(data.events || []);
      } catch {
        setError('Failed to load events.');
      }
      setLoading(false);
    };
    fetchEvents();
  }, [activeCategory]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getBestImage = (images: TMEvent['images']) => {
    if (!images?.length) return null;
    return images.sort((a, b) => b.width - a.width)[0]?.url;
  };

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; color: #fff; font-family: 'DM Sans', sans-serif; }

        .events-page {
          min-height: 100vh;
          padding: 72px 24px 140px;
          max-width: 900px;
          margin: 0 auto;
        }

        .events-header { margin-bottom: 40px; }

        .events-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.5em;
          color: #333;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .events-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(48px, 7vw, 80px);
          line-height: 0.9;
          color: #fff;
          margin-bottom: 24px;
        }
        .events-title em { color: #e8ff47; font-style: normal; }

        .category-pills { display: flex; gap: 8px; flex-wrap: wrap; }

        .category-pill {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid #1a1a1a;
          color: #444;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
        }
        .category-pill:hover { color: #888; border-color: #333; }
        .category-pill.active { background: #e8ff47; color: #080808; border-color: #e8ff47; }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .event-card {
          background: #0d0d0d;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.2s, transform 0.15s;
          text-decoration: none;
          display: flex;
          flex-direction: column;
        }
        .event-card:hover { border-color: #2a2a2a; transform: translateY(-2px); }

        .event-image {
          width: 100%;
          height: 140px;
          object-fit: cover;
          background: #111;
        }

        .event-image-placeholder {
          width: 100%;
          height: 140px;
          background: linear-gradient(135deg, #0e0e0e, #141414);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 40px;
          color: rgba(232,255,71,0.06);
          letter-spacing: 0.1em;
        }

        .event-body {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .event-date {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.15em;
          color: #e8ff47;
          text-transform: uppercase;
        }

        .event-name {
          font-size: 14px;
          font-weight: 500;
          color: #fff;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .event-location {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: #444;
          letter-spacing: 0.08em;
          margin-top: auto;
        }

        .event-arrow {
          font-size: 10px;
          color: #2a2a2a;
          margin-top: 8px;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.1em;
          transition: color 0.2s;
        }
        .event-card:hover .event-arrow { color: #e8ff47; }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0;
          gap: 16px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #333;
          letter-spacing: 0.2em;
        }

        .loading-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #e8ff47;
          animation: pulse 1.2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }

        .empty-state {
          text-align: center;
          padding: 80px 0;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #222;
          letter-spacing: 0.2em;
        }

        @media (max-width: 600px) {
          .events-page { padding: 64px 16px 140px; }
          .events-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {user && <NavBar user={{ avatar_url: user.avatar_url ?? undefined, username: user.username ?? undefined }} />}

      <div className="events-page">
        <div className="events-header">
          <p className="events-eyebrow">Upcoming — Global</p>
          <h1 className="events-title">Events &<br /><em>Meetups.</em></h1>
          <div className="category-pills">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                className={`category-pill${activeCategory === i ? ' active' : ''}`}
                onClick={() => setActiveCategory(i)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loading-dot" />
            fetching events...
          </div>
        )}

        {error && <div className="empty-state">{error}</div>}

        {!loading && !error && events.length === 0 && (
          <div className="empty-state">no events found</div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="events-grid">
            {events.map(event => {
              const img = getBestImage(event.images);
              const venue = event._embedded?.venues?.[0];
              return (
                <a key={event.id} className="event-card" href={event.url} target="_blank" rel="noopener noreferrer">
                  {img
                    ? <img className="event-image" src={img} alt={event.name} />
                    : <div className="event-image-placeholder">OUTBOUND</div>
                  }
                  <div className="event-body">
                    <span className="event-date">{formatDate(event.dates.start.localDate)}</span>
                    <div className="event-name">{event.name}</div>
                    {venue && (
                      <div className="event-location">
                        📍 {venue.city?.name}{venue.country?.name ? `, ${venue.country.name}` : ''}
                      </div>
                    )}
                    <div className="event-arrow">View event →</div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
