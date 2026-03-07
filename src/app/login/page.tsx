// src/app/login/page.tsx
// Outbound login — Web3Auth social login, wallet created on first sign-in

'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await login();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #080808;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
        }

        .login-wrap {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        /* ── LEFT PANEL ── */
        .login-left {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          border-right: 1px solid #111;
          position: relative;
          overflow: hidden;
        }

        .login-left::before {
          content: 'OUTBOUND OUTBOUND OUTBOUND OUTBOUND OUTBOUND OUTBOUND OUTBOUND OUTBOUND OUTBOUND OUTBOUND OUTBOUND OUTBOUND OUTBOUND OUTBOUND OUTBOUND';
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%) rotate(-35deg);
          font-family: 'Bebas Neue', sans-serif;
          font-size: 14px;
          letter-spacing: 0.8em;
          color: rgba(232,85,58,0.025);
          white-space: pre-wrap;
          width: 200%;
          line-height: 3.5;
          pointer-events: none;
          text-align: center;
        }

        .login-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px;
          letter-spacing: 0.15em;
          color: #e8553a;
          position: relative;
          z-index: 1;
        }

        .login-hero { position: relative; z-index: 1; }

        .login-headline {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(48px, 5vw, 72px);
          line-height: 0.95;
          color: #fff;
          margin-bottom: 20px;
          letter-spacing: 0.02em;
        }

        .login-headline span { color: #e8553a; }

        .login-sub {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #333;
          line-height: 1.8;
        }

        .login-stats {
          display: flex;
          gap: 32px;
          position: relative;
          z-index: 1;
        }

        .login-stat-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          color: #e8553a;
          line-height: 1;
          margin-bottom: 4px;
        }

        .login-stat-label {
          font-family: 'DM Mono', monospace;
          font-size: 8px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #2a2a2a;
        }

        /* ── RIGHT PANEL ── */
        .login-right {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px;
          max-width: 480px;
          margin: 0 auto;
          width: 100%;
        }

        .login-card-label {
          font-family: 'DM Mono', monospace;
          font-size: 8px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: #2a2a2a;
          margin-bottom: 32px;
        }

        .login-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 36px;
          letter-spacing: 0.05em;
          color: #fff;
          margin-bottom: 8px;
        }

        .login-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #444;
          line-height: 1.6;
          margin-bottom: 40px;
        }

        /* main login button */
        .login-btn {
          width: 100%;
          padding: 18px;
          background: #e8553a;
          color: #080808;
          border: none;
          border-radius: 4px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
        }

        .login-btn:hover:not(:disabled) {
          background: #f0ff6a;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(232,85,58,0.2);
        }

        .login-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .login-btn-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(8,8,8,0.3);
          border-top-color: #080808;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* providers info */
        .login-providers {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .login-provider-chip {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.1em;
          color: #2a2a2a;
          background: #0d0d0d;
          border: 1px solid #161616;
          border-radius: 2px;
          padding: 4px 8px;
        }

        .login-divider {
          color: #161616;
          font-size: 10px;
        }

        /* what you get */
        .login-perks {
          border-top: 1px solid #111;
          padding-top: 28px;
        }

        .login-perks-title {
          font-family: 'DM Mono', monospace;
          font-size: 8px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: #222;
          margin-bottom: 16px;
        }

        .login-perk {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 14px;
        }

        .login-perk-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #e8553a;
          flex-shrink: 0;
          margin-top: 6px;
        }

        .login-perk-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #555;
          line-height: 1.5;
        }

        .login-perk-text strong {
          color: #888;
          font-weight: 500;
        }

        .login-error {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: #ff6b6b;
          letter-spacing: 0.1em;
          text-align: center;
          margin-top: 12px;
        }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .login-wrap { grid-template-columns: 1fr; }
          .login-left {
            padding: 32px 24px 40px;
            border-right: none;
            border-bottom: 1px solid #111;
            min-height: auto;
          }
          .login-right { padding: 40px 24px; max-width: 100%; }
          .login-stats { gap: 20px; }
        }
      `}</style>

      <div className="login-wrap">

        {/* ── LEFT: brand ── */}
        <div className="login-left">
          <div className="login-logo">OUTBOUND</div>

          <div className="login-hero">
            <h1 className="login-headline">
              Never<br />
              travel<br />
              <span>alone</span><br />
              again.
            </h1>
            <p className="login-sub">
              35M+ digital nomads.<br />
              One place to find your people.
            </p>
          </div>

          <div className="login-stats">
            <div>
              <div className="login-stat-num">60+</div>
              <div className="login-stat-label">City Chapters</div>
            </div>
            <div>
              <div className="login-stat-num">35M</div>
              <div className="login-stat-label">Digital Nomads</div>
            </div>
            <div>
              <div className="login-stat-num">$0</div>
              <div className="login-stat-label">To Get Started</div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: login ── */}
        <div className="login-right">
          <div className="login-card-label">Traveler Registry · Outbound Network</div>

          <h2 className="login-title">Get Your Passport</h2>
          <p className="login-desc">
            Sign in with your Google or email — your Outbound passport and wallet are created instantly.
          </p>

          <button className="login-btn" onClick={handleLogin} disabled={loading}>
            {loading ? (
              <><div className="login-btn-spinner" /> Connecting...</>
            ) : (
              '→ Sign In & Get Passport'
            )}
          </button>

          <div className="login-providers">
            {['Google', 'Email', 'Apple', 'Twitter'].map((p, i) => (
              <>
                <span key={p} className="login-provider-chip">{p}</span>
                {i < 3 && <span className="login-divider">·</span>}
              </>
            ))}
          </div>

          {error && <div className="login-error">{error}</div>}

          <div className="login-perks">
            <div className="login-perks-title">What you get</div>

            <div className="login-perk">
              <div className="login-perk-dot" />
              <div className="login-perk-text">
                <strong>Your Outbound Passport</strong> — a travel identity that's yours forever, stamps, badges, and all.
              </div>
            </div>

            <div className="login-perk">
              <div className="login-perk-dot" />
              <div className="login-perk-text">
                <strong>A Base wallet</strong> — send and receive value from any nomad, anywhere, with no bank required.
              </div>
            </div>

            <div className="login-perk">
              <div className="login-perk-dot" />
              <div className="login-perk-text">
                <strong>Access to 60+ city chapters</strong> — find nomads in your city or wherever you're headed.
              </div>
            </div>

            <div className="login-perk">
              <div className="login-perk-dot" />
              <div className="login-perk-text">
                <strong>No crypto knowledge needed</strong> — the wallet is invisible until you need it.
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
