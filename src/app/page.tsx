'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/ui/NavBar';

// ─── DATA ────────────────────────────────────────────────────────────────────

const TRAVELER_TYPES = [
  { id: 'nomad',    emoji: '🌏', label: 'Digital Nomad',   desc: 'Laptop + passport = office' },
  { id: 'expat',    emoji: '☕', label: 'Expat',            desc: 'Put down roots abroad' },
  { id: 'solo',     emoji: '🎒', label: 'Solo Traveler',   desc: 'Just me, myself & wifi' },
  { id: 'remote',   emoji: '💻', label: 'Remote Worker',   desc: 'Work from anywhere crew' },
  { id: 'explorer', emoji: '🏔', label: 'Adventure Seeker', desc: 'Always chasing the next thing' },
  { id: 'slow',     emoji: '🌿', label: 'Slow Traveler',   desc: 'Deep dives, not quick stops' },
];

const VIBES = [
  { id: 'settling', emoji: '🏠', label: 'Settling in' },
  { id: 'exploring', emoji: '🗺', label: 'Exploring' },
  { id: 'working', emoji: '⚡', label: 'Deep work mode' },
  { id: 'socializing', emoji: '🤝', label: 'Meeting people' },
  { id: 'moving', emoji: '✈️', label: 'In transit' },
  { id: 'recharging', emoji: '🌊', label: 'Recharging' },
];

const COUNTRY_EMOJIS: Record<string, string> = {
  'US': '🇺🇸', 'GB': '🇬🇧', 'JP': '🇯🇵', 'FR': '🇫🇷', 'DE': '🇩🇪',
  'BR': '🇧🇷', 'MX': '🇲🇽', 'CA': '🇨🇦', 'AU': '🇦🇺', 'IN': '🇮🇳',
  'CN': '🇨🇳', 'KR': '🇰🇷', 'ES': '🇪🇸', 'IT': '🇮🇹', 'PT': '🇵🇹',
  'NL': '🇳🇱', 'SE': '🇸🇪', 'NO': '🇳🇴', 'SG': '🇸🇬', 'AE': '🇦🇪',
  'AR': '🇦🇷', 'CL': '🇨🇱', 'CO': '🇨🇴', 'PL': '🇵🇱', 'TR': '🇹🇷',
  'TH': '🇹🇭', 'VN': '🇻🇳', 'ID': '🇮🇩', 'PH': '🇵🇭', 'ZA': '🇿🇦',
  'NG': '🇳🇬', 'EG': '🇪🇬', 'GH': '🇬🇭', 'KE': '🇰🇪', 'MA': '🇲🇦',
  'NZ': '🇳🇿', 'CH': '🇨🇭', 'AT': '🇦🇹', 'BE': '🇧🇪', 'DK': '🇩🇰',
  'GR': '🇬🇷', 'HR': '🇭🇷', 'CZ': '🇨🇿', 'HU': '🇭🇺', 'RO': '🇷🇴',
  'GE': '🇬🇪', 'TW': '🇹🇼', 'MY': '🇲🇾', 'NP': '🇳🇵', 'KH': '🇰🇭',
  'EC': '🇪🇨', 'CR': '🇨🇷', 'PA': '🇵🇦', 'PE': '🇵🇪',
};

const COUNTRY_NAMES: Record<string, string> = {
  'US': 'United States', 'GB': 'United Kingdom', 'JP': 'Japan', 'FR': 'France',
  'DE': 'Germany', 'BR': 'Brazil', 'MX': 'Mexico', 'CA': 'Canada',
  'AU': 'Australia', 'IN': 'India', 'CN': 'China', 'KR': 'South Korea',
  'ES': 'Spain', 'IT': 'Italy', 'PT': 'Portugal', 'NL': 'Netherlands',
  'SE': 'Sweden', 'NO': 'Norway', 'SG': 'Singapore', 'AE': 'UAE',
  'AR': 'Argentina', 'CL': 'Chile', 'CO': 'Colombia', 'PL': 'Poland',
  'TR': 'Turkey', 'TH': 'Thailand', 'VN': 'Vietnam', 'ID': 'Indonesia',
  'PH': 'Philippines', 'ZA': 'South Africa', 'NG': 'Nigeria', 'EG': 'Egypt',
  'GH': 'Ghana', 'KE': 'Kenya', 'MA': 'Morocco', 'NZ': 'New Zealand',
  'CH': 'Switzerland', 'AT': 'Austria', 'BE': 'Belgium', 'DK': 'Denmark',
  'GR': 'Greece', 'HR': 'Croatia', 'CZ': 'Czech Republic', 'HU': 'Hungary',
  'RO': 'Romania', 'GE': 'Georgia', 'TW': 'Taiwan', 'MY': 'Malaysia',
  'NP': 'Nepal', 'KH': 'Cambodia', 'EC': 'Ecuador', 'CR': 'Costa Rica',
  'PA': 'Panama', 'PE': 'Peru',
};

