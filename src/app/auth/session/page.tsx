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
      const expiresIn    = params.get('expires_in');

      if (!accessToken || !refreshToken) {
        setStatus('No tokens found — returning home...');
        setTimeout(() => window.location.href = '/', 2000);
        return;
      }

      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const now = new Date().toISOString();

        // Full user object matching what Supabase expects
        const sessionObj = {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: expiresAt ? parseInt(expiresAt) : Math.floor(Date.now() / 1000) + 3600,
          expires_in: expiresIn ? parseInt(expiresIn) : 3600,
          token_type: 'bearer',
          user: {
            id: payload.sub,
            aud: payload.aud || 'authenticated',
            role: payload.role || 'authenticated',
            email: payload.email || '',
            email_confirmed_at: now,
            phone: payload.phone || '',
            confirmed_at: now,
            last_sign_in_at: now,
            created_at: now,
            updated_at: now,
            is_anonymous: false,
            app_metadata: payload.app_metadata || { provider: 'email', providers: ['email'] },
            user_metadata: payload.user_metadata || {},
            identities: [],
            factors: [],
          },
        };

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const projectRef  = supabaseUrl.replace('https://', '').split('.')[0];
        const storageKey  = `sb-${projectRef}-auth-token`;

        localStorage.setItem(storageKey, JSON.stringify(sessionObj));
        window.history.replaceState(null, '', window.location.pathname);

        setStatus('Welcome!');

        // Check profiles table to determine new vs returning
        // Use fetch directly — no Supabase client, avoids lock conflicts
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const profileRes = await fetch(
          `${supabaseUrl}/rest/v1/profiles?id=eq.${payload.sub}&select=username`,
          {
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );
        const profiles = await profileRes.json();
        const isNewUser = !profiles?.[0]?.username;

        window.location.href = isNewUser ? '/onboarding' : '/passport';

      } catch (err: any) {
        setStatus(`Error: ${err.message}`);
        setTimeout(() => window.location.href = '/', 2000);
      }
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
