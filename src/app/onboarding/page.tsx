// src/app/onboarding/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const STEPS = [
  { id: 'wallet',   label: 'Wallet Created',  sub: 'Your Base wallet is live'      },
  { id: 'passport', label: 'Passport Issued', sub: 'Your travel identity is ready' },
  { id: 'network',  label: 'Network Joined',  sub: 'Welcome to 60+ city chapters'  },
];

export default function OnboardingPage() {
  const [profile, setProfile]       = useState<any>(null);
  const [step, setStep]             = useState(-1);
  const [username, setUsername]     = useState('');
  const [checking, setChecking]     = useState(false);
  const [usernameOk, setUsernameOk] = useState<boolean | null>(null);
  const [saving, setSaving]         = useState(false);
  const supabase = createClient();
  const router   = useRouter();

  useEffect(() => {
    const load = async () => {
      // If tokens are in URL params, set the session first
      const params = new URLSearchParams(window.location.search);
      const at  = params.get('at');
      const rt  = params.get('rt');

      if (at && rt) {
        await supabase.auth.setSession({
          access_token: decodeURIComponent(at),
          refresh_token: decodeURIComponent(rt),
        });
        // Clean tokens from URL
        window.history.replaceState(null, '', '/onboarding');
      }

      // Now get the session
      let { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        await new Promise(r => setTimeout(r, 1500));
        const retry = await supabase.auth.getSession();
        session = retry.data.session;
      }
      if (!session) { router.push('/'); return; }

      const { data } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).maybeSingle();
      setProfile(data || {});

      setTimeout(() => setStep(0), 400);
      setTimeout(() => setStep(1), 1400);
      setTimeout(() => setStep(2), 2400);
      setTimeout(() => setStep(3), 3400);
    };
    load();
  }, []);

  useEffect(() => {
    if (!username || username.length < 3) { setUsernameOk(null); return; }
    const timer = setTimeout(async () => {
      setChecking(true);
      const { data } = await supabase
        .from('profiles').select('id').eq('username', username.toLowerCase()).maybeSingle();
      setUsernameOk(!data);
      setChecking(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [username]);

  const handleFinish = async () => {
    if (!usernameOk || !username) return;
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/'); return; }
    await supabase.from('profiles').update({
      username: username.toLowerCase(),
      updated_at: new Date().toISOString(),
    }).eq('id', session.user.id);
    router.push('/passport');
  };

  const walletShort = profile?.wallet_address
    ? `${profile.wallet_address.slice(0,6)}...${profile.wallet_address.slice(-4)}`
    : '—';

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; color: #fff; font-family: 'DM Sans', sans-serif; }
        .ob-wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; }
        .ob-card { width: 100%; max-width: 480px; }
        .ob-wordmark { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.5em; text-transform: uppercase; color: #222; margin-bottom: 48px; text-align: center; }
        .ob-passport { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 8px; padding: 28px; margin-bottom: 40px; position: relative; overflow: hidden; }
        .ob-passport::before { content: 'OUTBOUND · OUTBOUND · OUTBOUND · OUTBOUND · OUTBOUND · OUTBOUND'; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-35deg); font-family: 'Bebas Neue', sans-serif; font-size: 10px; letter-spacing: 0.6em; color: rgba(232,255,71,0.025); white-space: nowrap; pointer-events: none; width: 200%; text-align: center; line-height: 3; }
        .ob-passport-header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #141414; }
        .ob-passport-sub { font-family: 'DM Mono', monospace; font-size: 7.5px; letter-spacing: 0.5em; text-transform: uppercase; color: #2a2a2a; margin-bottom: 4px; }
        .ob-passport-title { font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: #fff; letter-spacing: 0.05em; }
        .ob-steps { display: flex; flex-direction: column; gap: 12px; }
        .ob-step { display: flex; align-items: center; gap: 14px; opacity: 0; transform: translateX(-12px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .ob-step.visible { opacity: 1; transform: translateX(0); }
        .ob-step-icon { width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #1a1a1a; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.4s ease; }
        .ob-step.visible .ob-step-icon { border-color: rgba(232,255,71,0.3); background: rgba(232,255,71,0.05); }
        .ob-step-check { font-size: 14px; opacity: 0; transition: opacity 0.3s ease 0.2s; }
        .ob-step.visible .ob-step-check { opacity: 1; }
        .ob-step-info { flex: 1; }
        .ob-step-label { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #1e1e1e; transition: color 0.4s ease; margin-bottom: 2px; }
        .ob-step.visible .ob-step-label { color: #ccc; }
        .ob-step-sub { font-family: 'DM Sans', sans-serif; font-size: 11px; color: #222; transition: color 0.4s ease; }
        .ob-step.visible .ob-step-sub { color: #555; }
        .ob-wallet-line { margin-top: 20px; padding-top: 14px; border-top: 1px solid #111; display: flex; align-items: center; justify-content: space-between; }
        .ob-wallet-lbl { font-family: 'DM Mono', monospace; font-size: 7.5px; letter-spacing: 0.3em; text-transform: uppercase; color: #222; }
        .ob-wallet-addr { font-family: 'DM Mono', monospace; font-size: 11px; color: #e8ff47; letter-spacing: 0.08em; opacity: 0; transition: opacity 0.5s ease 3s; }
        .ob-wallet-addr.show { opacity: 1; }
        .ob-form { opacity: 0; transform: translateY(8px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .ob-form.visible { opacity: 1; transform: translateY(0); }
        .ob-form-title { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: #fff; letter-spacing: 0.04em; margin-bottom: 6px; }
        .ob-form-sub { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #444; margin-bottom: 24px; line-height: 1.5; }
        .ob-input-wrap { position: relative; margin-bottom: 8px; }
        .ob-at { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-family: 'DM Mono', monospace; font-size: 13px; color: #333; }
        .ob-input { width: 100%; background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 4px; padding: 14px 14px 14px 28px; font-family: 'DM Mono', monospace; font-size: 14px; color: #fff; outline: none; transition: border-color 0.2s; letter-spacing: 0.05em; }
        .ob-input:focus { border-color: #2a2a2a; }
        .ob-input.ok    { border-color: rgba(232,255,71,0.4); }
        .ob-input.taken { border-color: rgba(255,80,80,0.4); }
        .ob-input-status { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; height: 16px; margin-bottom: 20px; }
        .ob-input-status.ok    { color: #e8ff47; }
        .ob-input-status.taken { color: #ff5050; }
        .ob-input-status.checking { color: #333; }
        .ob-finish-btn { width: 100%; padding: 16px; background: #e8ff47; color: #080808; border: none; border-radius: 4px; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
        .ob-finish-btn:hover:not(:disabled) { background: #f0ff6a; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(232,255,71,0.2); }
        .ob-finish-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }
      `}</style>

      <div className="ob-wrap">
        <div className="ob-card">
          <div className="ob-wordmark">outbound network · traveler registry</div>

          <div className="ob-passport">
            <div className="ob-passport-header">
              <div className="ob-passport-sub">Outbound Network · Traveler Registry</div>
              <div className="ob-passport-title">PASSPORT CREATION</div>
            </div>
            <div className="ob-steps">
              {STEPS.map((s, i) => (
                <div key={s.id} className={`ob-step${step >= i ? ' visible' : ''}`}>
                  <div className="ob-step-icon">
                    <span className="ob-step-check">✓</span>
                  </div>
                  <div className="ob-step-info">
                    <div className="ob-step-label">{s.label}</div>
                    <div className="ob-step-sub">{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="ob-wallet-line">
              <div className="ob-wallet-lbl">Base Wallet</div>
              <div className={`ob-wallet-addr${step >= 1 ? ' show' : ''}`}>{walletShort}</div>
            </div>
          </div>

          <div className={`ob-form${step >= 3 ? ' visible' : ''}`}>
            <div className="ob-form-title">One Last Thing</div>
            <p className="ob-form-sub">
              Choose your handle — this is how other nomads will find you and send you value.
            </p>
            <div className="ob-input-wrap">
              <span className="ob-at">@</span>
              <input
                className={`ob-input${usernameOk === true ? ' ok' : usernameOk === false ? ' taken' : ''}`}
                placeholder="yourhandle"
                value={username}
                onChange={e => setUsername(e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase())}
                maxLength={24}
              />
            </div>
            <div className={`ob-input-status${checking ? ' checking' : usernameOk === true ? ' ok' : usernameOk === false ? ' taken' : ''}`}>
              {checking ? 'checking...' : usernameOk === true ? '✓ available' : usernameOk === false ? '✕ taken — try another' : ''}
            </div>
            <button className="ob-finish-btn" disabled={!usernameOk || saving} onClick={handleFinish}>
              {saving ? 'Saving...' : 'Open My Passport →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
