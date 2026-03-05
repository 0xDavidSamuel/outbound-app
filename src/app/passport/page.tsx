'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/ui/NavBar';

const COUNTRY_EMOJIS: Record<string, string> = {
  'US': '🇺🇸', 'GB': '🇬🇧', 'JP': '🇯🇵', 'FR': '🇫🇷', 'DE': '🇩🇪',
  'BR': '🇧🇷', 'MX': '🇲🇽', 'CA': '🇨🇦', 'AU': '🇦🇺', 'IN': '🇮🇳',
  'CN': '🇨🇳', 'KR': '🇰🇷', 'ES': '🇪🇸', 'IT': '🇮🇹', 'PT': '🇵🇹',
  'NL': '🇳🇱', 'SE': '🇸🇪', 'NO': '🇳🇴', 'SG': '🇸🇬', 'AE': '🇦🇪',
  'AR': '🇦🇷', 'CL': '🇨🇱', 'CO': '🇨🇴', 'PL': '🇵🇱', 'TR': '🇹🇷',
  'TH': '🇹🇭', 'VN': '🇻🇳', 'ID': '🇮🇩', 'PH': '🇵🇭', 'ZA': '🇿🇦',
  'NG': '🇳🇬', 'EG': '🇪🇬', 'GH': '🇬🇭', 'KE': '🇰🇪', 'MA': '🇲🇦',
  'NZ': '🇳🇿', 'CH': '🇨🇭', 'AT': '🇦🇹', 'BE': '🇧🇪', 'DK': '🇩🇰',
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
};

const ALL_BADGES = [
  { id: 'first_pin', icon: '📍', label: 'First Pin', desc: 'Dropped your location on the map' },
  { id: 'web3_builder', icon: '⛓', label: 'Web3 Builder', desc: 'Working in blockchain / Web3' },
  { id: 'mobile_dev', icon: '📱', label: 'Mobile Dev', desc: 'Building for iOS or Android' },
  { id: 'open_source', icon: '🔓', label: 'Open Source', desc: 'Contributing to open source' },
  { id: 'globe_trotter', icon: '🌍', label: 'Globe Trotter', desc: 'Visited 5+ countries' },
  { id: 'continent_hopper', icon: '✈️', label: 'Continent Hopper', desc: 'Visited 3+ continents' },
  { id: 'local_legend', icon: '🏙', label: 'Local Legend', desc: 'Active in your home city' },
  { id: 'ai_builder', icon: '🤖', label: 'AI Builder', desc: 'Building with AI / ML' },
  { id: 'founding_member', icon: '🥇', label: 'Founding Member', desc: 'Joined during beta' },
  { id: 'event_host', icon: '⚡', label: 'Event Host', desc: 'Hosted a local event' },
  { id: 'full_stack', icon: '🧱', label: 'Full Stack', desc: 'Frontend + backend skills' },
  { id: 'nomad', icon: '🎒', label: 'Digital Nomad', desc: 'Visited 10+ countries' },
];

function getBadgesForProfile(profile: any): string[] {
  const earned: string[] = ['founding_member'];
  if (profile.lat && profile.lng) earned.push('first_pin');
  const skills = profile.skills || [];
  if (skills.some((s: string) => ['Solidity', 'Web3', 'Ethereum', 'Base'].includes(s))) earned.push('web3_builder');
  if (skills.some((s: string) => ['React Native', 'Swift', 'Kotlin', 'Flutter'].includes(s))) earned.push('mobile_dev');
  if (skills.some((s: string) => ['AI', 'ML', 'Python', 'TensorFlow', 'PyTorch'].includes(s))) earned.push('ai_builder');
  if (skills.some((s: string) => ['React', 'Vue', 'Next.js'].includes(s)) && skills.some((s: string) => ['Node.js', 'Go', 'Rust', 'Python'].includes(s))) earned.push('full_stack');
  const countries = profile.countries_visited || [];
  if (countries.length >= 5) earned.push('globe_trotter');
  if (countries.length >= 10) earned.push('nomad');
  return earned;
}

