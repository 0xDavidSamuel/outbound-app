# Outbound

Passive developer discovery, map-first. Find builders in your city.

## Setup (15 min)

### 1. Install deps
```bash
npm install
```

### 2. Supabase
1. Create project at https://supabase.com
2. Go to SQL Editor → paste and run `SCHEMA.sql`
3. Go to Authentication → Providers → enable **GitHub**
   - Create a GitHub OAuth App at https://github.com/settings/developers
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

### 3. Mapbox
1. Create account at https://mapbox.com
2. Copy your **public** access token

### 4. Environment
```bash
cp .env.local.example .env.local
```

Fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
```

### 5. Run
```bash
npm run dev
```

Open http://localhost:3000

## Flow
1. **/** — Landing + GitHub login
2. **/auth/callback** — Handled automatically
3. **/profile/setup** — First-time onboarding (name, bio, skills, location)
4. **/map** — The map. See devs and events, click pins for popups.

## Stack
- Next.js 14 (App Router)
- Supabase (auth + postgres + RLS)
- Mapbox GL + react-map-gl
- Tailwind CSS
