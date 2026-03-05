'use client';

import { Event } from '@/types';
import { X, MapPin, Calendar, Users } from 'lucide-react';

interface Props {
  event: Event;
  onClose: () => void;
}

export default function EventPopup({ event, onClose }: Props) {
  const date = new Date(event.date);
  const formatted = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  return (
    <div style={{ width: 280, padding: 16, fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{
          background: '#e8ff47', color: '#0a0a0a', fontSize: 10,
          fontWeight: 600, padding: '3px 8px', borderRadius: 5,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          fontFamily: 'DM Mono, monospace',
        }}>
          Event
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 2 }}>
          <X size={14} />
        </button>
      </div>

      <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 15, marginBottom: 10, lineHeight: 1.3 }}>
        {event.title}
      </h3>

      {event.description && (
        <p style={{ color: '#999', fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>
          {event.description}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#888', fontSize: 12 }}>
          <Calendar size={12} style={{ color: '#e8ff47' }} />
          {formatted}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#888', fontSize: 12 }}>
          <MapPin size={12} style={{ color: '#e8ff47' }} />
          {event.location_name}
        </div>
        {event.attendee_count > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#888', fontSize: 12 }}>
            <Users size={12} style={{ color: '#e8ff47' }} />
            {event.attendee_count} attending
          </div>
        )}
      </div>

      {event.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {event.tags.map(tag => (
            <span key={tag} style={{
              background: '#1a1a1a', border: '1px solid #2a2a2a',
              color: '#ccc', fontSize: 11, padding: '3px 8px',
              borderRadius: 6, fontFamily: 'DM Mono, monospace',
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
