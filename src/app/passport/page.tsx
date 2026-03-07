'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/session';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const TRAVELER_TYPES = [
  { id: 'nomad',    label: 'Digital Nomad',   code: 'NMD' },
  { id: 'expat',    label: 'Expat',            code: 'EXP' },
  { id: 'solo',     label: 'Solo Traveler',    code: 'SLO' },
  { id: 'remote',   label: 'Remote Worker',    code: 'RWK' },
  { id: 'explorer', label: 'Adventure Seeker', code: 'ADV' },
  { id: 'slow',     label: 'Slow Traveler',    code: 'SLW' },
];

const VIBES = [
  { id: 'settling',    label: 'Settling In',   icon: '🏠' },
  { id: 'exploring',  label: 'Exploring',      icon: '🗺' },
  { id: 'working',    label: 'Deep Work',      icon: '⚡' },
  { id: 'socializing',label: 'Meeting People', icon: '🤝' },
  { id: 'moving',     label: 'In Transit',     icon: '✈' },
  { id: 'recharging', label: 'Recharging',     icon: '🌊' },
];

const COUNTRY_EMOJIS: Record<string, string> = {
  'US':'🇺🇸','GB':'🇬🇧','JP':'🇯🇵','FR':'🇫🇷','DE':'🇩🇪',
  'BR':'🇧🇷','MX':'🇲🇽','CA':'🇨🇦','AU':'🇦🇺','IN':'🇮🇳',
  'KR':'🇰🇷','ES':'🇪🇸','IT':'🇮🇹','PT':'🇵🇹','NL':'🇳🇱',
  'SE':'🇸🇪','NO':'🇳🇴','SG':'🇸🇬','AE':'🇦🇪','AR':'🇦🇷',
  'CL':'🇨🇱','CO':'🇨🇴','PL':'🇵🇱','TR':'🇹🇷','TH':'🇹🇭',
  'VN':'🇻🇳','ID':'🇮🇩','PH':'🇵🇭','ZA':'🇿🇦','NG':'🇳🇬',
  'EG':'🇪🇬','GH':'🇬🇭','KE':'🇰🇪','MA':'🇲🇦','NZ':'🇳🇿',
  'CH':'🇨🇭','AT':'🇦🇹','BE':'🇧🇪','DK':'🇩🇰','GR':'🇬🇷',
  'HR':'🇭🇷','CZ':'🇨🇿','HU':'🇭🇺','RO':'🇷🇴','GE':'🇬🇪',
  'TW':'🇹🇼','MY':'🇲🇾','NP':'🇳🇵','KH':'🇰🇭','EC':'🇪🇨',
  'CR':'🇨🇷','PA':'🇵🇦','PE':'🇵🇪','CN':'🇨🇳',
};

const COUNTRY_NAMES: Record<string,string> = {
  'US':'United States','GB':'United Kingdom','JP':'Japan','FR':'France',
  'DE':'Germany','BR':'Brazil','MX':'Mexico','CA':'Canada','AU':'Australia',
  'IN':'India','CN':'China','KR':'South Korea','ES':'Spain','IT':'Italy',
  'PT':'Portugal','NL':'Netherlands','SE':'Sweden','NO':'Norway','SG':'Singapore',
  'AE':'UAE','AR':'Argentina','CL':'Chile','CO':'Colombia','PL':'Poland',
  'TR':'Turkey','TH':'Thailand','VN':'Vietnam','ID':'Indonesia','PH':'Philippines',
  'ZA':'South Africa','NG':'Nigeria','EG':'Egypt','GH':'Ghana','KE':'Kenya',
  'MA':'Morocco','NZ':'New Zealand','CH':'Switzerland','AT':'Austria',
  'BE':'Belgium','DK':'Denmark','GR':'Greece','HR':'Croatia','CZ':'Czech Republic',
  'HU':'Hungary','RO':'Romania','GE':'Georgia','TW':'Taiwan','MY':'Malaysia',
  'NP':'Nepal','KH':'Cambodia','EC':'Ecuador','CR':'Costa Rica','PA':'Panama','PE':'Peru',
};

