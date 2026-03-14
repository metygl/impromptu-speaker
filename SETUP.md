# Setup Checklist

This file tracks the current shared-demo setup status for the app.

Current state:
- Localhost auth setup is in place
- Google sign-in works locally
- Production/domain setup is not done yet
- Public email magic links are not set up yet

## Completed So Far

### Supabase Project

- [x] Created a Supabase project
- [x] Located the project URL
- [x] Located the client-safe Supabase key (`anon` / publishable key)
- [x] Created local env file support in the app with [.env.example](/Users/metygl/Projects/PlanProject/impromptu-speaker/.env.example)
- [x] Created and filled local env vars in `.env.local`
- [x] Corrected `NEXT_PUBLIC_SUPABASE_URL` to use the HTTPS project URL, not the Postgres connection string

Expected local env values:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
OPENAI_API_KEY=...
OPENAI_EVAL_MODEL=...
DAILY_ANALYSIS_LIMIT=3
MAX_TRANSCRIPT_CHARS=12000
```

### Supabase Database

- [x] Opened Supabase SQL Editor
- [x] Ran the schema in [supabase/schema.sql](/Users/metygl/Projects/PlanProject/impromptu-speaker/supabase/schema.sql)
- [x] Created `speech_feedback`
- [x] Created `analysis_attempts`
- [x] Created `reserve_analysis_attempt(...)`
- [x] Enabled row-level security and created the app policies in the schema

### Supabase Auth Configuration

- [x] Set `Site URL` to `http://localhost:3000`
- [x] Added localhost redirect URL for `http://localhost:3000/auth/callback`
- [x] Added localhost wildcard redirect URL for `http://localhost:3000/**`

Current local-only auth URLs:

```text
Site URL:
http://localhost:3000

Redirect URLs:
http://localhost:3000/auth/callback
http://localhost:3000/**
```

### Google OAuth

- [x] Created or selected a Google Cloud project
- [x] Opened Google Auth Platform
- [x] Set Audience to `External`
- [x] Created a `Web application` OAuth client
- [x] Added `http://localhost:3000` to Authorized JavaScript origins
- [x] Built the Supabase callback URL from the project ref
- [x] Added the Supabase callback URL to Authorized redirect URIs
- [x] Copied Google `Client ID`
- [x] Copied Google `Client Secret`
- [x] Enabled Google provider in Supabase
- [x] Pasted Google credentials into Supabase
- [x] Successfully signed in locally with Google

Google OAuth values used locally:

```text
Authorized JavaScript origins:
http://localhost:3000

Authorized redirect URI:
https://<project-ref>.supabase.co/auth/v1/callback
```

### App Fixes Verified

- [x] Fixed the auth callback so it no longer requires OpenAI env vars just to sign in
- [x] Verified `npm test` passes
- [x] Verified `npm run build` passes
- [x] Verified local Google sign-in works after the callback fix

## Next Steps To Test Locally

- [ ] Confirm signed-in state on the home page and menu
- [ ] Run a practice session while signed in
- [ ] Test local recording start/stop in the browser
- [ ] Test transcript analysis flow
- [ ] Confirm a row is written to `speech_feedback`
- [ ] Confirm a row is written to `analysis_attempts`
- [ ] Confirm feedback appears in `/feedback`
- [ ] Confirm daily analysis limit enforcement

### Required Before AI Analysis Can Work

- [ ] Set `OPENAI_API_KEY` in `.env.local`
- [ ] Set `OPENAI_EVAL_MODEL` in `.env.local`
- [ ] Restart the dev server after changing env vars

## Intentionally Deferred

### Real Domain / Production

- [ ] Decide on the real production domain
- [ ] Set Supabase `Site URL` to the production domain
- [ ] Add production redirect URLs in Supabase
- [ ] Add preview URLs if using Vercel preview deployments
- [ ] Add production origin in Google OAuth
- [ ] Add production env vars in Vercel

When the real domain exists, update:

```text
Supabase Site URL:
https://your-real-domain.com

Supabase Redirect URLs:
https://your-real-domain.com/auth/callback
https://your-real-domain.com/**
https://*-your-vercel-project.vercel.app/**

Google Authorized JavaScript origins:
https://your-real-domain.com

Google Authorized redirect URIs:
https://<project-ref>.supabase.co/auth/v1/callback
```

Note:
- The Google redirect URI stays the Supabase callback URL.
- Your real domain is added as an authorized JavaScript origin and in Supabase URL configuration.

### Email Magic Links

- [ ] Decide whether public magic-link login is actually needed
- [ ] Buy or choose a sending domain
- [ ] Set up Resend or another SMTP provider
- [ ] Verify the sending domain
- [ ] Add custom SMTP settings in Supabase
- [ ] Test magic-link email delivery

Current recommendation:
- Keep `Google login only` for the demo until a real domain exists.

## Useful References

- Setup schema: [supabase/schema.sql](/Users/metygl/Projects/PlanProject/impromptu-speaker/supabase/schema.sql)
- Env template: [.env.example](/Users/metygl/Projects/PlanProject/impromptu-speaker/.env.example)
- Main docs: [README.md](/Users/metygl/Projects/PlanProject/impromptu-speaker/README.md)

## Click-Path Runbook

### Supabase

Project URL and keys:

1. Open Supabase project dashboard
2. Click `Connect`
3. Copy the HTTPS project URL
4. If needed, go to `Settings` -> `API Keys`
5. Copy the `anon` / publishable key

SQL schema:

1. Click `SQL Editor`
2. Click `New query`
3. Open [supabase/schema.sql](/Users/metygl/Projects/PlanProject/impromptu-speaker/supabase/schema.sql)
4. Paste the full file into the query editor
5. Click `Run`

Auth URL configuration:

1. Click `Authentication`
2. Click `URL Configuration`
3. Set `Site URL` to `http://localhost:3000`
4. Add redirect URL `http://localhost:3000/auth/callback`
5. Add redirect URL `http://localhost:3000/**`
6. Save

Google provider:

1. Click `Authentication`
2. Click `Providers` or `Sign In / Providers`
3. Open `Google`
4. Enable the Google provider
5. Paste Google `Client ID`
6. Paste Google `Client Secret`
7. Leave `Skip nonce checks` off
8. Leave `Allow users without email` off
9. Save

### Google Cloud / Google Auth Platform

OAuth setup:

1. Open `https://console.cloud.google.com/`
2. Select the Google Cloud project
3. Open `Google Auth Platform`
4. Complete `Branding` if prompted
5. Complete `Audience` and choose `External`
6. Complete `Data Access` if prompted

OAuth client:

1. In Google Auth Platform, open `Clients`
2. Click `Create client`
3. Choose `Web application`
4. Name the client
5. Add authorized JavaScript origin `http://localhost:3000`
6. Add authorized redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`
7. Click `Create`
8. Copy `Client ID`
9. Copy `Client Secret`
10. Return to Supabase and paste them into the Google provider settings

### Local App

Env setup:

1. Create `.env.local` in the repo root
2. Copy values from [.env.example](/Users/metygl/Projects/PlanProject/impromptu-speaker/.env.example)
3. Replace placeholders with real values
4. Ensure `NEXT_PUBLIC_SUPABASE_URL` uses the HTTPS Supabase project URL
5. Restart the app after env changes

Run locally:

1. Start the app with `npm run dev`
2. Open `http://localhost:3000/login`
3. Click `Continue with Google`
4. Complete sign-in
5. Confirm you return signed in
