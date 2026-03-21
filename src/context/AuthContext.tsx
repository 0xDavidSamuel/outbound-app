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
    (async () => {
      const session = await getSession();
      if (session) {
        await loadProfile(session.access_token, session.user.id);
      }
      setBooting(false);
    })();
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
    const timeout = setTimeout(() => setLoading(false), 30000);
    try {
      const { createWeb3Auth, getWalletAddress } = await import('@/lib/web3auth');
      const web3auth = await createWeb3Auth();

      // If stale connected instance from previous session, disconnect first
      if (web3auth.connected) {
        try { await web3auth.logout(); } catch {}
      }

      await web3auth.connect();

      // v10 popup mode — connect() resolves here, handle post-login directly
      if (!web3auth.connected) {
        setLoading(false);
        clearTimeout(timeout);
        return;
      }

      const [userInfo, walletAddress] = await Promise.all([
        web3auth.getUserInfo(),
        getWalletAddress(web3auth),
      ]);

      const idToken = (userInfo as any).idToken ?? '';
      if (!walletAddress) throw new Error('No wallet address');

      // Create/find Supabase user via our API
      const res = await fetch('/api/auth/web3auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, walletAddress, userInfo }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Auth failed');
      if (!data.actionLink) throw new Error('No action link returned');

      clearTimeout(timeout);
      // Redirect to Supabase magic link — sets session then goes to /auth/session → /passport or /onboarding
      window.location.href = data.actionLink;

    } catch (err: any) {
      clearTimeout(timeout);
      const msg = err?.message || '';
      if (
        msg.includes('redirect') ||
        msg.includes('user closed') ||
        msg.includes('Modal is already open') ||
        msg.includes('User closed the modal') ||
        msg.includes('user_cancelled')
      ) {
        setLoading(false);
        return;
      }
      console.error('[login error]', msg);
      setLoading(false);
    }
  };

  const logout = () => {
    clearSession();
    setUser(null);
    // Disconnect Web3Auth cleanly so next login starts fresh
    import('@/lib/web3auth').then(({ createWeb3Auth }) => {
      createWeb3Auth()
        .then(w => { if (w.connected) return w.logout(); })
        .catch(() => {});
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
