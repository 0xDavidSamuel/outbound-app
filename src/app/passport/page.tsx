'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/ui/NavBar';

// ─── DATA ─────────────────────────────────────────────────────────────────────

const TRAVELER_TYPES = [
  { id: 'nomad',    label: 'Digital Nomad',    code: 'NMD' },
  { id: 'expat',    label: 'Expat',             code: 'EXP' },
  { id: 'solo',     label: 'Solo Traveler',     code: 'SLO' },
  { id: 'remote',   label: 'Remote Worker',     code: 'RWK' },
  { id: 'explorer', label: 'Adventure Seeker',  code: 'ADV' },
  { id: 'slow',     label: 'Slow Traveler',     code: 'SLW' },
];

const VIBES = [
  { id: 'settling',    label: 'Settling In',    stamp: '🏠' },
  { id: 'exploring',  label: 'Exploring',       stamp: '🗺' },
  { id: 'working',    label: 'Deep Work',       stamp: '⚡' },
  { id: 'socializing',label: 'Meeting People',  stamp: '🤝' },
  { id: 'moving',     label: 'In Transit',      stamp: '✈' },
  { id: 'recharging', label: 'Recharging',      stamp: '🌊' },
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
  { id:'founding_member', label:'FOUNDING MEMBER',   desc:'Joined during beta',           code:'FM-001' },
  { id:'first_stamp',     label:'FIRST STAMP',        desc:'Added your first country',     code:'FS-001' },
  { id:'globe_trotter',   label:'GLOBE TROTTER',      desc:'5+ countries visited',          code:'GT-005' },
  { id:'continent_hopper',label:'CONTINENT HOPPER',  desc:'3+ continents explored',        code:'CH-003' },
  { id:'nomad_certified', label:'NOMAD CERTIFIED',    desc:'10+ countries visited',         code:'NC-010' },
  { id:'local_legend',    label:'LOCAL LEGEND',       desc:'Active in your city',           code:'LL-001' },
  { id:'event_host',      label:'EVENT HOST',         desc:'Hosted a local meetup',         code:'EH-001' },
  { id:'connector',       label:'CONNECTOR',          desc:'Helped 5+ travelers',           code:'CN-005' },
  { id:'early_bird',      label:'EARLY BIRD',         desc:'Active in the first week',      code:'EB-001' },
  { id:'storyteller',     label:'STORYTELLER',        desc:'10+ posts in Feed',             code:'ST-010' },
];

const STAMP_COLORS = [
  '#c0392b','#2980b9','#27ae60','#8e44ad','#e67e22','#16a085','#d35400','#2c3e50',
];

function getEarnedBadges(profile: any): string[] {
  const earned: string[] = ['founding_member','early_bird'];
  const c = profile.countries_visited || [];
  if (c.length >= 1) earned.push('first_stamp');
  if (c.length >= 5) earned.push('globe_trotter');
  if (c.length >= 10) earned.push('nomad_certified');
  if (profile.lat && profile.lng) earned.push('local_legend');
  return earned;
}

function stampColor(code: string): string {
  let hash = 0;
  for (const ch of code) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return STAMP_COLORS[Math.abs(hash) % STAMP_COLORS.length];
}

