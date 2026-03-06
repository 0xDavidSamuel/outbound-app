// src/app/auth/session/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function SessionPage() {
  const [status, setStatus] = useState('Setting up your session...');

  useEffect(() => {
    const handle = async () => {
      // Parse tokens from URL hash
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken  = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (!accessToken || !refreshToken) {
        setStatus('No tokens found — returning home...');
        setTimeout(() => window.location.href = '/', 2000);
        return;
      }

      setStatus('Verifying...');

      // Dynamically import to avoid multiple instances from SSR
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { session }, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error || !session) {
        setStatus(`Failed: ${error?.message || 'no session'}`);
        setTimeout(() => window.location.href = '/', 2000);
        return;
      }

      setStatus('Welcome!');

      // Use maybeSingle to avoid 406 when profile row doesn't exist yet
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .maybeSingle();

      // Clear the hash before navigating so tokens don't linger in history
      window.history.replaceState(null, '', window.location.pathname);

      const isNewUser = !profile?.username;
      window.location.href = isNewUser ? '/onboarding' : '/passport';
    };

    handle();
  }, []);

  return (
    <div style={{
      height: '100vh',
      background: '#080808',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
    }}>
      <div style={{
        width: 36, height: 36,
        border: '2px solid #1a1a1a',
        borderTop: '2px solid #e8ff47',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: 11,
        color: '#333',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
      }}>
        {status}
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
