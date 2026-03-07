// src/lib/session.ts
const SESSION_KEY = 'outbound-auth-session';

export interface OutboundSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: {
    id: string;
    email: string;
    user_metadata: Record<string, any>;
  };
}

function storage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

export function saveSession(token: string, refreshToken: string): OutboundSession | null {
  const store = storage();
  if (!store) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const session: OutboundSession = {
      access_token: token,
      refresh_token: refreshToken,
      expires_at: payload.exp || Math.floor(Date.now() / 1000) + 3600,
      user: {
        id: payload.sub,
        email: payload.email || '',
        user_metadata: payload.user_metadata || {},
      },
    };
    store.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<OutboundSession | null> {
  const store = storage();
  if (!store) return null;
  try {
    const stored = store.getItem(SESSION_KEY);
    if (!stored) return null;
    const session: OutboundSession = JSON.parse(stored);

    const now = Math.floor(Date.now() / 1000);

    // Only refresh if actually expired (not just near expiry)
    if (session.expires_at < now) {
      console.log('[session] token expired, attempting refresh...');
      return refreshSession(session.refresh_token);
    }

    return session;
  } catch {
    return null;
  }
}

async function refreshSession(refreshToken: string): Promise<OutboundSession | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    );
    if (!res.ok) {
      console.error('[session] refresh failed:', res.status);
      clearSession();
      return null;
    }
    const data = await res.json();
    console.log('[session] refreshed successfully');
    return saveSession(data.access_token, data.refresh_token);
  } catch (e) {
    console.error('[session] refresh error:', e);
    clearSession();
    return null;
  }
}

export function clearSession(): void {
  const store = storage();
  if (store) store.removeItem(SESSION_KEY);
}