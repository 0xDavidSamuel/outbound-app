'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/session';

const SLIDES = [
  {
    eyebrow: 'For nomads · Expats · Solo travelers',
    headline: ['Never travel', 'alone', 'again.'],
    sub: 'Outbound is a real-time network for people who live and work internationally.',
  },
  {
    eyebrow: 'Who\'s in your city right now',
    headline: ['Find your', 'people,', 'anywhere.'],
    sub: 'See other travelers nearby. Meet people, share space, stop being a stranger.',
  },
  {
    eyebrow: 'Ground-level intelligence',
    headline: ['Real intel.', 'Real', 'people.'],
    sub: 'WiFi spots, safe neighbourhoods, hidden gems — from people who actually live there.',
  },
  {
    eyebrow: 'The nomad operating system',
    headline: ['Work.', 'Move.', 'Connect.'],
    sub: 'Jobs, stays, events, community — everything you need to live without borders.',
  },
];

export default function HomePage() {
  const { login, loading } = useAuth();
  const [slide, setSlide]       = useState(0);
  const [visible, setVisible]   = useState(true);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session) window.location.href = '/passport';
    })();
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setSlide(s => (s + 1) % SLIDES.length);
        setVisible(true);
      }, 600);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleJoin = async () => {
    const session = await getSession();
    if (session) { window.location.href = '/passport'; return; }
    login();
  };

  const current = SLIDES[slide];

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow: hidden; background: #080808; }

        .grain {
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 999; opacity: 0.35;
        }

        .page {
          position: fixed; inset: 0;
          display: flex; flex-direction: column;
          padding: 0 48px;
        }

        /* Top bar */
        .top-bar {
          height: 60px; display: flex; align-items: center;
          justify-content: space-between; flex-shrink: 0;
        }
        .wordmark {
          font-family: 'DM Mono', monospace; font-size: 11px;
          letter-spacing: 0.35em; color: #e8553a; text-transform: uppercase;
        }
        .top-right {
          display: flex; align-items: center; gap: 20px;
        }
        .nav-link {
          font-family: 'DM Mono', monospace; font-size: 9px;
          letter-spacing: 0.2em; color: #333; text-transform: uppercase;
          text-decoration: none; transition: color 0.2s; cursor: pointer; border: none; background: none;
        }
        .nav-link:hover { color: #888; }

        /* Main content */
        .main {
          flex: 1; display: flex; flex-direction: column;
          justify-content: center; position: relative;
        }

        /* Ghost background letter */
        .ghost-bg {
          position: absolute;
          font-family: 'Bebas Neue', sans-serif;
          color: rgba(232,85,58,0.04);
          pointer-events: none; user-select: none;
          line-height: 1; right: -2vw; top: 50%;
          transform: translateY(-50%);
          font-size: 38vw;
          transition: opacity 0.6s ease;
        }

        /* Fading content */
        .content {
          position: relative; z-index: 2;
          transition: opacity 0.5s ease, transform 0.5s ease;
          max-width: 700px;
        }
        .content.hidden {
          opacity: 0; transform: translateY(10px);
        }
        .content.shown {
          opacity: 1; transform: translateY(0);
        }

        .eyebrow {
          font-family: 'DM Mono', monospace; font-size: 9px;
          letter-spacing: 0.5em; color: #444; text-transform: uppercase;
          margin-bottom: 28px;
        }

        .headline {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(72px, 11vw, 148px);
          line-height: 0.88; color: #fff; margin-bottom: 28px;
          text-transform: none;
        }
        .headline em { color: #e8553a; font-style: normal; }

        .sub {
          font-size: 15px; color: #888; line-height: 1.8;
          max-width: 400px; font-weight: 300; margin-bottom: 48px;
        }

        /* CTA — always visible */
        .cta-wrap {
          position: relative; z-index: 2;
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
        }
        .btn-enter {
          display: flex; align-items: center; gap: 10px;
          background: #e8553a; color: #fff; border: none;
          padding: 14px 32px; font-family: 'DM Mono', monospace;
          font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
          border-radius: 4px; cursor: pointer;
          transition: opacity 0.2s, transform 0.15s; font-weight: 500;
        }
        .btn-enter:hover { opacity: 0.85; transform: translateY(-1px); }
        .btn-enter:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .btn-ghost {
          display: flex; align-items: center; gap: 10px;
          background: transparent; color: #fff; border: 1px solid #1e1e1e;
          padding: 14px 32px; font-family: 'DM Mono', monospace;
          font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
          border-radius: 4px; cursor: pointer; text-decoration: none;
          transition: border-color 0.2s, color 0.2s, transform 0.15s;
        }
        .btn-ghost:hover { border-color: #444; color: #e8553a; transform: translateY(-1px); }

        /* Slide dots */
        .dots {
          position: absolute; bottom: 0; left: 0;
          display: flex; gap: 6px; align-items: center;
          padding-bottom: 32px;
        }
        .dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: #1e1e1e; transition: all 0.3s ease; cursor: pointer;
          border: none;
        }
        .dot.active { background: #e8553a; width: 20px; border-radius: 2px; }

        /* Bottom bar */
        .bottom-bar {
          height: 52px; display: flex; align-items: center;
          justify-content: space-between; flex-shrink: 0;
        }
        .beta-pill {
          font-family: 'DM Mono', monospace; font-size: 8px;
          letter-spacing: 0.2em; color: #e8553a;
          background: rgba(232,85,58,0.07);
          border: 1px solid rgba(232,85,58,0.18);
          padding: 5px 10px; border-radius: 4px; text-transform: uppercase;
        }
        .bottom-right {
          font-family: 'DM Mono', monospace; font-size: 8px;
          letter-spacing: 0.2em; color: #1e1e1e; text-transform: uppercase;
        }

        /* Vertical rule */
        .v-rule {
          position: absolute; left: 48px; top: 60px; bottom: 52px;
          width: 1px; background: #0e0e0e; pointer-events: none;
        }

        @media (max-width: 600px) {
          .page { padding: 0 24px; }
          .v-rule { left: 24px; }
          .ghost-bg { font-size: 55vw; }
          .top-right .nav-link:not(:last-child) { display: none; }
        }
      `}</style>

      <div className="grain" />

      <div className="page">
        <div className="v-rule" />

        <div className="top-bar">
          <span className="wordmark">outbound</span>
          <div className="top-right">
            <a className="nav-link" href="https://outboundwear.com" target="_blank" rel="noopener noreferrer">Shop</a>
            <button className="nav-link" onClick={handleJoin} disabled={loading}>
              {loading ? 'Connecting...' : 'Sign in →'}
            </button>
          </div>
        </div>

        <div className="main">
          <div className="ghost-bg">{current.headline[0][0]}</div>

          <div className={`content ${visible ? 'shown' : 'hidden'}`}>
            <p className="eyebrow">{current.eyebrow}</p>
            <h1 className="headline">
              {current.headline.map((line, i) => (
                <span key={i}>
                  {i === current.headline.length - 1
                    ? <em>{line}</em>
                    : line}
                  <br />
                </span>
              ))}
            </h1>
            <p className="sub">{current.sub}</p>
          </div>

          <div className="cta-wrap">
            <button className="btn-enter" onClick={handleJoin} disabled={loading}>
              {loading ? 'Connecting...' : '→ Join Outbound'}
            </button>
            <a className="btn-ghost" href="https://outboundwear.com" target="_blank" rel="noopener noreferrer">
              Shop
            </a>
          </div>

          <div className="dots">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`dot${slide === i ? ' active' : ''}`}
                onClick={() => { setVisible(false); setTimeout(() => { setSlide(i); setVisible(true); }, 600); }}
              />
            ))}
          </div>
        </div>

        <div className="bottom-bar">
          <span className="beta-pill">Beta · Open</span>
          <span className="bottom-right">35M+ nomads · 0 platforms built for them</span>
        </div>
      </div>
    </>
  );
}
