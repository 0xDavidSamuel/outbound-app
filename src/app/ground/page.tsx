'use client';

import { useEffect, useState, useMemo } from 'react';
import { getSession } from '@/lib/session';
import PageReveal from '@/components/ui/PageReveal';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface Post {
  id: string; user_id: string; content: string; image_url?: string;
  city?: string; country?: string; type: string; likes: string[];
  created_at: string; author?: { username: string; avatar_url: string };
  comments?: Comment[];
}
interface Comment {
  id: string; post_id: string; user_id: string; content: string;
  created_at: string; author?: { username: string; avatar_url: string };
}
interface Community {
  slug: string; name: string; country: string; emoji: string;
  description: string; member_count: number;
}
interface CityScore {
  slug: string; name: string; image: string | null;
  scores: Record<string, number>; overall: number | null;
}

const POST_TYPES = [
  { key: 'plan',     label: '⚡ Plan',        color: '#f0ff6a', placeholder: "What's the plan? (e.g. Dinner at 8, Beach day tomorrow...)" },
  { key: 'moment',   label: '📸 Now',          color: '#e8553a', placeholder: 'Share what youre doing right now...' },
  { key: 'tip',      label: '💡 Intel',        color: '#47d4ff', placeholder: 'Drop some local intel or a hidden gem...' },
  { key: 'question', label: '🙋 Ask',          color: '#ff8c47', placeholder: 'Ask the people on the ground...' },
  { key: 'looking',  label: '🔍 Looking For',  color: '#c847ff', placeholder: 'Looking for a gym buddy, coworking spot, roommate...' },
  { key: 'warning',  label: '⚠️ Alert',       color: '#ff4747', placeholder: 'Safety update, scam warning, power outage...' },
  { key: 'recommend',label: '⭐ Spot',         color: '#47ff8c', placeholder: 'Recommend a place worth checking out...' },
];

const SCORE_LABELS: Record<string, string> = {
  'Outdoors & Adventure': 'Outdoors', 'Safety': 'Safety', 'Travel Connectivity': 'Transit',
  'Cost of Living': 'Cost', 'Internet Access': 'WiFi', 'Startup Culture': 'Startups',
  'Culture & Entertainment': 'Culture', 'Healthcare': 'Health',
};

// Intent-based statuses (replaces old vibes)
const STATUSES: Record<string, { label: string; icon: string }> = {
  'going_out':    { label: 'Going out tonight',   icon: '🌙' },
  'exploring':    { label: 'Exploring the city',   icon: '🗺' },
  'working':      { label: 'Working from café',    icon: '⚡' },
  'down_to_meet': { label: 'Down to meet up',      icon: '🤝' },
  'looking_food': { label: 'Looking for food',     icon: '🍜' },
  'just_landed':  { label: 'Just landed',          icon: '✈️' },
  'chilling':     { label: 'Taking it easy',       icon: '🌊' },
  'need_recs':    { label: 'Need recommendations', icon: '💡' },
};

const COUNTRY_EMOJIS: Record<string, string> = {
  'US':'🇺🇸','GB':'🇬🇧','JP':'🇯🇵','FR':'🇫🇷','DE':'🇩🇪','BR':'🇧🇷','MX':'🇲🇽','CA':'🇨🇦','AU':'🇦🇺','IN':'🇮🇳',
  'KR':'🇰🇷','ES':'🇪🇸','IT':'🇮🇹','PT':'🇵🇹','NL':'🇳🇱','SE':'🇸🇪','NO':'🇳🇴','SG':'🇸🇬','AE':'🇦🇪','AR':'🇦🇷',
  'CL':'🇨🇱','CO':'🇨🇴','PL':'🇵🇱','TR':'🇹🇷','TH':'🇹🇭','VN':'🇻🇳','ID':'🇮🇩','PH':'🇵🇭','ZA':'🇿🇦','NG':'🇳🇬',
  'EG':'🇪🇬','GH':'🇬🇭','KE':'🇰🇪','MA':'🇲🇦','NZ':'🇳🇿','CH':'🇨🇭','AT':'🇦🇹','BE':'🇧🇪','DK':'🇩🇰','GR':'🇬🇷',
  'HR':'🇭🇷','CZ':'🇨🇿','HU':'🇭🇺','RO':'🇷🇴','GE':'🇬🇪','TW':'🇹🇼','MY':'🇲🇾','NP':'🇳🇵','KH':'🇰🇭','EC':'🇪🇨',
  'CR':'🇨🇷','PA':'🇵🇦','PE':'🇵🇪','CN':'🇨🇳',
};

const TRAVELER_TYPES: Record<string, string> = {
  'nomad': 'Digital Nomad', 'expat': 'Expat', 'solo': 'Solo Traveler',
  'remote': 'Remote Worker', 'explorer': 'Adventure Seeker', 'slow': 'Slow Traveler',
};

const BADGE_LABELS: Record<string, { icon: string; label: string }> = {
  'founding_member': { icon: '⟐', label: 'Founding' },
  'first_stamp':     { icon: '⊙', label: '1st Stamp' },
  'globe_trotter':   { icon: '◉', label: 'Globe Trotter' },
  'nomad_certified': { icon: '◈', label: 'Nomad Certified' },
  'local_legend':    { icon: '⚑', label: 'Local Legend' },
  'early_bird':      { icon: '◎', label: 'Early Bird' },
};

