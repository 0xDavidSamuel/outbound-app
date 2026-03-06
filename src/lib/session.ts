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

export function getSession(): OutboundSession | null {
  const store = storage();
  if (!store) return null;
  try {
    const stored = store.getItem(SESSION_KEY);
    if (!stored) return null;
    const session: OutboundSession = JSON.parse(stored);
    if (session.expires_at < Math.floor(Date.now() / 1000) - 60) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  const store = storage();
  if (store) store.removeItem(SESSION_KEY);
}
