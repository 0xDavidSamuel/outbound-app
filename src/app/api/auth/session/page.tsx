// src/app/auth/session/page.tsx
// Supabase redirects here after magic link verification with tokens in the URL hash
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function SessionPage() {
  const [status, setStatus] = useState('Setting up your session...');

  useEffect(() => {
    const handle = async () => {
      const supabase = createClient();

      // Supabase puts tokens in the hash: #access_token=...&refresh_token=...
      // getSession() will automatically exchange the hash for a session
      // but we need to wait for onAuthStateChange to fire
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Session already set — check if new user
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();

        const isNewUser = !profile?.username;
        setStatus('Welcome!');
        window.location.href = isNewUser ? '/onboarding' : '/passport';
        return;
      }

      // Wait for Supabase to process the hash fragment
      setStatus('Verifying...');
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        subscription.unsubscribe();
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', session.user.id)
            .single();

          const isNewUser = !profile?.username;
          setStatus('Welcome!');
          window.location.href = isNewUser ? '/onboarding' : '/passport';
        } else {
          setStatus('Session failed — returning home...');
          setTimeout(() => window.location.href = '/', 2000);
        }
      });

      // Timeout fallback
      setTimeout(() => {
        subscription.unsubscribe();
        setStatus('Timed out — returning home...');
        setTimeout(() => window.location.href = '/', 1500);
      }, 8000);
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
