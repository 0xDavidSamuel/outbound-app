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

  // Login — init Web3Auth and trigger redirect (no popup)
  const login = async () => {
    setLoading(true);
    try {
      const { createWeb3Auth } = await import('@/lib/web3auth');
      const web3auth = await createWeb3Auth();
      // This redirects the entire page to Web3Auth's hosted login
      // then comes back to /auth/callback when done
      await web3auth.connect();
    } catch (err: any) {
      // REDIRECT_RESULT errors are expected on initial load, ignore them
      if (!err?.message?.includes('redirect')) {
        console.error('[login]', err);
      }
      setLoading(false);
    }
  };

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
