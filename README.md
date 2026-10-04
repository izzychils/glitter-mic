# Glitter Mic

Multiplayer + solo karaoke web game: blurred lyrics that reveal as you sing them, live voice analysis, fair
server-authoritative scoring, Google sign-in, collab rooms and leaderboards.

This repo is the monorepo from the build guide's Section 5 - frontend and backend live in the same repo as
separate apps, exactly as the guide lays out.

## Monorepo map

```
glitter-mic/
├─ apps/
│  ├─ web/            # FRONTEND - React 18 + Vite + TypeScript + Tailwind + Framer Motion + Zustand
│  ├─ api/            # BACKEND  - Node + Express + TypeScript + Socket.IO + Zod
│  └─ worker/         # Python FastAPI audio worker (placeholder until Phase 9)
├─ packages/
│  └─ scoring-core/   # Shared scoring engine used by BOTH web (live) and api (authoritative)
├─ scripts/           # repo checks (flat-color lint)
└─ package.json       # npm workspaces
```

Frontend = `apps/web`. Backend = `apps/api` (+ the Python `apps/worker` service). They are separate apps in one
repo and share code through `packages/scoring-core`, so the client preview and the server recompute run identical
scoring code - this is what makes results fair and tamper-resistant.

## Quick start

```bash
npm install                 # installs all workspaces
npm run dev                 # web on :5173 and api on :4000 together
npm test                    # scoring-core Vitest suite (fairness fixtures)
npm run typecheck           # tsc across every workspace
npm run lint:no-gradient    # CI check: no CSS color-ramp usage allowed in the web source
```

Individual apps:

```bash
npm run dev:web             # apps/web
npm run dev:api             # apps/api
```

Worker (placeholder):

```bash
cd apps/worker
python -m venv .venv && . .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Environment

Copy the examples when a phase needs them:

- `apps/web/.env.example` - `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`
- `apps/api/.env.example` - `PORT`, `CLIENT_ORIGIN`, `JWT_SECRET`, plus per-phase keys

Nothing is required for Phase 1; the API boots with safe defaults and the web app degrades gracefully offline.

In production the same keys live in Render's Environment settings (API) and Vercel's Environment Variables (web;
only `VITE_*` values are public). Secrets are never committed - `.env` files are gitignored.

## Decisions and deviations from the build guide

These are the places where your instructions override the guide - everything else is applied as written.

1. **Monorepo layout** - exactly the guide's Section 5 structure (`apps/web`, `apps/api`, `apps/worker`,
   `packages/scoring-core`). Frontend and backend live in the same repo as separate folders.
2. **Database** - the guide says MongoDB Atlas + Mongoose. Per your instruction we will use **Neon Postgres**
   instead when persistence arrives in Phase 7. No DB code exists yet (deliberately).
3. **Hosting (confirmed)** - `apps/api` deploys to **Render** as a persistent web service, because Socket.IO's
   long-lived WebSocket connections cannot run on Vercel's serverless functions. `apps/web` deploys to **Vercel**.
   Render injects `PORT` automatically, so it is never set there. Deployment itself is wired when we get there.
4. **Redis leaderboards** - the guide uses Upstash sorted sets; still the plan, wired in Phase 7.

Everything else (scoring weights, blur mechanic, clock sync, Deepgram STT, Demucs worker, glass design system,
icons-only/no-emoji/no-color-ramp rules) is implemented or queued exactly per the guide.

## Status

Phase 1 (scaffold + design system) is built, plus the scoring engine the guide demands early:

- [x] npm-workspaces monorepo
- [x] `apps/web`: design tokens, GlassCard, buttons, chips, inputs, modal, toast, tabs, progress bar, animated
      flat-color background, GlitterMic, `/design` showcase, landing page
- [x] `apps/api`: Express + Socket.IO + Zod env validation + helmet + CORS + rate limiting + `clock:ping`
- [x] `apps/worker`: FastAPI placeholder + Dockerfile
- [x] `packages/scoring-core`: Section 8 scoring (timeline, fuzzy lyric alignment, timing, key-fair pitch,
      final formula, participation rule) with the full Section 12.1 test suite
- [ ] Phase 2: Google auth end to end
- [ ] Phase 3: song browse + lyrics
- [ ] Phase 4: audio engine + calibration
- [ ] Phase 5-6: live scoring + STT + score report
- [ ] Phase 7: server recompute + leaderboards
- [ ] Phase 8: Socket.IO rooms + clock sync
- [ ] Phase 9: Demucs worker
- [ ] Phase 10-11: extras, polish, launch
