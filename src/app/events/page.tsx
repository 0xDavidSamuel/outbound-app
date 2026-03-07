'use client';

import { useEffect, useState } from 'react';

interface DevEvent {
  name: string;
  url: string;
  startDate: string;
  endDate?: string;
  city?: string;
  country?: string;
  online?: boolean;
  tags?: string[];
}

const CATEGORIES = [
  { label: 'All',        query: 'all' },
  { label: 'Crypto',     query: 'crypto' },
  { label: 'Web3',       query: 'web3' },
  { label: 'AI',         query: 'ai' },
  { label: 'Dev',        query: 'dev' },
  { label: 'Conference', query: 'conference' },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function EventsPage() {
  const [events, setEvents]             = useState<DevEvent[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(0);

  useEffect(() => {
    (async () => {
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
    })();
  }, [activeCategory]);

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; color: #fff; font-family: 'DM Sans', sans-serif; }
        .events-page { min-height: 100vh; padding: 72px 24px 140px; max-width: 900px; margin: 0 auto; }
        .events-header { margin-bottom: 40px; }
        .events-eyebrow { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.5em; color: #333; text-transform: uppercase; margin-bottom: 12px; }
        .events-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(48px, 7vw, 80px); line-height: 0.9; color: #fff; margin-bottom: 24px; }
        .events-title em { color: #e8553a; font-style: normal; }
        .category-pills { display: flex; gap: 8px; flex-wrap: wrap; }
        .category-pill { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; padding: 6px 14px; border-radius: 20px; border: 1px solid #1a1a1a; color: #444; cursor: pointer; transition: all 0.2s; background: transparent; }
        .category-pill:hover { color: #888; border-color: #333; }
        .category-pill.active { background: #e8553a; color: #080808; border-color: #e8553a; }
        .events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .event-card { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 12px; overflow: hidden; transition: border-color 0.2s, transform 0.15s; text-decoration: none; display: flex; flex-direction: column; }
        .event-card:hover { border-color: #2a2a2a; transform: translateY(-2px); }
        .event-banner { width: 100%; height: 80px; background: linear-gradient(135deg, #0e0e0e, #111); display: flex; align-items: center; padding: 0 20px; border-bottom: 1px solid #161616; }
        .event-banner-date { font-family: 'Bebas Neue', sans-serif; font-size: 48px; color: rgba(232,85,58,0.08); line-height: 1; letter-spacing: 0.05em; white-space: nowrap; overflow: hidden; }
        .event-body { padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .event-date { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.15em; color: #e8553a; text-transform: uppercase; }
        .event-name { font-size: 14px; font-weight: 500; color: #fff; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .event-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px; }
        .event-tag { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.1em; color: #333; background: #111; border: 1px solid #1a1a1a; padding: 2px 6px; border-radius: 3px; text-transform: uppercase; }
        .event-location { font-family: 'DM Mono', monospace; font-size: 10px; color: #444; letter-spacing: 0.08em; margin-top: auto; }
        .event-arrow { font-size: 10px; color: #2a2a2a; margin-top: 8px; font-family: 'DM Mono', monospace; letter-spacing: 0.1em; transition: color 0.2s; }
        .event-card:hover .event-arrow { color: #e8553a; }
        .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0; gap: 16px; font-family: 'DM Mono', monospace; font-size: 11px; color: #333; letter-spacing: 0.2em; }
        .loading-dot { width: 6px; height: 6px; border-radius: 50%; background: #e8553a; animation: pulse 1.2s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }
        .empty-state { text-align: center; padding: 80px 0; font-family: 'DM Mono', monospace; font-size: 11px; color: #222; letter-spacing: 0.2em; }
        @media (max-width: 600px) { .events-page { padding: 64px 16px 140px; } .events-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="events-page">
        <div className="events-header">
          <p className="events-eyebrow">Upcoming — Global</p>
          <h1 className="events-title">Events &<br /><em>Meetups.</em></h1>
          <div className="category-pills">
            {CATEGORIES.map((cat, i) => (
              <button key={cat.label} className={`category-pill${activeCategory === i ? ' active' : ''}`} onClick={() => setActiveCategory(i)}>{cat.label}</button>
            ))}
          </div>
        </div>

        {loading && <div className="loading-state"><div className="loading-dot" />fetching events...</div>}
        {error && <div className="empty-state">{error}</div>}
        {!loading && !error && events.length === 0 && <div className="empty-state">no events found</div>}

        {!loading && !error && events.length > 0 && (
          <div className="events-grid">
            {events.map((event, i) => (
              <a key={i} className="event-card" href={event.url} target="_blank" rel="noopener noreferrer">
                <div className="event-banner">
                  <span className="event-banner-date">{formatDate(event.startDate)}</span>
                </div>
                <div className="event-body">
                  <span className="event-date">
                    {formatDate(event.startDate)}
                    {event.endDate && event.endDate !== event.startDate ? ` — ${formatDate(event.endDate)}` : ''}
                  </span>
                  <div className="event-name">{event.name}</div>
                  {event.tags && event.tags.length > 0 && (
                    <div className="event-tags">
                      {event.tags.slice(0, 3).map((tag: any, i: number) => (
                        <span key={i} className="event-tag">{tag.value || tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="event-location">
                    {event.online ? '🌐 Online' : event.city ? `📍 ${event.city}${event.country ? `, ${event.country}` : ''}` : null}
                  </div>
                  <div className="event-arrow">View event →</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
