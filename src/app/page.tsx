'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const signInWithGitHub = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  /*const signInWithX = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };*/

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow: hidden; background: #080808; }

        :root {
          --bg: #080808;
          --accent: #e8ff47;
          --text: #fff;
          --dim: #444;
          --border: #111;
        }

        .grain {
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 999;
          opacity: 0.35;
        }

        .top-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 52px;
          display: flex;
          align-items: center;
          padding: 0 48px;
          z-index: 100;
        }

        .wordmark {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.35em;
          color: var(--accent);
          text-transform: uppercase;
        }

        .beta-pill {
          position: fixed;
          bottom: 28px;
          left: 48px;
          font-family: 'DM Mono', monospace;
          font-size: 8px;
          letter-spacing: 0.2em;
          color: var(--accent);
          background: rgba(232,255,71,0.07);
          border: 1px solid rgba(232,255,71,0.18);
          padding: 5px 10px;
          border-radius: 4px;
          z-index: 100;
          text-transform: uppercase;
        }

        .scroll-area {
          width: 100vw;
          height: 100vh;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          scrollbar-width: none;
        }
        .scroll-area::-webkit-scrollbar { display: none; }

        .section {
          height: 100vh;
          scroll-snap-align: start;
          display: flex;
          align-items: center;
          padding: 0 48px;
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid var(--border);
        }

        .ghost {
          position: absolute;
          font-family: 'Bebas Neue', sans-serif;
          color: rgba(255,255,255,0.025);
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
          line-height: 1;
        }

        .eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.5em;
          color: var(--dim);
          text-transform: uppercase;
          margin-bottom: 24px;
        }

        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(80px, 11vw, 156px);
          line-height: 0.88;
          color: var(--text);
          margin-bottom: 36px;
        }
        .hero-title em { color: var(--accent); font-style: normal; }

        .hero-sub {
          font-size: 14px;
          color: var(--dim);
          line-height: 1.8;
          max-width: 340px;
          margin-bottom: 48px;
          font-weight: 300;
        }

        .cta-group { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

        .btn-enter {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--accent);
          color: #080808;
          border: none;
          padding: 13px 28px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border-radius: 6px;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          font-weight: 500;
        }
        .btn-enter:hover { opacity: 0.88; transform: translateY(-1px); }
        .btn-enter:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .btn-enter-x {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          color: #080808;
          border: none;
          padding: 13px 28px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border-radius: 6px;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          font-weight: 500;
        }
        .btn-enter-x:hover { opacity: 0.88; transform: translateY(-1px); }
        .btn-enter-x:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .scroll-hint {
          position: absolute;
          bottom: 32px;
          left: 48px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.3em;
          color: #222;
          text-transform: uppercase;
        }
        .scroll-line { width: 32px; height: 1px; background: #1a1a1a; }

        .s2-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(56px, 8vw, 112px);
          line-height: 0.9;
          color: var(--text);
          margin-bottom: 56px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 36px 80px;
          max-width: 600px;
        }

        .feature-item { display: flex; flex-direction: column; gap: 6px; }

        .feature-icon {
          width: 30px;
          height: 30px;
          border: 1px solid #161616;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          margin-bottom: 6px;
        }

        .feature-name { font-size: 13px; font-weight: 500; color: var(--text); }
        .feature-desc { font-size: 12px; color: var(--dim); line-height: 1.6; font-weight: 300; }

        .section-label {
          position: absolute;
          left: 48px;
          top: 40px;
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.45em;
          color: #222;
          text-transform: uppercase;
        }

        .s3-pre {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.5em;
          color: #2a2a2a;
          text-transform: uppercase;
          margin-bottom: 24px;
        }

        .s3-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(60px, 9vw, 118px);
          line-height: 0.9;
          color: var(--text);
          margin-bottom: 32px;
        }
        .s3-title em { color: var(--accent); font-style: normal; }

        .s3-body {
          font-size: 14px;
          color: var(--dim);
          line-height: 1.9;
          font-weight: 300;
          max-width: 420px;
        }

        .s4-label {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.4em;
          color: var(--dim);
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .s4-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(72px, 11vw, 150px);
          line-height: 0.88;
          color: var(--text);
          margin-bottom: 12px;
        }

        .s4-sub {
          font-size: 13px;
          color: #2a2a2a;
          font-style: italic;
          font-weight: 300;
          margin-bottom: 40px;
        }

        .side-tagline {
          position: absolute;
          right: 48px;
          bottom: 48px;
          text-align: right;
        }
        .side-tagline span {
          display: block;
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.25em;
          color: #1e1e1e;
          text-transform: uppercase;
        }
        .side-tagline span + span {
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0;
          font-size: 11px;
          color: #1a1a1a;
          margin-top: 4px;
        }
      `}</style>

      <div className="grain" />
      <div className="top-bar"><span className="wordmark">outbound</span></div>
      <div className="beta-pill">Beta</div>

      <div className="scroll-area" ref={scrollRef}>

        {/* S1 — Hero */}
        <section className="section">
          <span className="ghost" style={{ fontSize: '30vw', bottom: '-6vw', right: '-2vw' }}>OUT</span>
          <div style={{ maxWidth: 700 }}>
            <p className="eyebrow">Beyond routine — For builders</p>
            <h1 className="hero-title">
              This is not<br />
              a platform.<br />
              <em>It's a shift.</em>
            </h1>
            <p className="hero-sub">
              Outbound is designed for developers who build beyond conventional structures. Find your people. Work anywhere. Connect locally.
            </p>
            <div className="cta-group">
              <button className="btn-enter" onClick={signInWithGitHub} disabled={loading}>
                <GHIcon />
                {loading ? 'Loading...' : 'Enter with GitHub'}
              </button>
            </div>
          </div>
          <div className="scroll-hint"><span className="scroll-line" />Scroll</div>
        </section>

        {/* S2 — Experience */}
        <section className="section">
          <span className="ghost" style={{ fontSize: '22vw', top: '50%', right: '-2vw', transform: 'translateY(-50%)' }}>MOVE</span>
          <span className="section-label">The Experience</span>
          <div style={{ width: '100%', paddingTop: 20 }}>
            <h2 className="s2-title">Move with<br />intention.</h2>
            <div className="features-grid">
              {[
                { icon: '📍', name: 'Discover elevated spaces', desc: 'Curated locations for those who work differently.' },
                { icon: '🌐', name: 'Travel with purpose', desc: 'Every destination becomes a chapter.' },
                { icon: '⚡', name: 'Connect in new cities', desc: 'Find your people wherever you land.' },
                { icon: '〰', name: 'Stay aligned globally', desc: 'Real-time connections across time zones.' },
              ].map(f => (
                <div className="feature-item" key={f.name}>
                  <div className="feature-icon">{f.icon}</div>
                  <span className="feature-name">{f.name}</span>
                  <span className="feature-desc">{f.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* S3 — Private Network */}
        <section className="section">
          <span className="ghost" style={{ fontSize: '28vw', bottom: '-6vw', left: '-2vw' }}>BOUND</span>
          <div style={{ maxWidth: 580 }}>
            <p className="s3-pre">Elevated · Unrestricted</p>
            <h2 className="s3-title">
              A private<br />
              network built<br />
              for the <em>globally<br />inclined.</em>
            </h2>
            <p className="s3-body">
              Not another social platform. Outbound is infrastructure for the way developers actually live — building across cities, crossing time zones, finding signal in the noise.
            </p>
          </div>
          <div className="side-tagline">
            <span>outbound</span>
            <span>The next frontier of global living.</span>
          </div>
        </section>

        {/* S4 — Enter */}
        <section className="section">
          <span className="ghost" style={{ fontSize: '26vw', top: '-4vw', right: '-2vw' }}>IN</span>
          <div>
            <p className="s4-label">For the well-traveled and the soon-to-be.</p>
            <h2 className="s4-title">Enter<br />Outbound.</h2>
            <p className="s4-sub">Currently in beta. Some features may be limited or under development.</p>
            <div className="cta-group">
              <button className="btn-enter" onClick={signInWithGitHub} disabled={loading}>
                <GHIcon />
                {loading ? 'Loading...' : 'Enter with GitHub'}
              </button>
            </div>
          </div>
          <div className="side-tagline">
            <span>outbound</span>
            <span>The next frontier of global living.</span>
          </div>
        </section>

      </div>
    </>
  );
}

function GHIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}
