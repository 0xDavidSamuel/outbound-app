// src/app/auth/session/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { saveSession } from '@/lib/session';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function SessionPage() {
  const [status, setStatus] = useState('Setting up your session...');

  useEffect(() => {
    (async () => {
      const hash   = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const at     = params.get('access_token');
      const rt     = params.get('refresh_token');

      if (!at || !rt) {
        setStatus('No tokens found — returning home...');
        setTimeout(() => window.location.href = '/', 2000);
        return;
      }

      const session = saveSession(at, rt);
      if (!session) {
        setStatus('Invalid token — returning home...');
        setTimeout(() => window.location.href = '/', 2000);
        return;
      }

      window.history.replaceState(null, '', '/auth/session');
      setStatus('Welcome to Outbound!');

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${session.user.id}&select=username`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${at}` } }
      );
      const rows = await res.json();
      const isNewUser = !rows?.[0]?.username;

      window.location.href = isNewUser ? '/onboarding' : '/passport';
    })();
  }, []);

  return (
    <div style={{
      height: '100vh', background: '#080808',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
    }}>
      <div style={{
        width: 36, height: 36,
        border: '2px solid #1a1a1a', borderTop: '2px solid #e8553a',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{
        fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#333',
        letterSpacing: '0.2em', textTransform: 'uppercase',
      }}>{status}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
