'use client';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/session';

const SCENARIOS = [
  { num: '01', city: 'Tokyo',    text: "You just landed. Open Outbound — see 4 people in Shinjuku right now. One's been here 6 months. Dinner sorted." },
  { num: '02', city: 'Medellín', text: "You're moving next month. Join the Colombia room. Ask what neighbourhood. Get 12 real answers in an hour." },
  { num: '03', city: 'Bali',     text: "Power's out across Canggu. Someone posts a safety update. You know before the travel blogs do." },
  { num: '04', city: 'Anywhere', text: "6 weeks alone on the road. Outbound shows 3 nomads in your city this week. You're not alone anymore." },
];

export default function HomePage() {
  const { login, loading } = useAuth();

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
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #080808; color: #fff; font-family: 'DM Sans', sans-serif; }

        .grain {
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 999; opacity: 0.3;
        }

        .ghost-bg {
          position: fixed; right: -2vw; bottom: -4vw;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28vw; color: rgba(232,85,58,0.03);
          pointer-events: none; user-select: none; line-height: 1; z-index: 0;
        }

        /* ── DESKTOP: split ── */
        .layout {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .left {
          position: sticky; top: 0;
          min-height: 100vh;
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 40px 48px;
          border-right: 1px solid #111;
        }

        .wordmark {
          font-family: 'DM Mono', monospace; font-size: 10px;
          letter-spacing: 0.4em; color: #e8553a; text-transform: uppercase;
        }

        .left-body { flex: 1; display: flex; flex-direction: column; justify-content: center; }

        .headline {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(56px, 6.5vw, 100px);
          line-height: 0.9; color: #fff;
          margin-bottom: 24px; text-transform: none;
        }
        .headline em { color: #e8553a; font-style: normal; }

        .tagline {
          font-size: 14px; color: #666; line-height: 1.8;
          max-width: 320px; font-weight: 300; margin-bottom: 16px;
        }

        .btn-enter {
          display: inline-flex; align-items: center; gap: 10px;
          background: #e8553a; color: #fff; border: none;
          padding: 14px 32px; font-family: 'DM Mono', monospace;
          font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
          border-radius: 3px; cursor: pointer;
          transition: opacity 0.2s, transform 0.15s; font-weight: 500;
        }
        .btn-enter:hover { opacity: 0.85; transform: translateY(-1px); }
        .btn-enter:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .left-footer {
          display: flex; align-items: center; justify-content: space-between;
        }

        .beta-pill {
          font-family: 'DM Mono', monospace; font-size: 8px;
          letter-spacing: 0.2em; color: #e8553a;
          background: rgba(232,85,58,0.07);
          border: 1px solid rgba(232,85,58,0.18);
          padding: 5px 10px; border-radius: 3px; text-transform: uppercase;
        }

        .shop-link {
          font-family: 'DM Mono', monospace; font-size: 8px;
          letter-spacing: 0.2em; color: #333; text-transform: uppercase;
          text-decoration: none; transition: color 0.2s;
        }
        .shop-link:hover { color: #666; }

        .right {
          display: flex; flex-direction: column; justify-content: center;
          padding: 40px 48px;
        }

        .scenarios-label {
          font-family: 'DM Mono', monospace; font-size: 8px;
          letter-spacing: 0.4em; color: #2a2a2a; text-transform: uppercase;
          margin-bottom: 32px;
        }

        .scenario {
          display: flex; gap: 20px; align-items: flex-start;
          padding: 20px 0; border-bottom: 1px solid #0f0f0f;
        }
        .scenario:first-of-type { border-top: 1px solid #0f0f0f; }

        .scenario-num {
          font-family: 'Bebas Neue', sans-serif; font-size: 28px;
          color: rgba(232,85,58,0.2); line-height: 1;
          flex-shrink: 0; width: 28px; padding-top: 2px;
        }

        .scenario-body { flex: 1; }

        .scenario-city {
          font-family: 'DM Mono', monospace; font-size: 9px;
          letter-spacing: 0.25em; color: #e8553a; text-transform: uppercase;
          margin-bottom: 6px;
        }

        .scenario-text {
          font-size: 13px; color: #666; line-height: 1.75; font-weight: 300;
        }

        /* ── MOBILE: single column ── */
        @media (max-width: 768px) {
          .layout {
            grid-template-columns: 1fr;
            min-height: 100vh;
          }

          .left {
            position: static; min-height: unset;
            border-right: none;
            padding: 40px 24px 0;
          }

          /* hide desktop CTA + footer on mobile */
          .left .btn-enter { display: none; }
          .left-footer { display: none; }

          .right {
            padding: 32px 24px 0;
          }

          .mobile-bottom {
            padding: 28px 24px 48px;
            display: flex; flex-direction: column; gap: 16px;
          }

          .mobile-bottom .btn-enter {
            width: 100%; justify-content: center; display: flex;
          }

          .mobile-footer {
            display: flex; align-items: center; justify-content: space-between;
          }
        }

        /* hide mobile-bottom on desktop */
        .mobile-bottom { display: none; }
        @media (max-width: 768px) {
          .mobile-bottom { display: flex; flex-direction: column; }
        }
      `}</style>

      <div className="grain" />
      <div className="ghost-bg">OB</div>

      <div className="layout">
        {/* LEFT */}
        <div className="left">
          <div className="wordmark">outbound</div>
          <div className="left-body">
            <h1 className="headline">
              Never travel<br />alone<br /><em>again.</em>
            </h1>
            <p className="tagline">
              A real-time network for people who live and work across borders. Find your people, wherever you land.
            </p>
            <button className="btn-enter" onClick={handleJoin} disabled={loading}>
              {loading ? 'Connecting...' : '→ Join Outbound'}
            </button>
          </div>
          <div className="left-footer">
            <span className="beta-pill">Beta · Open</span>
            <a className="shop-link" href="https://outboundwear.com" target="_blank" rel="noopener noreferrer">Shop →</a>
          </div>
        </div>

        {/* RIGHT — scenarios */}
        <div className="right">
          <div className="scenarios-label">Everything you need on the road</div>
          {SCENARIOS.map(s => (
            <div className="scenario" key={s.num}>
              <span className="scenario-num">{s.num}</span>
              <div className="scenario-body">
                <div className="scenario-city">{s.city}</div>
                <div className="scenario-text">{s.text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile bottom — CTA after scenarios */}
        <div className="mobile-bottom">
          <button className="btn-enter" onClick={handleJoin} disabled={loading}>
            {loading ? 'Connecting...' : '→ Join Outbound'}
          </button>
          <div className="mobile-footer">
            <span className="beta-pill">Beta · Open</span>
            <a className="shop-link" href="https://outboundwear.com" target="_blank" rel="noopener noreferrer">Shop →</a>
          </div>
        </div>
      </div>
    </>
  );
}
