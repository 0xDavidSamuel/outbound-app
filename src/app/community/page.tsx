'use client';

import { useEffect, useState, useCallback } from 'react';
import NavBar from '@/components/ui/NavBar';
import { createClient } from '@/lib/supabase';

interface Community {
  slug: string;
  name: string;
  country: string;
  emoji: string;
  description: string;
  member_count: number;
}

interface Member {
  user_id: string;
  is_here_now: boolean;
  profile: { username: string; avatar_url: string; countries_visited?: string[]; };
}

interface CommunityPost {
  id: string;
  user_id: string;
  community_slug: string;
  content: string;
  image_url?: string;
  type: string;
  likes: string[];
  is_pinned: boolean;
  created_at: string;
  author?: { username: string; avatar_url: string; };
}

const POST_TYPES = [
  { key: 'tip',        label: '💡 Tip',         color: '#47d4ff' },
  { key: 'question',   label: '🙋 Question',     color: '#ff8c47' },
  { key: 'moment',     label: '📸 Moment',       color: '#e8ff47' },
  { key: 'warning',    label: '⚠️ Heads Up',     color: '#ff4747' },
  { key: 'recommend',  label: '⭐ Recommend',    color: '#47ff8c' },
];

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  if (hrs < 24) return `${hrs}h`;
  return `${days}d`;
}

function typeInfo(type: string) {
  return POST_TYPES.find(t => t.key === type) || POST_TYPES[0];
}

