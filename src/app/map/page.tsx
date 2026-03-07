'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Profile, Event } from '@/types';
import NavBar from '@/components/ui/NavBar';
import { useRouter } from 'next/navigation';

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false });

export interface ExternalEvent {
  id: string;
  name: string;
  url: string;
  startDate: string;
  endDate?: string | null;
  city?: string;
  country?: string;
  location?: string;
  lat: number;
  lng: number;
  tags?: { key: string; value: string }[];
}

async function geocodeLocation(query: string, token: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?limit=1&access_token=${token}`
    );
    const data = await res.json();
    const feature = data?.features?.[0];
    if (!feature) return null;
    return { lng: feature.center[0], lat: feature.center[1] };
  } catch {
    return null;
  }
}

export default function MapPage() {
  const router = useRouter();
  const [developers, setDevelopers] = useState<Profile[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [externalEvents, setExternalEvents] = useState<ExternalEvent[]>([]);
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

      // Fetch external events and geocode them
      try {
        const res = await fetch('/api/events?q=all');
        const data = await res.json();
        const raw: any[] = data.events || [];
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

        // Only geocode events with a real city (not Online)
        const withLocation = raw.filter(e => e.city && e.city.toLowerCase() !== 'online');

        // Geocode in batches to avoid rate limits
        const geocoded: ExternalEvent[] = [];
        for (const e of withLocation.slice(0, 30)) {
          const query = e.location || `${e.city}, ${e.country}`;
          const coords = await geocodeLocation(query, token);
          if (coords) {
            geocoded.push({
              id: `ext-${e.name}-${e.startDate}`,
              name: e.name,
              url: e.url,
              startDate: e.startDate,
              endDate: e.endDate,
              city: e.city,
              country: e.country,
              location: e.location,
              tags: e.tags,
              ...coords,
            });
          }
        }
        setExternalEvents(geocoded);
      } catch (e) {
        console.error('Failed to load external events', e);
      }
    };

    load();
  }, []);

  return (
    <div className="h-screen flex flex-col" style={{ background: '#0a0a0a' }}>
      
      <div className="flex-1 relative">
        <MapView
          developers={developers}
          events={events}
          externalEvents={externalEvents}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}
