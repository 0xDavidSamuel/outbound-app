'use client';

import { Profile } from '@/types';
import { X, Github, Globe, MapPin } from 'lucide-react';

interface Props {
  profile: Profile;
  onClose: () => void;
}

export default function DevPopup({ profile, onClose }: Props) {
  return (
    <div style={{ width: 280, padding: 16, fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #1e1e1e' }}
            />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              👤
            </div>
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>
              {profile.full_name || profile.username}
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>@{profile.username}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 2 }}>
          <X size={14} />
        </button>
      </div>

      {profile.city && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#666', fontSize: 12, marginBottom: 8 }}>
          <MapPin size={11} />
          {profile.city}
        </div>
      )}

      {profile.bio && (
        <p style={{ color: '#999', fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>
          {profile.bio}
        </p>
      )}

      {profile.skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
          {profile.skills.slice(0, 5).map(skill => (
            <span key={skill} style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              color: '#ccc',
              fontSize: 11,
              padding: '3px 8px',
              borderRadius: 6,
              fontFamily: 'DM Mono, monospace',
            }}>
              {skill}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        {profile.github_url && (
          <a
            href={profile.github_url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: '#1a1a1a', border: '1px solid #2a2a2a',
              color: '#ccc', fontSize: 12, padding: '6px 10px',
              borderRadius: 8, textDecoration: 'none',
            }}
          >
            <Github size={13} /> GitHub
          </a>
        )}
        {profile.website_url && (
          <a
            href={profile.website_url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: '#1a1a1a', border: '1px solid #2a2a2a',
              color: '#ccc', fontSize: 12, padding: '6px 10px',
              borderRadius: 8, textDecoration: 'none',
            }}
          >
            <Globe size={13} /> Site
          </a>
        )}
      </div>
    </div>
  );
}
