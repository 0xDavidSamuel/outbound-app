'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/session';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface Community { slug: string; name: string; country: string; emoji: string; description: string; member_count: number; }
interface Member { user_id: string; is_here_now: boolean; profile: { username: string; avatar_url: string }; }
interface CommunityPost { id: string; user_id: string; community_slug: string; content: string; image_url?: string; type: string; likes: string[]; is_pinned: boolean; created_at: string; author?: { username: string; avatar_url: string }; }

const POST_TYPES = [
  { key: 'tip', label: '💡 Tip', color: '#47d4ff' },
  { key: 'question', label: '🙋 Question', color: '#ff8c47' },
  { key: 'moment', label: '📸 Moment', color: '#e8553a' },
  { key: 'warning', label: '⚠️ Heads Up', color: '#ff4747' },
  { key: 'recommend', label: '⭐ Recommend', color: '#47ff8c' },
];

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000), hrs = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now'; if (mins < 60) return `${mins}m`; if (hrs < 24) return `${hrs}h`; return `${days}d`;
}

function typeInfo(type: string) { return POST_TYPES.find(t => t.key === type) || POST_TYPES[0]; }

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

// ── Room view ──────────────────────────────────────────────────────────────
function CommunityRoom({ community, userId, token, userProfile, onBack }: { community: Community; userId: string; token: string; userProfile: any; onBack: () => void }) {
  const [posts, setPosts]         = useState<CommunityPost[]>([]);
  const [members, setMembers]     = useState<Member[]>([]);
  const [isMember, setIsMember]   = useState(false);
  const [isHereNow, setIsHereNow] = useState(false);
  const [composing, setComposing] = useState(false);
  const [postType, setPostType]   = useState('tip');
  const [content, setContent]     = useState('');
  const [imageUrl, setImageUrl]   = useState('');
  const [posting, setPosting]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [profileBubble, setProfileBubble] = useState<any>(null);
  const [bubbleLoading, setBubbleLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [postsData, membersData] = await Promise.all([
        rawGet(`community_posts?community_slug=eq.${community.slug}&select=*,author:profiles(username,avatar_url)&order=is_pinned.desc,created_at.desc&limit=40`, token),
        rawGet(`community_members?community_slug=eq.${community.slug}&select=user_id,is_here_now,profile:profiles(username,avatar_url)&limit=50`, token),
      ]);
      setPosts(Array.isArray(postsData) ? postsData : []);
      const mems = (Array.isArray(membersData) ? membersData : []).map((m: any) => ({ ...m, profile: Array.isArray(m.profile) ? m.profile[0] : m.profile }));
      setMembers(mems);
      if (userId) {
        const me = mems.find((m: any) => m.user_id === userId);
        setIsMember(!!me); setIsHereNow(me?.is_here_now || false);
      }
      setLoading(false);
    })();
  }, [community.slug]);

  const toggleJoin = async () => {
    if (!userId) return;
    if (isMember) {
      await rawDelete(`community_members?community_slug=eq.${community.slug}&user_id=eq.${userId}`, token);
      setIsMember(false); setMembers(prev => prev.filter(m => m.user_id !== userId));
    } else {
      await rawPost('community_members', token, { community_slug: community.slug, user_id: userId, is_here_now: false });
      setIsMember(true); setMembers(prev => [...prev, { user_id: userId, is_here_now: false, profile: { username: userProfile?.username, avatar_url: userProfile?.avatar_url } }]);
    }
  };

  const toggleHereNow = async () => {
    if (!userId || !isMember) return;
    const newVal = !isHereNow;
    await rawPatch(`community_members?community_slug=eq.${community.slug}&user_id=eq.${userId}`, token, { is_here_now: newVal });
    setIsHereNow(newVal); setMembers(prev => prev.map(m => m.user_id === userId ? { ...m, is_here_now: newVal } : m));
  };

  const submitPost = async () => {
    if (!content.trim() || !userId) return;
    setPosting(true);
    const rows = await rawPost('community_posts', token, { community_slug: community.slug, user_id: userId, content: content.trim(), image_url: imageUrl.trim() || null, type: postType, likes: [], is_pinned: false });
    const newPost = rows?.[0];
    if (newPost) {
      newPost.author = { username: userProfile?.username, avatar_url: userProfile?.avatar_url };
      setPosts(prev => [newPost, ...prev]); setContent(''); setImageUrl(''); setComposing(false);
    }
    setPosting(false);
  };

  const toggleLike = async (post: CommunityPost) => {
    if (!userId) return;
    const liked = post.likes.includes(userId);
    const newLikes = liked ? post.likes.filter(id => id !== userId) : [...post.likes, userId];
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: newLikes } : p));
    await rawPatch(`community_posts?id=eq.${post.id}`, token, { likes: newLikes });
  };

  const hereNow = members.filter(m => m.is_here_now);
  const allMembers = members.filter(m => !m.is_here_now);

  const openProfile = async (uid: string) => {
    setBubbleLoading(true);
    setProfileBubble({ loading: true });
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${uid}&select=username,avatar_url,city`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } }
      );
      const rows = await res.json();
      setProfileBubble(rows?.[0] || { username: null, avatar_url: null, city: null });
    } catch (err) { console.error('[openProfile]', err); setProfileBubble(null); }
    setBubbleLoading(false);
  };

  return (
    <>
    <div style={{ minHeight: '100vh', padding: '72px 24px 140px', maxWidth: 680, margin: '0 auto' }}>
      <button onClick={onBack} style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.2em', color: '#444', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', marginBottom: 20, padding: 0 }}>← All communities</button>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{community.emoji}</div>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(42px, 7vw, 64px)', lineHeight: 0.9, color: '#fff', marginBottom: 10 }}>{community.name}</h1>
          <p style={{ fontSize: 13, color: '#444', lineHeight: 1.6, fontWeight: 300, maxWidth: 400 }}>{community.description}</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{members.length} members</span>
            {hereNow.length > 0 && <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#e8553a', letterSpacing: '0.2em', textTransform: 'uppercase' }}>● {hereNow.length} here now</span>}
          </div>
        </div>
        {userId && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={toggleJoin} style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 500, background: isMember ? 'transparent' : '#e8553a', color: isMember ? '#444' : '#080808', border: isMember ? '1px solid #222' : '1px solid #e8553a' }}>
              {isMember ? 'Joined ✓' : '+ Join'}
            </button>
            {isMember && (
              <button onClick={toggleHereNow} style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', background: isHereNow ? 'rgba(232,85,58,0.1)' : 'transparent', color: isHereNow ? '#e8553a' : '#333', border: isHereNow ? '1px solid rgba(232,85,58,0.3)' : '1px solid #1a1a1a' }}>
                {isHereNow ? '● Here now' : "○ I'm here"}
              </button>
            )}
          </div>
        )}
      </div>

      {hereNow.length > 0 && (
        <div style={{ background: 'rgba(232,85,58,0.04)', border: '1px solid rgba(232,85,58,0.1)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.3em', color: '#e8553a', textTransform: 'uppercase', marginBottom: 10 }}>● Currently in {community.name}</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {hereNow.map(m => (
              <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid rgba(232,85,58,0.4)', overflow: 'hidden', background: '#111', flexShrink: 0 }}>
                  {m.profile?.avatar_url ? <img src={m.profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#444' }}>✈</div>}
                </div>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#888' }}>@{m.profile?.username}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {allMembers.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.3em', color: '#222', textTransform: 'uppercase', marginBottom: 10 }}>Members</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {allMembers.slice(0, 20).map(m => (
              <div key={m.user_id} title={`@${m.profile?.username}`} onClick={() => openProfile(m.user_id)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #1a1a1a', overflow: 'hidden', background: '#111', flexShrink: 0, cursor: 'pointer' }}>
                {m.profile?.avatar_url ? <img src={m.profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#333' }}>✈</div>}
              </div>
            ))}
            {allMembers.length > 20 && <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #1a1a1a', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#444' }}>+{allMembers.length - 20}</div>}
          </div>
        </div>
      )}

      <div style={{ height: 1, background: '#111', marginBottom: 20 }} />

      {userId && !composing && (
        <div onClick={() => setComposing(true)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 12, padding: '12px 16px', cursor: 'pointer', marginBottom: 20 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #222', background: '#111', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#444' }}>
            {userProfile?.avatar_url ? <img src={userProfile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : '✈'}
          </div>
          <span style={{ fontSize: 13, color: '#2a2a2a', fontWeight: 300 }}>Share a tip, photo, or question about {community.name}...</span>
        </div>
      )}

      {userId && composing && (
        <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 14, padding: 18, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {POST_TYPES.map(t => (
              <button key={t.key} onClick={() => setPostType(t.key)} style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.1em', padding: '5px 12px', borderRadius: 20, background: postType === t.key ? t.color : 'transparent', color: postType === t.key ? '#080808' : '#444', border: `1px solid ${postType === t.key ? t.color : '#1a1a1a'}`, cursor: 'pointer' }}>{t.label}</button>
            ))}
          </div>
          <textarea autoFocus placeholder={`What do you know about ${community.name}?`} value={content} onChange={e => setContent(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 300, lineHeight: 1.6, resize: 'none', minHeight: 80, marginBottom: 10 }} />
          <input placeholder="📷 Image URL (optional)" value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={{ width: '100%', background: '#111', border: '1px solid #1a1a1a', borderRadius: 8, padding: '8px 12px', color: '#fff', fontFamily: 'DM Mono, monospace', fontSize: 10, outline: 'none', marginBottom: 12 }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={() => setComposing(false)} style={{ background: 'none', border: '1px solid #1a1a1a', color: '#444', borderRadius: 8, padding: '8px 16px', fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>Cancel</button>
            <button onClick={submitPost} disabled={!content.trim() || posting} style={{ background: '#e8553a', color: '#080808', border: 'none', borderRadius: 8, padding: '8px 20px', fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500, opacity: !content.trim() || posting ? 0.4 : 1 }}>
              {posting ? 'Posting...' : 'Post →'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#333', letterSpacing: '0.2em' }}>loading...</div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#1e1e1e', letterSpacing: '0.2em', lineHeight: 2 }}>no posts yet.<br />be the first to share something.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {posts.map(post => {
            const t = typeInfo(post.type);
            const liked = !!userId && post.likes.includes(userId);
            return (
              <div key={post.id} style={{ background: '#0d0d0d', border: `1px solid ${post.is_pinned ? 'rgba(232,85,58,0.15)' : '#1a1a1a'}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 16px 0', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #222', background: '#111', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#444' }}>
                      {post.author?.avatar_url ? <img src={post.author.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : '✈'}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>@{post.author?.username || 'traveler'}</div>
                      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#2a2a2a', letterSpacing: '0.08em', marginTop: 2 }}>{timeAgo(post.created_at)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {post.is_pinned && <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 8, color: '#e8553a', letterSpacing: '0.2em', textTransform: 'uppercase' }}>📌 Pinned</span>}
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 8, padding: '2px 7px', borderRadius: 4, background: `${t.color}15`, color: t.color, border: `1px solid ${t.color}30`, letterSpacing: '0.1em' }}>{t.label}</span>
                  </div>
                </div>
                <div style={{ padding: '10px 16px', fontSize: 14, color: '#999', lineHeight: 1.7, fontWeight: 300, whiteSpace: 'pre-wrap' }}>{post.content}</div>
                {post.image_url && <img src={post.image_url} style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }} alt="" />}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 16px 12px', borderTop: '1px solid #111' }}>
                  <button onClick={() => toggleLike(post)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: 6, fontFamily: 'DM Mono, monospace', fontSize: 10, color: liked ? '#e8553a' : '#333' }}>
                    {liked ? '♥' : '♡'} {post.likes.length > 0 ? post.likes.length : ''}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
      {profileBubble && (
        <>
          <div onClick={() => setProfileBubble(null)} style={{position:'fixed',inset:0,zIndex:9998,background:'rgba(0,0,0,0.5)'}} />
          <div style={{
            position:'fixed',
            top:'50%',left:'50%',
            transform:'translate(-50%,-50%)',
            zIndex:9999,
            background:'#0d0d0d',
            border:'1px solid #1a1a1a',
            borderRadius:12,
            padding:16,
            width:240,
            fontFamily:'DM Sans, sans-serif',
            boxShadow:'0 8px 32px rgba(0,0,0,0.8)'
          }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <span style={{fontFamily:'DM Mono, monospace',fontSize:8,letterSpacing:'0.3em',color:'#e8553a',textTransform:'uppercase'}}>Profile</span>
              <button onClick={() => setProfileBubble(null)} style={{background:'none',border:'none',color:'#555',cursor:'pointer',fontSize:16,lineHeight:1,padding:0}}>×</button>
            </div>
            {bubbleLoading ? (
              <div style={{color:'#444',fontFamily:'DM Mono, monospace',fontSize:10,textAlign:'center',padding:'12px 0'}}>Loading...</div>
            ) : (
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <div style={{width:44,height:44,borderRadius:'50%',border:'1px solid #222',background:'#111',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>
                  {profileBubble.avatar_url ? <img src={profileBubble.avatar_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : '✈️'}
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:500,color:'#fff',marginBottom:4}}>@{profileBubble.username || 'traveler'}</div>
                  {profileBubble.city
                    ? <div style={{fontFamily:'DM Mono, monospace',fontSize:9,letterSpacing:'0.2em',color:'#e8553a',textTransform:'uppercase'}}>📍 {profileBubble.city}</div>
                    : <div style={{fontFamily:'DM Mono, monospace',fontSize:9,letterSpacing:'0.2em',color:'#333',textTransform:'uppercase'}}>No location set</div>
                  }
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

// ── Main community browser ─────────────────────────────────────────────────
export default function CommunityPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading]         = useState(true);
  const [userId, setUserId]           = useState('');
  const [token, setToken]             = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [search, setSearch]           = useState('');
  const [joined, setJoined]           = useState<string[]>([]);
  const [activeRoom, setActiveRoom]   = useState<Community | null>(null);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session) {
        setUserId(session.user.id);
        setToken(session.access_token);
        const profiles = await rawGet(`profiles?id=eq.${session.user.id}&select=*`, session.access_token);
        setUserProfile(profiles?.[0]);
        const memberships = await rawGet(`community_members?user_id=eq.${session.user.id}&select=community_slug`, session.access_token);
        setJoined((Array.isArray(memberships) ? memberships : []).map((m: any) => m.community_slug));
      }
      const tok = session?.access_token || SUPABASE_KEY;
      const data = await rawGet('communities?select=*&order=member_count.desc', tok);
      setCommunities(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  const filtered = communities.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.country.toLowerCase().includes(search.toLowerCase()));
  const joinedCommunities = filtered.filter(c => joined.includes(c.slug));
  const otherCommunities  = filtered.filter(c => !joined.includes(c.slug));

  const commonStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #080808; color: #fff; font-family: 'DM Sans', sans-serif; }
  `;

  if (activeRoom) {
    return (
      <>
        <style suppressHydrationWarning>{commonStyles}</style>
        <CommunityRoom community={activeRoom} userId={userId} token={token} userProfile={userProfile} onBack={() => setActiveRoom(null)} />
      </>
    );
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        ${commonStyles}
        .comm-page { min-height: 100vh; padding: 72px 24px 140px; max-width: 900px; margin: 0 auto; }
        .comm-eyebrow { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.5em; color: #333; text-transform: uppercase; margin-bottom: 12px; }
        .comm-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(48px, 7vw, 80px); line-height: 0.9; color: #fff; margin-bottom: 10px; }
        .comm-title em { color: #e8553a; font-style: normal; }
        .comm-subtitle { font-size: 14px; color: #333; font-weight: 300; line-height: 1.7; max-width: 520px; margin-bottom: 28px; }
        .search-box { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
        .search-input { flex: 1; background: transparent; border: none; outline: none; color: #fff; font-family: 'DM Mono', monospace; font-size: 12px; }
        .search-input::placeholder { color: #2a2a2a; }
        .section-label { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.4em; color: #222; text-transform: uppercase; margin-bottom: 14px; display: flex; align-items: center; gap: 14px; }
        .section-line { flex: 1; height: 1px; background: #111; }
        .comm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; margin-bottom: 36px; }
        .comm-card { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 14px; padding: 20px; cursor: pointer; transition: border-color 0.2s, transform 0.15s; display: flex; flex-direction: column; gap: 10px; }
        .comm-card:hover { border-color: #2a2a2a; transform: translateY(-2px); }
        .comm-card.is-joined { border-color: rgba(232,85,58,0.15); }
        .comm-flag { font-size: 32px; line-height: 1; }
        .comm-name { font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: #fff; line-height: 1; }
        .comm-desc { font-size: 12px; color: #444; line-height: 1.6; font-weight: 300; }
        .comm-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
        .comm-members { font-family: 'DM Mono', monospace; font-size: 9px; color: #2a2a2a; letter-spacing: 0.1em; }
        .comm-arrow { font-family: 'DM Mono', monospace; font-size: 9px; color: #2a2a2a; transition: color 0.2s; }
        .comm-card:hover .comm-arrow { color: #e8553a; }
        .loading-dot { width: 6px; height: 6px; border-radius: 50%; background: #e8553a; animation: pulse 1.2s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }
        @media (max-width: 600px) { .comm-page { padding: 64px 16px 140px; } .comm-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <div className="comm-page">
        <p className="comm-eyebrow">Locals · Expats · Nomads</p>
        <h1 className="comm-title">Find your<br /><em>people.</em></h1>
        <p className="comm-subtitle">Never travel alone again. Connect with people who live there, have been there, or are on their way. Get real tips from real people.</p>

        <div className="search-box">
          <span style={{ fontSize: 14, color: '#333' }}>🔍</span>
          <input className="search-input" placeholder="Search a country or city..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="loading-dot" /></div>}

        {!loading && joinedCommunities.length > 0 && (
          <>
            <div className="section-label">Your communities<div className="section-line" /></div>
            <div className="comm-grid">
              {joinedCommunities.map(c => (
                <div key={c.slug} className="comm-card is-joined" onClick={() => setActiveRoom(c)}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <span className="comm-flag">{c.emoji}</span>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 8, letterSpacing: '0.15em', color: '#e8553a', background: 'rgba(232,85,58,0.08)', border: '1px solid rgba(232,85,58,0.2)', padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' }}>Joined</span>
                  </div>
                  <div className="comm-name">{c.name}</div>
                  <div className="comm-desc">{c.description}</div>
                  <div className="comm-footer">
                    <span className="comm-members">{c.member_count > 0 ? `${c.member_count} members` : 'New'}</span>
                    <span className="comm-arrow">Enter →</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && otherCommunities.length > 0 && (
          <>
            <div className="section-label">
              {joinedCommunities.length > 0 ? 'Explore' : 'All communities'}
              <div className="section-line" />
              <span style={{ whiteSpace: 'nowrap' }}>{otherCommunities.length} destinations</span>
            </div>
            <div className="comm-grid">
              {otherCommunities.map(c => (
                <div key={c.slug} className="comm-card" onClick={() => setActiveRoom(c)}>
                  <span className="comm-flag">{c.emoji}</span>
                  <div className="comm-name">{c.name}</div>
                  <div className="comm-desc">{c.description}</div>
                  <div className="comm-footer">
                    <span className="comm-members">{c.member_count > 0 ? `${c.member_count} members` : 'Be first'}</span>
                    <span className="comm-arrow">Explore →</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