const ALL_BADGES = [
  { id:'founding_member', label:'FOUNDING MEMBER',  desc:'Joined during beta',        code:'FM-001' },
  { id:'first_stamp',     label:'FIRST STAMP',       desc:'Added your first country',  code:'FS-001' },
  { id:'globe_trotter',   label:'GLOBE TROTTER',     desc:'5+ countries visited',      code:'GT-005' },
  { id:'continent_hopper',label:'CONTINENT HOPPER',  desc:'3+ continents explored',    code:'CH-003' },
  { id:'nomad_certified', label:'NOMAD CERTIFIED',   desc:'10+ countries visited',     code:'NC-010' },
  { id:'local_legend',    label:'LOCAL LEGEND',      desc:'Active in your city',       code:'LL-001' },
  { id:'event_host',      label:'EVENT HOST',        desc:'Hosted a local meetup',     code:'EH-001' },
  { id:'connector',       label:'CONNECTOR',         desc:'Helped 5+ travelers',       code:'CN-005' },
  { id:'early_bird',      label:'EARLY BIRD',        desc:'Active in the first week',  code:'EB-001' },
  { id:'storyteller',     label:'STORYTELLER',       desc:'10+ posts in Feed',         code:'ST-010' },
];

const STAMP_COLORS = ['#e8ff47','#4fc3f7','#81c784','#ce93d8','#ffb74d','#4dd0e1','#ef9a9a','#fff176'];

function getEarnedBadges(profile: any): string[] {
  const earned = ['founding_member','early_bird'];
  const c = profile?.countries_visited || [];
  if (c.length >= 1)  earned.push('first_stamp');
  if (c.length >= 5)  earned.push('globe_trotter');
  if (c.length >= 10) earned.push('nomad_certified');
  if (profile?.lat && profile?.lng) earned.push('local_legend');
  return earned;
}

