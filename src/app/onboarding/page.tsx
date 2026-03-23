'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/session';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const STEPS = [
  { id: 'wallet',   label: 'Wallet Created',  sub: 'Your Base wallet is live'      },
  { id: 'passport', label: 'Passport Issued', sub: 'Your travel identity is ready' },
  { id: 'network',  label: 'Network Joined',  sub: 'Welcome to 60+ city chapters'  },
];

const VIBES = [
  { id: 'going_out',    label: 'Going out tonight',   icon: '🌙' },
  { id: 'exploring',    label: 'Exploring the city',   icon: '🗺' },
  { id: 'working',      label: 'Working from café',    icon: '⚡' },
  { id: 'down_to_meet', label: 'Down to meet up',      icon: '🤝' },
  { id: 'looking_food', label: 'Looking for food',     icon: '🍜' },
  { id: 'just_landed',  label: 'Just landed',          icon: '✈️' },
  { id: 'chilling',     label: 'Taking it easy',       icon: '🌊' },
  { id: 'need_recs',    label: 'Need recommendations', icon: '💡' },
  { id: 'landing_soon', label: 'Landing soon',         icon: '🛬' },
];

const TRAVELER_TYPES = [
  { id: 'nomad',    label: 'Digital Nomad',    code: 'NMD' },
  { id: 'expat',    label: 'Expat',            code: 'EXP' },
  { id: 'solo',     label: 'Solo Traveler',    code: 'SLO' },
  { id: 'remote',   label: 'Remote Worker',    code: 'RWK' },
  { id: 'explorer', label: 'Adventure Seeker', code: 'ADV' },
  { id: 'slow',     label: 'Slow Traveler',    code: 'SLW' },
];

const COUNTRY_EMOJIS: Record<string, string> = {
  'US':'🇺🇸','GB':'🇬🇧','JP':'🇯🇵','FR':'🇫🇷','DE':'🇩🇪','BR':'🇧🇷','MX':'🇲🇽','CA':'🇨🇦','AU':'🇦🇺','IN':'🇮🇳',
  'KR':'🇰🇷','ES':'🇪🇸','IT':'🇮🇹','PT':'🇵🇹','NL':'🇳🇱','SE':'🇸🇪','NO':'🇳🇴','SG':'🇸🇬','AE':'🇦🇪','AR':'🇦🇷',
  'CL':'🇨🇱','CO':'🇨🇴','PL':'🇵🇱','TR':'🇹🇷','TH':'🇹🇭','VN':'🇻🇳','ID':'🇮🇩','PH':'🇵🇭','ZA':'🇿🇦','NG':'🇳🇬',
  'EG':'🇪🇬','GH':'🇬🇭','KE':'🇰🇪','MA':'🇲🇦','NZ':'🇳🇿','CH':'🇨🇭','AT':'🇦🇹','BE':'🇧🇪','DK':'🇩🇰','GR':'🇬🇷',
  'HR':'🇭🇷','CZ':'🇨🇿','HU':'🇭🇺','RO':'🇷🇴','GE':'🇬🇪','TW':'🇹🇼','MY':'🇲🇾','NP':'🇳🇵','KH':'🇰🇭','EC':'🇪🇨',
  'CR':'🇨🇷','PA':'🇵🇦','PE':'🇵🇪','CN':'🇨🇳',
};

const COUNTRY_NAMES: Record<string, string> = {
  'US':'United States','GB':'United Kingdom','JP':'Japan','FR':'France','DE':'Germany','BR':'Brazil','MX':'Mexico',
  'CA':'Canada','AU':'Australia','IN':'India','KR':'South Korea','ES':'Spain','IT':'Italy',
  'PT':'Portugal','NL':'Netherlands','SE':'Sweden','NO':'Norway','SG':'Singapore','AE':'UAE',
  'AR':'Argentina','CL':'Chile','CO':'Colombia','PL':'Poland','TR':'Turkey','TH':'Thailand',
  'VN':'Vietnam','ID':'Indonesia','PH':'Philippines','ZA':'South Africa','NG':'Nigeria',
  'EG':'Egypt','GH':'Ghana','KE':'Kenya','MA':'Morocco','NZ':'New Zealand','CH':'Switzerland',
  'AT':'Austria','BE':'Belgium','DK':'Denmark','GR':'Greece','HR':'Croatia','CZ':'Czech Republic',
  'HU':'Hungary','RO':'Romania','GE':'Georgia','TW':'Taiwan','MY':'Malaysia','NP':'Nepal',
  'KH':'Cambodia','EC':'Ecuador','CR':'Costa Rica','PA':'Panama','PE':'Peru','CN':'China',
};

