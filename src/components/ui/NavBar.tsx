'use client';

import { Profile } from '@/types';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut, User, Map } from 'lucide-react';

interface Props {
  currentUser: Profile | null;
}

export default function NavBar({ currentUser }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav style={{
      height: 56,
      borderBottom: '1px solid #1e1e1e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      background: '#0a0a0a',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#e8ff47' }} />
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: '#fff', letterSpacing: '0.1em' }}>
          outbound
        </span>
      </div>

      {/* Nav items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <NavBtn href="/map" icon={<Map size={14} />} label="Map" />
        <NavBtn href="/profile/setup" icon={<User size={14} />} label="Profile" />

        {currentUser?.avatar_url && (
          <img
            src={currentUser.avatar_url}
            alt=""
            style={{ width: 28, height: 28, borderRadius: '50%', marginLeft: 4, border: '1.5px solid #2a2a2a' }}
          />
        )}

        <button
          onClick={signOut}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: '1px solid #1e1e1e',
            color: '#666', cursor: 'pointer', padding: '5px 10px',
            borderRadius: 7, fontSize: 12, marginLeft: 4,
          }}
        >
          <LogOut size={13} />
        </button>
      </div>
    </nav>
  );
}

function NavBtn({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        color: '#888', textDecoration: 'none', padding: '5px 10px',
        borderRadius: 7, fontSize: 12,
        transition: 'color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
      onMouseLeave={e => (e.currentTarget.style.color = '#888')}
    >
      {icon} {label}
    </a>
  );
}
