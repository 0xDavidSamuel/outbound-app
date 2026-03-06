// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  walletAddress: string;
  username?: string;
  avatarUrl?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: false,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase              = createClient();

  // ── Restore Supabase session ───────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { session: existing } } = await supabase.auth.getSession();
      if (existing) {
        setSession(existing);
        await loadProfile(existing.user.id);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, sess) => {
      setSession(sess);
      if (sess) await loadProfile(sess.user.id);
      else setUser(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, wallet_address')
      .eq('id', userId)
      .single();

    if (profile) {
      setUser({
        id: profile.id,
        email: '',
        walletAddress: profile.wallet_address || '',
        username: profile.username,
        avatarUrl: profile.avatar_url,
      });
    }
  };

  // ── Login — init Web3Auth fresh on every click ─────────────────────────────
  const login = async () => {
    setLoading(true);
    try {
      // Dynamically import so it never runs on the server
      const { createWeb3Auth, getWalletAddress } = await import('@/lib/web3auth');

      // Fresh init every time — avoids stale/broken singleton
      const web3auth = await createWeb3Auth();

      // Open modal
      await web3auth.connect();

      // Get user info + wallet
      const [userInfo, walletAddress] = await Promise.all([
        web3auth.getUserInfo(),
        getWalletAddress(web3auth),
      ]);

      const idToken = (userInfo as any).idToken ?? '';

      if (!walletAddress) throw new Error('Could not get wallet address');

      // Bridge to Supabase
      const res = await fetch('/api/auth/web3auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, walletAddress, userInfo }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Auth bridge failed');

      // Exchange token for Supabase session
      if (data.tokenHash) {
        const { data: { session: newSession }, error } = await supabase.auth.verifyOtp({
          token_hash: data.tokenHash,
          type: 'magiclink',
        });
        if (error) throw error;
        if (newSession) {
          setSession(newSession);
          await loadProfile(newSession.user.id);
        }
      }

      window.location.href = data.isNewUser ? '/onboarding' : '/passport';

    } catch (err: any) {
      console.error('[login]', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      const { createWeb3Auth } = await import('@/lib/web3auth');
      const web3auth = await createWeb3Auth();
      if (web3auth.connected) await web3auth.logout();
    } catch {}
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