const ALL_BADGES = [
  { id: 'founding_member', emoji: '🥇', label: 'Founding Member', desc: 'Joined during beta' },
  { id: 'first_stamp',     emoji: '📮', label: 'First Stamp',     desc: 'Added your first country' },
  { id: 'globe_trotter',   emoji: '🌍', label: 'Globe Trotter',   desc: '5+ countries visited' },
  { id: 'continent_hopper',emoji: '✈️', label: 'Continent Hopper',desc: '3+ continents' },
  { id: 'nomad_certified', emoji: '🌏', label: 'Nomad Certified', desc: '10+ countries visited' },
  { id: 'local_legend',    emoji: '🏙', label: 'Local Legend',    desc: 'Active in your city' },
  { id: 'event_host',      emoji: '⚡', label: 'Event Host',      desc: 'Hosted a local meetup' },
  { id: 'connector',       emoji: '🤝', label: 'Connector',       desc: 'Helped 5+ travelers' },
  { id: 'early_bird',      emoji: '🐣', label: 'Early Bird',      desc: 'Active in the first week' },
  { id: 'storyteller',     emoji: '📸', label: 'Storyteller',     desc: '10+ posts in the Feed' },
];

function getEarnedBadges(profile: any): string[] {
  const earned: string[] = ['founding_member', 'early_bird'];
  const countries = profile.countries_visited || [];
  if (countries.length >= 1) earned.push('first_stamp');
  if (countries.length >= 5) earned.push('globe_trotter');
  if (countries.length >= 10) earned.push('nomad_certified');
  if (profile.lat && profile.lng) earned.push('local_legend');
  return earned;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function PassportPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [addingCountry, setAddingCountry] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [savingType, setSavingType] = useState(false);
  const [savingVibe, setSavingVibe] = useState(false);
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

  const setTravelerType = async (type: string) => {
    setSavingType(true);
    await supabase.from('profiles').update({ traveler_type: type }).eq('id', profile.id);
    setProfile({ ...profile, traveler_type: type });
    setSavingType(false);
  };

  const setCurrentVibe = async (vibe: string) => {
    setSavingVibe(true);
    await supabase.from('profiles').update({ current_vibe: vibe }).eq('id', profile.id);
    setProfile({ ...profile, current_vibe: vibe });
    setSavingVibe(false);
  };

  const addCountry = async (code: string) => {
    const current = profile.countries_visited || [];
    if (current.includes(code)) return;
    const updated = [...current, code];
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
    <div style={{ height: '100vh', background: '#09090f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: 'bounce 0.8s infinite alternate' }}>🌏</div>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: '#555', letterSpacing: '0.05em' }}>loading your hub...</p>
      </div>
      <style>{`@keyframes bounce { to { transform: translateY(-8px); } }`}</style>
    </div>
  );

  const earnedBadges = getEarnedBadges(profile);
  const countries = profile?.countries_visited || [];
  const travelerType = TRAVELER_TYPES.find(t => t.id === profile?.traveler_type);
  const currentVibe = VIBES.find(v => v.id === profile?.current_vibe);
  const memberYear = new Date(profile?.created_at).getFullYear();
  const filteredCountries = Object.entries(COUNTRY_NAMES).filter(([code, name]) =>
    !countries.includes(code) && name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #09090f;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
        }

        .pp-page {
          min-height: 100vh;
          padding: 80px 20px 140px;
          max-width: 760px;
          margin: 0 auto;
        }

        /* ── HERO CARD ── */
        .pp-hero {
          background: linear-gradient(145deg, #13131f 0%, #0f0f1a 100%);
          border: 1.5px solid #1e1e30;
          border-radius: 28px;
          padding: 32px;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
        }

        .pp-hero::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(232,255,71,0.07) 0%, transparent 70%);
          pointer-events: none;
        }

        .pp-hero-top {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        /* chibi avatar frame */
        .pp-avatar-frame {
          position: relative;
          flex-shrink: 0;
        }

        .pp-avatar {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          border: 3px solid #e8ff47;
          overflow: hidden;
          background: #1a1a2e;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Fredoka One', cursive;
          font-size: 32px;
          color: #e8ff47;
          position: relative;
          z-index: 1;
        }

        .pp-avatar img { width: 100%; height: 100%; object-fit: cover; }

        .pp-avatar-ring {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px dashed rgba(232,255,71,0.2);
          animation: spin 12s linear infinite;
        }

        .pp-avatar-dot {
          position: absolute;
          top: 2px; right: 2px;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #e8ff47;
          border: 2.5px solid #09090f;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .pp-identity { flex: 1; min-width: 0; }

        .pp-name {
          font-family: 'Fredoka One', cursive;
          font-size: 28px;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 4px;
        }

        .pp-handle {
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          color: #3d3d55;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .pp-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(232,255,71,0.1);
          border: 1px solid rgba(232,255,71,0.25);
          border-radius: 20px;
          padding: 5px 12px;
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #e8ff47;
        }

        .pp-type-badge.unset {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.08);
          color: #2a2a40;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pp-type-badge.unset:hover { border-color: rgba(232,255,71,0.2); color: #444; }

        /* bio */
        .pp-bio {
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #4a4a6a;
          line-height: 1.6;
          cursor: pointer;
          padding: 10px 14px;
          border-radius: 14px;
          border: 1.5px dashed transparent;
          transition: all 0.2s;
          margin-bottom: 20px;
        }
        .pp-bio:hover { border-color: rgba(232,255,71,0.2); color: #6a6a8a; }
        .pp-bio.has-bio { color: #9090b0; }

        .pp-bio-edit {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(232,255,71,0.3);
          border-radius: 14px;
          padding: 10px 14px;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          outline: none;
          resize: none;
          height: 72px;
          margin-bottom: 8px;
        }

        .pp-bio-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }

        .pp-btn-save {
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          font-weight: 800;
          background: #e8ff47;
          color: #09090f;
          border: none;
          border-radius: 20px;
          padding: 6px 16px;
          cursor: pointer;
          transition: transform 0.15s;
        }
        .pp-btn-save:hover { transform: scale(1.03); }

        .pp-btn-cancel {
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          font-weight: 700;
          background: transparent;
          color: #3a3a55;
          border: 1px solid #1e1e30;
          border-radius: 20px;
          padding: 6px 16px;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .pp-btn-cancel:hover { border-color: #333350; }

        /* stats strip */
        .pp-stats {
          display: flex;
          gap: 0;
          background: rgba(255,255,255,0.03);
          border: 1px solid #1a1a2a;
          border-radius: 16px;
          overflow: hidden;
        }

        .pp-stat {
          flex: 1;
          padding: 12px;
          text-align: center;
          border-right: 1px solid #1a1a2a;
        }
        .pp-stat:last-child { border-right: none; }

        .pp-stat-num {
          font-family: 'Fredoka One', cursive;
          font-size: 22px;
          color: #e8ff47;
          line-height: 1;
          margin-bottom: 3px;
        }

        .pp-stat-label {
          font-family: 'Nunito', sans-serif;
          font-size: 10px;
          font-weight: 700;
          color: #2a2a40;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        /* ── SECTION WRAPPER ── */
        .pp-card {
          background: linear-gradient(145deg, #13131f 0%, #0f0f1a 100%);
          border: 1.5px solid #1e1e30;
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 16px;
        }

        .pp-section-title {
          font-family: 'Fredoka One', cursive;
          font-size: 18px;
          color: #fff;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pp-section-sub {
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #2a2a40;
          margin-bottom: 16px;
        }

        /* ── TRAVELER TYPE PICKER ── */
        .pp-type-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .pp-type-card {
          background: rgba(255,255,255,0.02);
          border: 1.5px solid #1a1a2a;
          border-radius: 16px;
          padding: 14px 10px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pp-type-card:hover {
          border-color: rgba(232,255,71,0.2);
          background: rgba(232,255,71,0.03);
          transform: translateY(-2px);
        }

        .pp-type-card.selected {
          border-color: #e8ff47;
          background: rgba(232,255,71,0.07);
        }

        .pp-type-emoji {
          font-size: 28px;
          line-height: 1;
          margin-bottom: 6px;
          display: block;
          transition: transform 0.2s;
        }
        .pp-type-card:hover .pp-type-emoji { transform: scale(1.15); }
        .pp-type-card.selected .pp-type-emoji { animation: wiggle 0.4s ease; }

        @keyframes wiggle {
          0%, 100% { transform: rotate(0); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(8deg); }
        }

        .pp-type-name {
          font-family: 'Nunito', sans-serif;
          font-size: 11px;
          font-weight: 800;
          color: #6060 80;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: block;
          margin-bottom: 2px;
        }
        .pp-type-card.selected .pp-type-name { color: #e8ff47; }

        .pp-type-desc {
          font-family: 'Nunito', sans-serif;
          font-size: 10px;
          font-weight: 600;
          color: #2a2a40;
          line-height: 1.3;
        }

        /* ── VIBE PICKER ── */
        .pp-vibe-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .pp-vibe-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 20px;
          border: 1.5px solid #1a1a2a;
          background: rgba(255,255,255,0.02);
          cursor: pointer;
          transition: all 0.18s;
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #3a3a55;
        }

        .pp-vibe-chip:hover {
          border-color: rgba(232,255,71,0.25);
          color: #6a6a8a;
          transform: scale(1.03);
        }

        .pp-vibe-chip.selected {
          border-color: #e8ff47;
          background: rgba(232,255,71,0.08);
          color: #e8ff47;
        }

        .pp-vibe-emoji { font-size: 16px; }

        /* ── COUNTRY STAMPS ── */
        .pp-stamps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
          gap: 10px;
        }

        .pp-stamp {
          background: rgba(255,255,255,0.03);
          border: 1.5px solid #1a1a2a;
          border-radius: 16px;
          padding: 12px 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          animation: stampIn 0.3s ease both;
        }

        @keyframes stampIn {
          from { opacity: 0; transform: scale(0.7) rotate(-5deg); }
          to   { opacity: 1; transform: scale(1) rotate(0); }
        }

        .pp-stamp:hover { transform: translateY(-3px) scale(1.04); border-color: #2a2a3a; }

        .pp-stamp-flag { font-size: 30px; line-height: 1; }

        .pp-stamp-code {
          font-family: 'Nunito', sans-serif;
          font-size: 9px;
          font-weight: 800;
          color: #2a2a40;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .pp-stamp-remove {
          position: absolute;
          top: 3px; right: 3px;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: #1a1a2a;
          border: none;
          color: #444;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
          padding: 0;
          line-height: 1;
        }
        .pp-stamp:hover .pp-stamp-remove { opacity: 1; }

        .pp-stamp-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 40px 20px;
          border: 2px dashed #1a1a2a;
          border-radius: 20px;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #2a2a40;
          line-height: 1.6;
        }

        /* add country btn */
        .pp-add-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 9px 16px;
          border-radius: 20px;
          border: 1.5px dashed rgba(232,255,71,0.3);
          background: rgba(232,255,71,0.04);
          color: #e8ff47;
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 16px;
        }
        .pp-add-btn:hover { background: rgba(232,255,71,0.09); border-style: solid; }

        /* country search */
        .pp-country-search {
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(232,255,71,0.2);
          border-radius: 14px;
          padding: 10px 14px;
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          outline: none;
          width: 100%;
          margin-top: 14px;
          margin-bottom: 12px;
        }
        .pp-country-search::placeholder { color: #2a2a40; }
        .pp-country-search:focus { border-color: rgba(232,255,71,0.4); }

        .pp-country-results {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          max-height: 160px;
          overflow-y: auto;
          margin-bottom: 4px;
        }

        .pp-country-opt {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,255,255,0.03);
          border: 1px solid #1a1a2a;
          border-radius: 10px;
          padding: 5px 9px;
          cursor: pointer;
          font-family: 'Nunito', sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: #4a4a6a;
          transition: all 0.15s;
        }
        .pp-country-opt:hover { border-color: #e8ff47; color: #fff; transform: scale(1.03); }

        /* ── BADGES ── */
        .pp-badges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 10px;
        }

        .pp-badge {
          background: rgba(255,255,255,0.02);
          border: 1.5px solid #1a1a2a;
          border-radius: 18px;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          text-align: center;
          transition: all 0.2s;
        }

        .pp-badge.earned {
          border-color: rgba(232,255,71,0.3);
          background: rgba(232,255,71,0.04);
        }

        .pp-badge.earned:hover { transform: translateY(-3px); border-color: rgba(232,255,71,0.5); }

        .pp-badge.locked { opacity: 0.3; filter: grayscale(1) blur(0.5px); }

        .pp-badge-emoji {
          font-size: 30px;
          line-height: 1;
          transition: transform 0.2s;
        }
        .pp-badge.earned:hover .pp-badge-emoji { transform: scale(1.2) rotate(-5deg); }

        .pp-badge-name {
          font-family: 'Nunito', sans-serif;
          font-size: 11px;
          font-weight: 800;
          color: #5a5a7a;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .pp-badge.earned .pp-badge-name { color: #e8ff47; }

        .pp-badge-desc {
          font-family: 'Nunito', sans-serif;
          font-size: 10px;
          font-weight: 600;
          color: #2a2a40;
          line-height: 1.4;
        }

        .pp-badge-check {
          font-family: 'Nunito', sans-serif;
          font-size: 9px;
          font-weight: 800;
          color: #e8ff47;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* ── WHO'S IT FOR callout ── */
        .pp-callout {
          background: linear-gradient(135deg, rgba(232,255,71,0.06) 0%, rgba(232,255,71,0.02) 100%);
          border: 1.5px solid rgba(232,255,71,0.12);
          border-radius: 20px;
          padding: 20px;
          text-align: center;
          margin-bottom: 16px;
        }

        .pp-callout-headline {
          font-family: 'Fredoka One', cursive;
          font-size: 20px;
          color: #e8ff47;
          margin-bottom: 6px;
        }

        .pp-callout-sub {
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #4a4a6a;
          line-height: 1.5;
        }

        .pp-personas {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-top: 14px;
        }

        .pp-persona-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border-radius: 20px;
          background: rgba(255,255,255,0.04);
          border: 1px solid #1e1e30;
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #4a4a6a;
        }

        @media (max-width: 600px) {
          .pp-page { padding: 70px 14px 140px; }
          .pp-hero { padding: 20px; }
          .pp-type-grid { grid-template-columns: repeat(2, 1fr); }
          .pp-badges-grid { grid-template-columns: repeat(2, 1fr); }
          .pp-name { font-size: 22px; }
          .pp-avatar { width: 72px; height: 72px; font-size: 26px; }
        }
      `}</style>

      <NavBar user={{ avatar_url: profile?.avatar_url ?? undefined, username: profile?.username ?? undefined }} />

      <div className="pp-page">

        {/* ── HERO CARD ── */}
        <div className="pp-hero">
          <div className="pp-hero-top">
            <div className="pp-avatar-frame">
              <div className="pp-avatar-ring" />
              <div className="pp-avatar">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="avatar" />
                  : (profile?.username?.[0] || '?').toUpperCase()
                }
              </div>
              <div className="pp-avatar-dot">✈</div>
            </div>

            <div className="pp-identity">
              <div className="pp-name">{profile?.full_name || profile?.username || 'Wanderer'}</div>
              <div className="pp-handle">@{profile?.username} · member since {memberYear}</div>
              {travelerType
                ? <div className="pp-type-badge">{travelerType.emoji} {travelerType.label}</div>
                : <div className="pp-type-badge unset" onClick={() => document.getElementById('type-picker')?.scrollIntoView({ behavior: 'smooth' })}>
                    ✦ Pick your traveler type ↓
                  </div>
              }
            </div>
          </div>

          {/* bio */}
          {editingBio ? (
            <>
              <textarea
                className="pp-bio-edit"
                value={bioText}
                onChange={e => setBioText(e.target.value)}
                placeholder="Tell the world who you are in one line..."
                autoFocus
                maxLength={120}
              />
              <div className="pp-bio-actions">
                <button className="pp-btn-save" onClick={saveBio}>Save</button>
                <button className="pp-btn-cancel" onClick={() => { setEditingBio(false); setBioText(profile?.bio || ''); }}>Cancel</button>
              </div>
            </>
          ) : (
            <div
              className={`pp-bio${profile?.bio ? ' has-bio' : ''}`}
              onClick={() => setEditingBio(true)}
            >
              {profile?.bio || '✏️  Add a one-liner about yourself...'}
            </div>
          )}

          {/* stats */}
          <div className="pp-stats">
            <div className="pp-stat">
              <div className="pp-stat-num">{countries.length}</div>
              <div className="pp-stat-label">Countries</div>
            </div>
            <div className="pp-stat">
              <div className="pp-stat-num">{earnedBadges.length}</div>
              <div className="pp-stat-label">Badges</div>
            </div>
            <div className="pp-stat">
              <div className="pp-stat-num">{Math.min(Math.max(countries.length * 10, 5), 99)}</div>
              <div className="pp-stat-label">Wanderer Score</div>
            </div>
          </div>
        </div>

        {/* ── CALLOUT — who it's for ── */}
        <div className="pp-callout">
          <div className="pp-callout-headline">This is your hub 🌍</div>
          <div className="pp-callout-sub">
            Whether you're a nomad, expat, solo traveler or remote worker —<br />
            your passport tells the world who you are.
          </div>
          <div className="pp-personas">
            {['🌏 Nomad', '☕ Expat', '🎒 Solo Traveler', '💻 Remote Worker', '🏔 Explorer', '🌿 Slow Traveler'].map(p => (
              <span key={p} className="pp-persona-chip">{p}</span>
            ))}
          </div>
        </div>

        {/* ── CURRENT VIBE ── */}
        <div className="pp-card">
          <div className="pp-section-title">⚡ Current Vibe</div>
          <div className="pp-section-sub">What are you up to right now?</div>
          <div className="pp-vibe-row">
            {VIBES.map(v => (
              <button
                key={v.id}
                className={`pp-vibe-chip${profile?.current_vibe === v.id ? ' selected' : ''}`}
                onClick={() => setCurrentVibe(v.id)}
                disabled={savingVibe}
              >
                <span className="pp-vibe-emoji">{v.emoji}</span>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── TRAVELER TYPE ── */}
        <div className="pp-card" id="type-picker">
          <div className="pp-section-title">🧳 I am a...</div>
          <div className="pp-section-sub">Pick the traveler type that fits you best</div>
          <div className="pp-type-grid">
            {TRAVELER_TYPES.map(t => (
              <div
                key={t.id}
                className={`pp-type-card${profile?.traveler_type === t.id ? ' selected' : ''}`}
                onClick={() => !savingType && setTravelerType(t.id)}
              >
                <span className="pp-type-emoji">{t.emoji}</span>
                <span className="pp-type-name">{t.label}</span>
                <span className="pp-type-desc">{t.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── COUNTRY STAMPS ── */}
        <div className="pp-card">
          <div className="pp-section-title">🗺 Countries Visited</div>
          <div className="pp-section-sub">
            {countries.length === 0
              ? 'Your travel history starts here — add your first stamp!'
              : `${countries.length} stamp${countries.length === 1 ? '' : 's'} collected`
            }
          </div>

          <div className="pp-stamps-grid">
            {countries.length === 0 && (
              <div className="pp-stamp-empty">
                🌍<br />No stamps yet.<br />Every journey starts somewhere.
              </div>
            )}
            {countries.map((code: string) => (
              <div key={code} className="pp-stamp">
                <span className="pp-stamp-flag">{COUNTRY_EMOJIS[code] || '🏳'}</span>
                <span className="pp-stamp-code">{code}</span>
                <button className="pp-stamp-remove" onClick={() => removeCountry(code)}>×</button>
              </div>
            ))}
          </div>

          <button className="pp-add-btn" onClick={() => setAddingCountry(!addingCountry)}>
            {addingCountry ? '✕ Close' : '+ Add stamp'}
          </button>

          {addingCountry && (
            <>
              <input
                className="pp-country-search"
                placeholder="Search country..."
                value={countrySearch}
                onChange={e => setCountrySearch(e.target.value)}
                autoFocus
              />
              <div className="pp-country-results">
                {filteredCountries.slice(0, 40).map(([code, name]) => (
                  <div key={code} className="pp-country-opt" onClick={() => addCountry(code)}>
                    <span>{COUNTRY_EMOJIS[code] || '🏳'}</span>
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── BADGES ── */}
        <div className="pp-card">
          <div className="pp-section-title">🏆 Badges</div>
          <div className="pp-section-sub">
            {earnedBadges.length} earned · {ALL_BADGES.length - earnedBadges.length} to unlock
          </div>
          <div className="pp-badges-grid">
            {ALL_BADGES.map(badge => {
              const earned = earnedBadges.includes(badge.id);
              return (
                <div key={badge.id} className={`pp-badge${earned ? ' earned' : ' locked'}`}>
                  <span className="pp-badge-emoji">{badge.emoji}</span>
                  <span className="pp-badge-name">{badge.label}</span>
                  <span className="pp-badge-desc">{badge.desc}</span>
                  {earned && <span className="pp-badge-check">✓ Earned</span>}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </>
  );
}
