'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/session';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  city?: string;
  country?: string;
  type: string;
  likes: string[];
  created_at: string;
  author?: { username: string; avatar_url: string };
  comments?: Comment[];
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: { username: string; avatar_url: string };
}

const POST_TYPES = [
  { key: 'moment',   label: '📸 Moment',     placeholder: 'Share where you are right now...' },
  { key: 'tip',      label: '💡 Tip',         placeholder: 'Share a travel tip or local secret...' },
  { key: 'question', label: '🙋 Ask',         placeholder: 'Ask the community anything...' },
  { key: 'looking',  label: '🔍 Looking For', placeholder: 'Looking for recommendations, coworking spots, roommates...' },
];

const FILTERS = ['All', 'Moments', 'Tips', 'Questions', 'Looking For'];

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs  < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

function typeColor(type: string) {
  const map: Record<string, string> = { moment: '#e8553a', tip: '#47d4ff', question: '#ff8c47', looking: '#c847ff' };
  return map[type] || '#e8553a';
}

function typeLabel(type: string) {
  return POST_TYPES.find(t => t.key === type)?.label || type;
}

async function rawGet(path: string, token: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
  });
  return res.json();
}

async function rawPost(path: string, token: string, body: object) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function rawPatch(path: string, token: string, body: object) {
  await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
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

export default function FeedPage() {
  const [posts, setPosts]               = useState<Post[]>([]);
  const [loading, setLoading]           = useState(true);
  const [userId, setUserId]             = useState('');
  const [token, setToken]               = useState('');
  const [userProfile, setUserProfile]   = useState<any>(null);
  const [filter, setFilter]             = useState('All');
  const [composing, setComposing]       = useState(false);
  const [postType, setPostType]         = useState('moment');
  const [content, setContent]           = useState('');
  const [imageUrl, setImageUrl]         = useState('');
  const [city, setCity]                 = useState('');
  const [country, setCountry]           = useState('');
  const [posting, setPosting]           = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs]       = useState<Record<string, string>>({});
  const [profileBubble, setProfileBubble]       = useState<any>(null);
  const [bubbleLoading, setBubbleLoading]       = useState(false);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session) {
        setUserId(session.user.id);
        setToken(session.access_token);
        const profiles = await rawGet(`profiles?id=eq.${session.user.id}&select=*`, session.access_token);
        const profile = profiles?.[0];
        if (profile) {
          setUserProfile(profile);
          if (profile.city)    setCity(profile.city);
          if (profile.country) setCountry(profile.country);
        }
        await fetchPosts(session.access_token);
      }
      setLoading(false);
    })();
  }, []);

  const fetchPosts = async (tok: string) => {
    const data = await rawGet(
      'posts?select=*,author:profiles(username,avatar_url),comments(id,post_id,user_id,content,created_at,author:profiles(username,avatar_url))&order=created_at.desc&limit=50',
      tok
    );
    setPosts(Array.isArray(data) ? data : []);
  };

  const submitPost = async () => {
    if (!content.trim() || !userId || !token) return;
    setPosting(true);
    const rows = await rawPost('posts', token, {
      user_id: userId,
      content: content.trim(),
      image_url: imageUrl.trim() || null,
      city: city.trim() || null,
      country: country.trim() || null,
      type: postType,
      likes: [],
    });
    const newPost = rows?.[0];
    if (newPost) {
      // Attach author info locally
      newPost.author = { username: userProfile?.username, avatar_url: userProfile?.avatar_url };
      newPost.comments = [];
      setPosts(prev => [newPost, ...prev]);
      setContent('');
      setImageUrl('');
      setComposing(false);
    }
    setPosting(false);
  };

  const toggleLike = async (post: Post) => {
    if (!userId || !token) return;
    const liked    = post.likes.includes(userId);
    const newLikes = liked ? post.likes.filter(id => id !== userId) : [...post.likes, userId];
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: newLikes } : p));
    await rawPatch(`posts?id=eq.${post.id}`, token, { likes: newLikes });
  };

  const submitComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text || !userId || !token) return;
    const rows = await rawPost('comments', token, { post_id: postId, user_id: userId, content: text });
    const newComment = rows?.[0];
    if (newComment) {
      newComment.author = { username: userProfile?.username, avatar_url: userProfile?.avatar_url };
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...(p.comments || []), newComment] } : p));
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  const filterMap: Record<string, string> = { Moments: 'moment', Tips: 'tip', Questions: 'question', 'Looking For': 'looking' };
  const filtered = filter === 'All' ? posts : posts.filter(p => p.type === filterMap[filter]);
  const currentPlaceholder = POST_TYPES.find(t => t.key === postType)?.placeholder || '';

  const openProfile = async (uid: string) => {
    console.log('[openProfile] called with uid:', uid);
    const t = token || (await getSession())?.access_token;
    console.log('[openProfile] token:', t ? 'present' : 'missing');
    if (!t) return;
    setBubbleLoading(true);
    setProfileBubble({ loading: true });
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${uid}&select=username,avatar_url,city`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${t}` } }
      );
      const rows = await res.json();
      console.log('[openProfile] rows:', rows);
      setProfileBubble(rows?.[0] || null);
    } catch (e) { console.error('[openProfile]', e); setProfileBubble(null); }
    setBubbleLoading(false);
  };

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; color: #fff; font-family: 'DM Sans', sans-serif; }
        .feed-page { min-height: 100vh; padding: 72px 24px 140px; max-width: 640px; margin: 0 auto; }
        .feed-header { margin-bottom: 28px; }
        .feed-eyebrow { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.5em; color: #333; text-transform: uppercase; margin-bottom: 10px; }
        .feed-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(42px, 7vw, 72px); line-height: 0.9; color: #fff; margin-bottom: 20px; }
        .feed-title em { color: #e8553a; font-style: normal; }
        .compose-trigger { display: flex; align-items: center; gap: 12px; background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 14px; padding: 14px 16px; cursor: pointer; margin-bottom: 20px; transition: border-color 0.2s; }
        .compose-trigger:hover { border-color: #2a2a2a; }
        .compose-avatar { width: 36px; height: 36px; border-radius: 50%; border: 1px solid #222; background: #111; overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #444; }
        .compose-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .compose-placeholder { font-size: 13px; color: #333; font-weight: 300; }
        .compose-box { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 14px; padding: 16px; margin-bottom: 20px; }
        .type-pills { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
        .type-pill { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.1em; padding: 5px 12px; border-radius: 20px; border: 1px solid #1a1a1a; color: #444; cursor: pointer; background: transparent; transition: all 0.15s; }
        .type-pill.active { color: #080808; border-color: transparent; }
        .compose-textarea { width: 100%; background: transparent; border: none; outline: none; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 300; line-height: 1.6; resize: none; min-height: 80px; margin-bottom: 12px; }
        .compose-textarea::placeholder { color: #2a2a2a; }
        .compose-extras { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
        .compose-input { background: #111; border: 1px solid #1a1a1a; border-radius: 8px; padding: 8px 12px; color: #fff; font-family: 'DM Mono', monospace; font-size: 10px; outline: none; width: 100%; }
        .compose-input::placeholder { color: #333; }
        .compose-image-input { background: #111; border: 1px solid #1a1a1a; border-radius: 8px; padding: 8px 12px; color: #fff; font-family: 'DM Mono', monospace; font-size: 10px; outline: none; width: 100%; margin-bottom: 12px; }
        .compose-image-input::placeholder { color: #333; }
        .compose-actions { display: flex; justify-content: flex-end; gap: 8px; }
        .btn-cancel { background: none; border: 1px solid #1a1a1a; color: #444; border-radius: 8px; padding: 8px 16px; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; }
        .btn-post { background: #e8553a; color: #080808; border: none; border-radius: 8px; padding: 8px 20px; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; font-weight: 500; transition: opacity 0.2s; }
        .btn-post:disabled { opacity: 0.4; cursor: not-allowed; }
        .filter-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 24px; }
        .filter-pill { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; padding: 5px 12px; border-radius: 20px; border: 1px solid #1a1a1a; color: #444; cursor: pointer; background: transparent; transition: all 0.2s; }
        .filter-pill:hover { color: #888; border-color: #333; }
        .filter-pill.active { background: #e8553a; color: #080808; border-color: #e8553a; }
        .posts-list { display: flex; flex-direction: column; gap: 16px; }
        .post-card { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 14px; overflow: hidden; transition: border-color 0.2s; }
        .post-card:hover { border-color: #1e1e1e; }
        .post-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 14px 16px 0; gap: 12px; }
        .post-author { display: flex; align-items: center; gap: 10px; }
        .post-avatar { width: 36px; height: 36px; border-radius: 50%; border: 1px solid #222; background: #111; overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #444; }
        .post-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .post-username { font-size: 13px; font-weight: 500; color: #fff; }
        .post-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 2px; }
        .post-location { font-family: 'DM Mono', monospace; font-size: 9px; color: #e8553a; letter-spacing: 0.1em; }
        .post-time { font-family: 'DM Mono', monospace; font-size: 9px; color: #2a2a2a; }
        .post-type-badge { font-family: 'DM Mono', monospace; font-size: 8px; padding: 2px 7px; border-radius: 4px; letter-spacing: 0.1em; }
        .post-content { padding: 12px 16px; font-size: 14px; color: #aaa; line-height: 1.7; font-weight: 300; white-space: pre-wrap; }
        .post-image { width: 100%; max-height: 420px; object-fit: cover; display: block; }
        .post-actions { display: flex; align-items: center; gap: 4px; padding: 10px 16px 12px; border-top: 1px solid #111; }
        .action-btn { display: flex; align-items: center; gap: 5px; background: none; border: none; cursor: pointer; padding: 6px 10px; border-radius: 6px; font-family: 'DM Mono', monospace; font-size: 10px; color: #333; transition: all 0.15s; letter-spacing: 0.05em; }
        .action-btn:hover { background: rgba(255,255,255,0.03); color: #666; }
        .action-btn.liked { color: #e8553a; }
        .action-btn-icon { font-size: 14px; }
        .comments-section { border-top: 1px solid #111; padding: 12px 16px; }
        .comment-item { display: flex; gap: 8px; margin-bottom: 10px; }
        .comment-avatar { width: 26px; height: 26px; border-radius: 50%; border: 1px solid #1a1a1a; background: #111; overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #444; }
        .comment-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .comment-bubble { background: #111; border-radius: 8px; padding: 8px 12px; flex: 1; }
        .comment-author { font-size: 11px; font-weight: 500; color: #888; margin-bottom: 3px; }
        .comment-text { font-size: 12px; color: #666; line-height: 1.5; font-weight: 300; }
        .comment-input-row { display: flex; gap: 8px; align-items: center; margin-top: 8px; }
        .comment-input { flex: 1; background: #111; border: 1px solid #1a1a1a; border-radius: 8px; padding: 8px 12px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 12px; outline: none; }
        .comment-input::placeholder { color: #333; }
        .comment-submit { background: rgba(232,85,58,0.1); border: 1px solid rgba(232,85,58,0.2); color: #e8553a; border-radius: 6px; padding: 7px 12px; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.1em; cursor: pointer; white-space: nowrap; transition: background 0.15s; }
        .comment-submit:hover { background: rgba(232,85,58,0.18); }
        .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; gap: 16px; font-family: 'DM Mono', monospace; font-size: 11px; color: #333; letter-spacing: 0.2em; }
        .loading-dot { width: 6px; height: 6px; border-radius: 50%; background: #e8553a; animation: pulse 1.2s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }
        .empty-state { text-align: center; padding: 60px 0; font-family: 'DM Mono', monospace; font-size: 11px; color: #222; letter-spacing: 0.2em; line-height: 2; }
        @media (max-width: 600px) { .feed-page { padding: 64px 16px 140px; } }
      `}</style>

      <div className="feed-page">
        <div className="feed-header">
          <p className="feed-eyebrow">Live · Share · Connect</p>
          <h1 className="feed-title">What's<br /><em>happening.</em></h1>
        </div>

        {userId && !composing && (
          <div className="compose-trigger" onClick={() => setComposing(true)}>
            <div className="compose-avatar">
              {userProfile?.avatar_url ? <img src={userProfile.avatar_url} alt="" /> : '✈️'}
            </div>
            <span className="compose-placeholder">Share where you are or what you've found...</span>
          </div>
        )}

        {userId && composing && (
          <div className="compose-box">
            <div className="type-pills">
              {POST_TYPES.map(t => (
                <button
                  key={t.key}
                  className={`type-pill${postType === t.key ? ' active' : ''}`}
                  style={postType === t.key ? { background: typeColor(t.key), borderColor: typeColor(t.key) } : {}}
                  onClick={() => setPostType(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <textarea
              className="compose-textarea"
              placeholder={currentPlaceholder}
              value={content}
              onChange={e => setContent(e.target.value)}
              autoFocus
            />
            <input className="compose-image-input" placeholder="📷 Image URL (optional)" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
            <div className="compose-extras">
              <input className="compose-input" placeholder="📍 City" value={city} onChange={e => setCity(e.target.value)} />
              <input className="compose-input" placeholder="🌍 Country" value={country} onChange={e => setCountry(e.target.value)} />
            </div>
            <div className="compose-actions">
              <button className="btn-cancel" onClick={() => setComposing(false)}>Cancel</button>
              <button className="btn-post" onClick={submitPost} disabled={!content.trim() || posting}>
                {posting ? 'Posting...' : 'Post →'}
              </button>
            </div>
          </div>
        )}

        <div className="filter-row">
          {FILTERS.map(f => (
            <button key={f} className={`filter-pill${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>

        {loading && <div className="loading-state"><div className="loading-dot" />loading feed...</div>}

        {!loading && filtered.length === 0 && (
          <div className="empty-state">no posts yet.<br />be the first to share.</div>
        )}

        {!loading && (
          <div className="posts-list">
            {filtered.map(post => {
              const liked       = !!userId && post.likes.includes(userId);
              const showComments = expandedComments.has(post.id);
              const color       = typeColor(post.type);
              return (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <div className="post-author">
                      <div className="post-avatar" onClick={() => openProfile(post.user_id)} style={{cursor:'pointer'}}>
                        {post.author?.avatar_url ? <img src={post.author.avatar_url} alt="" /> : '✈️'}
                      </div>
                      <div>
                        <div className="post-username" onClick={() => openProfile(post.user_id)} style={{cursor:'pointer'}}>@{post.author?.username || 'traveler'}</div>
                        <div className="post-meta">
                          {(post.city || post.country) && (
                            <span className="post-location">📍 {[post.city, post.country].filter(Boolean).join(', ')}</span>
                          )}
                          <span className="post-time">{timeAgo(post.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <span className="post-type-badge" style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                      {typeLabel(post.type)}
                    </span>
                  </div>
                  {post.content && <div className="post-content">{post.content}</div>}
                  {post.image_url && <img className="post-image" src={post.image_url} alt="" />}
                  <div className="post-actions">
                    <button className={`action-btn${liked ? ' liked' : ''}`} onClick={() => toggleLike(post)}>
                      <span className="action-btn-icon">{liked ? '♥' : '♡'}</span>
                      {post.likes.length > 0 && post.likes.length}
                    </button>
                    <button className="action-btn" onClick={() => toggleComments(post.id)}>
                      <span className="action-btn-icon">💬</span>
                      {post.comments?.length ? post.comments.length : ''}
                    </button>
                    <button className="action-btn" onClick={() => navigator.share?.({ text: post.content }) || navigator.clipboard?.writeText(window.location.href)}>
                      <span className="action-btn-icon">↗</span>
                    </button>
                  </div>
                  {showComments && (
                    <div className="comments-section">
                      {(post.comments || []).map(c => (
                        <div key={c.id} className="comment-item">
                          <div className="comment-avatar">
                            {c.author?.avatar_url ? <img src={c.author.avatar_url} alt="" /> : '✈️'}
                          </div>
                          <div className="comment-bubble">
                            <div className="comment-author">@{c.author?.username}</div>
                            <div className="comment-text">{c.content}</div>
                          </div>
                        </div>
                      ))}
                      {userId && (
                        <div className="comment-input-row">
                          <input
                            className="comment-input"
                            placeholder="Add a comment..."
                            value={commentInputs[post.id] || ''}
                            onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && submitComment(post.id)}
                          />
                          <button className="comment-submit" onClick={() => submitComment(post.id)}>Reply</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {profileBubble && (
        <div className="profile-overlay" onClick={() => setProfileBubble(null)} style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:9999,display:"flex",alignItems:"flex-end",justifyContent:"center",background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)"}}>
          <div className="profile-bubble" onClick={e => e.stopPropagation()}>
            <div className="bubble-handle" />
            {bubbleLoading ? (
              <div style={{color:'#333',fontFamily:'DM Mono, monospace',fontSize:10}}>Loading...</div>
            ) : (
              <>
                <div className="bubble-avatar">
                  {profileBubble.avatar_url ? <img src={profileBubble.avatar_url} alt="" /> : '✈️'}
                </div>
                <div className="bubble-username">@{profileBubble.username || 'traveler'}</div>
                {profileBubble.city
                  ? <div className="bubble-city">📍 {profileBubble.city}</div>
                  : <div className="bubble-no-city">No location set</div>
                }
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
