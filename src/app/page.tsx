'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const signInWithGitHub = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: '#0a0a0a' }}>

      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(232,255,71,0.06) 0%, transparent 70%)' }} />

      <div className="relative z-10 flex flex-col items-center gap-10 fade-up px-6 text-center max-w-lg">

        {/* Wordmark */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: '#e8ff47' }} />
            <span className="text-xs tracking-[0.3em] uppercase font-mono"
              style={{ color: '#666' }}>outbound</span>
          </div>
          <h1 className="text-5xl font-semibold tracking-tight leading-none" style={{ color: '#fff' }}>
            Find the builders<br />
            <span style={{ color: '#e8ff47' }}>in your city.</span>
          </h1>
        </div>

        <p style={{ color: '#666', lineHeight: 1.7, fontSize: '0.95rem' }}>
          A passive map for developers. Drop your pin, discover who's building near you,
          find local events — no feed, no noise.
        </p>

        <button
          onClick={signInWithGitHub}
          disabled={loading}
          className="flex items-center gap-3 px-6 py-3.5 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
          style={{ background: '#e8ff47', color: '#0a0a0a' }}>
          <GitHubIcon />
          {loading ? 'Redirecting...' : 'Continue with GitHub'}
        </button>

        <p className="text-xs" style={{ color: '#444' }}>
          Your location is only shared with your consent.
        </p>
      </div>
    </main>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
