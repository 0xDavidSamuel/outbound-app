'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Profile, Event } from '@/types';
import NavBar from '@/components/ui/NavBar';
import { useRouter } from 'next/navigation';

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false });

export default function MapPage() {
  const router = useRouter();
  const [developers, setDevelopers] = useState<Profile[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }

      const [{ data: profile }, { data: devs }, { data: evts }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('profiles').select('*').eq('is_visible', true).not('lat', 'is', null),
        supabase.from('events').select('*, host:profiles(*)').order('date', { ascending: true }),
      ]);

      if (profile) setCurrentUser(profile);
      if (devs) setDevelopers(devs);
      if (evts) setEvents(evts as Event[]);
    };
    load();
  }, []);

  return (
    <div className="h-screen flex flex-col" style={{ background: '#0a0a0a' }}>
      <NavBar currentUser={currentUser} />
      <div className="flex-1 relative">
        <MapView developers={developers} events={events} currentUser={currentUser} />
      </div>
    </div>
  );
}