export default function PassportPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addingCountry, setAddingCountry] = useState(false);
  const [search, setSearch] = useState('');
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/'); return; }
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(data);
      setLoading(false);
    };
    load();
  }, []);

  const addCountry = async (code: string) => {
    const current = profile.countries_visited || [];
    if (current.includes(code)) return;
    const updated = [...current, code];
    await supabase.from('profiles').update({ countries_visited: updated }).eq('id', profile.id);
    setProfile({ ...profile, countries_visited: updated });
    setAddingCountry(false);
    setSearch('');
  };

  const removeCountry = async (code: string) => {
    const updated = (profile.countries_visited || []).filter((c: string) => c !== code);
    await supabase.from('profiles').update({ countries_visited: updated }).eq('id', profile.id);
    setProfile({ ...profile, countries_visited: updated });
  };

  if (loading) return (
    <div style={{ height: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#333', letterSpacing: '0.2em' }}>
      loading passport...
    </div>
  );

  const earnedBadges = getBadgesForProfile(profile);
  const countries = profile?.countries_visited || [];
  const filteredCountries = Object.entries(COUNTRY_NAMES).filter(([code, name]) =>
    !countries.includes(code) && name.toLowerCase().includes(search.toLowerCase())
  );
  const memberSince = new Date(profile?.created_at).getFullYear();

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; color: #fff; font-family: 'DM Sans', sans-serif; }

        .passport-page {
          min-height: 100vh;
          padding: 80px 24px 120px;
          max-width: 720px;
          margin: 0 auto;
        }

        /* COVER */
        .passport-cover {
          background: linear-gradient(135deg, #0e0e0e 0%, #111 50%, #0a0a0a 100%);
          border: 1px solid #1a1a1a;
          border-radius: 16px;
          padding: 40px;
          margin-bottom: 32px;
          position: relative;
          overflow: hidden;
        }

        .passport-cover::before {
          content: 'OUTBOUND';
          position: absolute;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 120px;
          color: rgba(232,255,71,0.03);
          right: -20px;
          bottom: -20px;
          pointer-events: none;
          letter-spacing: 0.05em;
          line-height: 1;
        }

        .passport-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 32px;
        }

        .passport-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          border: 2px solid #e8ff47;
          overflow: hidden;
          flex-shrink: 0;
          background: #111;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          color: #e8ff47;
        }

        .passport-avatar img { width: 100%; height: 100%; object-fit: cover; }

        .passport-identity { flex: 1; }

        .passport-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 36px;
          line-height: 1;
          color: #fff;
          margin-bottom: 4px;
        }

        .passport-username {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #444;
          letter-spacing: 0.1em;
        }

        .passport-meta {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
        }

        .passport-meta-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .passport-meta-label {
          font-family: 'DM Mono', monospace;
          font-size: 8px;
          letter-spacing: 0.35em;
          color: #333;
          text-transform: uppercase;
        }

        .passport-meta-value {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: #888;
        }

        .passport-meta-value.accent { color: #e8ff47; }

        /* SECTION */
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .section-title {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.4em;
          color: #333;
          text-transform: uppercase;
        }

        .section-add {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.15em;
          color: #e8ff47;
          background: rgba(232,255,71,0.07);
          border: 1px solid rgba(232,255,71,0.18);
          padding: 5px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
          text-transform: uppercase;
        }
        .section-add:hover { background: rgba(232,255,71,0.14); }

        /* STAMPS */
        .stamps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 12px;
          margin-bottom: 32px;
        }

        .stamp {
          background: #0d0d0d;
          border: 1px solid #1a1a1a;
          border-radius: 10px;
          padding: 14px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: border-color 0.2s, transform 0.15s;
          position: relative;
          group: true;
        }

        .stamp:hover { border-color: #333; transform: translateY(-2px); }

        .stamp-flag { font-size: 28px; line-height: 1; }

        .stamp-code {
          font-family: 'DM Mono', monospace;
          font-size: 8px;
          letter-spacing: 0.15em;
          color: #333;
          text-transform: uppercase;
        }

        .stamp-remove {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #1a1a1a;
          border: none;
          color: #555;
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

        .stamp:hover .stamp-remove { opacity: 1; }

        .stamps-empty {
          grid-column: 1 / -1;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #222;
          text-align: center;
          padding: 32px;
          border: 1px dashed #161616;
          border-radius: 10px;
          letter-spacing: 0.1em;
        }

        /* COUNTRY SEARCH */
        .country-search-box {
          background: #0d0d0d;
          border: 1px solid #1a1a1a;
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 32px;
        }

        .country-search-input {
          width: 100%;
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 6px;
          padding: 10px 14px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #fff;
          outline: none;
          margin-bottom: 12px;
          transition: border-color 0.2s;
        }
        .country-search-input:focus { border-color: #333; }
        .country-search-input::placeholder { color: #333; }

        .country-results {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          max-height: 180px;
          overflow-y: auto;
        }

        .country-option {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 6px;
          padding: 6px 10px;
          cursor: pointer;
          transition: border-color 0.15s;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: #666;
        }
        .country-option:hover { border-color: #e8ff47; color: #fff; }

        /* BADGES */
        .badges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 12px;
          margin-bottom: 32px;
        }

        .badge-card {
          background: #0d0d0d;
          border: 1px solid #1a1a1a;
          border-radius: 10px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: border-color 0.2s;
        }

        .badge-card.earned {
          border-color: rgba(232,255,71,0.2);
          background: rgba(232,255,71,0.03);
        }

        .badge-card.locked { opacity: 0.35; filter: grayscale(1); }

        .badge-icon { font-size: 24px; line-height: 1; }

        .badge-label {
          font-size: 12px;
          font-weight: 500;
          color: #fff;
        }

        .badge-desc {
          font-size: 11px;
          color: #444;
          line-height: 1.5;
          font-weight: 300;
        }

        .badge-earned-tag {
          font-family: 'DM Mono', monospace;
          font-size: 8px;
          letter-spacing: 0.15em;
          color: #e8ff47;
          text-transform: uppercase;
          margin-top: auto;
        }

        /* SKILLS STRIP */
        .skills-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 32px;
        }

        .skill-tag {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          color: #555;
          background: #0d0d0d;
          border: 1px solid #1a1a1a;
          padding: 6px 12px;
          border-radius: 20px;
          text-transform: uppercase;
        }

        @media (max-width: 600px) {
          .passport-page { padding: 72px 16px 140px; }
          .passport-cover { padding: 24px; }
          .passport-name { font-size: 28px; }
          .badges-grid { grid-template-columns: repeat(2, 1fr); }
          .stamps-grid { grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)); }
        }
      `}</style>

      <NavBar user={{ avatar_url: profile?.avatar_url ?? undefined, username: profile?.username ?? undefined }} />

      <div className="passport-page">

        {/* COVER */}
        <div className="passport-cover">
          <div className="passport-header">
            <div className="passport-avatar">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="avatar" />
                : (profile?.username?.[0] || '?').toUpperCase()
              }
            </div>
            <div className="passport-identity">
              <div className="passport-name">{profile?.full_name || profile?.username || 'Anonymous'}</div>
              <div className="passport-username">@{profile?.username}</div>
            </div>
          </div>
          <div className="passport-meta">
            <div className="passport-meta-item">
              <span className="passport-meta-label">Member Since</span>
              <span className="passport-meta-value">{memberSince}</span>
            </div>
            <div className="passport-meta-item">
              <span className="passport-meta-label">Countries</span>
              <span className="passport-meta-value accent">{countries.length}</span>
            </div>
            <div className="passport-meta-item">
              <span className="passport-meta-label">Badges</span>
              <span className="passport-meta-value accent">{earnedBadges.length}</span>
            </div>
            {profile?.city && (
              <div className="passport-meta-item">
                <span className="passport-meta-label">Base</span>
                <span className="passport-meta-value">{profile.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* SKILLS */}
        {profile?.skills?.length > 0 && (
          <>
            <div className="section-header">
              <span className="section-title">Stack</span>
            </div>
            <div className="skills-strip">
              {profile.skills.map((s: string) => (
                <span key={s} className="skill-tag">{s}</span>
              ))}
            </div>
          </>
        )}

        {/* STAMPS */}
        <div className="section-header">
          <span className="section-title">Countries Visited</span>
          <button className="section-add" onClick={() => setAddingCountry(!addingCountry)}>
            {addingCountry ? '✕ Close' : '+ Add stamp'}
          </button>
        </div>

        {addingCountry && (
          <div className="country-search-box">
            <input
              className="country-search-input"
              placeholder="Search country..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
            <div className="country-results">
              {filteredCountries.slice(0, 30).map(([code, name]) => (
                <div key={code} className="country-option" onClick={() => addCountry(code)}>
                  <span>{COUNTRY_EMOJIS[code] || '🏳'}</span>
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="stamps-grid">
          {countries.length === 0 && (
            <div className="stamps-empty">No stamps yet — add countries you've visited</div>
          )}
          {countries.map((code: string) => (
            <div key={code} className="stamp">
              <span className="stamp-flag">{COUNTRY_EMOJIS[code] || '🏳'}</span>
              <span className="stamp-code">{code}</span>
              <button className="stamp-remove" onClick={() => removeCountry(code)}>×</button>
            </div>
          ))}
        </div>

        {/* BADGES */}
        <div className="section-header">
          <span className="section-title">Badges</span>
        </div>
        <div className="badges-grid">
          {ALL_BADGES.map(badge => {
            const earned = earnedBadges.includes(badge.id);
            return (
              <div key={badge.id} className={`badge-card${earned ? ' earned' : ' locked'}`}>
                <span className="badge-icon">{badge.icon}</span>
                <span className="badge-label">{badge.label}</span>
                <span className="badge-desc">{badge.desc}</span>
                {earned && <span className="badge-earned-tag">✓ Earned</span>}
              </div>
            );
          })}
        </div>

      </div>
    </>
  );
}
