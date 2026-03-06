// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSession, clearSession } from '@/lib/session';

interface AuthUser {
  id: string;
  email: string;
  walletAddress: string;
  username?: string;
  avatarUrl?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    // On load, check for existing session and load profile
    const session = getSession();
    if (session) {
      loadProfile(session.access_token, session.user.id).finally(() => setBooting(false));
    } else {
      setBooting(false);
    }
  }, []);

  const loadProfile = async (token: string, uid: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${uid}&select=id,username,avatar_url,wallet_address`,
        { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, Authorization: `Bearer ${token}` } }
      );
      const rows = await res.json();
      const profile = rows?.[0];
      if (profile) {
        setUser({
          id: profile.id,
          email: '',
          walletAddress: profile.wallet_address || '',
          username: profile.username,
          avatarUrl: profile.avatar_url,
        });
      }
    } catch {}
  };

  const login = async () => {
  setLoading(true);
  try {
    const { createWeb3Auth } = await import('@/lib/web3auth');
    const web3auth = await createWeb3Auth();
    await web3auth.connect();
  } catch (err: any) {
    const msg = err?.message || '';
    if (msg.includes('redirect') || msg.includes('user closed') || msg.includes('Modal is already open')) {
      return;
    }
    console.error('[login error]', msg);
    setLoading(false);
  }
};

  const logout = () => {
    clearSession();
    setUser(null);
    // Also disconnect Web3Auth if connected
    import('@/lib/web3auth').then(({ createWeb3Auth }) => {
      createWeb3Auth().then(w => { if (w.connected) w.logout(); }).catch(() => {});
    });
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading: loading || booting, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