async function dbGet(path: string, token: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
  });
  return res.json();
}

async function dbPatch(path: string, token: string, body: object) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  });
}

export default function OnboardingPage() {
  const [profile, setProfile]         = useState<any>({});
  const [step, setStep]               = useState(-1);
  const [username, setUsername]        = useState('');
  const [checking, setChecking]       = useState(false);
  const [usernameOk, setUsernameOk]   = useState<boolean | null>(null);
  const [saving, setSaving]           = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [userId, setUserId]           = useState('');

  // Location — mandatory
  const [cityInput, setCityInput]     = useState('');
  const [locLat, setLocLat]           = useState<number | null>(null);
  const [locLng, setLocLng]           = useState<number | null>(null);
  const [locating, setLocating]       = useState(false);
  const [locMsg, setLocMsg]           = useState('');
  const [resolved, setResolved]       = useState<string | null>(null);

  // Country stamp — first stamp on passport
  const [countryCode, setCountryCode]       = useState<string | null>(null);
  const [countryName, setCountryName]       = useState<string | null>(null);
  const [stampAnimating, setStampAnimating] = useState(false);
  const [stampDone, setStampDone]           = useState(false);

  // Status selections (optional)
  const [selectedVibe, setSelectedVibe]     = useState<string | null>(null);
  const [selectedType, setSelectedType]     = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setStep(0), 400);
    setTimeout(() => setStep(1), 1400);
    setTimeout(() => setStep(2), 2400);
    setTimeout(() => setStep(3), 3400);

    (async () => {
      const session = await getSession();
      if (!session) return;
      setAccessToken(session.access_token);
      setUserId(session.user.id);
      const rows = await dbGet(`profiles?id=eq.${session.user.id}&select=*`, session.access_token);
      if (rows?.[0]) setProfile(rows[0]);
    })();
  }, []);

  useEffect(() => {
    if (!username || username.length < 3) { setUsernameOk(null); return; }
    const timer = setTimeout(async () => {
      setChecking(true);
      try {
        const rows = await dbGet(
          `profiles?username=eq.${encodeURIComponent(username.toLowerCase())}&select=id`,
          accessToken || SUPABASE_KEY
        );
        setUsernameOk(Array.isArray(rows) && rows.length === 0);
      } catch { setUsernameOk(null); }
      setChecking(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [username, accessToken]);

  useEffect(() => { setResolved(null); setCountryCode(null); setCountryName(null); setStampDone(false); }, [cityInput]);

  const detectLocation = () => {
    if (!navigator.geolocation) { setLocMsg('Geolocation not supported — enter location manually'); return; }
    setLocating(true);
    setLocMsg('Detecting your location...');
    setResolved(null);
    setCountryCode(null);
    setCountryName(null);
    setStampDone(false);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        setLocLat(latitude);
        setLocLng(longitude);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const city    = data.address?.city || data.address?.town || data.address?.village || '';
          const country = data.address?.country || '';
          const cc      = data.address?.country_code?.toUpperCase() || '';
          const combined = [city, country].filter(Boolean).join(', ');
          setCityInput(combined);
          setResolved(combined);
          setLocMsg('');

          // Trigger stamp animation
          if (cc) {
            setCountryCode(cc);
            setCountryName(COUNTRY_NAMES[cc] || country || cc);
            setTimeout(() => setStampAnimating(true), 300);
            setTimeout(() => { setStampAnimating(false); setStampDone(true); }, 1800);
          }
        } catch { setLocMsg('Coordinates captured — enter your city below'); }
        setLocating(false);
      },
      () => { setLocMsg('Location access denied — enter your city and country below'); setLocating(false); }
    );
  };

  // Manual location entry — geocode on blur to get country code
  const geocodeManual = async () => {
    if (!cityInput.trim() || resolved) return;
    setLocMsg('Looking up location...');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityInput)}&format=json&addressdetails=1&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data?.[0]) {
        const r = data[0];
        const city    = r.address?.city || r.address?.town || r.address?.village || cityInput;
        const country = r.address?.country || '';
        const cc      = r.address?.country_code?.toUpperCase() || '';
        const combined = [city, country].filter(Boolean).join(', ');
        setLocLat(parseFloat(r.lat));
        setLocLng(parseFloat(r.lon));
        setResolved(combined);
        setCityInput(combined);
        setLocMsg('');

        if (cc) {
          setCountryCode(cc);
          setCountryName(COUNTRY_NAMES[cc] || country || cc);
          setTimeout(() => setStampAnimating(true), 300);
          setTimeout(() => { setStampAnimating(false); setStampDone(true); }, 1800);
        }
      } else {
        setLocMsg('Could not find that location — try "City, Country"');
      }
    } catch { setLocMsg('Lookup failed — try again'); }
  };

  const locationReady = !!(resolved && countryCode);

  const handleFinish = async () => {
    if (!usernameOk || !username || !userId || !accessToken || !locationReady) return;
    setSaving(true);

    const patch: any = {
      username: username.toLowerCase(),
      countries_visited: [countryCode],
    };

    if (selectedVibe) patch.current_vibe = selectedVibe;
    if (selectedType) patch.traveler_type = selectedType;

    if (locLat !== null && locLng !== null && resolved) {
      patch.city = resolved;
      patch.lat  = locLat;
      patch.lng  = locLng;
    } else {
      patch.city = cityInput;
    }

    const res = await dbPatch(`profiles?id=eq.${userId}`, accessToken, patch);
    if (!res.ok) {
      console.error('[onboarding] patch failed', res.status, await res.text());
    }
    window.location.href = '/ground';
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
        .ob-passport::before { content: 'OUTBOUND · OUTBOUND · OUTBOUND · OUTBOUND · OUTBOUND · OUTBOUND'; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-35deg); font-family: 'Bebas Neue', sans-serif; font-size: 10px; letter-spacing: 0.6em; color: rgba(232,85,58,0.025); white-space: nowrap; pointer-events: none; width: 200%; text-align: center; line-height: 3; }
        .ob-passport-header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #141414; }
        .ob-passport-sub { font-family: 'DM Mono', monospace; font-size: 7.5px; letter-spacing: 0.5em; text-transform: uppercase; color: #2a2a2a; margin-bottom: 4px; }
        .ob-passport-title { font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: #fff; letter-spacing: 0.05em; }
        .ob-steps { display: flex; flex-direction: column; gap: 12px; }
        .ob-step { display: flex; align-items: center; gap: 14px; opacity: 0; transform: translateX(-12px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .ob-step.visible { opacity: 1; transform: translateX(0); }
        .ob-step-icon { width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #1a1a1a; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.4s ease; }
        .ob-step.visible .ob-step-icon { border-color: rgba(232,85,58,0.3); background: rgba(232,85,58,0.05); }
        .ob-step-check { font-size: 14px; opacity: 0; transition: opacity 0.3s ease 0.2s; }
        .ob-step.visible .ob-step-check { opacity: 1; }
        .ob-step-info { flex: 1; }
        .ob-step-label { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #1e1e1e; transition: color 0.4s ease; margin-bottom: 2px; }
        .ob-step.visible .ob-step-label { color: #ccc; }
        .ob-step-sub { font-family: 'DM Sans', sans-serif; font-size: 11px; color: #222; transition: color 0.4s ease; }
        .ob-step.visible .ob-step-sub { color: #555; }
        .ob-wallet-line { margin-top: 20px; padding-top: 14px; border-top: 1px solid #111; display: flex; align-items: center; justify-content: space-between; }
        .ob-wallet-lbl { font-family: 'DM Mono', monospace; font-size: 7.5px; letter-spacing: 0.3em; text-transform: uppercase; color: #222; }
        .ob-wallet-addr { font-family: 'DM Mono', monospace; font-size: 11px; color: #e8553a; letter-spacing: 0.08em; opacity: 0; transition: opacity 0.5s ease 3s; }
        .ob-wallet-addr.show { opacity: 1; }
        .ob-form { opacity: 0; transform: translateY(8px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .ob-form.visible { opacity: 1; transform: translateY(0); }
        .ob-form-title { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: #fff; letter-spacing: 0.04em; margin-bottom: 6px; }
        .ob-form-sub { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #444; margin-bottom: 24px; line-height: 1.5; }
        .ob-input-wrap { position: relative; margin-bottom: 8px; }
        .ob-at { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-family: 'DM Mono', monospace; font-size: 13px; color: #333; }
        .ob-input { width: 100%; background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 4px; padding: 14px 14px 14px 28px; font-family: 'DM Mono', monospace; font-size: 14px; color: #fff; outline: none; transition: border-color 0.2s; letter-spacing: 0.05em; }
        .ob-input:focus { border-color: #2a2a2a; }
        .ob-input.ok    { border-color: rgba(232,85,58,0.4); }
        .ob-input.taken { border-color: rgba(255,80,80,0.4); }
        .ob-input-status { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; height: 16px; margin-bottom: 20px; }
        .ob-input-status.ok    { color: #e8553a; }
        .ob-input-status.taken { color: #ff5050; }
        .ob-input-status.checking { color: #333; }
        .ob-divider { height: 1px; background: #141414; margin: 20px 0; }
        .ob-loc-label { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: #333; margin-bottom: 4px; }
        .ob-loc-required { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.15em; color: #e8553a; margin-bottom: 12px; }
        .ob-loc-btn { width: 100%; background: transparent; border: 1px solid #1a1a1a; border-radius: 4px; padding: 12px; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #444; cursor: pointer; transition: all 0.2s; margin-bottom: 10px; }
        .ob-loc-btn:hover { border-color: rgba(232,85,58,0.3); color: #e8553a; }
        .ob-loc-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .ob-loc-input { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 4px; padding: 11px 14px; font-family: 'DM Mono', monospace; font-size: 12px; color: #fff; outline: none; width: 100%; transition: border-color 0.2s; }
        .ob-loc-input:focus { border-color: #2a2a2a; }
        .ob-loc-input::placeholder { color: #2a2a2a; }
        .ob-loc-msg { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.15em; color: #555; margin-bottom: 8px; min-height: 14px; }
        .ob-resolved { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.1em; color: #e8553a; background: rgba(232,85,58,0.05); border: 1px solid rgba(232,85,58,0.15); border-radius: 3px; padding: 7px 12px; margin-bottom: 16px; }

        /* First stamp animation */
        .ob-stamp-area { margin-bottom: 20px; }
        .ob-stamp-card { background: #111; border: 1px solid #1a1a1a; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 10px; position: relative; overflow: hidden; }
        .ob-stamp-flag { font-size: 48px; line-height: 1; opacity: 0; transform: scale(2) rotate(-15deg); transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .ob-stamp-flag.animating { opacity: 1; transform: scale(1.2) rotate(-5deg); }
        .ob-stamp-flag.done { opacity: 1; transform: scale(1) rotate(0deg); }
        .ob-stamp-ring { width: 80px; height: 80px; border-radius: 50%; border: 2.5px solid transparent; display: flex; align-items: center; justify-content: center; transition: border-color 0.4s ease 0.3s; }
        .ob-stamp-ring.animating { border-color: #e8553a; }
        .ob-stamp-ring.done { border-color: rgba(232,85,58,0.4); }
        .ob-stamp-country { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: #fff; opacity: 0; transform: translateY(8px); transition: all 0.4s ease 0.6s; }
        .ob-stamp-country.show { opacity: 1; transform: translateY(0); }
        .ob-stamp-label { font-family: 'DM Mono', monospace; font-size: 7px; letter-spacing: 0.4em; text-transform: uppercase; color: #333; opacity: 0; transition: opacity 0.3s ease 0.8s; }
        .ob-stamp-label.show { opacity: 1; color: #e8553a; }
        .ob-stamp-msg { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.15em; color: #47ff8c; opacity: 0; transition: opacity 0.4s ease 1s; text-align: center; margin-top: 4px; }
        .ob-stamp-msg.show { opacity: 1; }

        .ob-finish-btn { width: 100%; padding: 16px; background: #e8553a; color: #080808; border: none; border-radius: 4px; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; margin-top: 8px; }
        .ob-finish-btn:hover:not(:disabled) { background: #f0ff6a; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(232,85,58,0.2); }
        .ob-finish-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }
        .ob-section-head { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.4em; text-transform: uppercase; color: #333; margin-bottom: 10px; }
        .ob-vibe-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 6px; }
        .ob-vibe-btn { display: flex; align-items: center; gap: 6px; padding: 7px 11px; border: 1px solid #1a1a1a; border-radius: 2px; font-family: 'DM Mono', monospace; font-size: 10px; color: #444; background: transparent; cursor: pointer; transition: all 0.15s; }
        .ob-vibe-btn:hover { border-color: #555; color: #888; }
        .ob-vibe-btn.on { border-color: rgba(232,85,58,0.3); color: #e8553a; background: rgba(232,85,58,0.05); }
        .ob-type-row { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 6px; }
        .ob-type-chip { font-family: 'DM Mono', monospace; font-size: 8.5px; letter-spacing: 0.12em; text-transform: uppercase; padding: 4px 9px; border: 1px solid #1a1a1a; border-radius: 2px; color: #444; background: transparent; cursor: pointer; transition: all 0.14s; }
        .ob-type-chip:hover { border-color: #555; color: #888; }
        .ob-type-chip.on { background: #e8553a; color: #080808; border-color: #e8553a; }
        .ob-optional { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.15em; color: #222; text-transform: uppercase; display: inline-block; margin-left: 6px; }
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
                  <div className="ob-step-icon"><span className="ob-step-check">✓</span></div>
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
            <p className="ob-form-sub">Choose your handle — this is how other travelers will find you.</p>

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

            <div className="ob-divider" />
            <div className="ob-loc-label">📍 Where are you right now?</div>
            <div className="ob-loc-required">Your first passport stamp is based on your current location</div>

            <button className="ob-loc-btn" onClick={detectLocation} disabled={locating}>
              {locating ? 'Detecting location...' : '◎ Detect my location'}
            </button>

            <input
              className="ob-loc-input"
              style={{ width: '100%', marginBottom: 8 }}
              placeholder="Or type: City, Country (e.g. Tokyo, Japan)"
              value={cityInput}
              onChange={e => setCityInput(e.target.value)}
              onBlur={geocodeManual}
            />

            {locMsg && <div className="ob-loc-msg">{locMsg}</div>}

            {resolved && !countryCode && (
              <div className="ob-resolved">✓ Resolved to: {resolved}</div>
            )}

            {/* First stamp animation */}
            {countryCode && (
              <div className="ob-stamp-area">
                <div className="ob-stamp-card">
                  <div className="ob-stamp-label show">First entry stamp</div>
                  <div className={`ob-stamp-ring${stampAnimating ? ' animating' : stampDone ? ' done' : ''}`}>
                    <span className={`ob-stamp-flag${stampAnimating ? ' animating' : stampDone ? ' done' : ''}`}>
                      {COUNTRY_EMOJIS[countryCode] || '🏳'}
                    </span>
                  </div>
                  <div className={`ob-stamp-country${stampAnimating || stampDone ? ' show' : ''}`}>
                    {countryName}
                  </div>
                  <div className={`ob-stamp-msg${stampDone ? ' show' : ''}`}>
                    ✓ Stamped on your passport
                  </div>
                </div>
              </div>
            )}

            {/* Status section — optional */}
            <div className="ob-divider" />

            <div style={{ marginBottom: 16 }}>
              <div className="ob-section-head">
                What are you up to?
                <span className="ob-optional">· optional</span>
              </div>
              <div className="ob-vibe-row">
                {VIBES.map(v => (
                  <button
                    key={v.id}
                    className={`ob-vibe-btn${selectedVibe === v.id ? ' on' : ''}`}
                    onClick={() => setSelectedVibe(selectedVibe === v.id ? null : v.id)}
                  >
                    {v.icon} {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div className="ob-section-head">
                Traveler Type
                <span className="ob-optional">· optional</span>
              </div>
              <div className="ob-type-row">
                {TRAVELER_TYPES.map(t => (
                  <button
                    key={t.id}
                    className={`ob-type-chip${selectedType === t.id ? ' on' : ''}`}
                    onClick={() => setSelectedType(selectedType === t.id ? null : t.id)}
                  >
                    {t.code} · {t.label}
                  </button>
                ))}
              </div>
            </div>

            <button className="ob-finish-btn" disabled={!usernameOk || !locationReady || saving} onClick={handleFinish}>
              {saving ? 'Saving...' : locationReady ? 'Open My Passport →' : 'Detect location to continue'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
