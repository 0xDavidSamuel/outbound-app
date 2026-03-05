'use client';

import { useRef, useState, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import { Profile, Event } from '@/types';
import DevPopup from './DevPopup';
import EventPopup from './EventPopup';

interface Props {
  developers: Profile[];
  events: Event[];
  currentUser: Profile | null;
}

export default function MapView({ developers, events, currentUser }: Props) {
  const [selectedDev, setSelectedDev] = useState<Profile | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewport, setViewport] = useState({
    longitude: currentUser?.lng ?? -118.2437,
    latitude: currentUser?.lat ?? 34.0522,
    zoom: 11,
  });

  const closePopups = useCallback(() => {
    setSelectedDev(null);
    setSelectedEvent(null);
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
            onClick={e => { e.originalEvent.stopPropagation(); setSelectedDev(dev); setSelectedEvent(null); }}
          >
            <DevMarker
              avatar={dev.avatar_url}
              isCurrentUser={dev.id === currentUser?.id}
            />
          </Marker>
        ) : null
      ))}

      {/* Event pins */}
      {events.map(event => (
        <Marker
          key={event.id}
          longitude={event.lng}
          latitude={event.lat}
          anchor="center"
          onClick={e => { e.originalEvent.stopPropagation(); setSelectedEvent(event); setSelectedDev(null); }}
        >
          <EventMarker />
        </Marker>
      ))}

      {/* Popups */}
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

function EventMarker() {
  return (
    <div
      className="cursor-pointer transition-transform duration-150 hover:scale-110 flex items-center justify-center"
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: '#e8ff47',
        boxShadow: '0 0 0 3px rgba(232,255,71,0.2), 0 4px 16px rgba(0,0,0,0.5)',
        fontSize: 16,
      }}
    >
      ⚡
    </div>
  );
}
