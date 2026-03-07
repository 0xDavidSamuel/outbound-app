// src/app/auth/callback/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function AuthCallback() {
  const [status, setStatus] = useState('Completing login...');

  useEffect(() => {
    const finish = async () => {
      try {
        const { createWeb3Auth, getWalletAddress } = await import('@/lib/web3auth');

        setStatus('Loading wallet...');
        const web3auth = await createWeb3Auth();

        if (!web3auth.connected) {
          setStatus('Not connected — returning home...');
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

        if (!data.actionLink) throw new Error('No action link returned');

        setStatus('Opening your passport...');

        // Redirect to Supabase magic link — it verifies the token,
        // sets the session in browser storage, then redirects to /onboarding or /passport
        window.location.href = data.actionLink;

      } catch (err: any) {
        console.error('[callback]', err);
        setStatus(`Error: ${err.message}`);
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
        borderTop: '2px solid #e8553a',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: 11,
        color: '#333',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        maxWidth: 340,
        textAlign: 'center',
        lineHeight: 1.8,
      }}>
        {status}
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
