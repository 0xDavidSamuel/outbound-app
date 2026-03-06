// src/app/auth/callback/page.tsx
// Web3Auth redirects back here after Google login completes
'use client';

import { useEffect, useState } from 'react';

export default function AuthCallback() {
  const [status, setStatus] = useState('Completing login...');

  useEffect(() => {
    const finish = async () => {
      try {
        const { createWeb3Auth, getWalletAddress } = await import('@/lib/web3auth');

        // Re-init Web3Auth — it automatically picks up the redirect result
        const web3auth = await createWeb3Auth();

        if (!web3auth.connected) {
          setStatus('Not connected — redirecting...');
          setTimeout(() => window.location.href = '/', 2000);
          return;
        }

        const [userInfo, walletAddress] = await Promise.all([
          web3auth.getUserInfo(),
          getWalletAddress(web3auth),
        ]);

        const idToken = (userInfo as any).idToken ?? '';
        if (!walletAddress) throw new Error('No wallet address');

        setStatus('Creating your passport...');

        const res = await fetch('/api/auth/web3auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken, walletAddress, userInfo }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Auth failed');

        // Exchange for Supabase session
        if (data.tokenHash) {
          const { createClient } = await import('@/lib/supabase');
          const supabase = createClient();
          const { error } = await supabase.auth.verifyOtp({
            token_hash: data.tokenHash,
            type: 'magiclink',
          });
          if (error) throw error;
        }

        setStatus('Welcome to Outbound!');
        window.location.href = data.isNewUser ? '/onboarding' : '/passport';

      } catch (err: any) {
        console.error('[callback]', err);
        setStatus(`Error: ${err.message} — redirecting...`);
        setTimeout(() => window.location.href = '/', 3000);
      }
    };

    finish();
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
        maxWidth: 320,
        textAlign: 'center',
      }}>
        {status}
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
