// src/app/auth/session/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function SessionPage() {
  const [status, setStatus] = useState('Setting up your session...');

  useEffect(() => {
    const handle = async () => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken  = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const expiresAt    = params.get('expires_at');

      if (!accessToken || !refreshToken) {
        setStatus('No tokens found — returning home...');
        setTimeout(() => window.location.href = '/', 2000);
        return;
      }

      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const userId = payload.sub;

        // Check if new user via raw fetch — no Supabase client, no lock
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const profileRes = await fetch(
          `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=username`,
          { headers: { apikey: supabaseKey, Authorization: `Bearer ${accessToken}` } }
        );
        const profiles = await profileRes.json();
        const isNewUser = !profiles?.[0]?.username;

        setStatus('Welcome!');

        // Forward tokens to destination page via query params
        // The destination calls setSession immediately on load
        const dest = isNewUser ? '/onboarding' : '/passport';
        window.location.href = `${dest}?at=${encodeURIComponent(accessToken)}&rt=${encodeURIComponent(refreshToken)}&exp=${expiresAt || ''}`;

      } catch (err: any) {
        setStatus(`Error: ${err.message}`);
        setTimeout(() => window.location.href = '/', 2000);
      }
    };

    handle();
  }, []);

  return (
    <div style={{
      height: '100vh', background: '#080808',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
    }}>
      <div style={{
        width: 36, height: 36,
        border: '2px solid #1a1a1a', borderTop: '2px solid #e8ff47',
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
