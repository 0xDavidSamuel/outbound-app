'use client';

import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const NAV_ITEMS = [
  { label: 'Passport', href: '/passport', icon: '◉' },
  { label: 'Feed', href: '/feed', icon: '≡' },
  { label: 'Community', href: '/community', icon: '◈' },
  { label: 'Cities', href: '/cities', icon: '⬡' },
  { label: 'Tools', href: '/tools', icon: '⊞' },
  { label: 'Map', href: '/map', icon: '◎' },
  { label: 'Events', href: '/events', icon: '◇' },
  { label: 'Jobs', href: '/jobs', icon: '□' },
  { label: 'Store', href: 'https://outboundwear.com', icon: '◻', external: true },
];

export default function NavBar({ user }: { user: { avatar_url?: string; username?: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleNav = (item: { href: string; external?: boolean }) => {
    if (item.external) {
      window.open(item.href, '_blank');
    } else {
      router.push(item.href);
    }
  };

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');

        .nav-shell {
          position: fixed;
          bottom: 24px;
          left: 0;
          right: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          z-index: 500;
          pointer-events: none;
        }

        .nav-topbar {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(10,10,10,0.9);
          border: 1px solid #161616;
          border-radius: 40px;
          padding: 5px 14px 5px 16px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          pointer-events: all;
        }

        .nav-wordmark {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.35em;
          color: #e8ff47;
          text-transform: uppercase;
        }

        .nav-divider { width: 1px; height: 12px; background: #1a1a1a; }

        .nav-avatar {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1px solid #222;
          background: #111;
          cursor: pointer;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          color: #444;
          transition: border-color 0.2s;
          flex-shrink: 0;
        }
        .nav-avatar:hover { border-color: #e8ff47; }
        .nav-avatar img { width: 100%; height: 100%; object-fit: cover; }

        .nav-signout {
          font-family: 'DM Mono', monospace;
          font-size: 8px;
          letter-spacing: 0.15em;
          color: #2a2a2a;
          text-transform: uppercase;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
          padding: 0 2px;
        }
        .nav-signout:hover { color: #555; }

        .nav-pill-wrapper {
          width: 100%;
          max-width: 680px;
          padding: 0 16px;
          pointer-events: all;
        }

        .nav-pill {
          display: flex;
          align-items: center;
          gap: 2px;
          background: rgba(10,10,10,0.92);
          border: 1px solid #161616;
          border-radius: 40px;
          padding: 5px 6px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.7);
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .nav-pill::-webkit-scrollbar { display: none; }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 7px 12px;
          border-radius: 32px;
          cursor: pointer;
          transition: background 0.18s, color 0.18s;
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          color: #383838;
          text-transform: uppercase;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .nav-item:hover { color: #666; background: rgba(255,255,255,0.03); }
        .nav-item.active { color: #080808; background: #e8ff47; }
        .nav-item.store { color: #e8ff47; }
        .nav-item.store:hover { background: rgba(232,255,71,0.08); color: #e8ff47; }

        .nav-item-icon { font-size: 10px; line-height: 1; }

        .nav-sep {
          width: 1px;
          height: 14px;
          background: #141414;
          margin: 0 2px;
          flex-shrink: 0;
        }

        .nav-upgrade {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 7px 12px;
          border-radius: 32px;
          cursor: pointer;
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          color: #e8ff47;
          text-transform: uppercase;
          background: rgba(232,255,71,0.06);
          border: none;
          transition: background 0.18s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .nav-upgrade:hover { background: rgba(232,255,71,0.12); }
      `}</style>

      <div className="nav-shell">
        <div className="nav-topbar">
          <span className="nav-wordmark">outbound</span>
          <div className="nav-divider" />
          <div className="nav-avatar" onClick={() => router.push('/passport')} title={user.username}>
            {user.avatar_url
              ? <img src={user.avatar_url} alt="avatar" />
              : (user.username?.[0] || '?').toUpperCase()
            }
          </div>
          <button className="nav-signout" onClick={signOut}>out</button>
        </div>

        <div className="nav-pill-wrapper">
          <div className="nav-pill">
            {NAV_ITEMS.map((item, i) => (
              <>
                {i === 4 && <div key="sep1" className="nav-sep" />}
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
