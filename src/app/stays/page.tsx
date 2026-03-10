'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/session';
import PageReveal from '@/components/ui/PageReveal';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface Stay {
  id: string;
  host_id: string;
  title: string;
  description: string;
  city: string;
  country: string;
  price_per_month: number;
  price_per_week?: number;
  price_per_night?: number;
  images: string[];
  amenities: string[];
  type: string;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  wifi_speed?: number;
  is_nomad_friendly: boolean;
  is_available: boolean;
  featured: boolean;
  created_at: string;
  host?: { username: string; avatar_url: string };
}

const TYPES = ['All', 'Apartment', 'House', 'Room', 'Coliving', 'Villa', 'Studio'];
const AMENITIES_LIST = ['WiFi', 'Desk', 'AC', 'Kitchen', 'Washer', 'Pool', 'Gym', 'Parking', 'Rooftop', 'Coffee'];

const inputStyle: React.CSSProperties = { width: '100%', background: '#111', border: '1px solid #1a1a1a', borderRadius: 8, padding: '10px 14px', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none' };
const labelStyle: React.CSSProperties = { fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.2em', color: '#444', textTransform: 'uppercase', marginBottom: 8 };
const pillStyle: React.CSSProperties = { fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 20, border: '1px solid #1a1a1a', color: '#444', cursor: 'pointer', background: 'transparent', transition: 'all 0.15s' };
const pillActiveStyle: React.CSSProperties = { background: '#e8553a', color: '#080808', border: '1px solid #e8553a' };
const primaryBtnStyle: React.CSSProperties = { width: '100%', background: '#e8553a', color: '#080808', border: 'none', borderRadius: 8, padding: '13px', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500 };
const countBtnStyle: React.CSSProperties = { width: 28, height: 28, borderRadius: 6, background: '#111', border: '1px solid #1a1a1a', color: '#fff', cursor: 'pointer', fontFamily: 'DM Mono, monospace', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' };

function ListStayModal({ onClose, onSave, userId }: { onClose: () => void; onSave: (stay: any) => void; userId: string }) {
  const [form, setForm] = useState({ title: '', description: '', city: '', country: '', price_per_month: '', price_per_week: '', price_per_night: '', type: 'apartment', bedrooms: 1, bathrooms: 1, max_guests: 2, wifi_speed: '', amenities: [] as string[], images: [''], is_nomad_friendly: true });
  const [step, setStep] = useState(1);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleAmenity = (a: string) => set('amenities', form.amenities.includes(a) ? form.amenities.filter(x => x !== a) : [...form.amenities, a]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflowY: 'auto' }}>
      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 8, letterSpacing: '0.4em', color: '#333', textTransform: 'uppercase', marginBottom: 4 }}>Step {step} of 2</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: '#e8553a', lineHeight: 1 }}>{step === 1 ? 'List your stay.' : 'Pricing & amenities.'}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 20 }}>×</button>
        </div>

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input placeholder="Title (e.g. Sunny studio near beach)" value={form.title} onChange={e => set('title', e.target.value)} style={inputStyle} />
            <textarea placeholder="Describe your place..." value={form.description} onChange={e => set('description', e.target.value)} style={{ ...inputStyle, height: 80, resize: 'none' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input placeholder="City" value={form.city} onChange={e => set('city', e.target.value)} style={inputStyle} />
              <input placeholder="Country" value={form.country} onChange={e => set('country', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <div style={labelStyle}>Type</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['apartment', 'house', 'room', 'coliving', 'villa', 'studio'].map(t => (
                  <button key={t} onClick={() => set('type', t)} style={{ ...pillStyle, ...(form.type === t ? pillActiveStyle : {}) }}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[['bedrooms', 'Beds'], ['bathrooms', 'Baths'], ['max_guests', 'Guests']].map(([k, l]) => (
                <div key={k}>
                  <div style={labelStyle}>{l}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => set(k, Math.max(1, (form as any)[k] - 1))} style={countBtnStyle}>−</button>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 14, color: '#fff', minWidth: 20, textAlign: 'center' }}>{(form as any)[k]}</span>
                    <button onClick={() => set(k, (form as any)[k] + 1)} style={countBtnStyle}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div style={labelStyle}>Image URLs</div>
              {form.images.map((img, i) => (
                <input key={i} placeholder={`Image ${i + 1} URL`} value={img} onChange={e => { const imgs = [...form.images]; imgs[i] = e.target.value; set('images', imgs); }} style={{ ...inputStyle, marginBottom: 6 }} />
              ))}
              <button onClick={() => set('images', [...form.images, ''])} style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#444', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.15em', textTransform: 'uppercase' }}>+ Add image</button>
            </div>
            <button onClick={() => setStep(2)} style={primaryBtnStyle}>Continue →</button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={labelStyle}>Pricing (USD)</div>
              {[['price_per_month', '/ month *'], ['price_per_week', '/ week'], ['price_per_night', '/ night']].map(([k, l]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 16, color: '#333' }}>$</span>
                  <input placeholder="0" type="number" value={(form as any)[k]} onChange={e => set(k, e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#444', whiteSpace: 'nowrap', letterSpacing: '0.1em' }}>{l}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input placeholder="WiFi speed (Mbps)" type="number" value={form.wifi_speed} onChange={e => set('wifi_speed', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#444', letterSpacing: '0.1em' }}>Mbps</span>
            </div>
            <div>
              <div style={labelStyle}>Amenities</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {AMENITIES_LIST.map(a => (
                  <button key={a} onClick={() => toggleAmenity(a)} style={{ ...pillStyle, ...(form.amenities.includes(a) ? pillActiveStyle : {}) }}>{a}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#111', border: '1px solid #1a1a1a', borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>Nomad friendly</div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#444', letterSpacing: '0.1em', marginTop: 2 }}>Monthly stays, flexible checkout</div>
              </div>
              <button onClick={() => set('is_nomad_friendly', !form.is_nomad_friendly)} style={{ width: 40, height: 22, borderRadius: 11, background: form.is_nomad_friendly ? '#e8553a' : '#1a1a1a', border: 'none', cursor: 'pointer', transition: 'background 0.2s', position: 'relative' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: form.is_nomad_friendly ? '#080808' : '#444', position: 'absolute', top: 3, left: form.is_nomad_friendly ? 21 : 3, transition: 'left 0.2s' }} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ ...primaryBtnStyle, background: 'transparent', border: '1px solid #1a1a1a', color: '#444', flex: 1 }}>← Back</button>
              <button onClick={() => onSave({ ...form, price_per_month: parseInt(form.price_per_month) || 0, price_per_week: parseInt(form.price_per_week) || null, price_per_night: parseInt(form.price_per_night) || null, wifi_speed: parseInt(form.wifi_speed) || null, images: form.images.filter(Boolean), host_id: userId })} style={{ ...primaryBtnStyle, flex: 2 }}>List my stay ✓</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StaysPage() {
  const [stays, setStays]             = useState<Stay[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [userId, setUserId]           = useState('');
  const [token, setToken]             = useState('');
  const [activeType, setActiveType]   = useState('All');
  const [search, setSearch]           = useState('');
  const [maxPrice, setMaxPrice]       = useState(10000);
  const [nomadOnly, setNomadOnly]     = useState(false);
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session) {
        setUserId(session.user.id);
        setToken(session.access_token);
      }
      const tok = session?.access_token || SUPABASE_KEY;
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/stays?is_available=eq.true&select=*,host:profiles(username,avatar_url)&order=featured.desc,created_at.desc`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${tok}` } }
      );
      const data = await res.json();
      setStays(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  const saveStay = async (stay: any) => {
    if (!token) return;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/stays`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(stay),
    });
    const rows = await res.json();
    const newStay = rows?.[0];
    if (newStay) {
      setStays(prev => [newStay, ...prev]);
      setShowModal(false);
    }
  };

  const filtered = stays.filter(s => {
    if (activeType !== 'All' && s.type.toLowerCase() !== activeType.toLowerCase()) return false;
    if (search && !s.city.toLowerCase().includes(search.toLowerCase()) && !s.country.toLowerCase().includes(search.toLowerCase()) && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (s.price_per_month > maxPrice) return false;
    if (nomadOnly && !s.is_nomad_friendly) return false;
    return true;
  });

  return (
    <PageReveal>
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; color: #fff; font-family: 'DM Sans', sans-serif; }
        .stays-page { min-height: 100vh; padding: 72px 24px 140px; max-width: 1000px; margin: 0 auto; }
        .stays-header { margin-bottom: 32px; }
        .stays-eyebrow { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.5em; color: #333; text-transform: uppercase; margin-bottom: 12px; }
        .stays-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(48px, 7vw, 80px); line-height: 0.9; color: #fff; margin-bottom: 24px; }
        .stays-title em { color: #e8553a; font-style: normal; }
        .stays-controls { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 14px; padding: 16px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 12px; }
        .filter-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .filter-pill { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; padding: 6px 14px; border-radius: 20px; border: 1px solid #1a1a1a; color: #444; cursor: pointer; transition: all 0.2s; background: transparent; }
        .filter-pill:hover { color: #888; border-color: #333; }
        .filter-pill.active { background: #e8553a; color: #080808; border-color: #e8553a; }
        .filter-pill.nomad-active { background: rgba(232,85,58,0.1); color: #e8553a; border-color: rgba(232,85,58,0.3); }
        .search-input { flex: 1; min-width: 160px; background: #111; border: 1px solid #1a1a1a; border-radius: 8px; padding: 9px 14px; font-family: 'DM Mono', monospace; font-size: 11px; color: #fff; outline: none; }
        .search-input::placeholder { color: #333; }
        .price-range { display: flex; align-items: center; gap: 10px; }
        .price-label { font-family: 'DM Mono', monospace; font-size: 9px; color: #444; letter-spacing: 0.1em; text-transform: uppercase; white-space: nowrap; }
        .price-slider { flex: 1; accent-color: #e8553a; }
        .price-val { font-family: 'DM Mono', monospace; font-size: 10px; color: #e8553a; white-space: nowrap; }
        .btn-list { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; padding: 9px 18px; border-radius: 8px; background: #e8553a; color: #080808; border: none; cursor: pointer; font-weight: 500; white-space: nowrap; }
        .section-divider { display: flex; align-items: center; gap: 16px; margin: 8px 0 20px; }
        .section-divider-label { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.4em; color: #222; text-transform: uppercase; white-space: nowrap; }
        .section-divider-line { flex: 1; height: 1px; background: #111; }
        .stays-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .stay-card { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 14px; overflow: hidden; transition: border-color 0.2s, transform 0.15s; cursor: pointer; }
        .stay-card:hover { border-color: #2a2a2a; transform: translateY(-2px); }
        .stay-card.featured { border-color: rgba(232,85,58,0.2); }
        .stay-image { position: relative; height: 180px; overflow: hidden; background: #111; }
        .stay-image img { width: 100%; height: 100%; object-fit: cover; }
        .stay-image-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; opacity: 0.3; background: linear-gradient(135deg, #0e0e0e, #111); }
        .stay-badge { position: absolute; top: 10px; left: 10px; background: rgba(8,8,8,0.85); border-radius: 6px; padding: 4px 8px; font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.15em; color: #e8553a; text-transform: uppercase; }
        .stay-featured-badge { position: absolute; top: 10px; right: 10px; background: #e8553a; color: #080808; border-radius: 6px; padding: 4px 8px; font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.15em; text-transform: uppercase; }
        .stay-nomad-badge { position: absolute; bottom: 10px; left: 10px; background: rgba(232,85,58,0.15); border: 1px solid rgba(232,85,58,0.3); color: #e8553a; border-radius: 6px; padding: 3px 8px; font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.1em; }
        .stay-body { padding: 14px; display: flex; flex-direction: column; gap: 8px; }
        .stay-location { font-family: 'DM Mono', monospace; font-size: 9px; color: #444; letter-spacing: 0.15em; text-transform: uppercase; }
        .stay-title-text { font-size: 14px; font-weight: 500; color: #fff; line-height: 1.4; }
        .stay-meta { display: flex; gap: 12px; }
        .stay-meta-item { font-family: 'DM Mono', monospace; font-size: 9px; color: #333; letter-spacing: 0.08em; }
        .stay-amenities { display: flex; flex-wrap: wrap; gap: 4px; }
        .stay-amenity { font-family: 'DM Mono', monospace; font-size: 8px; color: #333; background: #111; border: 1px solid #1a1a1a; padding: 2px 6px; border-radius: 3px; text-transform: uppercase; letter-spacing: 0.08em; }
        .stay-footer { display: flex; align-items: flex-end; justify-content: space-between; margin-top: 4px; }
        .stay-host { display: flex; align-items: center; gap: 6px; }
        .stay-host-avatar { width: 24px; height: 24px; border-radius: 50%; border: 1px solid #222; object-fit: cover; background: #111; }
        .stay-host-name { font-family: 'DM Mono', monospace; font-size: 9px; color: #333; letter-spacing: 0.08em; }
        .empty-state { text-align: center; padding: 80px 0; font-family: 'DM Mono', monospace; font-size: 11px; color: #222; letter-spacing: 0.2em; }
        .empty-cta { margin-top: 16px; background: none; border: 1px solid #1a1a1a; color: #444; padding: 10px 20px; border-radius: 8px; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
        .empty-cta:hover { border-color: #e8553a; color: #e8553a; }
        .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0; gap: 16px; font-family: 'DM Mono', monospace; font-size: 11px; color: #333; letter-spacing: 0.2em; }
        .loading-dot { width: 6px; height: 6px; border-radius: 50%; background: #e8553a; animation: pulse 1.2s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }
        .detail-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 900; display: flex; align-items: flex-start; justify-content: center; padding: 40px 24px; overflow-y: auto; }
        .detail-modal { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 16px; width: 100%; max-width: 600px; overflow: hidden; }
        .detail-images { position: relative; height: 280px; background: #111; }
        .detail-images img { width: 100%; height: 100%; object-fit: cover; }
        .detail-close { position: absolute; top: 14px; right: 14px; width: 32px; height: 32px; border-radius: 50%; background: rgba(8,8,8,0.8); border: none; color: #fff; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; }
        .detail-body { padding: 24px; }
        .detail-title { font-family: 'Bebas Neue', sans-serif; font-size: 32px; color: #fff; line-height: 1.1; margin-bottom: 6px; }
        .detail-location { font-family: 'DM Mono', monospace; font-size: 10px; color: #e8553a; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 16px; }
        .detail-desc { font-size: 13px; color: #555; line-height: 1.7; margin-bottom: 20px; font-weight: 300; }
        .detail-prices { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
        .detail-price-item { background: #111; border: 1px solid #1a1a1a; border-radius: 8px; padding: 12px 16px; }
        .detail-price-period { font-family: 'DM Mono', monospace; font-size: 8px; color: #444; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 2px; }
        .detail-amenities-grid { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
        .detail-amenity { font-family: 'DM Mono', monospace; font-size: 9px; color: #444; background: #111; border: 1px solid #1a1a1a; padding: 5px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.1em; }
        .btn-contact { width: 100%; background: #e8553a; color: #080808; border: none; border-radius: 10px; padding: 14px; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; font-weight: 500; }
        @media (max-width: 600px) { .stays-page { padding: 64px 16px 140px; } .stays-grid { grid-template-columns: 1fr; } }
      `}</style>

      {showModal && userId && <ListStayModal onClose={() => setShowModal(false)} onSave={saveStay} userId={userId} />}

      {selectedStay && (
        <div className="detail-overlay" onClick={() => setSelectedStay(null)}>
          <div className="detail-modal" onClick={e => e.stopPropagation()}>
            <div className="detail-images">
              {selectedStay.images?.[0] ? <img src={selectedStay.images[0]} alt={selectedStay.title} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, opacity: 0.2 }}>🏠</div>}
              <button className="detail-close" onClick={() => setSelectedStay(null)}>×</button>
              {selectedStay.featured && <div className="stay-featured-badge">Featured</div>}
            </div>
            <div className="detail-body">
              <div className="detail-title">{selectedStay.title}</div>
              <div className="detail-location">📍 {selectedStay.city}, {selectedStay.country}</div>
              {selectedStay.description && <p className="detail-desc">{selectedStay.description}</p>}
              <div className="detail-prices">
                {selectedStay.price_per_month && <div className="detail-price-item"><div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: '#fff' }}>${selectedStay.price_per_month.toLocaleString()}</div><div className="detail-price-period">/ month</div></div>}
                {selectedStay.price_per_week && <div className="detail-price-item"><div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: '#fff' }}>${selectedStay.price_per_week.toLocaleString()}</div><div className="detail-price-period">/ week</div></div>}
                {selectedStay.price_per_night && <div className="detail-price-item"><div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: '#fff' }}>${selectedStay.price_per_night.toLocaleString()}</div><div className="detail-price-period">/ night</div></div>}
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                {[['🛏', `${selectedStay.bedrooms} bed${selectedStay.bedrooms > 1 ? 's' : ''}`], ['🚿', `${selectedStay.bathrooms} bath${selectedStay.bathrooms > 1 ? 's' : ''}`], ['👤', `${selectedStay.max_guests} guests`], ...(selectedStay.wifi_speed ? [['📶', `${selectedStay.wifi_speed} Mbps`]] : [])].map(([icon, label]) => (
                  <span key={label as string} style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#555', letterSpacing: '0.08em' }}>{icon} {label}</span>
                ))}
              </div>
              {selectedStay.amenities?.length > 0 && <div className="detail-amenities-grid">{selectedStay.amenities.map(a => <span key={a} className="detail-amenity">{a}</span>)}</div>}
              {selectedStay.host && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderTop: '1px solid #1a1a1a', marginBottom: 16 }}>
                  {selectedStay.host.avatar_url ? <img src={selectedStay.host.avatar_url} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid #222' }} alt="" /> : <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#111', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: 12 }}>?</div>}
                  <div>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 8, color: '#333', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Hosted by</div>
                    <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>@{selectedStay.host.username}</div>
                  </div>
                </div>
              )}
              <button className="btn-contact">Message Host →</button>
            </div>
          </div>
        </div>
      )}

      <div className="stays-page">
        <div className="stays-header">
          <p className="stays-eyebrow">Monthly · Weekly · Nightly</p>
          <h1 className="stays-title">Find a place<br /><em>to stay.</em></h1>
        </div>

        <div className="stays-controls">
          <div className="filter-row">
            {TYPES.map(t => <button key={t} className={`filter-pill${activeType === t ? ' active' : ''}`} onClick={() => setActiveType(t)}>{t}</button>)}
            <button className={`filter-pill${nomadOnly ? ' nomad-active' : ''}`} onClick={() => setNomadOnly(!nomadOnly)}>◉ Nomad Friendly</button>
          </div>
          <div className="filter-row">
            <input className="search-input" placeholder="Search city or country..." value={search} onChange={e => setSearch(e.target.value)} />
            {userId && <button className="btn-list" onClick={() => setShowModal(true)}>+ List your stay</button>}
          </div>
          <div className="price-range">
            <span className="price-label">Max / mo</span>
            <input type="range" min={500} max={10000} step={100} value={maxPrice} onChange={e => setMaxPrice(parseInt(e.target.value))} className="price-slider" style={{ flex: 1 }} />
            <span className="price-val">${maxPrice.toLocaleString()}</span>
          </div>
        </div>

        <div className="section-divider">
          <span className="section-divider-label">Available now</span>
          <div className="section-divider-line" />
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#222', letterSpacing: '0.2em', whiteSpace: 'nowrap' }}>{filtered.length} stays</span>
        </div>

        {loading && <div className="loading-state"><div className="loading-dot" />loading stays...</div>}
        {!loading && filtered.length === 0 && <div className="empty-state"><div>no stays yet.</div>{userId && <button className="empty-cta" onClick={() => setShowModal(true)}>Be the first to list →</button>}</div>}
        {!loading && filtered.length > 0 && (
          <div className="stays-grid">
            {filtered.map(stay => (
              <div key={stay.id} className={`stay-card${stay.featured ? ' featured' : ''}`} onClick={() => setSelectedStay(stay)}>
                <div className="stay-image">
                  {stay.images?.[0] ? <img src={stay.images[0]} alt={stay.title} /> : <div className="stay-image-placeholder">{stay.type === 'villa' ? '🏖' : stay.type === 'coliving' ? '🏢' : stay.type === 'house' ? '🏡' : '🏠'}</div>}
                  <div className="stay-badge">{stay.type}</div>
                  {stay.featured && <div className="stay-featured-badge">Featured</div>}
                  {stay.is_nomad_friendly && <div className="stay-nomad-badge">◉ Nomad</div>}
                </div>
                <div className="stay-body">
                  <div className="stay-location">📍 {stay.city}, {stay.country}</div>
                  <div className="stay-title-text">{stay.title}</div>
                  <div className="stay-meta">
                    <span className="stay-meta-item">🛏 {stay.bedrooms}bd</span>
                    <span className="stay-meta-item">🚿 {stay.bathrooms}ba</span>
                    <span className="stay-meta-item">👤 {stay.max_guests}</span>
                    {stay.wifi_speed && <span className="stay-meta-item">📶 {stay.wifi_speed}Mbps</span>}
                  </div>
                  {stay.amenities?.length > 0 && <div className="stay-amenities">{stay.amenities.slice(0, 4).map(a => <span key={a} className="stay-amenity">{a}</span>)}{stay.amenities.length > 4 && <span className="stay-amenity">+{stay.amenities.length - 4}</span>}</div>}
                  <div className="stay-footer">
                    <div>
                      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, color: '#fff', lineHeight: 1 }}>${stay.price_per_month.toLocaleString()}</div>
                      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 8, color: '#444', letterSpacing: '0.15em', textTransform: 'uppercase' }}>/ month</div>
                    </div>
                    {stay.host && (
                      <div className="stay-host">
                        {stay.host.avatar_url ? <img className="stay-host-avatar" src={stay.host.avatar_url} alt="" /> : <div className="stay-host-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#444' }}>?</div>}
                        <span className="stay-host-name">@{stay.host.username}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
    </PageReveal>
  );
}
