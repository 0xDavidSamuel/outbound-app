'use client';

import { useRouter, usePathname } from 'next/navigation';
import { clearSession, getSession } from '@/lib/session';
import { useEffect, useState, useRef } from 'react';

const NAV_ITEMS = [
  { label: 'Ground',    href: '/ground',    icon: '⚑' },
  { label: 'Events',    href: '/events',    icon: '◇' },
  { label: 'Jobs',      href: '/jobs',      icon: '□' },
  { label: 'Stays',     href: '/stays',     icon: '⌂' },
  { label: 'Passport',  href: '/passport',  icon: '◉' },
  { label: 'Tools',     href: '/tools',     icon: '⊞' },
  { label: 'Map',       href: '/map',       icon: '◎' },
  { label: 'Store',     href: 'https://outboundwear.com', icon: '◻', external: true },
];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const HIDDEN_PATHS = ['/', '/onboarding', '/auth/callback', '/auth/session'];

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
  from_user_id?: string;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000);
  if (m < 1) return 'now'; if (m < 60) return `${m}m`; if (h < 24) return `${h}h`; return `${d}d`;
}

const NOTIF_ICONS: Record<string, string> = {
  signal: '📡', like: '♥', comment: '💬', plan_join: '⚡', match: '🤝',
};

export default function NavBar() {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ avatar_url?: string; username?: string } | null>(null);
  const [navRevealed, setNavRevealed] = useState(false);
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (!session) return;
      setToken(session.access_token);
      setUserId(session.user.id);
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${session.user.id}&select=username,avatar_url`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${session.access_token}` } }
      );
      const rows = await res.json();
      if (rows?.[0]) {
        setUser(rows[0]);
        setTimeout(() => setNavRevealed(true), 100);
      }
      try {
        const nRes = await fetch(
          `${SUPABASE_URL}/rest/v1/notifications?user_id=eq.${session.user.id}&select=id,type,message,read,created_at,from_user_id&order=created_at.desc&limit=30`,
          { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${session.access_token}` } }
        );
        const nData = await nRes.json();
        if (Array.isArray(nData)) setNotifications(nData);
      } catch {}
      // Load existing matches
      try {
        const mRes = await fetch(
          `${SUPABASE_URL}/rest/v1/matches?or=(user_a.eq.${session.user.id},user_b.eq.${session.user.id})&select=user_a,user_b`,
          { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${session.access_token}` } }
        );
        const mData = await mRes.json();
        if (Array.isArray(mData)) {
          const ids = new Set<string>();
          mData.forEach((m: any) => { ids.add(m.user_a); ids.add(m.user_b); });
          ids.delete(session.user.id);
          setMatchedIds(ids);
        }
      } catch {}
    })();
  }, []);

  // Poll every 30s
  useEffect(() => {
    if (!userId || !token) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/notifications?user_id=eq.${userId}&select=id,type,message,read,created_at,from_user_id&order=created_at.desc&limit=30`,
          { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (Array.isArray(data)) setNotifications(data);
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, [userId, token]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    if (!userId || !token) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/notifications?user_id=eq.${userId}&read=eq.false`, {
        method: 'PATCH',
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ read: true }),
      });
    } catch {}
  };

  const toggleBell = () => {
    const opening = !bellOpen;
    setBellOpen(opening);
    if (opening && unreadCount > 0) markAllRead();
  };

  const handleMatch = async (notif: Notification) => {
    if (!userId || !token || !notif.from_user_id) return;
    if (matchedIds.has(notif.from_user_id)) return; // already matched

    // Get username for notification message
    const username = user?.username || 'someone';

    // Create match record (user_a = original signaler, user_b = matcher)
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/matches`, {
        method: 'POST',
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ user_a: notif.from_user_id, user_b: userId, signal_message: notif.message }),
      });
    } catch {}

    // Notify the original signaler
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
        method: 'POST',
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({
          user_id: notif.from_user_id, from_user_id: userId,
          type: 'match', message: `🤝 @${username} matched your signal!`,
        }),
      });
    } catch {}

    // Update local state
    setMatchedIds(prev => new Set(prev).add(notif.from_user_id!));
  };

  const signOut = () => { clearSession(); window.location.href = '/'; };

  const handleNav = (item: { href: string; external?: boolean }) => {
    if (item.external) window.open(item.href, '_blank');
    else router.push(item.href);
  };

  if (HIDDEN_PATHS.includes(pathname)) return null;
  if (!user) return null;
  if (!user.username) { router.push('/onboarding'); return null; }

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        .nav-shell { position: fixed; bottom: 24px; left: 0; right: 0; display: flex; flex-direction: column; align-items: center; gap: 8px; z-index: 500; pointer-events: none; }
        .nav-topbar { display: flex; align-items: center; gap: 10px; background: rgba(10,10,10,0.9); border: 1px solid #161616; border-radius: 40px; padding: 5px 14px 5px 16px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); pointer-events: all; opacity: 0; transform: translateY(20px); transition: opacity 0.4s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .nav-shell.nav-revealed .nav-topbar { opacity: 1; transform: translateY(0); }
        .nav-wordmark { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.35em; color: #e8553a; text-transform: uppercase; }
        .nav-divider { width: 1px; height: 12px; background: #1a1a1a; }
        .nav-avatar { width: 22px; height: 22px; border-radius: 50%; border: 1px solid #222; background: #111; cursor: pointer; overflow: hidden; display: flex; align-items: center; justify-content: center; font-family: 'DM Mono', monospace; font-size: 9px; color: #444; transition: border-color 0.2s; flex-shrink: 0; }
        .nav-avatar:hover { border-color: #e8553a; }
        .nav-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .nav-bell-wrap { position: relative; }
        .nav-bell { background: none; border: none; cursor: pointer; font-size: 13px; line-height: 1; padding: 2px; position: relative; transition: transform 0.15s; }
        .nav-bell:hover { transform: scale(1.1); }
        .nav-bell-badge { position: absolute; top: -4px; right: -6px; min-width: 14px; height: 14px; border-radius: 7px; background: #e8553a; font-family: 'DM Mono', monospace; font-size: 7px; color: #080808; display: flex; align-items: center; justify-content: center; padding: 0 3px; font-weight: 500; }
        .nav-bell-dropdown { position: absolute; bottom: 36px; right: -40px; width: 280px; max-height: 340px; overflow-y: auto; background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 12px; box-shadow: 0 12px 48px rgba(0,0,0,0.9); z-index: 600; }
        .nav-bell-dropdown::-webkit-scrollbar { display: none; }
        .nav-bell-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-bottom: 1px solid #141414; position: sticky; top: 0; background: #0d0d0d; z-index: 1; }
        .nav-bell-title { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.3em; text-transform: uppercase; color: #e8553a; }
        .nav-bell-clear { font-family: 'DM Mono', monospace; font-size: 7px; letter-spacing: 0.15em; text-transform: uppercase; color: #333; background: none; border: none; cursor: pointer; transition: color 0.2s; }
        .nav-bell-clear:hover { color: #888; }
        .nav-notif { display: flex; gap: 10px; padding: 10px 14px; border-bottom: 1px solid #0f0f0f; transition: background 0.15s; cursor: default; }
        .nav-notif:hover { background: rgba(255,255,255,0.01); }
        .nav-notif.unread { background: rgba(232,85,58,0.03); }
        .nav-notif-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }
        .nav-notif-body { flex: 1; min-width: 0; }
        .nav-notif-msg { font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888; line-height: 1.5; font-weight: 300; }
        .nav-notif-msg.unread { color: #ccc; }
        .nav-notif-time { font-family: 'DM Mono', monospace; font-size: 8px; color: #2a2a2a; margin-top: 2px; }
        .nav-notif-dot { width: 5px; height: 5px; border-radius: 50%; background: #e8553a; flex-shrink: 0; margin-top: 6px; }
        .nav-notif-empty { text-align: center; padding: 32px 0; font-family: 'DM Mono', monospace; font-size: 9px; color: #222; letter-spacing: 0.2em; }
        .nav-match-btn { font-family: 'DM Mono', monospace; font-size: 7px; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; background: rgba(232,85,58,0.08); border: 1px solid rgba(232,85,58,0.2); color: #e8553a; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .nav-match-btn:hover { background: rgba(232,85,58,0.15); border-color: rgba(232,85,58,0.4); }
        .nav-signout { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.15em; color: #2a2a2a; text-transform: uppercase; background: none; border: none; cursor: pointer; transition: color 0.2s; padding: 0 2px; }
        .nav-signout:hover { color: #555; }
        .nav-pill-wrapper { width: 100%; max-width: 720px; padding: 0 16px; pointer-events: all; opacity: 0; transform: translateY(24px); transition: opacity 0.5s ease 0.15s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s; }
        .nav-shell.nav-revealed .nav-pill-wrapper { opacity: 1; transform: translateY(0); }
        .nav-pill { display: flex; align-items: center; gap: 2px; background: rgba(10,10,10,0.92); border: 1px solid #161616; border-radius: 40px; padding: 5px 6px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); box-shadow: 0 8px 32px rgba(0,0,0,0.7); overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
        .nav-pill::-webkit-scrollbar { display: none; }
        .nav-item { display: flex; align-items: center; gap: 5px; padding: 7px 12px; border-radius: 32px; cursor: pointer; transition: background 0.18s, color 0.18s; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.12em; color: #383838; text-transform: uppercase; white-space: nowrap; flex-shrink: 0; }
        .nav-item:hover { color: #666; background: rgba(255,255,255,0.03); }
        .nav-item.active { color: #080808; background: #e8553a; }
        .nav-item.store { color: #e8553a; }
        .nav-item.store:hover { background: rgba(232,85,58,0.08); color: #e8553a; }
        .nav-item-icon { font-size: 10px; line-height: 1; }
        .nav-sep { width: 1px; height: 14px; background: #141414; margin: 0 2px; flex-shrink: 0; }
        .nav-upgrade { display: flex; align-items: center; gap: 5px; padding: 7px 12px; border-radius: 32px; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.12em; color: #e8553a; text-transform: uppercase; background: rgba(232,85,58,0.06); border: none; transition: background 0.18s; white-space: nowrap; flex-shrink: 0; }
        .nav-upgrade:hover { background: rgba(232,85,58,0.12); }
      `}</style>

      <div className={`nav-shell${navRevealed ? ' nav-revealed' : ''}`}>
        <div className="nav-topbar">
          <span className="nav-wordmark">outbound</span>
          <div className="nav-divider" />

          <div className="nav-bell-wrap" ref={bellRef}>
            <button className="nav-bell" onClick={toggleBell}>
              🔔
              {unreadCount > 0 && <span className="nav-bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>
            {bellOpen && (
              <div className="nav-bell-dropdown">
                <div className="nav-bell-header">
                  <span className="nav-bell-title">Notifications</span>
                  {notifications.length > 0 && (
                    <button className="nav-bell-clear" onClick={markAllRead}>Mark all read</button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="nav-notif-empty">No notifications yet</div>
                ) : (
                  notifications.slice(0, 20).map(n => (
                    <div key={n.id} className={`nav-notif${!n.read ? ' unread' : ''}`}>
                      <span className="nav-notif-icon">{NOTIF_ICONS[n.type] || '📌'}</span>
                      <div className="nav-notif-body">
                        <div className={`nav-notif-msg${!n.read ? ' unread' : ''}`}>{n.message}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                          <span className="nav-notif-time">{timeAgo(n.created_at)}</span>
                          {n.type === 'signal' && n.from_user_id && (
                            matchedIds.has(n.from_user_id) ? (
                              <span style={{ fontFamily:'DM Mono, monospace',fontSize:7,color:'#47ff8c',letterSpacing:'0.1em' }}>✓ Matched</span>
                            ) : (
                              <button className="nav-match-btn" onClick={(e) => { e.stopPropagation(); handleMatch(n); }}>
                                🤝 Match it
                              </button>
                            )
                          )}
                          {n.type === 'match' && (
                            <span style={{ fontFamily:'DM Mono, monospace',fontSize:7,color:'#e8553a',letterSpacing:'0.1em' }}>🤝 Connected</span>
                          )}
                        </div>
                      </div>
                      {!n.read && <div className="nav-notif-dot" />}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="nav-avatar" onClick={() => router.push('/passport')} title={user.username}>
            {user.avatar_url
              ? <img src={user.avatar_url} alt="avatar" />
              : (user.username?.[0] || '?').toUpperCase()}
          </div>
          <button className="nav-signout" onClick={signOut}>out</button>
        </div>

        <div className="nav-pill-wrapper">
          <div className="nav-pill">
            {NAV_ITEMS.map((item, i) => (
              <>
                {i === 5 && <div key="sep1" className="nav-sep" />}
                {i === NAV_ITEMS.length - 1 && <div key="sep2" className="nav-sep" />}
                <div
                  key={item.href}
                  className={`nav-item${pathname === item.href ? ' active' : ''}${item.external ? ' store' : ''}`}
                  onClick={() => handleNav(item)}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  {item.label}
                </div>
              </>
            ))}
            <div className="nav-sep" />
            <button className="nav-upgrade">↑ Pro</button>
          </div>
        </div>
      </div>
    </>
  );
}
