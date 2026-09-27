# Movies Hub

Next.js + TypeScript + Tailwind rebuild of [ashish-lgtm/movies-hub](https://github.com/ashish-lgtm/movies-hub), with Supabase auth and personal library features.

## Features

- Trending, discover movies/series, search
- Content modal with cast + trailer
- Google sign-in + profile onboarding (name, DOB/age, optional phone)
- Watchlist and mark-as-watched
- Profile page for to-watch and watched lists

## Setup

### 1. Environment

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_key
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_key
```

Use the **project root URL** only (no `/rest/v1/`).

### 2. Database

In the Supabase SQL Editor, run these in order:

1. `supabase/schema.sql` (watchlist / watched)
2. `supabase/profiles.sql` (name, DOB, phone)

### 3. Auth: Google

1. Open Auth Providers → **Google** → enable
2. Create an OAuth **Web** client in Google Cloud Console
3. Authorized JavaScript origin: `http://localhost:3000`
4. Authorized redirect URI: Supabase callback  
   (`https://<project-ref>.supabase.co/auth/v1/callback`)
5. Paste Client ID + Client Secret into Supabase and save

### 4. Auth URLs

- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

### 5. Run

```bash
npm install
npm run dev
```

## Usage

1. Sign in with Google
2. Complete profile (name, date of birth → age, optional phone)
3. Save titles to watchlist / watched
4. Open the single Profile icon for your details and lists