function pad2(n: number) { return String(n).padStart(2,'0'); }
function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${pad2(d.getDate())} ${['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][d.getMonth()]} ${d.getFullYear()}`;
}

function mrz(name: string, id: string) {
  const n = (name || 'TRAVELER').toUpperCase().replace(/[^A-Z]/g,'').padEnd(18,'<').slice(0,18);
  const idCode = (id || 'OUTBOUND').toUpperCase().replace(/[^A-Z0-9]/g,'').padEnd(9,'<').slice(0,9);
  return [
    `P<OUTBOUND${n}<<<<<<<<<<<<<<<<<<<<<<<<<<<`,
    `${idCode}<<0000000000NMD0000000<<<<<6`
  ];
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function PassportPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [addingCountry, setAddingCountry] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [activePage, setActivePage] = useState(0);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/'); return; }
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(data);
      setBioText(data?.bio || '');
      setLoading(false);
    };
    load();
  }, []);

  const saveBio = async () => {
    await supabase.from('profiles').update({ bio: bioText }).eq('id', profile.id);
    setProfile({ ...profile, bio: bioText });
    setEditingBio(false);
  };

  const setType = async (type: string) => {
    await supabase.from('profiles').update({ traveler_type: type }).eq('id', profile.id);
    setProfile({ ...profile, traveler_type: type });
  };

  const setVibe = async (vibe: string) => {
    await supabase.from('profiles').update({ current_vibe: vibe }).eq('id', profile.id);
    setProfile({ ...profile, current_vibe: vibe });
  };

  const addCountry = async (code: string) => {
    const updated = [...(profile.countries_visited || []), code];
    await supabase.from('profiles').update({ countries_visited: updated }).eq('id', profile.id);
    setProfile({ ...profile, countries_visited: updated });
    setAddingCountry(false);
    setCountrySearch('');
  };

  const removeCountry = async (code: string) => {
    const updated = (profile.countries_visited || []).filter((c: string) => c !== code);
    await supabase.from('profiles').update({ countries_visited: updated }).eq('id', profile.id);
    setProfile({ ...profile, countries_visited: updated });
  };

  if (loading) return (
    <div style={{ height:'100vh', background:'#1a0f0a', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:48 }}>📘</div>
      <p style={{ fontFamily:'serif', fontSize:13, color:'#6b4c30', letterSpacing:'0.2em', textTransform:'uppercase' }}>Loading Passport...</p>
    </div>
  );

  const earnedBadges = getEarnedBadges(profile);
  const countries = profile?.countries_visited || [];
  const mrzLines = mrz(profile?.full_name || profile?.username || '', profile?.id?.slice(0,8) || '');
  const filtered = Object.entries(COUNTRY_NAMES).filter(([code, name]) =>
    !countries.includes(code) && name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const PAGES = ['IDENTITY', 'STAMPS', 'BADGES', 'STATUS'];

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@400;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0e0906; min-height: 100vh; }

        .pp-wrap {
          min-height: 100vh;
          padding: 80px 16px 140px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .pp-book {
          width: 100%;
          max-width: 560px;
          position: relative;
        }

        /* ── TABS ── */
        .pp-tabs {
          display: flex;
          gap: 0;
          margin-bottom: -2px;
          padding-left: 24px;
          position: relative;
          z-index: 2;
        }

        .pp-tab {
          padding: 7px 18px 10px;
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #5c3d22;
          background: #1a0f0a;
          border: 1px solid #3a2010;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
          cursor: pointer;
          transition: all 0.15s;
        }
        .pp-tab.active {
          background: #f4e8d0;
          color: #1a0f0a;
          border-color: #c9a97a;
          z-index: 3;
        }
        .pp-tab:hover:not(.active) { color: #8b6040; }

        /* ── PASSPORT PAGE ── */
        .pp-page {
          background: #f4e8d0;
          border: 1px solid #c9a97a;
          border-radius: 0 12px 4px 4px;
          position: relative;
          overflow: hidden;
          min-height: 520px;
          box-shadow:
            0 24px 80px rgba(0,0,0,0.8),
            inset 0 0 0 1px rgba(255,255,255,0.2),
            6px 0 18px rgba(0,0,0,0.35);
          z-index: 1;
        }

        /* binding edge */
        .pp-page::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 22px;
          background: linear-gradient(
            90deg,
            rgba(180,120,60,0.18) 0%,
            rgba(180,120,60,0.06) 40%,
            transparent 100%
          );
          border-right: 1px dashed rgba(180,120,60,0.25);
          z-index: 2;
        }

        /* punch holes */
        .pp-holes {
          position: absolute;
          left: 7px;
          top: 0; bottom: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
          z-index: 3;
          pointer-events: none;
        }

        .pp-hole {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: #0e0906;
          border: 1px solid rgba(180,120,60,0.3);
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
        }

        /* security guilloche watermark */
        .pp-watermark {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%) rotate(-35deg);
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.6em;
          color: rgba(180,120,60,0.05);
          white-space: nowrap;
          pointer-events: none;
          z-index: 0;
          width: 200%;
          text-align: center;
          line-height: 3;
          text-transform: uppercase;
        }

        .pp-content {
          position: relative;
          z-index: 1;
          padding: 28px 28px 40px 36px;
        }

        /* ── AUTHORITY HEADER ── */
        .pp-authority {
          text-align: center;
          margin-bottom: 22px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(180,120,60,0.3);
          position: relative;
        }

        .pp-authority-sub {
          font-family: 'DM Mono', monospace;
          font-size: 8px;
          letter-spacing: 0.45em;
          color: #8b6040;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .pp-authority-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 700;
          color: #1a0f0a;
          letter-spacing: 0.04em;
        }

        .pp-seal {
          position: absolute;
          right: 0; top: 50%; transform: translateY(-50%);
          width: 40px; height: 40px;
          border-radius: 50%;
          border: 2px solid rgba(180,120,60,0.35);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          color: rgba(139,96,64,0.4);
        }

        /* ── IDENTITY ── */
        .pp-id-grid {
          display: grid;
          grid-template-columns: 108px 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .pp-photo {
          width: 108px; height: 138px;
          border: 2px solid rgba(180,120,60,0.45);
          border-radius: 3px;
          background: #e8d9c0;
          overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 42px; color: #8b6040;
          position: relative;
          flex-shrink: 0;
        }
        .pp-photo img { width: 100%; height: 100%; object-fit: cover; }

        .pp-photo-corner {
          position: absolute;
          width: 10px; height: 10px;
          border-color: rgba(180,120,60,0.6);
          border-style: solid;
        }
        .pp-photo-corner.tl { top: 4px; left: 4px; border-width: 2px 0 0 2px; }
        .pp-photo-corner.br { bottom: 4px; right: 4px; border-width: 0 2px 2px 0; }

        .pp-fields { display: flex; flex-direction: column; gap: 13px; }

        .pp-label {
          font-family: 'DM Mono', monospace;
          font-size: 7.5px;
          letter-spacing: 0.35em;
          color: #8b6040;
          text-transform: uppercase;
          margin-bottom: 3px;
        }

        .pp-value {
          font-family: 'Special Elite', cursive;
          font-size: 14px;
          color: #1a0f0a;
          line-height: 1.2;
        }

        .pp-value.edit {
          cursor: pointer;
          border-bottom: 1px dashed rgba(180,120,60,0.4);
          padding-bottom: 2px;
          transition: border-color 0.2s;
          display: inline-block;
        }
        .pp-value.edit:hover { border-color: rgba(180,120,60,0.8); }
        .pp-value.muted { color: rgba(139,96,64,0.5); font-style: italic; }

        .pp-bio-input {
          font-family: 'Special Elite', cursive;
          font-size: 13px;
          color: #1a0f0a;
          background: transparent;
          border: none;
          border-bottom: 1.5px solid rgba(180,120,60,0.7);
          outline: none;
          width: 100%;
          padding: 2px 0;
        }

        .pp-row-btns {
          display: flex; gap: 6px; margin-top: 5px;
        }

        .pp-btn-dark {
          font-family: 'DM Mono', monospace;
          font-size: 8px; letter-spacing: 0.15em; text-transform: uppercase;
          background: #1a0f0a; color: #f4e8d0;
          border: none; border-radius: 2px;
          padding: 5px 12px; cursor: pointer; transition: opacity 0.2s;
        }
        .pp-btn-dark:hover { opacity: 0.7; }

        .pp-btn-light {
          font-family: 'DM Mono', monospace;
          font-size: 8px; letter-spacing: 0.15em; text-transform: uppercase;
          background: transparent; color: #8b6040;
          border: 1px solid rgba(180,120,60,0.35); border-radius: 2px;
          padding: 5px 12px; cursor: pointer; transition: border-color 0.2s;
        }
        .pp-btn-light:hover { border-color: rgba(180,120,60,0.8); }

        /* classification chips */
        .pp-chips {
          display: flex; flex-wrap: wrap; gap: 5px;
          margin-top: 16px;
        }

        .pp-chip {
          font-family: 'DM Mono', monospace;
          font-size: 8.5px; letter-spacing: 0.12em; text-transform: uppercase;
          padding: 4px 9px;
          border: 1px solid rgba(180,120,60,0.3);
          border-radius: 2px;
          color: #8b6040; background: transparent;
          cursor: pointer; transition: all 0.14s;
        }
        .pp-chip:hover { border-color: rgba(180,120,60,0.8); color: #4a2e10; }
        .pp-chip.on { background: #1a0f0a; color: #f4e8d0; border-color: #1a0f0a; }

        /* MRZ */
        .pp-mrz {
          margin-top: 22px;
          padding-top: 14px;
          border-top: 1px solid rgba(180,120,60,0.2);
        }
        .pp-mrz-lbl {
          font-family: 'DM Mono', monospace;
          font-size: 7px; letter-spacing: 0.3em;
          color: rgba(139,96,64,0.45); text-transform: uppercase;
          margin-bottom: 5px;
        }
        .pp-mrz-line {
          font-family: 'DM Mono', monospace;
          font-size: 9.5px; letter-spacing: 0.1em;
          color: rgba(26,15,10,0.2);
          line-height: 1.9; word-break: break-all;
        }

        /* ── STAMPS ── */
        .pp-stamps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .pp-stamp-cell {
          display: flex; flex-direction: column;
          align-items: center; gap: 5px;
          position: relative;
          animation: stampIn 0.4s ease both;
        }

        @keyframes stampIn {
          from { opacity: 0; transform: scale(0.4) rotate(-20deg); }
          to   { opacity: 1; transform: scale(1) rotate(var(--tilt,0deg)); }
        }

        .pp-stamp-ring {
          width: 78px; height: 78px;
          border-radius: 50%;
          border: 3px solid var(--clr);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          position: relative;
          opacity: 0.88;
        }

        .pp-stamp-ring::before {
          content: '';
          position: absolute; inset: 5px;
          border-radius: 50%;
          border: 1.5px solid var(--clr);
          opacity: 0.35;
        }

        .pp-stamp-flag { font-size: 28px; line-height: 1; }

        .pp-stamp-lbl {
          font-family: 'DM Mono', monospace;
          font-size: 8px; letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--clr); text-align: center; opacity: 0.9;
        }

        .pp-stamp-del {
          position: absolute; top: 0; right: 4px;
          width: 16px; height: 16px; border-radius: 50%;
          background: rgba(180,120,60,0.15); border: none;
          color: #8b6040; font-size: 10px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; opacity: 0; transition: opacity 0.2s;
          padding: 0; line-height: 1;
        }
        .pp-stamp-cell:hover .pp-stamp-del { opacity: 1; }

        .pp-stamps-empty {
          grid-column: 1/-1;
          text-align: center; padding: 56px 0;
          font-family: 'Special Elite', cursive;
          font-size: 14px; color: rgba(180,120,60,0.35);
          line-height: 2;
        }

        .pp-add-btn {
          margin-top: 18px;
          font-family: 'DM Mono', monospace;
          font-size: 8.5px; letter-spacing: 0.2em; text-transform: uppercase;
          color: #8b6040; background: transparent;
          border: 1px dashed rgba(180,120,60,0.5); border-radius: 2px;
          padding: 8px 18px; cursor: pointer; transition: all 0.2s;
          display: inline-block;
        }
        .pp-add-btn:hover { border-color: rgba(180,120,60,0.9); color: #4a2e10; }

        .pp-search {
          background: rgba(26,15,10,0.06);
          border: 1px solid rgba(180,120,60,0.35);
          border-radius: 2px;
          padding: 8px 12px;
          font-family: 'DM Mono', monospace; font-size: 11px;
          color: #1a0f0a; outline: none; width: 100%;
          margin-top: 12px; margin-bottom: 8px;
        }
        .pp-search::placeholder { color: rgba(139,96,64,0.35); }

        .pp-results {
          display: flex; flex-wrap: wrap; gap: 5px;
          max-height: 150px; overflow-y: auto;
        }

        .pp-result-opt {
          display: flex; align-items: center; gap: 4px;
          background: rgba(26,15,10,0.04);
          border: 1px solid rgba(180,120,60,0.2); border-radius: 2px;
          padding: 4px 8px; cursor: pointer;
          font-family: 'DM Mono', monospace; font-size: 9.5px; color: #6b4030;
          transition: all 0.12s;
        }
        .pp-result-opt:hover { border-color: rgba(180,120,60,0.7); color: #1a0f0a; }

        /* ── BADGES ── */
        .pp-badge-list { display: flex; flex-direction: column; gap: 9px; }

        .pp-badge-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px;
          border: 1px solid rgba(180,120,60,0.15);
          border-radius: 3px;
          background: rgba(255,255,255,0.25);
        }
        .pp-badge-row.earned {
          border-color: rgba(180,120,60,0.45);
          background: rgba(180,120,60,0.07);
        }
        .pp-badge-row.locked { opacity: 0.32; }

        .pp-badge-seal {
          width: 36px; height: 36px; border-radius: 50%;
          border: 2px solid rgba(180,120,60,0.4);
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Mono', monospace; font-size: 6.5px;
          letter-spacing: 0.04em; color: #8b6040; flex-shrink: 0;
          text-align: center; line-height: 1.2; padding: 3px;
        }
        .pp-badge-row.earned .pp-badge-seal { border-color: #8b6040; background: rgba(180,120,60,0.1); }

        .pp-badge-info { flex: 1; min-width: 0; }

        .pp-badge-title {
          font-family: 'DM Mono', monospace;
          font-size: 9.5px; letter-spacing: 0.2em; text-transform: uppercase;
          color: #1a0f0a; margin-bottom: 2px;
        }
        .pp-badge-desc {
          font-family: 'Special Elite', cursive;
          font-size: 11px; color: #8b6040;
        }

        .pp-badge-status {
          font-family: 'DM Mono', monospace;
          font-size: 8px; letter-spacing: 0.1em; text-transform: uppercase;
          flex-shrink: 0;
        }
        .pp-badge-status.issued { color: #5a3a10; }
        .pp-badge-status.pending { color: rgba(139,96,64,0.35); }

        /* ── STATUS ── */
        .pp-section-head {
          font-family: 'DM Mono', monospace;
          font-size: 8px; letter-spacing: 0.4em; text-transform: uppercase;
          color: #8b6040; margin-bottom: 11px;
          padding-bottom: 5px;
          border-bottom: 1px solid rgba(180,120,60,0.2);
        }

        .pp-vibe-row { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 24px; }

        .pp-vibe-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 7px 11px;
          border: 1px solid rgba(180,120,60,0.25); border-radius: 2px;
          font-family: 'Special Elite', cursive; font-size: 12px;
          color: #6b4030; background: transparent;
          cursor: pointer; transition: all 0.15s;
        }
        .pp-vibe-btn:hover { border-color: rgba(180,120,60,0.7); color: #1a0f0a; }
        .pp-vibe-btn.on { background: rgba(180,120,60,0.12); border-color: #8b6040; color: #1a0f0a; }

        .pp-stats-tbl { width: 100%; border-collapse: collapse; }
        .pp-stats-tbl td {
          padding: 9px 0;
          border-bottom: 1px solid rgba(180,120,60,0.12);
        }
        .pp-stats-tbl td:first-child {
          font-family: 'DM Mono', monospace;
          font-size: 8px; letter-spacing: 0.25em; text-transform: uppercase;
          color: #8b6040; width: 55%;
        }
        .pp-stats-tbl td:last-child {
          font-family: 'Special Elite', cursive;
          font-size: 14px; color: #1a0f0a; text-align: right;
        }

        /* ── PAGE NUMBER & TORN BOTTOM ── */
        .pp-pagenum {
          position: absolute; bottom: 12px; right: 22px;
          font-family: 'DM Mono', monospace;
          font-size: 7.5px; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(139,96,64,0.25);
        }

        .pp-torn {
          height: 18px;
          position: relative; z-index: 4;
          background: transparent;
          margin-top: -2px;
        }
        .pp-torn svg {
          position: absolute; bottom: 0; left: 0;
          width: 100%; height: 100%;
        }

        @media (max-width: 540px) {
          .pp-id-grid { grid-template-columns: 90px 1fr; }
          .pp-photo { width: 90px; height: 115px; font-size: 36px; }
          .pp-stamps-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
          .pp-stamp-ring { width: 66px; height: 66px; }
          .pp-stamp-flag { font-size: 22px; }
        }
      `}</style>

      <NavBar user={{ avatar_url: profile?.avatar_url ?? undefined, username: profile?.username ?? undefined }} />

      <div className="pp-wrap">
        <div className="pp-book">

          {/* ── TABS ── */}
          <div className="pp-tabs">
            {PAGES.map((p, i) => (
              <button key={p} className={`pp-tab${activePage===i?' active':''}`} onClick={() => setActivePage(i)}>
                {p}
              </button>
            ))}
          </div>

          {/* ── THE PAGE ── */}
          <div className="pp-page">

            {/* punch holes */}
            <div className="pp-holes">
              {[0,1,2,3,4].map(i => <div key={i} className="pp-hole" />)}
            </div>

            {/* watermark */}
            <div className="pp-watermark">
              OUTBOUND · OUTBOUND · OUTBOUND · OUTBOUND · OUTBOUND · OUTBOUND · OUTBOUND · OUTBOUND
            </div>

            <div className="pp-content">

              {/* authority header */}
              <div className="pp-authority">
                <div className="pp-authority-sub">OUTBOUND NETWORK · TRAVELER REGISTRY</div>
                <div className="pp-authority-title">
                  {['IDENTITY DOCUMENT','ENTRY & EXIT STAMPS','TRAVEL DISTINCTIONS','CURRENT STATUS'][activePage]}
                </div>
                <div className="pp-seal">◈</div>
              </div>

              {/* ── PAGE 0: IDENTITY ── */}
              {activePage === 0 && <>
                <div className="pp-id-grid">
                  <div>
                    <div className="pp-photo">
                      <div className="pp-photo-corner tl" />
                      <div className="pp-photo-corner br" />
                      {profile?.avatar_url
                        ? <img src={profile.avatar_url} alt="photo" />
                        : (profile?.username?.[0] || '?').toUpperCase()
                      }
                    </div>
                  </div>
                  <div className="pp-fields">
                    <div>
                      <div className="pp-label">Surname / Given Names</div>
                      <div className="pp-value">{(profile?.full_name || profile?.username || 'TRAVELER').toUpperCase()}</div>
                    </div>
                    <div>
                      <div className="pp-label">Handle</div>
                      <div className="pp-value">@{profile?.username}</div>
                    </div>
                    <div>
                      <div className="pp-label">Bio / Occupation</div>
                      {editingBio ? (
                        <>
                          <input className="pp-bio-input" value={bioText} onChange={e => setBioText(e.target.value)} maxLength={80} autoFocus />
                          <div className="pp-row-btns">
                            <button className="pp-btn-dark" onClick={saveBio}>Confirm</button>
                            <button className="pp-btn-light" onClick={() => { setEditingBio(false); setBioText(profile?.bio||''); }}>Cancel</button>
                          </div>
                        </>
                      ) : (
                        <div className={`pp-value edit${!profile?.bio?' muted':''}`} onClick={() => setEditingBio(true)}>
                          {profile?.bio || 'Click to enter...'}
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
                    {TRAVELER_TYPES.map(t => (
                      <button key={t.id} className={`pp-chip${profile?.traveler_type===t.id?' on':''}`} onClick={() => setType(t.id)}>
                        {t.code} · {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pp-mrz">
                  <div className="pp-mrz-lbl">Machine Readable Zone · TD3</div>
                  {mrzLines.map((l,i) => <div key={i} className="pp-mrz-line">{l}</div>)}
                </div>
              </>}

              {/* ── PAGE 1: STAMPS ── */}
              {activePage === 1 && <>
                {countries.length === 0
                  ? <div className="pp-stamps-grid"><div className="pp-stamps-empty">No entry stamps yet.<br/>Add the countries you've visited.</div></div>
                  : (
                    <div className="pp-stamps-grid">
                      {countries.map((code: string, i: number) => {
                        const clr = stampColor(code);
                        const tilt = ((i*137)%16)-8;
                        return (
                          <div key={code} className="pp-stamp-cell" style={{'--tilt':`${tilt}deg`,'--clr':clr} as any}>
                            <div className="pp-stamp-ring" style={{'--clr':clr} as any}>
                              <span className="pp-stamp-flag">{COUNTRY_EMOJIS[code]||'🏳'}</span>
                            </div>
                            <div className="pp-stamp-lbl" style={{'--clr':clr} as any}>
                              {COUNTRY_NAMES[code]?.slice(0,11)||code}
                            </div>
                            <button className="pp-stamp-del" onClick={() => removeCountry(code)}>×</button>
                          </div>
                        );
                      })}
                    </div>
                  )
                }
                <button className="pp-add-btn" onClick={() => setAddingCountry(!addingCountry)}>
                  {addingCountry ? '✕ Close' : '+ Add Entry Stamp'}
                </button>
                {addingCountry && <>
                  <input className="pp-search" placeholder="Search country..." value={countrySearch} onChange={e => setCountrySearch(e.target.value)} autoFocus />
                  <div className="pp-results">
                    {filtered.slice(0,40).map(([code,name]) => (
                      <div key={code} className="pp-result-opt" onClick={() => addCountry(code)}>
                        <span>{COUNTRY_EMOJIS[code]||'🏳'}</span><span>{name}</span>
                      </div>
                    ))}
                  </div>
                </>}
              </>}

              {/* ── PAGE 2: BADGES ── */}
              {activePage === 2 && (
                <div className="pp-badge-list">
                  {ALL_BADGES.map(badge => {
                    const earned = earnedBadges.includes(badge.id);
                    return (
                      <div key={badge.id} className={`pp-badge-row${earned?' earned':' locked'}`}>
                        <div className="pp-badge-seal">{badge.code}</div>
                        <div className="pp-badge-info">
                          <div className="pp-badge-title">{badge.label}</div>
                          <div className="pp-badge-desc">{badge.desc}</div>
                        </div>
                        <div className={`pp-badge-status${earned?' issued':' pending'}`}>
                          {earned ? '✓ ISSUED' : 'PENDING'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── PAGE 3: STATUS ── */}
              {activePage === 3 && <>
                <div>
                  <div className="pp-section-head">Current Situation</div>
                  <div className="pp-vibe-row">
                    {VIBES.map(v => (
                      <button key={v.id} className={`pp-vibe-btn${profile?.current_vibe===v.id?' on':''}`} onClick={() => setVibe(v.id)}>
                        {v.stamp} {v.label}
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

            {/* torn bottom edge */}
            <div className="pp-torn">
              <svg viewBox="0 0 560 18" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,0 L0,10 Q7,18 14,11 Q21,4 28,13 Q35,18 42,10 Q49,3 56,12 Q63,18 70,10 Q77,3 84,13 Q91,18 98,10 Q105,3 112,12 Q119,18 126,10 Q133,3 140,13 Q147,18 154,10 Q161,3 168,12 Q175,18 182,10 Q189,4 196,13 Q203,18 210,10 Q217,3 224,12 Q231,18 238,10 Q245,4 252,13 Q259,18 266,10 Q273,3 280,12 Q287,18 294,10 Q301,4 308,13 Q315,18 322,10 Q329,3 336,12 Q343,18 350,10 Q357,4 364,13 Q371,18 378,10 Q385,3 392,12 Q399,18 406,10 Q413,4 420,13 Q427,18 434,10 Q441,3 448,12 Q455,18 462,10 Q469,4 476,13 Q483,18 490,10 Q497,3 504,12 Q511,18 518,10 Q525,4 532,13 Q539,18 546,10 Q553,3 560,10 L560,0 Z" fill="#f4e8d0"/>
              </svg>
            </div>

            <div className="pp-pagenum">PAGE {['01','02','03','04'][activePage]} OF 04</div>
          </div>

        </div>
      </div>
    </>
  );
}