function getEarnedBadgeIds(profile: any): string[] {
  const earned = ['founding_member', 'early_bird'];
  const c = profile?.countries_visited || [];
  if (c.length >= 1) earned.push('first_stamp');
  if (c.length >= 5) earned.push('globe_trotter');
  if (c.length >= 10) earned.push('nomad_certified');
  if (profile?.lat && profile?.lng) earned.push('local_legend');
  return earned;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff/60000), h = Math.floor(diff/3600000), d = Math.floor(diff/86400000);
  if (m < 1) return 'just now'; if (m < 60) return `${m}m`; if (h < 24) return `${h}h`; return `${d}d`;
}
function typeInfo(type: string) { return POST_TYPES.find(t => t.key === type) || POST_TYPES[0]; }
function scoreColor(s: number) { return s >= 7 ? '#e8553a' : s >= 5 ? '#888' : '#444'; }

async function rawGet(path: string, token: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } });
  return res.json();
}
async function rawPost(path: string, token: string, body: object) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { method: 'POST', headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(body) });
  return res.json();
}
async function rawPatch(path: string, token: string, body: object) {
  await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { method: 'PATCH', headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(body) });
}
async function rawDelete(path: string, token: string) {
  await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { method: 'DELETE', headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } });
}

// ── Post Card ──────────────────────────────────────────────────────────────
function PostCard({ post, userId, token, userProfile, onLike, onDelete, onOpenProfile }: {
  post: Post; userId: string; token: string; userProfile: any;
  onLike: (post: Post) => void; onDelete: (id: string) => void; onOpenProfile: (uid: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText]   = useState('');
  const [comments, setComments]         = useState<Comment[]>(post.comments || []);
  const liked = !!userId && post.likes.includes(userId);
  const t = typeInfo(post.type);
  const isOwn = userId === post.user_id;

  const submitComment = async () => {
    if (!commentText.trim() || !userId) return;
    const rows = await rawPost('comments', token, { post_id: post.id, user_id: userId, content: commentText.trim() });
    const nc = rows?.[0];
    if (nc) { nc.author = { username: userProfile?.username, avatar_url: userProfile?.avatar_url }; setComments(prev => [...prev, nc]); setCommentText(''); }
  };

  return (
    <div className="g-post">
      <div className="g-post-header">
        <div className="g-post-author" onClick={() => onOpenProfile(post.user_id)}>
          <div className="g-avatar-sm">{post.author?.avatar_url ? <img src={post.author.avatar_url} alt="" /> : '✈️'}</div>
          <div>
            <div className="g-post-username">@{post.author?.username || 'traveler'}</div>
            <div className="g-post-meta">
              {(post.city || post.country) && <span className="g-post-loc">📍 {[post.city, post.country].filter(Boolean).join(', ')}</span>}
              <span className="g-post-time">{timeAgo(post.created_at)}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="g-post-badge" style={{ background: `${t.color}15`, color: t.color, border: `1px solid ${t.color}30` }}>{t.label}</span>
          {isOwn && <button className="g-post-del" onClick={() => onDelete(post.id)}>×</button>}
        </div>
      </div>
      {post.content && <div className="g-post-body">{post.content}</div>}
      {post.image_url && <img className="g-post-img" src={post.image_url} alt="" />}
      <div className="g-post-actions">
        {post.type === 'plan' ? (
          <button className={`g-action g-join${liked ? ' joined' : ''}`} onClick={() => onLike(post)}>
            {liked ? '✓ Going' : '→ I\'m in'} {post.likes.length > 0 && <span className="g-join-count">{post.likes.length} going</span>}
          </button>
        ) : (
          <button className={`g-action${liked ? ' liked' : ''}`} onClick={() => onLike(post)}>{liked ? '♥' : '♡'} {post.likes.length > 0 && post.likes.length}</button>
        )}
        <button className="g-action" onClick={() => setShowComments(!showComments)}>💬 {comments.length > 0 && comments.length}</button>
      </div>
      {showComments && (
        <div className="g-comments">
          {comments.map(c => (
            <div key={c.id} className="g-comment">
              <div className="g-avatar-xs">{c.author?.avatar_url ? <img src={c.author.avatar_url} alt="" /> : '✈️'}</div>
              <div className="g-comment-bubble">
                <span className="g-comment-author">@{c.author?.username}</span>
                <span className="g-comment-text">{c.content}</span>
              </div>
            </div>
          ))}
          {userId && (
            <div className="g-comment-input-row">
              <input className="g-comment-input" placeholder="Add a comment..." value={commentText}
                onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitComment()} />
              <button className="g-comment-submit" onClick={submitComment}>→</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Compose Box ────────────────────────────────────────────────────────────
function ComposeBox({ userProfile, city, country, onPost }: {
  userProfile: any; city?: string; country?: string;
  onPost: (data: { content: string; image_url: string; type: string; city: string; country: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('plan');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [locationInput, setLocationInput] = useState(city ? `${city}${country ? ', ' + country : ''}` : userProfile?.city || '');
  const [resolvedCity, setResolvedCity] = useState(city || '');
  const [resolvedCountry, setResolvedCountry] = useState(country || '');
  const [resolvedDisplay, setResolvedDisplay] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  // When in a city room, location is locked
  const isLocked = !!(city && country);

  const geocodeLocation = async () => {
    if (!locationInput.trim() || isLocked) return;
    setGeoLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationInput)}&format=json&addressdetails=1&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data?.[0]) {
        const r = data[0];
        const c = r.address?.city || r.address?.town || r.address?.village || locationInput;
        const co = r.address?.country || '';
        setResolvedCity(c);
        setResolvedCountry(co);
        setResolvedDisplay(`${c}, ${co}`);
        setLocationInput(`${c}, ${co}`);
      }
    } catch {}
    setGeoLoading(false);
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    // If location wasn't geocoded yet and not locked, try now
    let finalCity = resolvedCity || city || '';
    let finalCountry = resolvedCountry || country || '';
    if (!isLocked && locationInput.trim() && !resolvedCity) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationInput)}&format=json&addressdetails=1&limit=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        if (data?.[0]) {
          finalCity = data[0].address?.city || data[0].address?.town || data[0].address?.village || locationInput;
          finalCountry = data[0].address?.country || '';
        }
      } catch {}
    }
    await onPost({ content: content.trim(), image_url: imageUrl.trim(), type, city: finalCity, country: finalCountry });
    setContent(''); setImageUrl(''); setOpen(false); setPosting(false);
  };

  if (!open) return (
    <div className="g-compose-trigger" onClick={() => setOpen(true)}>
      <div className="g-avatar-sm">{userProfile?.avatar_url ? <img src={userProfile.avatar_url} alt="" /> : '✈️'}</div>
      <span style={{ fontSize: 13, color: '#2a2a2a', fontWeight: 300 }}>{city ? `Share something about ${city}...` : "What's happening where you are?"}</span>
    </div>
  );

  return (
    <div className="g-compose-box">
      <div className="g-type-pills">
        {POST_TYPES.map(t => (
          <button key={t.key} className={`g-type-pill${type === t.key ? ' active' : ''}`}
            style={type === t.key ? { background: t.color, borderColor: t.color } : {}} onClick={() => setType(t.key)}>{t.label}</button>
        ))}
      </div>
      <textarea className="g-compose-text" placeholder={POST_TYPES.find(t => t.key === type)?.placeholder || ''} value={content} onChange={e => setContent(e.target.value)} autoFocus />
      <input className="g-compose-extra" placeholder="📷 Image URL (optional)" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <input
          className="g-compose-extra"
          placeholder="📍 Location (e.g. Lisbon, Portugal)"
          value={locationInput}
          onChange={e => { setLocationInput(e.target.value); setResolvedCity(''); setResolvedCountry(''); setResolvedDisplay(''); }}
          onBlur={geocodeLocation}
          disabled={isLocked}
          style={{ flex: 1, marginBottom: 0, opacity: isLocked ? 0.6 : 1 }}
        />
        {!isLocked && !resolvedDisplay && locationInput.trim() && (
          <button className="g-btn-ghost" onClick={geocodeLocation} disabled={geoLoading} style={{ padding: '8px 10px', fontSize: 8, whiteSpace: 'nowrap' }}>
            {geoLoading ? '...' : '✓ Verify'}
          </button>
        )}
      </div>
      {resolvedDisplay && !isLocked && (
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#e8553a', background: 'rgba(232,85,58,0.05)', border: '1px solid rgba(232,85,58,0.15)', borderRadius: 4, padding: '5px 10px', marginBottom: 12, letterSpacing: '0.1em' }}>
          📍 {resolvedDisplay}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button className="g-btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
        <button className="g-btn-primary" onClick={handlePost} disabled={!content.trim() || posting}>{posting ? 'Posting...' : 'Post →'}</button>
      </div>
    </div>
  );
}

// ── Profile Bubble — Mini Passport ──────────────────────────────────────────
function ProfileBubble({ profile, loading, onClose }: { profile: any; loading: boolean; onClose: () => void }) {
  if (!profile) return null;
  const stamps = profile.countries_visited || [];
  const badges = getEarnedBadgeIds(profile);
  const type = TRAVELER_TYPES[profile.traveler_type] || null;
  const status = profile.current_vibe && STATUSES[profile.current_vibe] ? STATUSES[profile.current_vibe] : null;

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed',inset:0,zIndex:9998,background:'rgba(0,0,0,0.6)' }} />
      <div style={{
        position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:9999,
        background:'#0d0d0d',border:'1px solid #1a1a1a',borderRadius:14,width:280,
        fontFamily:'DM Sans, sans-serif',boxShadow:'0 12px 48px rgba(0,0,0,0.9)',overflow:'hidden',
      }}>
        {/* Header bar */}
        <div style={{ background:'rgba(232,85,58,0.04)',borderBottom:'1px solid #1a1a1a',padding:'8px 14px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <span style={{ fontFamily:'DM Mono, monospace',fontSize:7,letterSpacing:'0.4em',color:'#e8553a',textTransform:'uppercase' }}>Outbound Passport</span>
          <button onClick={onClose} style={{ background:'none',border:'none',color:'#444',cursor:'pointer',fontSize:14,lineHeight:1,padding:0 }}>×</button>
        </div>

        {loading ? (
          <div style={{ color:'#444',fontFamily:'DM Mono, monospace',fontSize:10,textAlign:'center',padding:'32px 0' }}>Loading...</div>
        ) : (
          <div style={{ padding:'16px' }}>
            {/* Identity row */}
            <div style={{ display:'flex',gap:12,alignItems:'center',marginBottom:14 }}>
              <div style={{ width:48,height:48,borderRadius:'50%',border:'2px solid #1a1a1a',background:'#111',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0 }}>
                {profile.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} /> : '✈️'}
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:14,fontWeight:500,color:'#fff',marginBottom:2 }}>@{profile.username || 'traveler'}</div>
                {profile.city && <div style={{ fontFamily:'DM Mono, monospace',fontSize:8,letterSpacing:'0.15em',color:'#e8553a',textTransform:'uppercase' }}>📍 {profile.city}</div>}
                {type && <div style={{ fontFamily:'DM Mono, monospace',fontSize:8,letterSpacing:'0.1em',color:'#444',marginTop:2 }}>{type}</div>}
              </div>
            </div>

            {/* Status */}
            {status && (
              <div style={{ background:'rgba(232,85,58,0.05)',border:'1px solid rgba(232,85,58,0.12)',borderRadius:6,padding:'6px 10px',marginBottom:12,fontFamily:'DM Mono, monospace',fontSize:10,color:'#ccc',display:'flex',alignItems:'center',gap:6 }}>
                <span>{status.icon}</span> {status.label}
              </div>
            )}

            {/* Bio */}
            {profile.bio && (
              <div style={{ fontSize:11,color:'#555',lineHeight:1.5,fontWeight:300,marginBottom:12,fontStyle:'italic' }}>"{profile.bio}"</div>
            )}

            {/* Stamps */}
            {stamps.length > 0 && (
              <div style={{ marginBottom:12 }}>
                <div style={{ fontFamily:'DM Mono, monospace',fontSize:7,letterSpacing:'0.3em',color:'#333',textTransform:'uppercase',marginBottom:6 }}>
                  Stamps · {stamps.length} {stamps.length === 1 ? 'country' : 'countries'}
                </div>
                <div style={{ display:'flex',flexWrap:'wrap',gap:4 }}>
                  {stamps.slice(0, 12).map((code: string) => (
                    <span key={code} style={{ fontSize:18,lineHeight:1 }} title={code}>{COUNTRY_EMOJIS[code] || '🏳'}</span>
                  ))}
                  {stamps.length > 12 && <span style={{ fontFamily:'DM Mono, monospace',fontSize:9,color:'#444',alignSelf:'center' }}>+{stamps.length - 12}</span>}
                </div>
              </div>
            )}

            {/* Badges */}
            {badges.length > 0 && (
              <div style={{ marginBottom:8 }}>
                <div style={{ fontFamily:'DM Mono, monospace',fontSize:7,letterSpacing:'0.3em',color:'#333',textTransform:'uppercase',marginBottom:6 }}>
                  Distinctions · {badges.length}
                </div>
                <div style={{ display:'flex',flexWrap:'wrap',gap:4 }}>
                  {badges.map(id => {
                    const b = BADGE_LABELS[id];
                    if (!b) return null;
                    return (
                      <span key={id} style={{
                        fontFamily:'DM Mono, monospace',fontSize:8,letterSpacing:'0.08em',
                        padding:'3px 7px',borderRadius:3,
                        background:'rgba(232,85,58,0.06)',border:'1px solid rgba(232,85,58,0.15)',color:'#e8553a',
                      }}>{b.icon} {b.label}</span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer stats */}
            <div style={{ borderTop:'1px solid #141414',paddingTop:10,marginTop:4,display:'flex',justifyContent:'space-between' }}>
              <span style={{ fontFamily:'DM Mono, monospace',fontSize:8,color:'#222',letterSpacing:'0.1em' }}>
                {stamps.length} stamps · {badges.length} badges
              </span>
              <span style={{ fontFamily:'DM Mono, monospace',fontSize:8,color:'#222',letterSpacing:'0.1em' }}>
                {profile.created_at ? `Since ${new Date(profile.created_at).toLocaleDateString('en-US', { month:'short', year:'numeric' })}` : ''}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function GroundPage() {
  const [userId, setUserId] = useState('');
  const [token, setToken] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [cityScores, setCityScores] = useState<CityScore[]>([]);
  const [joined, setJoined] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'home' | { country: Community } | { city: string; country: string }>('home');
  const [filter, setFilter] = useState('All');
  const [profileBubble, setProfileBubble] = useState<any>(null);
  const [bubbleLoading, setBubbleLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      let tok = SUPABASE_KEY;
      if (session) {
        setUserId(session.user.id); setToken(session.access_token); tok = session.access_token;
        const profiles = await rawGet(`profiles?id=eq.${session.user.id}&select=*`, tok);
        if (profiles?.[0]) setUserProfile(profiles[0]);
        const memberships = await rawGet(`community_members?user_id=eq.${session.user.id}&select=community_slug`, tok);
        setJoined((Array.isArray(memberships) ? memberships : []).map((m: any) => m.community_slug));
      }
      const [postsData, commData] = await Promise.all([
        rawGet('posts?select=*,author:profiles(username,avatar_url),comments(id,post_id,user_id,content,created_at,author:profiles(username,avatar_url))&order=created_at.desc&limit=80', tok),
        rawGet('communities?select=*&order=member_count.desc', tok),
      ]);
      setPosts(Array.isArray(postsData) ? postsData : []);
      setCommunities(Array.isArray(commData) ? commData : []);
      try { const res = await fetch('/api/cities'); const data = await res.json(); setCityScores(data.cities || []); } catch {}
      setLoading(false);
    })();
  }, []);

  const handlePost = async (data: { content: string; image_url: string; type: string; city: string; country: string }) => {
    if (!userId || !token) return;
    const rows = await rawPost('posts', token, { user_id: userId, content: data.content, image_url: data.image_url || null, city: data.city || null, country: data.country || null, type: data.type, likes: [] });
    const np = rows?.[0];
    if (np) { np.author = { username: userProfile?.username, avatar_url: userProfile?.avatar_url }; np.comments = []; setPosts(prev => [np, ...prev]); }
  };

  const handleLike = async (post: Post) => {
    if (!userId || !token) return;
    const liked = post.likes.includes(userId);
    const newLikes = liked ? post.likes.filter(id => id !== userId) : [...post.likes, userId];
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: newLikes } : p));
    await rawPatch(`posts?id=eq.${post.id}`, token, { likes: newLikes });
  };

  const handleDelete = async (id: string) => {
    await rawDelete(`posts?id=eq.${id}`, token);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const openProfile = async (uid: string) => {
    setBubbleLoading(true); setProfileBubble({ loading: true });
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${uid}&select=username,avatar_url,city,current_vibe,traveler_type,countries_visited,bio,created_at`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } });
      const rows = await res.json(); setProfileBubble(rows?.[0] || null);
    } catch { setProfileBubble(null); }
    setBubbleLoading(false);
  };

  const filterMap: Record<string, string> = { Plans: 'plan', Now: 'moment', Intel: 'tip', Questions: 'question', 'Looking For': 'looking' };
  const globalPosts = useMemo(() => { let list = posts; if (filter !== 'All') list = list.filter(p => p.type === filterMap[filter]); return list.slice(0, 40); }, [posts, filter]);
  const cityPosts = useMemo(() => { if (typeof view !== 'object' || !('city' in view)) return []; return posts.filter(p => p.city?.toLowerCase() === (view as any).city.toLowerCase()).slice(0, 40); }, [posts, view]);
  const countryPosts = useMemo(() => { if (typeof view !== 'object' || !('country' in view) || 'city' in view) return []; const name = (view as { country: Community }).country.name; return posts.filter(p => p.country?.toLowerCase() === name.toLowerCase()).slice(0, 40); }, [posts, view]);
  const citiesInCountry = useMemo(() => { if (typeof view !== 'object' || !('country' in view) || 'city' in view) return []; const name = (view as { country: Community }).country.name; const fromPosts = new Set(posts.filter(p => p.country?.toLowerCase() === name.toLowerCase()).map(p => p.city).filter(Boolean)); return [...fromPosts].sort() as string[]; }, [view, posts]);
  const currentCityScore = useMemo(() => { if (typeof view !== 'object' || !('city' in view)) return null; return cityScores.find(c => c.name.toLowerCase().includes((view as any).city.toLowerCase())) || null; }, [view, cityScores]);

  const renderPostList = (postList: Post[], emptyMsg: string) => (
    postList.length === 0 ? <div className="g-empty">{emptyMsg}</div> : (
      <div className="g-posts">{postList.map(post => <PostCard key={post.id} post={post} userId={userId} token={token} userProfile={userProfile} onLike={handleLike} onDelete={handleDelete} onOpenProfile={openProfile} />)}</div>
    )
  );

  return (
    <>
    <PageReveal>
      <>
        <style suppressHydrationWarning>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #080808; color: #fff; font-family: 'DM Sans', sans-serif; }
          .g-page { min-height: 100vh; padding: 72px 24px 140px; max-width: 720px; margin: 0 auto; }
          .g-eyebrow { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.5em; color: #333; text-transform: uppercase; margin-bottom: 12px; }
          .g-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(48px, 7vw, 80px); line-height: 0.9; color: #fff; margin-bottom: 20px; }
          .g-title em { color: #e8553a; font-style: normal; }
          .g-back { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.2em; color: #444; background: none; border: none; cursor: pointer; text-transform: uppercase; margin-bottom: 20px; padding: 0; }
          .g-back:hover { color: #888; }
          .g-cities-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; margin-bottom: 32px; }
          .g-city-browse { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 14px; overflow: hidden; cursor: pointer; transition: border-color 0.2s, transform 0.15s; display: flex; flex-direction: column; }
          .g-city-browse:hover { border-color: #2a2a2a; transform: translateY(-2px); }
          .g-city-browse-img { position: relative; height: 130px; overflow: hidden; background: #111; }
          .g-city-browse-img img { width: 100%; height: 100%; object-fit: cover; }
          .g-city-browse-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: 48px; color: rgba(232,85,58,0.06); letter-spacing: 0.1em; background: linear-gradient(135deg, #0e0e0e, #111); }
          .g-city-browse-rank { position: absolute; top: 8px; left: 8px; width: 22px; height: 22px; background: rgba(8,8,8,0.8); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-family: 'DM Mono', monospace; font-size: 9px; color: #888; }
          .g-city-browse-score { position: absolute; bottom: 8px; left: 8px; background: rgba(8,8,8,0.85); border-radius: 6px; padding: 3px 7px; font-family: 'DM Mono', monospace; font-size: 10px; color: #e8553a; }
          .g-city-browse-body { padding: 12px 14px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
          .g-city-browse-name { font-size: 14px; font-weight: 500; color: #fff; }
          .g-city-browse-scores { display: flex; flex-direction: column; gap: 4px; }
          .g-city-browse-score-row { display: flex; align-items: center; }
          .g-city-browse-score-label { font-family: 'DM Mono', monospace; font-size: 8px; color: #333; letter-spacing: 0.1em; text-transform: uppercase; width: 42px; flex-shrink: 0; }
          .g-city-browse-bar { flex: 1; height: 2px; background: #111; margin: 0 8px; border-radius: 2px; overflow: hidden; }
          .g-city-browse-fill { height: 100%; border-radius: 2px; }
          .g-city-browse-score-val { font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500; width: 28px; text-align: right; flex-shrink: 0; }
          .g-filters { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; }
          .g-filter { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; padding: 5px 12px; border-radius: 20px; border: 1px solid #1a1a1a; color: #444; cursor: pointer; background: transparent; transition: all 0.2s; }
          .g-filter:hover { color: #888; border-color: #333; }
          .g-filter.active { background: #e8553a; color: #080808; border-color: #e8553a; }
          .g-section { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.4em; color: #222; text-transform: uppercase; margin-bottom: 14px; display: flex; align-items: center; gap: 14px; }
          .g-section-line { flex: 1; height: 1px; background: #111; }
          .g-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin-bottom: 32px; }
          .g-country-card { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 12px; padding: 16px; cursor: pointer; transition: border-color 0.2s, transform 0.15s; display: flex; flex-direction: column; gap: 6px; }
          .g-country-card:hover { border-color: #2a2a2a; transform: translateY(-2px); }
          .g-country-card.joined { border-color: rgba(232,85,58,0.15); }
          .g-country-flag { font-size: 28px; line-height: 1; }
          .g-country-name { font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: #fff; line-height: 1; }
          .g-country-meta { font-family: 'DM Mono', monospace; font-size: 9px; color: #2a2a2a; letter-spacing: 0.1em; }
          .g-country-arrow { font-family: 'DM Mono', monospace; font-size: 9px; color: #2a2a2a; transition: color 0.2s; }
          .g-country-card:hover .g-country-arrow { color: #e8553a; }
          .g-city-card { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 10px; padding: 14px 16px; cursor: pointer; transition: border-color 0.2s; display: flex; align-items: center; justify-content: space-between; }
          .g-city-card:hover { border-color: #2a2a2a; }
          .g-city-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
          .g-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; margin-bottom: 24px; }
          .g-stat { background: #111; border: 1px solid #1a1a1a; border-radius: 8px; padding: 12px; }
          .g-stat-label { font-family: 'DM Mono', monospace; font-size: 8px; color: #333; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 4px; }
          .g-stat-value { font-family: 'DM Mono', monospace; font-size: 16px; font-weight: 500; }
          .g-posts { display: flex; flex-direction: column; gap: 14px; }
          .g-post { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 14px; overflow: hidden; transition: border-color 0.2s; }
          .g-post:hover { border-color: #1e1e1e; }
          .g-post-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 14px 16px 0; gap: 12px; }
          .g-post-author { display: flex; align-items: center; gap: 10px; cursor: pointer; }
          .g-avatar-sm { width: 36px; height: 36px; border-radius: 50%; border: 1px solid #222; background: #111; overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #444; }
          .g-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
          .g-avatar-xs { width: 26px; height: 26px; border-radius: 50%; border: 1px solid #1a1a1a; background: #111; overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #444; }
          .g-avatar-xs img { width: 100%; height: 100%; object-fit: cover; }
          .g-post-username { font-size: 13px; font-weight: 500; color: #fff; }
          .g-post-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 2px; }
          .g-post-loc { font-family: 'DM Mono', monospace; font-size: 9px; color: #e8553a; letter-spacing: 0.1em; }
          .g-post-time { font-family: 'DM Mono', monospace; font-size: 9px; color: #2a2a2a; }
          .g-post-badge { font-family: 'DM Mono', monospace; font-size: 8px; padding: 2px 7px; border-radius: 4px; letter-spacing: 0.1em; }
          .g-post-del { background: none; border: none; color: #333; cursor: pointer; font-size: 16px; padding: 0 4px; transition: color 0.2s; }
          .g-post-del:hover { color: #ff6b6b; }
          .g-post-body { padding: 12px 16px; font-size: 14px; color: #aaa; line-height: 1.7; font-weight: 300; white-space: pre-wrap; }
          .g-post-img { width: 100%; max-height: 420px; object-fit: cover; display: block; }
          .g-post-actions { display: flex; align-items: center; gap: 4px; padding: 10px 16px 12px; border-top: 1px solid #111; }
          .g-action { display: flex; align-items: center; gap: 5px; background: none; border: none; cursor: pointer; padding: 6px 10px; border-radius: 6px; font-family: 'DM Mono', monospace; font-size: 10px; color: #333; transition: all 0.15s; }
          .g-action:hover { background: rgba(255,255,255,0.03); color: #666; }
          .g-action.liked { color: #e8553a; }
          .g-join { color: #f0ff6a; font-weight: 500; }
          .g-join.joined { color: #e8553a; }
          .g-join-count { font-size: 9px; color: #555; font-weight: 400; margin-left: 4px; }
          .g-activity-bar { display: flex; align-items: center; gap: 8px; background: rgba(232,85,58,0.04); border: 1px solid rgba(232,85,58,0.1); border-radius: 10px; padding: 10px 14px; margin-bottom: 20px; font-family: 'DM Mono', monospace; font-size: 10px; color: #888; letter-spacing: 0.08em; }
          .g-activity-dot { width: 6px; height: 6px; border-radius: 50%; background: #e8553a; animation: pulse 1.5s ease-in-out infinite; flex-shrink: 0; }
          .g-activity-plans { margin-left: auto; color: #f0ff6a; }
          .g-comments { border-top: 1px solid #111; padding: 12px 16px; }
          .g-comment { display: flex; gap: 8px; margin-bottom: 10px; }
          .g-comment-bubble { background: #111; border-radius: 8px; padding: 8px 12px; flex: 1; }
          .g-comment-author { font-size: 11px; font-weight: 500; color: #888; margin-right: 6px; }
          .g-comment-text { font-size: 12px; color: #666; line-height: 1.5; font-weight: 300; }
          .g-comment-input-row { display: flex; gap: 8px; align-items: center; margin-top: 8px; }
          .g-comment-input { flex: 1; background: #111; border: 1px solid #1a1a1a; border-radius: 8px; padding: 8px 12px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 12px; outline: none; }
          .g-comment-input::placeholder { color: #333; }
          .g-comment-submit { background: rgba(232,85,58,0.1); border: 1px solid rgba(232,85,58,0.2); color: #e8553a; border-radius: 6px; padding: 7px 12px; font-family: 'DM Mono', monospace; font-size: 11px; cursor: pointer; }
          .g-compose-trigger { display: flex; align-items: center; gap: 12px; background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 14px; padding: 14px 16px; cursor: pointer; margin-bottom: 20px; transition: border-color 0.2s; }
          .g-compose-trigger:hover { border-color: #2a2a2a; }
          .g-compose-box { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 14px; padding: 16px; margin-bottom: 20px; }
          .g-type-pills { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
          .g-type-pill { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.1em; padding: 5px 12px; border-radius: 20px; border: 1px solid #1a1a1a; color: #444; cursor: pointer; background: transparent; transition: all 0.15s; }
          .g-type-pill.active { color: #080808; border-color: transparent; }
          .g-compose-text { width: 100%; background: transparent; border: none; outline: none; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 300; line-height: 1.6; resize: none; min-height: 80px; margin-bottom: 12px; }
          .g-compose-text::placeholder { color: #2a2a2a; }
          .g-compose-extra { width: 100%; background: #111; border: 1px solid #1a1a1a; border-radius: 8px; padding: 8px 12px; color: #fff; font-family: 'DM Mono', monospace; font-size: 10px; outline: none; margin-bottom: 8px; }
          .g-compose-extra::placeholder { color: #333; }
          .g-btn-primary { background: #e8553a; color: #080808; border: none; border-radius: 8px; padding: 8px 20px; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; font-weight: 500; transition: opacity 0.2s; }
          .g-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
          .g-btn-ghost { background: none; border: 1px solid #1a1a1a; color: #444; border-radius: 8px; padding: 8px 16px; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; }
          .g-empty { text-align: center; padding: 60px 0; font-family: 'DM Mono', monospace; font-size: 11px; color: #1e1e1e; letter-spacing: 0.2em; line-height: 2; }
          .g-loading { display: flex; flex-direction: column; align-items: center; padding: 60px 0; gap: 16px; font-family: 'DM Mono', monospace; font-size: 11px; color: #333; letter-spacing: 0.2em; }
          .g-dot { width: 6px; height: 6px; border-radius: 50%; background: #e8553a; animation: pulse 1.2s ease-in-out infinite; }
          @keyframes pulse { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }
          @media (max-width: 600px) { .g-page { padding: 64px 16px 140px; } .g-grid { grid-template-columns: 1fr 1fr; } .g-cities-grid { grid-template-columns: 1fr 1fr; } .g-stats { grid-template-columns: 1fr 1fr; } }
        `}</style>

        <div className="g-page">

          {view === 'home' && <>
            <p className="g-eyebrow">Real-time · Local · Global</p>
            <h1 className="g-title">On the<br /><em>ground.</em></h1>

            {/* Live activity pulse */}
            <div className="g-activity-bar">
              <div className="g-activity-dot" />
              <span>{posts.length > 0 ? `${new Set(posts.slice(0, 20).map(p => p.user_id)).size}+ people active` : 'Be the first on the ground'}</span>
              {posts.length > 0 && <span className="g-activity-plans">{posts.filter(p => p.type === 'plan').length} plans live</span>}
            </div>

            {userId && <ComposeBox userProfile={userProfile} onPost={handlePost} />}
            <div className="g-filters">
              {['All', 'Plans', 'Now', 'Intel', 'Questions', 'Looking For'].map(f => (
                <button key={f} className={`g-filter${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
            <div className="g-section">What's happening<div className="g-section-line" /></div>
            {loading ? <div className="g-loading"><div className="g-dot" />loading...</div> : renderPostList(globalPosts, 'no posts yet. be the first to share.')}

            <div className="g-section" style={{ marginTop: 32 }}>Destination rooms<div className="g-section-line" /><span style={{ whiteSpace: 'nowrap' }}>{cityScores.length} cities</span></div>
            <div className="g-cities-grid">
              {cityScores.slice(0, 30).map((city, i) => (
                <div key={city.slug} className="g-city-browse" onClick={() => {
                  const name = city.name;
                  const parts = name.split(',');
                  const cityName = parts[0]?.trim() || name;
                  const countryName = parts[1]?.trim() || '';
                  setView({ city: cityName, country: countryName });
                }}>
                  <div className="g-city-browse-img">
                    {city.image ? <img src={city.image} alt={city.name} /> : <div className="g-city-browse-placeholder">{city.name.slice(0,2).toUpperCase()}</div>}
                    <div className="g-city-browse-rank">{i + 1}</div>
                    {city.overall && <div className="g-city-browse-score">★ {(city.overall / 10).toFixed(1)}</div>}
                  </div>
                  <div className="g-city-browse-body">
                    <div className="g-city-browse-name">{city.name} Room</div>
                    <div className="g-city-browse-scores">
                      {['Outdoors & Adventure', 'Safety', 'Travel Connectivity', 'Cost of Living', 'Internet Access'].filter(key => city.scores[key]).slice(0, 3).map(key => {
                        const val = city.scores[key];
                        return (
                          <div key={key} className="g-city-browse-score-row">
                            <span className="g-city-browse-score-label">{SCORE_LABELS[key] || key}</span>
                            <div className="g-city-browse-bar"><div className="g-city-browse-fill" style={{ width: `${val * 10}%`, background: scoreColor(val) }} /></div>
                            <span className="g-city-browse-score-val" style={{ color: scoreColor(val) }}>{val.toFixed(1)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {typeof view === 'object' && 'country' in view && !('city' in view) && (() => {
            const community = (view as { country: Community }).country;
            return <>
              <button className="g-back" onClick={() => setView('home')}>← Ground</button>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 52 }}>{community.emoji}</div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h1 className="g-title" style={{ marginBottom: 8 }}>{community.name}</h1>
                  <p style={{ fontSize: 13, color: '#444', lineHeight: 1.6, fontWeight: 300, marginBottom: 10 }}>{community.description}</p>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{community.member_count} members</div>
                </div>
              </div>
              {citiesInCountry.length > 0 && <>
                <div className="g-section">City rooms<div className="g-section-line" /></div>
                <div className="g-city-list">
                  {citiesInCountry.map(city => (
                    <div key={city} className="g-city-card" onClick={() => setView({ city, country: community.name })}>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: '#ccc' }}>📍 {city}</span>
                      <span className="g-country-arrow">→</span>
                    </div>
                  ))}
                </div>
              </>}
              {userId && <ComposeBox userProfile={userProfile} country={community.name} onPost={handlePost} />}
              <div className="g-section">What's happening<div className="g-section-line" /></div>
              {renderPostList(countryPosts, `no posts from ${community.name} yet. be the first.`)}
            </>;
          })()}

          {typeof view === 'object' && 'city' in view && (() => {
            const { city, country } = view as { city: string; country: string };
            return <>
              <button className="g-back" onClick={() => { const comm = communities.find(c => c.name === country); if (comm) setView({ country: comm }); else setView('home'); }}>← {country}</button>
              <h1 className="g-title" style={{ marginBottom: 8 }}>{city}<em>.</em></h1>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#e8553a', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 24 }}>📍 {city}, {country}</p>
              {currentCityScore && <>
                <div className="g-section">City Stats<div className="g-section-line" /></div>
                <div className="g-stats">
                  {currentCityScore.overall && <div className="g-stat"><div className="g-stat-label">Overall</div><div className="g-stat-value" style={{ color: '#e8553a' }}>★ {(currentCityScore.overall / 10).toFixed(1)}</div></div>}
                  {['Outdoors & Adventure', 'Safety', 'Travel Connectivity', 'Cost of Living', 'Internet Access', 'Healthcare', 'Startup Culture'].filter(k => currentCityScore.scores[k]).map(key => (
                    <div key={key} className="g-stat"><div className="g-stat-label">{SCORE_LABELS[key] || key}</div><div className="g-stat-value" style={{ color: scoreColor(currentCityScore.scores[key]) }}>{currentCityScore.scores[key].toFixed(1)}</div></div>
                  ))}
                </div>
              </>}
              {userId && <ComposeBox userProfile={userProfile} city={city} country={country} onPost={handlePost} />}
              <div className="g-section">What's happening<div className="g-section-line" /></div>
              {renderPostList(cityPosts, `no posts from ${city} yet. be the first to share.`)}
            </>;
          })()}

        </div>
      </>
    </PageReveal>
    <ProfileBubble profile={profileBubble} loading={bubbleLoading} onClose={() => setProfileBubble(null)} />
    </>
  );
}
