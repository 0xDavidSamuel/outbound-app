'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const [status, setStatus] = useState('signing you in...');
  const router = useRouter();

  useEffect(() => {
    const handle = async () => {
      const supabase = createClient();

      // Wait a tick for session to settle
      await new Promise(r => setTimeout(r, 500));

      const { data: { session } } = await supabase.auth.getSession();
      setStatus(`session: ${!!session}`);

      if (!session) {
        router.push('/');
        return;
      }

      const user = session.user;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        await supabase.from('profiles').insert({
          id: user.id,
          username: user.user_metadata?.user_name || user.email?.split('@')[0] || 'dev',
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          skills: [],
          is_visible: true,
        });
        router.push('/profile/setup');
      } else {
        router.push('/passport');
      }
    };

    handle();
  }, []);

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0a0a0a', color: '#e8ff47',
      fontFamily: 'DM Mono, monospace', fontSize: 13
    }}>
      {status}
    </div>
  );
}