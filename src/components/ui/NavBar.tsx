'use client';

import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const NAV_ITEMS = [
  { label: 'Map', href: '/map' },
  { label: 'Feed', href: '/feed' },
  { label: 'Community', href: '/community' },
  { label: 'Cities', href: '/cities' },
  { label: 'Events', href: '/events' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Tools', href: '/tools' },
];

export default function NavBar({ user }: { user: { avatar_url?: string; username?: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <>
      <style suppressHydrationWarning>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 48px;
          background: rgba(8,8,8,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #111;
          display: flex;
          align-items: center;
          padding: 0 32px;
          gap: 0;
          z-index: 200;
        }

        .navbar-wordmark {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.35em;
          color: #e8ff47;
          text-transform: uppercase;
          margin-right: 40px;
          flex-shrink: 0;
        }

        .navbar-nav {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
          list-style: none;
        }

        .navbar-link {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          color: #444;
          text-transform: uppercase;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: color 0.2s, background 0.2s;
          white-space: nowrap;
        }

        .navbar-link:hover { color: #888; }
        .navbar-link.active { color: #e8ff47; background: rgba(232,255,71,0.06); }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-left: auto;
        }

        .navbar-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid #222;
          background: #111;
          cursor: pointer;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: #444;
          transition: border-color 0.2s;
          flex-shrink: 0;
        }

        .navbar-avatar:hover { border-color: #e8ff47; }
        .navbar-avatar img { width: 100%; height: 100%; object-fit: cover; }

        .navbar-signout {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.15em;
          color: #2a2a2a;
          text-transform: uppercase;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
          padding: 6px 8px;
        }
        .navbar-signout:hover { color: #555; }

        .navbar-upgrade {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.15em;
          color: #e8ff47;
          text-transform: uppercase;
          background: rgba(232,255,71,0.08);
          border: 1px solid rgba(232,255,71,0.2);
          padding: 5px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .navbar-upgrade:hover { background: rgba(232,255,71,0.14); }
      `}</style>

      <nav className="navbar">
        <span className="navbar-wordmark">outbound</span>
        <ul className="navbar-nav">
          {NAV_ITEMS.map(item => (
            <li key={item.label}>
              <span
                className={`navbar-link${pathname === item.href ? ' active' : ''}`}
                onClick={() => router.push(item.href)}
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
        <div className="navbar-right">
          <button className="navbar-upgrade">Upgrade</button>
          <div
            className="navbar-avatar"
            onClick={() => router.push('/profile/setup')}
            title={user.username || 'Profile'}
          >
            {user.avatar_url
              ? <img src={user.avatar_url} alt="avatar" />
              : (user.username?.[0] || '?').toUpperCase()
            }
          </div>
          <button className="navbar-signout" onClick={signOut}>Sign out</button>
        </div>
      </nav>
    </>
  );
}
