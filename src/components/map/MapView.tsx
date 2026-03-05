'use client';

import { useRef, useState, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import { Profile, Event } from '@/types';
import { ExternalEvent } from '@/app/map/page';
import DevPopup from './DevPopup';
import EventPopup from './EventPopup';

interface Props {
  developers: Profile[];
  events: Event[];
  externalEvents: ExternalEvent[];
  currentUser: Profile | null;
}

export default function MapView({ developers, events, externalEvents, currentUser }: Props) {
  const [selectedDev, setSelectedDev] = useState<Profile | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedExternal, setSelectedExternal] = useState<ExternalEvent | null>(null);
  const [viewport, setViewport] = useState({
    longitude: currentUser?.lng ?? -118.2437,
    latitude: currentUser?.lat ?? 34.0522,
    zoom: 11,
  });

  const closePopups = useCallback(() => {
    setSelectedDev(null);
    setSelectedEvent(null);
    setSelectedExternal(null);
  }, []);

  return (
    <Map
      {...viewport}
      onMove={e => setViewport(e.viewState)}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      onClick={closePopups}
    >
      <NavigationControl position="bottom-right" showCompass={false} />

      {/* Developer pins */}
      {developers.map(dev => (
        dev.lat && dev.lng ? (
          <Marker
            key={dev.id}
            longitude={dev.lng}
            latitude={dev.lat}
            anchor="center"
            onClick={e => { e.originalEvent.stopPropagation(); setSelectedDev(dev); setSelectedEvent(null); setSelectedExternal(null); }}
          >
            <DevMarker avatar={dev.avatar_url} isCurrentUser={dev.id === currentUser?.id} />
          </Marker>
        ) : null
      ))}

      {/* Supabase event pins */}
      {events.map(event => (
        <Marker
          key={event.id}
          longitude={event.lng}
          latitude={event.lat}
          anchor="center"
          onClick={e => { e.originalEvent.stopPropagation(); setSelectedEvent(event); setSelectedDev(null); setSelectedExternal(null); }}
        >
          <EventMarker type="local" />
        </Marker>
      ))}

      {/* External event pins */}
      {externalEvents.map(event => (
        <Marker
          key={event.id}
          longitude={event.lng}
          latitude={event.lat}
          anchor="center"
          onClick={e => { e.originalEvent.stopPropagation(); setSelectedExternal(event); setSelectedDev(null); setSelectedEvent(null); }}
        >
          <EventMarker type="external" />
        </Marker>
      ))}

      {/* Dev popup */}
      {selectedDev && selectedDev.lat && selectedDev.lng && (
        <Popup
          longitude={selectedDev.lng}
          latitude={selectedDev.lat}
          anchor="bottom"
          onClose={closePopups}
          closeButton={false}
          offset={20}
        >
          <DevPopup profile={selectedDev} onClose={closePopups} />
        </Popup>
      )}

      {/* Supabase event popup */}
      {selectedEvent && (
        <Popup
          longitude={selectedEvent.lng}
          latitude={selectedEvent.lat}
          anchor="bottom"
          onClose={closePopups}
          closeButton={false}
          offset={20}
        >
          <EventPopup event={selectedEvent} onClose={closePopups} />
        </Popup>
      )}

      {/* External event popup */}
      {selectedExternal && (
        <Popup
          longitude={selectedExternal.lng}
          latitude={selectedExternal.lat}
          anchor="bottom"
          onClose={closePopups}
          closeButton={false}
          offset={20}
        >
          <ExternalEventPopup event={selectedExternal} onClose={closePopups} />
        </Popup>
      )}
    </Map>
  );
}

function DevMarker({ avatar, isCurrentUser }: { avatar: string | null; isCurrentUser: boolean }) {
  return (
    <div
      className="relative cursor-pointer transition-transform duration-150 hover:scale-110"
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: `2.5px solid ${isCurrentUser ? '#e8ff47' : '#fff'}`,
        overflow: 'hidden',
        boxShadow: isCurrentUser
          ? '0 0 0 3px rgba(232,255,71,0.25), 0 4px 16px rgba(0,0,0,0.5)'
          : '0 4px 16px rgba(0,0,0,0.5)',
        background: '#1e1e1e',
      }}
    >
      {avatar ? (
        <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
          👤
        </div>
      )}
    </div>
  );
}

function EventMarker({ type }: { type: 'local' | 'external' }) {
  const isExternal = type === 'external';
  return (
    <div
      className="cursor-pointer transition-transform duration-150 hover:scale-110 flex items-center justify-center"
      style={{
        width: isExternal ? 32 : 36,
        height: isExternal ? 32 : 36,
        borderRadius: isExternal ? '50%' : 10,
        background: isExternal ? '#080808' : '#e8ff47',
        border: isExternal ? '2px solid #e8ff47' : 'none',
        boxShadow: isExternal
          ? '0 0 0 2px rgba(232,255,71,0.15), 0 4px 16px rgba(0,0,0,0.5)'
          : '0 0 0 3px rgba(232,255,71,0.2), 0 4px 16px rgba(0,0,0,0.5)',
        fontSize: isExternal ? 14 : 16,
      }}
    >
      {isExternal ? '◇' : '⚡'}
    </div>
  );
}

function ExternalEventPopup({ event, onClose }: { event: ExternalEvent; onClose: () => void }) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{
      background: '#0d0d0d',
      border: '1px solid #1a1a1a',
      borderRadius: 12,
      padding: 16,
      minWidth: 220,
      maxWidth: 280,
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: 8,
          letterSpacing: '0.3em',
          color: '#e8ff47',
          textTransform: 'uppercase',
        }}>
          {formatDate(event.startDate)}
          {event.endDate && event.endDate !== event.startDate ? ` — ${formatDate(event.endDate)}` : ''}
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
      </div>

      <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', lineHeight: 1.4, marginBottom: 8 }}>
        {event.name}
      </div>

      {event.city && event.city.toLowerCase() !== 'online' && (
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#444', marginBottom: 12 }}>
          📍 {event.city}{event.country ? `, ${event.country}` : ''}
        </div>
      )}

      {event.tags && event.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
          {event.tags.slice(0, 3).map((tag, i) => (
            <span key={i} style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 8,
              color: '#333',
              background: '#111',
              border: '1px solid #1a1a1a',
              padding: '2px 6px',
              borderRadius: 3,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              {typeof tag === 'string' ? tag : tag.value}
            </span>
          ))}
        </div>
      )}

      <a
        href={event.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          fontFamily: 'DM Mono, monospace',
          fontSize: 9,
          letterSpacing: '0.15em',
          color: '#e8ff47',
          textTransform: 'uppercase',
          textDecoration: 'none',
        }}
      >
        View event →
      </a>
    </div>
  );
}
