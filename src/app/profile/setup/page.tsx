'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { MapPin, Loader } from 'lucide-react';
import NavBar from '@/components/ui/NavBar';
import { Profile } from '@/types';

const SKILL_SUGGESTIONS = ['React', 'TypeScript', 'Python', 'Rust', 'Go', 'Web3', 'iOS', 'Android', 'AI/ML', 'DevOps', 'Solidity', 'Next.js', 'Node.js', 'Swift', 'Kotlin'];

export default function ProfileSetupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Partial<Profile>>({
    full_name: '',
    bio: '',
    skills: [],
    github_url: '',
    website_url: '',
    city: '',
    is_visible: true,
    lat: null,
    lng: null,
  });
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
    };
    load();
  }, []);

  const detectLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        // Reverse geocode city name via Mapbox
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        try {
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?types=place&access_token=${token}`
          );
          const geo = await res.json();
          const city = geo.features?.[0]?.text || '';
          setProfile(p => ({ ...p, lat: latitude, lng: longitude, city }));
        } catch {
          setProfile(p => ({ ...p, lat: latitude, lng: longitude }));
        }
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const toggleSkill = (skill: string) => {
    setProfile(p => ({
      ...p,
      skills: p.skills?.includes(skill)
        ? p.skills.filter(s => s !== skill)
        : [...(p.skills || []), skill],
    }));
  };

  const addCustomSkill = () => {
    const s = skillInput.trim();
    if (s && !profile.skills?.includes(s)) {
      setProfile(p => ({ ...p, skills: [...(p.skills || []), s] }));
    }
    setSkillInput('');
  };

  const save = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('profiles').upsert({ id: user.id, ...profile });
    setSaved(true);
    setLoading(false);
    setTimeout(() => router.push('/passport'), 800);
  };

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <NavBar user={{ avatar_url: profile?.avatar_url ?? undefined, username: profile?.username ?? undefined }} />

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
        <div className="fade-up">
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#fff', marginBottom: 6 }}>Your Profile</h1>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 32 }}>
            This is what other devs see when they click your pin.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <Field label="Full Name">
              <input
                value={profile.full_name || ''}
                onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                placeholder="Your name"
                style={inputStyle}
              />
            </Field>

            <Field label="Bio">
              <textarea
                value={profile.bio || ''}
                onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                placeholder="What are you building? What do you care about?"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </Field>

            <Field label="Skills">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {SKILL_SUGGESTIONS.map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    style={{
                      background: profile.skills?.includes(skill) ? 'rgba(232,255,71,0.15)' : '#111',
                      border: `1px solid ${profile.skills?.includes(skill) ? '#e8ff47' : '#2a2a2a'}`,
                      color: profile.skills?.includes(skill) ? '#e8ff47' : '#888',
                      fontSize: 12, padding: '5px 10px', borderRadius: 7,
                      cursor: 'pointer', fontFamily: 'DM Mono, monospace',
                      transition: 'all 0.15s',
                    }}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomSkill()}
                  placeholder="Add custom skill..."
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button onClick={addCustomSkill} style={secondaryBtnStyle}>Add</button>
              </div>
            </Field>

            <Field label="GitHub URL">
              <input
                value={profile.github_url || ''}
                onChange={e => setProfile(p => ({ ...p, github_url: e.target.value }))}
                placeholder="https://github.com/username"
                style={inputStyle}
              />
            </Field>

            <Field label="Website">
              <input
                value={profile.website_url || ''}
                onChange={e => setProfile(p => ({ ...p, website_url: e.target.value }))}
                placeholder="https://yoursite.com"
                style={inputStyle}
              />
            </Field>

            <Field label="Location">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  value={profile.city || ''}
                  onChange={e => setProfile(p => ({ ...p, city: e.target.value }))}
                  placeholder="City (auto-detected or type manually)"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button onClick={detectLocation} disabled={locating} style={secondaryBtnStyle}>
                  {locating ? <Loader size={14} className="animate-spin" /> : <MapPin size={14} />}
                </button>
              </div>
              {profile.lat && (
                <p style={{ color: '#555', fontSize: 12, marginTop: 6 }}>
                  ✓ Location set — {profile.lat?.toFixed(4)}, {profile.lng?.toFixed(4)}
                </p>
              )}
            </Field>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#111', border: '1px solid #1e1e1e', borderRadius: 10 }}>
              <input
                type="checkbox"
                id="visible"
                checked={profile.is_visible}
                onChange={e => setProfile(p => ({ ...p, is_visible: e.target.checked }))}
                style={{ accentColor: '#e8ff47', width: 15, height: 15 }}
              />
              <label htmlFor="visible" style={{ color: '#ccc', fontSize: 13, cursor: 'pointer' }}>
                Show me on the map
              </label>
            </div>

            <button
              onClick={save}
              disabled={loading || saved}
              style={{
                background: saved ? '#1a2a00' : '#e8ff47',
                color: saved ? '#e8ff47' : '#0a0a0a',
                border: saved ? '1px solid #e8ff47' : 'none',
                padding: '12px 24px', borderRadius: 10,
                fontWeight: 600, fontSize: 14, cursor: 'pointer',
                transition: 'all 0.2s', marginTop: 8,
              }}
            >
              {saved ? '✓ Saved — taking you to the map' : loading ? 'Saving...' : 'Save & Go to Map'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ color: '#888', fontSize: 12, fontFamily: 'DM Mono, monospace', letterSpacing: '0.05em' }}>
        {label.toUpperCase()}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: '#111',
  border: '1px solid #1e1e1e',
  color: '#fff',
  padding: '10px 14px',
  borderRadius: 10,
  fontSize: 14,
  outline: 'none',
  width: '100%',
  fontFamily: 'DM Sans, sans-serif',
  transition: 'border-color 0.15s',
};

const secondaryBtnStyle: React.CSSProperties = {
  background: '#111',
  border: '1px solid #2a2a2a',
  color: '#888',
  padding: '10px 14px',
  borderRadius: 10,
  fontSize: 13,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 5,
};