// ── Room view ──────────────────────────────────────────────────────────────
function CommunityRoom({ community, user, onBack }: {
  community: Community;
  user: any;
  onBack: () => void;
}) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [isHereNow, setIsHereNow] = useState(false);
  const [composing, setComposing] = useState(false);
  const [postType, setPostType] = useState('tip');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const [{ data: postsData }, { data: membersData }] = await Promise.all([
        supabase.from('community_posts')
          .select('*, author:profiles(username, avatar_url)')
          .eq('community_slug', community.slug)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(40),
        supabase.from('community_members')
          .select('user_id, is_here_now, profile:profiles(username, avatar_url, countries_visited)')
          .eq('community_slug', community.slug)
          .limit(50),
      ]);
      setPosts(postsData || []);
      setMembers((membersData || []).map((m: any) => ({
        ...m,
        profile: Array.isArray(m.profile) ? m.profile[0] : m.profile,
        })));
      if (user) {
        const me = (membersData || []).find((m: any) => m.user_id === user.id);
        setIsMember(!!me);
        setIsHereNow(me?.is_here_now || false);
      }
      setLoading(false);
    };
    load();
  }, [community.slug]);

  const toggleJoin = async () => {
    if (!user) return;
    if (isMember) {
      await supabase.from('community_members').delete().eq('community_slug', community.slug).eq('user_id', user.id);
      setIsMember(false);
      setMembers(prev => prev.filter(m => m.user_id !== user.id));
    } else {
      await supabase.from('community_members').insert({ community_slug: community.slug, user_id: user.id, is_here_now: false });
      setIsMember(true);
      setMembers(prev => [...prev, { user_id: user.id, is_here_now: false, profile: { username: user.username, avatar_url: user.avatar_url } }]);
    }
  };

  const toggleHereNow = async () => {
    if (!user || !isMember) return;
    const newVal = !isHereNow;
    await supabase.from('community_members').update({ is_here_now: newVal }).eq('community_slug', community.slug).eq('user_id', user.id);
    setIsHereNow(newVal);
    setMembers(prev => prev.map(m => m.user_id === user.id ? { ...m, is_here_now: newVal } : m));
  };

  const submitPost = async () => {
    if (!content.trim() || !user) return;
    setPosting(true);
    const { data, error } = await supabase.from('community_posts').insert({
      community_slug: community.slug,
      user_id: user.id,
      content: content.trim(),
      image_url: imageUrl.trim() || null,
      type: postType,
      likes: [],
      is_pinned: false,
    }).select('*, author:profiles(username, avatar_url)').single();
    if (!error && data) {
      setPosts(prev => [data, ...prev]);
      setContent('');
      setImageUrl('');
      setComposing(false);
    }
    setPosting(false);
  };

  const toggleLike = async (post: CommunityPost) => {
    if (!user) return;
    const liked = post.likes.includes(user.id);
    const newLikes = liked ? post.likes.filter(id => id !== user.id) : [...post.likes, user.id];
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: newLikes } : p));
    await supabase.from('community_posts').update({ likes: newLikes }).eq('id', post.id);
  };

  const hereNow = members.filter(m => m.is_here_now);
  const allMembers = members.filter(m => !m.is_here_now);

  return (
    <div style={{ minHeight: '100vh', padding: '72px 24px 140px', maxWidth: 680, margin: '0 auto' }}>

      {/* Back + header */}
      <button onClick={onBack} style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.2em', color: '#444', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', marginBottom: 20, padding: 0 }}>
        ← All communities
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{community.emoji}</div>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(42px, 7vw, 64px)', lineHeight: 0.9, color: '#fff', marginBottom: 10 }}>{community.name}</h1>
          <p style={{ fontSize: 13, color: '#444', lineHeight: 1.6, fontWeight: 300, maxWidth: 400 }}>{community.description}</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{members.length} members</span>
            {hereNow.length > 0 && (
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#e8ff47', letterSpacing: '0.2em', textTransform: 'uppercase' }}>● {hereNow.length} here now</span>
            )}
          </div>
        </div>
        {user && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={toggleJoin} style={{
              fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
              padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s',
              background: isMember ? 'transparent' : '#e8ff47',
              color: isMember ? '#444' : '#080808',
              border: isMember ? '1px solid #222' : '1px solid #e8ff47',
            }}>
              {isMember ? 'Joined ✓' : '+ Join'}
            </button>
            {isMember && (
              <button onClick={toggleHereNow} style={{
                fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase',
                padding: '8px 16px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
                background: isHereNow ? 'rgba(232,255,71,0.1)' : 'transparent',
                color: isHereNow ? '#e8ff47' : '#333',
                border: isHereNow ? '1px solid rgba(232,255,71,0.3)' : '1px solid #1a1a1a',
              }}>
                {isHereNow ? '● Here now' : '○ I\'m here'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Here now strip */}
      {hereNow.length > 0 && (
        <div style={{ background: 'rgba(232,255,71,0.04)', border: '1px solid rgba(232,255,71,0.1)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.3em', color: '#e8ff47', textTransform: 'uppercase', marginBottom: 10 }}>● Currently in {community.name}</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {hereNow.map(m => (
              <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid rgba(232,255,71,0.4)', overflow: 'hidden', background: '#111', flexShrink: 0 }}>
                  {m.profile?.avatar_url ? <img src={m.profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#444' }}>✈</div>}
                </div>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#888' }}>@{m.profile?.username}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members strip */}
      {allMembers.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.3em', color: '#222', textTransform: 'uppercase', marginBottom: 10 }}>Members</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {allMembers.slice(0, 20).map(m => (
              <div key={m.user_id} title={`@${m.profile?.username}`} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #1a1a1a', overflow: 'hidden', background: '#111', flexShrink: 0 }}>
                {m.profile?.avatar_url ? <img src={m.profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#333' }}>✈</div>}
              </div>
            ))}
            {allMembers.length > 20 && <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #1a1a1a', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#444' }}>+{allMembers.length - 20}</div>}
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: '#111', marginBottom: 20 }} />

      {/* Compose */}
      {user && !composing && (
        <div onClick={() => setComposing(true)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 12, padding: '12px 16px', cursor: 'pointer', marginBottom: 20, transition: 'border-color 0.2s' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #222', background: '#111', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#444' }}>
            {user.avatar_url ? <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : '✈'}
          </div>
          <span style={{ fontSize: 13, color: '#2a2a2a', fontWeight: 300 }}>Share a tip, photo, or question about {community.name}...</span>
        </div>
      )}

      {user && composing && (
        <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 14, padding: 18, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {POST_TYPES.map(t => (
              <button key={t.key} onClick={() => setPostType(t.key)} style={{
                fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.1em', padding: '5px 12px', borderRadius: 20,
                background: postType === t.key ? t.color : 'transparent',
                color: postType === t.key ? '#080808' : '#444',
                border: `1px solid ${postType === t.key ? t.color : '#1a1a1a'}`,
                cursor: 'pointer', transition: 'all 0.15s',
              }}>{t.label}</button>
            ))}
          </div>
          <textarea
            autoFocus
            placeholder={`What do you know about ${community.name}?`}
            value={content}
            onChange={e => setContent(e.target.value)}
            style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 300, lineHeight: 1.6, resize: 'none', minHeight: 80, marginBottom: 10 }}
          />
          <input
            placeholder="📷 Image URL (optional)"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            style={{ width: '100%', background: '#111', border: '1px solid #1a1a1a', borderRadius: 8, padding: '8px 12px', color: '#fff', fontFamily: 'DM Mono, monospace', fontSize: 10, outline: 'none', marginBottom: 12 }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={() => setComposing(false)} style={{ background: 'none', border: '1px solid #1a1a1a', color: '#444', borderRadius: 8, padding: '8px 16px', fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>Cancel</button>
            <button onClick={submitPost} disabled={!content.trim() || posting} style={{ background: '#e8ff47', color: '#080808', border: 'none', borderRadius: 8, padding: '8px 20px', fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500, opacity: !content.trim() || posting ? 0.4 : 1 }}>
              {posting ? 'Posting...' : 'Post →'}
            </button>
          </div>
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#333', letterSpacing: '0.2em' }}>loading...</div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#1e1e1e', letterSpacing: '0.2em', lineHeight: 2 }}>
          no posts yet.<br />be the first to share something.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {posts.map(post => {
            const t = typeInfo(post.type);
            const liked = user && post.likes.includes(user.id);
            return (
              <div key={post.id} style={{ background: '#0d0d0d', border: `1px solid ${post.is_pinned ? 'rgba(232,255,71,0.15)' : '#1a1a1a'}`, borderRadius: 14, overflow: 'hidden' }}>
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
                    {post.is_pinned && <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 8, color: '#e8ff47', letterSpacing: '0.2em', textTransform: 'uppercase' }}>📌 Pinned</span>}
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 8, padding: '2px 7px', borderRadius: 4, background: `${t.color}15`, color: t.color, border: `1px solid ${t.color}30`, letterSpacing: '0.1em' }}>{t.label}</span>
                  </div>
                </div>

                <div style={{ padding: '10px 16px', fontSize: 14, color: '#999', lineHeight: 1.7, fontWeight: 300, whiteSpace: 'pre-wrap' }}>{post.content}</div>

                {post.image_url && <img src={post.image_url} style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }} alt="" />}

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 16px 12px', borderTop: '1px solid #111' }}>
                  <button onClick={() => toggleLike(post)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: 6, fontFamily: 'DM Mono, monospace', fontSize: 10, color: liked ? '#e8ff47' : '#333', transition: 'all 0.15s' }}>
                    {liked ? '♥' : '♡'} {post.likes.length > 0 ? post.likes.length : ''}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main community browser ─────────────────────────────────────────────────
export default function CommunityPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [joined, setJoined] = useState<string[]>([]);
  const [activeRoom, setActiveRoom] = useState<Community | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setUser({ ...profile, id: session.user.id });
        const { data: memberships } = await supabase.from('community_members').select('community_slug').eq('user_id', session.user.id);
        setJoined((memberships || []).map((m: any) => m.community_slug));
      }
      const { data } = await supabase.from('communities').select('*').order('member_count', { ascending: false });
      setCommunities(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = communities.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.country.toLowerCase().includes(search.toLowerCase())
  );

  const joinedCommunities = filtered.filter(c => joined.includes(c.slug));
  const otherCommunities = filtered.filter(c => !joined.includes(c.slug));

  if (activeRoom) {
    return (
      <>
        <style suppressHydrationWarning>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #080808; color: #fff; font-family: 'DM Sans', sans-serif; }
        `}</style>
      </>
    );
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; color: #fff; font-family: 'DM Sans', sans-serif; }

        .comm-page { min-height: 100vh; padding: 72px 24px 140px; max-width: 900px; margin: 0 auto; }
        .comm-eyebrow { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.5em; color: #333; text-transform: uppercase; margin-bottom: 12px; }
        .comm-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(48px, 7vw, 80px); line-height: 0.9; color: #fff; margin-bottom: 10px; }
        .comm-title em { color: #e8ff47; font-style: normal; }
        .comm-subtitle { font-size: 14px; color: #333; font-weight: 300; line-height: 1.7; max-width: 520px; margin-bottom: 28px; }

        .search-box { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
        .search-icon { font-size: 14px; color: #333; flex-shrink: 0; }
        .search-input { flex: 1; background: transparent; border: none; outline: none; color: #fff; font-family: 'DM Mono', monospace; font-size: 12px; }
        .search-input::placeholder { color: #2a2a2a; }

        .section-label { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.4em; color: #222; text-transform: uppercase; margin-bottom: 14px; display: flex; align-items: center; gap: 14px; }
        .section-line { flex: 1; height: 1px; background: #111; }

        .comm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; margin-bottom: 36px; }

        .comm-card { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 14px; padding: 20px; cursor: pointer; transition: border-color 0.2s, transform 0.15s; display: flex; flex-direction: column; gap: 10px; }
        .comm-card:hover { border-color: #2a2a2a; transform: translateY(-2px); }
        .comm-card.is-joined { border-color: rgba(232,255,71,0.15); }

        .comm-card-top { display: flex; align-items: flex-start; justify-content: space-between; }
        .comm-flag { font-size: 32px; line-height: 1; }
        .comm-joined-badge { font-family: 'DM Mono', monospace; font-size: 8px; letterSpacing: '0.15em'; color: '#e8ff47'; background: 'rgba(232,255,71,0.08)'; border: '1px solid rgba(232,255,71,0.2)'; padding: '3px 8px'; borderRadius: 4; textTransform: 'uppercase'; }

        .comm-name { font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: #fff; line-height: 1; }
        .comm-desc { font-size: 12px; color: #444; line-height: 1.6; font-weight: 300; }
        .comm-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
        .comm-members { font-family: 'DM Mono', monospace; font-size: 9px; color: #2a2a2a; letter-spacing: 0.1em; }
        .comm-arrow { font-family: 'DM Mono', monospace; font-size: 9px; color: #2a2a2a; transition: color 0.2s; }
        .comm-card:hover .comm-arrow { color: #e8ff47; }

        .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0; gap: 16px; font-family: 'DM Mono', monospace; font-size: 11px; color: '#333'; letter-spacing: 0.2em; }
        .loading-dot { width: 6px; height: 6px; border-radius: 50%; background: #e8ff47; animation: pulse 1.2s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }

        @media (max-width: 600px) {
          .comm-page { padding: 64px 16px 140px; }
          .comm-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="comm-page">
        <p className="comm-eyebrow">Locals · Expats · Nomads</p>
        <h1 className="comm-title">Find your<br /><em>people.</em></h1>
        <p className="comm-subtitle">
          Never travel alone again. Connect with people who live there, have been there, or are on their way. Get real tips from real people — best neighborhoods, hidden spots, honest safety takes, foodie secrets.
        </p>

        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search a country or city..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading && <div className="loading-state"><div className="loading-dot" /></div>}

        {!loading && joinedCommunities.length > 0 && (
          <>
            <div className="section-label">
              Your communities
              <div className="section-line" />
            </div>
            <div className="comm-grid">
              {joinedCommunities.map(c => (
                <div key={c.slug} className="comm-card is-joined" onClick={() => setActiveRoom(c)}>
                  <div className="comm-card-top">
                    <span className="comm-flag">{c.emoji}</span>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 8, letterSpacing: '0.15em', color: '#e8ff47', background: 'rgba(232,255,71,0.08)', border: '1px solid rgba(232,255,71,0.2)', padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' }}>Joined</span>
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
