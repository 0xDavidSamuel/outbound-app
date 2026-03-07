'use client';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/session';

export default function HomePage() {
  const { login, loading } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session) window.location.href = '/passport';
    })();
  }, []);

  const handleJoin = async () => {
    const session = await getSession();
    if (session) { window.location.href = '/passport'; return; }
    login();
  };

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow: hidden; background: #080808; }
        :root { --bg: #080808; --accent: #e8553a; --text: #fff; --dim: #444; --border: #111; }
        .grain { position: fixed; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E"); pointer-events: none; z-index: 999; opacity: 0.35; }
        .top-bar { position: fixed; top: 0; left: 0; right: 0; height: 52px; display: flex; align-items: center; padding: 0 48px; z-index: 100; }
        .wordmark { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.35em; color: var(--accent); text-transform: uppercase; }
        .beta-pill { position: fixed; bottom: 28px; left: 48px; font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.2em; color: var(--accent); background: rgba(232,85,58,0.07); border: 1px solid rgba(232,85,58,0.18); padding: 5px 10px; border-radius: 4px; z-index: 100; text-transform: uppercase; }
        .scroll-area { width: 100vw; height: 100vh; overflow-y: scroll; scroll-snap-type: y mandatory; scrollbar-width: none; }
        .scroll-area::-webkit-scrollbar { display: none; }
        .section { height: 100vh; scroll-snap-align: start; display: flex; align-items: center; padding: 0 48px; position: relative; overflow: hidden; border-bottom: 1px solid var(--border); }
        .ghost { position: absolute; font-family: 'Bebas Neue', sans-serif; color: rgba(255,255,255,0.025); pointer-events: none; user-select: none; white-space: nowrap; line-height: 1; }
        .eyebrow { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.5em; color: var(--dim); text-transform: uppercase; margin-bottom: 24px; }
        .hero-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(72px, 10vw, 148px); line-height: 0.88; color: var(--text); margin-bottom: 32px; }
        .hero-title em { color: var(--accent); font-style: normal; }
        .hero-sub { font-size: 14px; color: var(--dim); line-height: 1.9; max-width: 360px; margin-bottom: 48px; font-weight: 300; }
        .cta-group { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .btn-enter { display: flex; align-items: center; gap: 10px; background: var(--accent); color: #080808; border: none; padding: 13px 28px; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; border-radius: 6px; cursor: pointer; transition: opacity 0.2s, transform 0.15s; font-weight: 500; }
        .btn-enter:hover { opacity: 0.88; transform: translateY(-1px); }
        .btn-enter:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .btn-ghost { display: flex; align-items: center; gap: 10px; background: transparent; color: #fff; border: 1px solid #222; padding: 13px 28px; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; border-radius: 6px; cursor: pointer; transition: border-color 0.2s, color 0.2s, transform 0.15s; text-decoration: none; }
        .btn-ghost:hover { border-color: #444; color: var(--accent); transform: translateY(-1px); }
        .scroll-hint { position: absolute; bottom: 32px; left: 48px; display: flex; align-items: center; gap: 10px; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.3em; color: #222; text-transform: uppercase; }
        .scroll-line { width: 32px; height: 1px; background: #1a1a1a; }
        .section-label { position: absolute; left: 48px; top: 40px; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.45em; color: #222; text-transform: uppercase; }
        .pillars { display: grid; grid-template-columns: repeat(2, 1fr); gap: 28px 60px; max-width: 560px; }
        .pillar { display: flex; flex-direction: column; gap: 5px; }
        .pillar-icon { font-size: 18px; margin-bottom: 4px; }
        .pillar-name { font-size: 13px; font-weight: 500; color: #fff; }
        .pillar-desc { font-size: 12px; color: #444; line-height: 1.6; font-weight: 300; }
        .stats-row { display: flex; gap: 48px; margin-bottom: 48px; flex-wrap: wrap; }
        .stat { display: flex; flex-direction: column; gap: 4px; }
        .stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 52px; color: var(--accent); line-height: 1; }
        .stat-label { font-family: 'DM Mono', monospace; font-size: 9px; color: #333; letter-spacing: 0.2em; text-transform: uppercase; }
        .use-cases { display: flex; flex-direction: column; gap: 16px; max-width: 520px; }
        .use-case { display: flex; align-items: flex-start; gap: 16px; padding: 16px; background: rgba(255,255,255,0.02); border: 1px solid #111; border-radius: 10px; }
        .use-case-num { font-family: 'Bebas Neue', sans-serif; font-size: 32px; color: rgba(232,85,58,0.2); line-height: 1; flex-shrink: 0; width: 32px; }
        .use-case-text { font-size: 13px; color: #555; line-height: 1.7; font-weight: 300; }
        .use-case-text strong { color: #888; font-weight: 500; }
        .final-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(72px, 11vw, 150px); line-height: 0.88; color: var(--text); margin-bottom: 12px; }
        .final-sub { font-size: 13px; color: #2a2a2a; font-style: italic; font-weight: 300; margin-bottom: 40px; }
        .side-tagline { position: absolute; right: 48px; bottom: 48px; text-align: right; }
        .side-tagline span { display: block; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.25em; color: #1e1e1e; text-transform: uppercase; }
        .side-tagline span + span { font-family: 'DM Sans', sans-serif; letter-spacing: 0; font-size: 11px; color: #1a1a1a; margin-top: 4px; }
        .ticker-wrap { position: absolute; bottom: 0; left: 0; right: 0; height: 36px; border-top: 1px solid #0e0e0e; overflow: hidden; display: flex; align-items: center; }
        .ticker { display: flex; gap: 0; white-space: nowrap; animation: ticker 30s linear infinite; }
        .ticker-item { font-family: 'DM Mono', monospace; font-size: 9px; color: #1e1e1e; letter-spacing: 0.2em; text-transform: uppercase; padding: 0 32px; }
        .ticker-dot { color: var(--accent); }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (max-width: 600px) {
          .section { padding: 0 24px; }
          .pillars { grid-template-columns: 1fr; gap: 20px; }
          .stats-row { gap: 28px; }
          .top-bar { padding: 0 24px; }
          .beta-pill { left: 24px; }
          .scroll-hint { left: 24px; }
        }
      `}</style>

      <div className="grain" />
      <div className="top-bar"><span className="wordmark">outbound</span></div>
      <div className="beta-pill">Beta · Open</div>

      <div className="scroll-area" ref={scrollRef}>
        <section className="section">
          <span className="ghost" style={{ fontSize: '28vw', bottom: '-4vw', right: '-2vw' }}>OUT</span>
          <div style={{ maxWidth: 680 }}>
            <p className="eyebrow">For nomads · Expats · Solo travelers</p>
            <h1 className="hero-title">Never travel<br />alone<br /><em>again.</em></h1>
            <p className="hero-sub">Outbound is a real-time network for people who live and work internationally. Find travelers in your city, get local intel, connect with people who've actually been there.</p>
            <div className="cta-group">
              <button className="btn-enter" onClick={handleJoin} disabled={loading}>
                {loading ? 'Connecting...' : '→ Join Outbound'}
              </button>
              <a className="btn-ghost" href="https://outboundwear.com" target="_blank" rel="noopener noreferrer">Shop</a>
            </div>
          </div>
          <div className="scroll-hint"><span className="scroll-line" />Scroll</div>
          <div className="ticker-wrap">
            <div className="ticker">
              {['🇯🇵 Tokyo','🇵🇹 Lisbon','🇹🇭 Chiang Mai','🇨🇴 Medellín','🇲🇽 Mexico City','🇮🇩 Bali','🇪🇸 Barcelona','🇩🇪 Berlin','🇦🇪 Dubai','🇰🇷 Seoul','🇧🇷 São Paulo','🇰🇪 Nairobi','🇦🇺 Melbourne','🇺🇸 Miami','🇨🇱 Santiago','🇹🇷 Istanbul','🇵🇱 Warsaw','🇳🇱 Amsterdam','🇨🇿 Prague','🇿🇦 Cape Town'].concat(['🇯🇵 Tokyo','🇵🇹 Lisbon','🇹🇭 Chiang Mai','🇨🇴 Medellín','🇲🇽 Mexico City','🇮🇩 Bali','🇪🇸 Barcelona','🇩🇪 Berlin','🇦🇪 Dubai','🇰🇷 Seoul','🇧🇷 São Paulo','🇰🇪 Nairobi','🇦🇺 Melbourne','🇺🇸 Miami','🇨🇱 Santiago','🇹🇷 Istanbul','🇵🇱 Warsaw','🇳🇱 Amsterdam','🇨🇿 Prague','🇿🇦 Cape Town']).map((city, i) => (
                <span key={i} className="ticker-item">{city} <span className="ticker-dot">·</span></span>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <span className="ghost" style={{ fontSize: '22vw', top: '50%', right: '-2vw', transform: 'translateY(-50%)' }}>LIVE</span>
          <span className="section-label">The Platform</span>
          <div style={{ width: '100%', paddingTop: 20 }}>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(52px, 7vw, 100px)', lineHeight: 0.9, color: '#fff', marginBottom: 48 }}>Everything you<br />need on the road.</h2>
            <div className="pillars">
              {[
                { icon: '📍', name: "Who's nearby",        desc: 'See other travelers in your city right now. Meet people, share space, stop being alone.' },
                { icon: '🏠', name: 'Places to stay',      desc: 'Nomad-friendly rooms, apartments, colivings — listed by people who actually live there.' },
                { icon: '🧠', name: 'Ground intelligence',  desc: 'Real-time tips on WiFi, safety, neighbourhoods, hidden spots. No outdated blogs.' },
                { icon: '🌍', name: 'Destination rooms',   desc: 'Join Japan, Colombia, Portugal — connect with locals, expats, and fellow travelers.' },
                { icon: '⚡', name: 'Events & meetups',    desc: "Find what's happening near you — co-working days, dinners, experiences." },
                { icon: '💼', name: 'Work while you roam', desc: 'Bounties, grants, remote contracts. Opportunities that move with you.' },
              ].map(f => (
                <div className="pillar" key={f.name}>
                  <div className="pillar-icon">{f.icon}</div>
                  <span className="pillar-name">{f.name}</span>
                  <span className="pillar-desc">{f.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <span className="ghost" style={{ fontSize: '26vw', bottom: '-5vw', left: '-2vw' }}>MOVE</span>
          <span className="section-label">The Movement</span>
          <div style={{ maxWidth: 560 }}>
            <p className="eyebrow">35M+ digital nomads. Zero platform built for them.</p>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(52px, 8vw, 106px)', lineHeight: 0.9, color: '#fff', marginBottom: 40 }}>The world is your<br /><em style={{ color: '#e8553a', fontStyle: 'normal' }}>office.</em></h2>
            <div className="stats-row">
              <div className="stat"><span className="stat-num">35M+</span><span className="stat-label">Digital nomads</span></div>
              <div className="stat"><span className="stat-num">195</span><span className="stat-label">Countries</span></div>
              <div className="stat"><span className="stat-num">0</span><span className="stat-label">Platforms built for them</span></div>
            </div>
            <p style={{ fontSize: 13, color: '#333', lineHeight: 1.9, fontWeight: 300, maxWidth: 420 }}>Right now travelers rely on scattered WhatsApp groups, outdated Reddit threads, and random blog posts written years ago. Outbound replaces all of that with a real-time, location-aware network built specifically for people on the move.</p>
          </div>
          <div className="side-tagline"><span>outbound</span><span>The operating system for nomad life.</span></div>
        </section>

        <section className="section">
          <span className="ghost" style={{ fontSize: '24vw', top: '-3vw', right: '-2vw' }}>HERE</span>
          <span className="section-label">Real Scenarios</span>
          <div>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(48px, 6vw, 88px)', lineHeight: 0.9, color: '#fff', marginBottom: 32 }}>Built for moments<br /><em style={{ color: '#e8553a', fontStyle: 'normal' }}>like these.</em></h2>
            <div className="use-cases">
              {[
                { num: '01', text: "You just landed in <strong>Tokyo</strong> for the first time. Open Outbound — see 4 people in Shinjuku right now. One's been here 6 months. You message them. Dinner sorted." },
                { num: '02', text: "You're heading to <strong>Medellín</strong> next month. Join the Colombia community. Ask what neighbourhood. Get 12 real answers from people who live there." },
                { num: '03', text: "You're in <strong>Bali</strong>, the power went out, WiFi is down across Canggu. Someone posts a safety update. You know before the travel blogs do." },
                { num: '04', text: "You've been <strong>alone on the road</strong> for 6 weeks. Outbound shows you 3 other nomads in your city this week. You're not alone anymore." },
              ].map(uc => (
                <div className="use-case" key={uc.num}>
                  <span className="use-case-num">{uc.num}</span>
                  <span className="use-case-text" dangerouslySetInnerHTML={{ __html: uc.text }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <span className="ghost" style={{ fontSize: '26vw', top: '-4vw', right: '-2vw' }}>IN</span>
          <div>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.4em', color: '#444', textTransform: 'uppercase', marginBottom: 16 }}>For the well-traveled and the soon-to-be.</p>
            <h2 className="final-title">Join<br />Outbound.</h2>
            <p className="final-sub">Currently in beta. Free to join. Travelers worldwide.</p>
            <div className="cta-group">
              <button className="btn-enter" onClick={handleJoin} disabled={loading}>
                {loading ? 'Connecting...' : '→ Join Outbound'}
              </button>
              <a className="btn-ghost" href="https://outboundwear.com" target="_blank" rel="noopener noreferrer">Shop Outbound</a>
            </div>
          </div>
          <div className="side-tagline"><span>outbound</span><span>Travelers helping travelers.</span></div>
        </section>
      </div>
    </>
  );
}
