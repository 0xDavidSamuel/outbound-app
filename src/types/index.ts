export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  skills: string[];
  github_url: string | null;
  website_url: string | null;
  lat: number | null;
  lng: number | null;
  city: string | null;
  is_visible: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  lat: number;
  lng: number;
  location_name: string;
  date: string;
  attendee_count: number;
  tags: string[];
  created_at: string;
  host?: Profile;
}

export type MapPin =
  | { type: 'developer'; data: Profile }
  | { type: 'event'; data: Event };
