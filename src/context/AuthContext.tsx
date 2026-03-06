// src/context/AuthContext.tsx
// Wraps Web3Auth + Supabase into one unified auth context for Outbound

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
  isNewUser?: boolean;
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
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // ── Restore existing session on mount ─────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (existingSession) {
        setSession(existingSession);
        await loadProfile(existingSession.user.id);
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, sess) => {
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

  // ── Login via Web3Auth ─────────────────────────────────────────────────────
  const login = async () => {
    setLoading(true);
    try {
      // Dynamically import Web3Auth (client-only)
      const { getWeb3Auth, getWalletAddress } = await import('@/lib/web3auth');
      const web3auth = await getWeb3Auth();

      // Open Web3Auth modal
      await web3auth.connect();

      // Get user info + wallet address
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

      // Exchange token hash for a real Supabase session
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

      // Redirect new users to onboarding
      if (data.isNewUser) {
        window.location.href = '/onboarding';
      } else {
        window.location.href = '/passport';
      }

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
      const { getWeb3Auth } = await import('@/lib/web3auth');
      const web3auth = await getWeb3Auth();
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
