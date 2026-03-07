'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { getSession } from '@/lib/session';
import { Profile, Event } from '@/types';
import { useRouter } from 'next/navigation';

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

async function rawGet(path: string, token: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export default function MapPage() {
  const router = useRouter();
  const [developers, setDevelopers]       = useState<Profile[]>([]);
  const [events, setEvents]               = useState<Event[]>([]);
  const [externalEvents, setExternalEvents] = useState<ExternalEvent[]>([]);
  const [currentUser, setCurrentUser]     = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (!session) { router.push('/'); return; }

      const token = session.access_token;

      const [profileRows, devRows, evtRows] = await Promise.all([
        rawGet(`profiles?id=eq.${session.user.id}&select=*`, token),
        rawGet('profiles?is_visible=eq.true&lat=not.is.null&select=*', token),
        rawGet('events?select=*,host:profiles(*)&order=date.asc', token),
      ]);

      if (profileRows?.[0]) setCurrentUser(profileRows[0]);
      if (Array.isArray(devRows)) setDevelopers(devRows);
      if (Array.isArray(evtRows)) setEvents(evtRows as Event[]);

      // Fetch external events and geocode them
      try {
        const res = await fetch('/api/events?q=all');
        const data = await res.json();
        const raw: any[] = data.events || [];
        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
        const withLocation = raw.filter(e => e.city && e.city.toLowerCase() !== 'online');
        const geocoded: ExternalEvent[] = [];
        for (const e of withLocation.slice(0, 30)) {
          const query = e.location || `${e.city}, ${e.country}`;
          const coords = await geocodeLocation(query, mapboxToken);
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
    })();
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