function stampColor(code: string): string {
  let h = 0;
  for (const ch of code) h = (h * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return STAMP_COLORS[Math.abs(h) % STAMP_COLORS.length];
}

function fmtDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')} ${['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][d.getMonth()]} ${d.getFullYear()}`;
}

function mrz(name: string, id: string) {
  const n = (name||'TRAVELER').toUpperCase().replace(/[^A-Z]/g,'').padEnd(18,'<').slice(0,18);
  const i = (id||'OUTBOUND').toUpperCase().replace(/[^A-Z0-9]/g,'').padEnd(9,'<').slice(0,9);
  return [
    `P<OUTBOUND${n}<<<<<<<<<<<<<<<<<<<<<<<<<<<`,
    `${i}<<0000000000NMD0000000<<<<<6`,
  ];
}

export default function PassportPage() {
  const [profile, setProfile]             = useState<any>(null);
  const [loading, setLoading]             = useState(true);
  const [loadError, setLoadError]         = useState('');
  const [editingBio, setEditingBio]       = useState(false);
  const [bioText, setBioText]             = useState('');
  const [addingCountry, setAddingCountry] = useState(false);
  const [search, setSearch]               = useState('');
  const [page, setPage]                   = useState(0);
  const [token, setToken]                 = useState('');
  const [userId, setUserId]               = useState('');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      console.log('[passport] loading...');
      const session = await getSession();
      console.log('[passport] session:', session ? `uid=${session.user.id}` : 'null');

      if (!session) {
        console.log('[passport] no session → home');
        router.push('/');
        return;
      }

      setToken(session.access_token);
      setUserId(session.user.id);

      // Retry up to 4 times — profile row may not be committed yet after onboarding
      let data = null;
      for (let i = 0; i < 4; i++) {
        console.log(`[passport] fetch attempt ${i + 1}...`);
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/profiles?id=eq.${session.user.id}&select=*`,
          { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${session.access_token}` } }
        );
        const rows = await res.json();
        console.log('[passport] rows:', rows);
        data = rows?.[0] || null;
        if (data) break;
        await new Promise(r => setTimeout(r, 1000));
      }

      if (!data) {
        console.log('[passport] no profile found after retries');
        setLoadError(`No profile found for user ${session.user.id}. Try logging in again.`);
        setLoading(false);
        return;
      }

      setProfile(data);
      setBioText(data?.bio || '');
      setLoading(false);
    })();
  }, []);

  async function dbPatch(body: object) {
    return fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
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

  const saveBio = async () => {
    await dbPatch({ bio: bioText });
    setProfile({ ...profile, bio: bioText });
    setEditingBio(false);
  };

  const setType = async (type: string) => {
    await dbPatch({ traveler_type: type });
    setProfile({ ...profile, traveler_type: type });
  };

  const setVibe = async (vibe: string) => {
    await dbPatch({ current_vibe: vibe });
    setProfile({ ...profile, current_vibe: vibe });
  };

  const addCountry = async (code: string) => {
    const updated = [...(profile.countries_visited || []), code];
    await dbPatch({ countries_visited: updated });
    setProfile({ ...profile, countries_visited: updated });
    setAddingCountry(false);
    setSearch('');
  };

  const removeCountry = async (code: string) => {
    const updated = (profile.countries_visited || []).filter((c: string) => c !== code);
    await dbPatch({ countries_visited: updated });
    setProfile({ ...profile, countries_visited: updated });
  };

  if (loading) return (
    <div style={{ height:'100vh', background:'#080808', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div style={{ width:32, height:32, border:'2px solid #1a1a1a', borderTop:'2px solid #e8ff47', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <p style={{ fontFamily:'DM Mono, monospace', fontSize:11, color:'#333', letterSpacing:'0.2em', textTransform:'uppercase' }}>loading passport...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (loadError) return (
    <div style={{ height:'100vh', background:'#080808', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16, padding:32 }}>
      <p style={{ fontFamily:'DM Mono, monospace', fontSize:11, color:'#ff5050', letterSpacing:'0.1em', textAlign:'center' }}>{loadError}</p>
      <button onClick={() => router.push('/')} style={{ fontFamily:'DM Mono, monospace', fontSize:10, color:'#e8ff47', background:'transparent', border:'1px solid rgba(232,255,71,0.3)', padding:'8px 20px', borderRadius:3, cursor:'pointer', letterSpacing:'0.15em', textTransform:'uppercase' }}>← Back Home</button>
    </div>
  );

  const earnedBadges = getEarnedBadges(profile);
  const countries    = profile?.countries_visited || [];
  const mrzLines     = mrz(profile?.full_name || profile?.username || '', profile?.id?.slice(0,8) || '');
  const filtered     = Object.entries(COUNTRY_NAMES).filter(([code, name]) =>
    !countries.includes(code) && name.toLowerCase().includes(search.toLowerCase())
  );
  const PAGES = ['IDENTITY', 'STAMPS', 'BADGES', 'STATUS'];

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; color: #fff; font-family: 'DM Sans', sans-serif; }
        .pp-wrap { min-height: 100vh; padding: 80px 16px 140px; display: flex; flex-direction: column; align-items: center; }
        .pp-book { width: 100%; max-width: 560px; }
        .pp-tabs { display: flex; gap: 0; padding-left: 20px; margin-bottom: -1px; position: relative; z-index: 2; }
        .pp-tab { padding: 7px 18px 10px; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #2a2a2a; background: #080808; border: 1px solid #161616; border-bottom: none; border-radius: 8px 8px 0 0; cursor: pointer; transition: color 0.15s; }
        .pp-tab:hover:not(.active) { color: #555; }
        .pp-tab.active { color: #e8ff47; border-color: #222; background: #0d0d0d; z-index: 3; }
        .pp-page { background: #0d0d0d; border: 1px solid #222; border-radius: 0 10px 4px 4px; position: relative; overflow: hidden; min-height: 520px; box-shadow: 0 24px 80px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.03); z-index: 1; }
        .pp-page::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 20px; background: linear-gradient(90deg, rgba(232,255,71,0.05) 0%, transparent 100%); border-right: 1px dashed rgba(232,255,71,0.08); z-index: 2; }
        .pp-watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-35deg); font-family: 'Bebas Neue', sans-serif; font-size: 13px; letter-spacing: 0.8em; color: rgba(232,255,71,0.025); white-space: nowrap; pointer-events: none; z-index: 0; width: 200%; text-align: center; line-height: 3.2; }
        .pp-holes { position: absolute; left: 6px; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: space-evenly; z-index: 3; pointer-events: none; }
        .pp-hole { width: 9px; height: 9px; border-radius: 50%; background: #080808; border: 1px solid rgba(232,255,71,0.08); box-shadow: inset 0 1px 3px rgba(0,0,0,0.8); }
        .pp-content { position: relative; z-index: 1; padding: 28px 28px 44px 34px; }
        .pp-authority { text-align: center; margin-bottom: 22px; padding-bottom: 14px; border-bottom: 1px solid #1a1a1a; position: relative; }
        .pp-authority-sub { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.5em; color: #333; text-transform: uppercase; margin-bottom: 4px; }
        .pp-authority-title { font-family: 'Bebas Neue', sans-serif; font-size: 26px; color: #fff; letter-spacing: 0.08em; }
        .pp-seal { position: absolute; right: 0; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; border-radius: 50%; border: 2px solid #1e1e1e; display: flex; align-items: center; justify-content: center; font-size: 18px; color: rgba(232,255,71,0.15); }
        .pp-id-grid { display: grid; grid-template-columns: 108px 1fr; gap: 20px; margin-bottom: 20px; }
        .pp-photo { width: 108px; height: 138px; border: 1px solid #222; border-radius: 3px; background: #111; overflow: hidden; display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: 44px; color: #e8ff47; position: relative; flex-shrink: 0; }
        .pp-photo img { width: 100%; height: 100%; object-fit: cover; }
        .pp-corner { position: absolute; width: 10px; height: 10px; border-color: rgba(232,255,71,0.35); border-style: solid; }
        .pp-corner.tl { top: 4px; left: 4px; border-width: 1px 0 0 1px; }
        .pp-corner.br { bottom: 4px; right: 4px; border-width: 0 1px 1px 0; }
        .pp-fields { display: flex; flex-direction: column; gap: 13px; }
        .pp-label { font-family: 'DM Mono', monospace; font-size: 7.5px; letter-spacing: 0.35em; color: #333; text-transform: uppercase; margin-bottom: 3px; }
        .pp-value { font-family: 'DM Mono', monospace; font-size: 13px; color: #ccc; line-height: 1.3; }
        .pp-value.edit { cursor: pointer; border-bottom: 1px dashed #1e1e1e; padding-bottom: 2px; transition: border-color 0.2s; display: inline-block; }
        .pp-value.edit:hover { border-color: rgba(232,255,71,0.3); }
        .pp-value.muted { color: #2a2a2a; font-style: italic; }
        .pp-value.accent { color: #e8ff47; }
        .pp-bio-input { font-family: 'DM Mono', monospace; font-size: 12px; color: #ccc; background: transparent; border: none; border-bottom: 1px solid rgba(232,255,71,0.3); outline: none; width: 100%; padding: 2px 0; }
        .pp-row-btns { display: flex; gap: 6px; margin-top: 6px; }
        .pp-btn-y { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.15em; text-transform: uppercase; background: #e8ff47; color: #080808; border: none; border-radius: 2px; padding: 5px 12px; cursor: pointer; transition: opacity 0.2s; }
        .pp-btn-y:hover { opacity: 0.8; }
        .pp-btn-ghost { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.15em; text-transform: uppercase; background: transparent; color: #444; border: 1px solid #1e1e1e; border-radius: 2px; padding: 5px 12px; cursor: pointer; transition: border-color 0.2s; }
        .pp-btn-ghost:hover { border-color: #333; }
        .pp-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 16px; }
        .pp-chip { font-family: 'DM Mono', monospace; font-size: 8.5px; letter-spacing: 0.12em; text-transform: uppercase; padding: 4px 9px; border: 1px solid #1a1a1a; border-radius: 2px; color: #333; background: transparent; cursor: pointer; transition: all 0.14s; }
        .pp-chip:hover { border-color: #333; color: #888; }
        .pp-chip.on { background: #e8ff47; color: #080808; border-color: #e8ff47; }
        .pp-mrz { margin-top: 22px; padding-top: 14px; border-top: 1px solid #161616; }
        .pp-mrz-lbl { font-family: 'DM Mono', monospace; font-size: 7px; letter-spacing: 0.3em; color: #1e1e1e; text-transform: uppercase; margin-bottom: 5px; }
        .pp-mrz-line { font-family: 'DM Mono', monospace; font-size: 9.5px; letter-spacing: 0.1em; color: #1c1c1c; line-height: 1.9; word-break: break-all; }
        .pp-stamps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .pp-stamp-cell { display: flex; flex-direction: column; align-items: center; gap: 5px; position: relative; animation: stampIn 0.4s ease both; }
        @keyframes stampIn { from { opacity: 0; transform: scale(0.4) rotate(-20deg); } to { opacity: 1; transform: scale(1) rotate(var(--tilt,0deg)); } }
        .pp-stamp-ring { width: 76px; height: 76px; border-radius: 50%; border: 2.5px solid var(--clr); display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; box-shadow: 0 0 12px color-mix(in srgb, var(--clr) 15%, transparent); }
        .pp-stamp-ring::before { content: ''; position: absolute; inset: 5px; border-radius: 50%; border: 1px solid var(--clr); opacity: 0.3; }
        .pp-stamp-flag { font-size: 26px; line-height: 1; }
        .pp-stamp-lbl { font-family: 'DM Mono', monospace; font-size: 7.5px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--clr); text-align: center; opacity: 0.85; }
        .pp-stamp-del { position: absolute; top: 0; right: 2px; width: 16px; height: 16px; border-radius: 50%; background: #111; border: 1px solid #1e1e1e; color: #444; font-size: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0; transition: opacity 0.2s; padding: 0; line-height: 1; }
        .pp-stamp-cell:hover .pp-stamp-del { opacity: 1; }
        .pp-stamps-empty { grid-column: 1/-1; text-align: center; padding: 56px 0; font-family: 'DM Mono', monospace; font-size: 11px; color: #1e1e1e; letter-spacing: 0.2em; border: 1px dashed #141414; border-radius: 4px; }
        .pp-add-btn { margin-top: 18px; font-family: 'DM Mono', monospace; font-size: 8.5px; letter-spacing: 0.2em; text-transform: uppercase; color: #e8ff47; background: rgba(232,255,71,0.05); border: 1px solid rgba(232,255,71,0.15); border-radius: 2px; padding: 8px 18px; cursor: pointer; transition: all 0.2s; display: inline-block; }
        .pp-add-btn:hover { background: rgba(232,255,71,0.1); border-color: rgba(232,255,71,0.35); }
        .pp-search { background: #111; border: 1px solid #1e1e1e; border-radius: 3px; padding: 8px 12px; font-family: 'DM Mono', monospace; font-size: 11px; color: #ccc; outline: none; width: 100%; margin-top: 12px; margin-bottom: 8px; transition: border-color 0.2s; }
        .pp-search:focus { border-color: #333; }
        .pp-search::placeholder { color: #222; }
        .pp-results { display: flex; flex-wrap: wrap; gap: 5px; max-height: 150px; overflow-y: auto; }
        .pp-opt { display: flex; align-items: center; gap: 4px; background: #111; border: 1px solid #1a1a1a; border-radius: 2px; padding: 4px 8px; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 9.5px; color: #555; transition: all 0.12s; }
        .pp-opt:hover { border-color: rgba(232,255,71,0.3); color: #ccc; }
        .pp-badge-list { display: flex; flex-direction: column; gap: 8px; }
        .pp-badge-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border: 1px solid #141414; border-radius: 3px; background: rgba(255,255,255,0.01); transition: border-color 0.15s; }
        .pp-badge-row.earned { border-color: rgba(232,255,71,0.15); background: rgba(232,255,71,0.03); }
        .pp-badge-row.locked { opacity: 0.3; }
        .pp-badge-seal { width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #1e1e1e; display: flex; align-items: center; justify-content: center; font-family: 'DM Mono', monospace; font-size: 6.5px; letter-spacing: 0.04em; color: #333; flex-shrink: 0; text-align: center; line-height: 1.2; padding: 3px; }
        .pp-badge-row.earned .pp-badge-seal { border-color: rgba(232,255,71,0.3); color: #e8ff47; }
        .pp-badge-info { flex: 1; min-width: 0; }
        .pp-badge-title { font-family: 'DM Mono', monospace; font-size: 9.5px; letter-spacing: 0.2em; text-transform: uppercase; color: #888; margin-bottom: 2px; }
        .pp-badge-row.earned .pp-badge-title { color: #ccc; }
        .pp-badge-desc { font-family: 'DM Mono', monospace; font-size: 10px; color: #333; }
        .pp-badge-status { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.1em; text-transform: uppercase; flex-shrink: 0; }
        .pp-badge-status.issued { color: #e8ff47; }
        .pp-badge-status.pending { color: #1e1e1e; }
        .pp-section-head { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.4em; text-transform: uppercase; color: #333; margin-bottom: 11px; padding-bottom: 6px; border-bottom: 1px solid #141414; }
        .pp-vibe-row { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 24px; }
        .pp-vibe-btn { display: flex; align-items: center; gap: 6px; padding: 7px 12px; border: 1px solid #1a1a1a; border-radius: 2px; font-family: 'DM Mono', monospace; font-size: 11px; color: #444; background: transparent; cursor: pointer; transition: all 0.15s; }
        .pp-vibe-btn:hover { border-color: #333; color: #888; }
        .pp-vibe-btn.on { border-color: rgba(232,255,71,0.3); color: #e8ff47; background: rgba(232,255,71,0.05); }
        .pp-stats-tbl { width: 100%; border-collapse: collapse; }
        .pp-stats-tbl td { padding: 9px 0; border-bottom: 1px solid #111; font-family: 'DM Mono', monospace; }
        .pp-stats-tbl td:first-child { font-size: 8px; letter-spacing: 0.25em; text-transform: uppercase; color: #333; width: 55%; }
        .pp-stats-tbl td:last-child { font-size: 13px; color: #ccc; text-align: right; }
        .pp-pagenum { position: absolute; bottom: 12px; right: 22px; font-family: 'DM Mono', monospace; font-size: 7.5px; letter-spacing: 0.2em; text-transform: uppercase; color: #1a1a1a; }
        .pp-torn { height: 16px; position: relative; z-index: 4; margin-top: -2px; }
        .pp-torn svg { position: absolute; bottom: 0; left: 0; width: 100%; height: 100%; }
        @media (max-width: 540px) {
          .pp-id-grid { grid-template-columns: 90px 1fr; }
          .pp-photo { width: 90px; height: 115px; font-size: 36px; }
          .pp-stamp-ring { width: 64px; height: 64px; }
          .pp-stamp-flag { font-size: 22px; }
        }
      `}</style>

      
      <div className="pp-wrap">
        <div className="pp-book">
          <div className="pp-tabs">
            {PAGES.map((p, i) => (
              <button key={p} className={`pp-tab${page===i?' active':''}`} onClick={() => setPage(i)}>{p}</button>
            ))}
          </div>
          <div className="pp-page">
            <div className="pp-holes">{[0,1,2,3,4].map(i=><div key={i} className="pp-hole"/>)}</div>
            <div className="pp-watermark">OUTBOUND · OUTBOUND · OUTBOUND · OUTBOUND · OUTBOUND · OUTBOUND · OUTBOUND · OUTBOUND</div>
            <div className="pp-content">
              <div className="pp-authority">
                <div className="pp-authority-sub">outbound network · traveler registry</div>
                <div className="pp-authority-title">{['IDENTITY DOCUMENT','ENTRY & EXIT STAMPS','TRAVEL DISTINCTIONS','CURRENT STATUS'][page]}</div>
                <div className="pp-seal">◈</div>
              </div>

              {page===0 && <>
                <div className="pp-id-grid">
                  <div className="pp-photo">
                    <div className="pp-corner tl"/><div className="pp-corner br"/>
                    {profile?.avatar_url ? <img src={profile.avatar_url} alt="photo"/> : (profile?.username?.[0]||'?').toUpperCase()}
                  </div>
                  <div className="pp-fields">
                    <div>
                      <div className="pp-label">Surname / Given Names</div>
                      <div className="pp-value accent">{(profile?.full_name||profile?.username||'TRAVELER').toUpperCase()}</div>
                    </div>
                    <div>
                      <div className="pp-label">Handle</div>
                      <div className="pp-value">@{profile?.username}</div>
                    </div>
                    <div>
                      <div className="pp-label">Bio / Occupation</div>
                      {editingBio ? (
                        <>
                          <input className="pp-bio-input" value={bioText} onChange={e=>setBioText(e.target.value)} maxLength={80} autoFocus/>
                          <div className="pp-row-btns">
                            <button className="pp-btn-y" onClick={saveBio}>Confirm</button>
                            <button className="pp-btn-ghost" onClick={()=>{setEditingBio(false);setBioText(profile?.bio||'');}}>Cancel</button>
                          </div>
                        </>
                      ) : (
                        <div className={`pp-value edit${!profile?.bio?' muted':''}`} onClick={()=>setEditingBio(true)}>
                          {profile?.bio||'Click to enter...'}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="pp-label">Date of Issue</div>
                      <div className="pp-value">{fmtDate(profile?.created_at)}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="pp-label">Traveler Classification</div>
                  <div className="pp-chips">
                    {TRAVELER_TYPES.map(t=>(
                      <button key={t.id} className={`pp-chip${profile?.traveler_type===t.id?' on':''}`} onClick={()=>setType(t.id)}>
                        {t.code} · {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pp-mrz">
                  <div className="pp-mrz-lbl">Machine Readable Zone · TD3</div>
                  {mrzLines.map((l,i)=><div key={i} className="pp-mrz-line">{l}</div>)}
                </div>
              </>}

              {page===1 && <>
                {countries.length===0
                  ? <div className="pp-stamps-grid"><div className="pp-stamps-empty">no entry stamps yet<br/>add the countries you've visited</div></div>
                  : <div className="pp-stamps-grid">
                      {countries.map((code:string,i:number)=>{
                        const clr=stampColor(code); const tilt=((i*137)%16)-8;
                        return (
                          <div key={code} className="pp-stamp-cell" style={{'--tilt':`${tilt}deg`,'--clr':clr} as any}>
                            <div className="pp-stamp-ring" style={{'--clr':clr} as any}>
                              <span className="pp-stamp-flag">{COUNTRY_EMOJIS[code]||'🏳'}</span>
                            </div>
                            <div className="pp-stamp-lbl" style={{'--clr':clr} as any}>{COUNTRY_NAMES[code]?.slice(0,11)||code}</div>
                            <button className="pp-stamp-del" onClick={()=>removeCountry(code)}>×</button>
                          </div>
                        );
                      })}
                    </div>
                }
                <button className="pp-add-btn" onClick={()=>setAddingCountry(!addingCountry)}>
                  {addingCountry?'✕  close':'+ add entry stamp'}
                </button>
                {addingCountry && <>
                  <input className="pp-search" placeholder="Search country..." value={search} onChange={e=>setSearch(e.target.value)} autoFocus/>
                  <div className="pp-results">
                    {filtered.slice(0,40).map(([code,name])=>(
                      <div key={code} className="pp-opt" onClick={()=>addCountry(code)}>
                        <span>{COUNTRY_EMOJIS[code]||'🏳'}</span><span>{name}</span>
                      </div>
                    ))}
                  </div>
                </>}
              </>}

              {page===2 && (
                <div className="pp-badge-list">
                  {ALL_BADGES.map(badge=>{
                    const earned=earnedBadges.includes(badge.id);
                    return (
                      <div key={badge.id} className={`pp-badge-row${earned?' earned':' locked'}`}>
                        <div className="pp-badge-seal">{badge.code}</div>
                        <div className="pp-badge-info">
                          <div className="pp-badge-title">{badge.label}</div>
                          <div className="pp-badge-desc">{badge.desc}</div>
                        </div>
                        <div className={`pp-badge-status${earned?' issued':' pending'}`}>{earned?'✓ issued':'pending'}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {page===3 && <>
                <div>
                  <div className="pp-section-head">Current Situation</div>
                  <div className="pp-vibe-row">
                    {VIBES.map(v=>(
                      <button key={v.id} className={`pp-vibe-btn${profile?.current_vibe===v.id?' on':''}`} onClick={()=>setVibe(v.id)}>
                        {v.icon} {v.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="pp-section-head">Travel Record</div>
                  <table className="pp-stats-tbl">
                    <tbody>
                      <tr><td>Countries Visited</td><td>{countries.length}</td></tr>
                      <tr><td>Distinctions Earned</td><td>{earnedBadges.length} / {ALL_BADGES.length}</td></tr>
                      <tr><td>Member Since</td><td>{fmtDate(profile?.created_at)}</td></tr>
                      <tr><td>Classification</td><td>{TRAVELER_TYPES.find(t=>t.id===profile?.traveler_type)?.label||'—'}</td></tr>
                      <tr><td>Current Vibe</td><td>{VIBES.find(v=>v.id===profile?.current_vibe)?.label||'—'}</td></tr>
                      <tr><td>Base City</td><td>{profile?.city||'—'}</td></tr>
                    </tbody>
                  </table>
                </div>
              </>}
            </div>

            <div className="pp-torn">
              <svg viewBox="0 0 560 16" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,0 L0,9 Q7,16 14,10 Q21,4 28,12 Q35,16 42,9 Q49,3 56,11 Q63,16 70,9 Q77,3 84,12 Q91,16 98,9 Q105,3 112,11 Q119,16 126,9 Q133,3 140,12 Q147,16 154,9 Q161,3 168,11 Q175,16 182,9 Q189,4 196,12 Q203,16 210,9 Q217,3 224,11 Q231,16 238,9 Q245,4 252,12 Q259,16 266,9 Q273,3 280,11 Q287,16 294,9 Q301,4 308,12 Q315,16 322,9 Q329,3 336,11 Q343,16 350,9 Q357,4 364,12 Q371,16 378,9 Q385,3 392,11 Q399,16 406,9 Q413,4 420,12 Q427,16 434,9 Q441,3 448,11 Q455,16 462,9 Q469,4 476,12 Q483,16 490,9 Q497,3 504,11 Q511,16 518,9 Q525,4 532,12 Q539,16 546,9 Q553,3 560,9 L560,0 Z" fill="#0d0d0d"/>
              </svg>
            </div>
            <div className="pp-pagenum">page {['01','02','03','04'][page]} of 04</div>
          </div>
        </div>
      </div>
    </>
  );
}
