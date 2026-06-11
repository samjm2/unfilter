# Unfilter

**Every filter is a lie. See through it.**

Privacy-first filter literacy and skin-tracking app for teens. Built for the Congressional App Challenge 2026 (IL-10).

## The Problem

Filtered faces have quietly become the default reference image for an entire generation of teenagers. The faces in their feeds are not faces — they are smoothed, reshaped, recolored renderings. Comparing a real reflection to them is a losing game with measurable mental-health consequences, especially for adolescent girls.

Existing tools make this worse: dermatology apps upload your face to a server, charge a subscription, or pitch themselves as medical when they aren't.

Unfilter is the alternative. It shows teens, concretely, what filters are doing to their image — and gives them a private, on-device way to track their real skin without ever sending a photo anywhere.

## What Unfilter does

- **Distortion Lab** — Take any photo and watch a beauty filter apply pore-by-pore, in your browser. The lie, made visible.
- **Filter Detector** — Heuristic scan that flags likely filter use on an image (smoothing artifacts, symmetry, edge anomalies) so teens can sanity-check what they're comparing themselves to.
- **Private Check-in** — Canvas-based computer vision runs entirely in the browser. Lighting/focus quality gate, then on-device analysis of redness, texture, spot count, and uniformity. **No upload, ever.**
- **Journal** — Timeline, trend view, and side-by-side compare for your own check-ins. All data lives on your device.
- **Routine Safety** — Add the products you use; the safety engine flags ingredient conflicts.
- **Confidence Mode** — 20 short cards on media literacy, comparison traps, and how filters work technically.
- **Trusted Circle** — Lightweight scripts and resources for looping in a parent, guardian, or dermatologist when something warrants a real conversation.
- **Help & Crisis Resources** — Direct links to vetted hotlines and escalation paths.

## Privacy architecture

Unfilter is built so the privacy claim is **verifiable, not marketing.**

- **What the server stores:** email address and a bcrypt hash of your password. That's it. Auth lives in a local SQLite file at `data/auth.db`.
- **What never leaves your device:** every photo, every check-in result, every journal entry, every routine, every confidence card you've read. All of it is stored in `localStorage` and IndexedDB in your browser.
- **No third-party analytics, no image hosting, no model API calls.** The computer vision runs in the browser via canvas image-data math.
- **How to verify yourself:** open DevTools, switch to the Network tab, and run a check-in. You will see zero requests carrying image data. The only network traffic is the session cookie.

If you don't trust the claim, don't trust it — open the tab and watch.

## Tech stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS 4
- Zustand for client state
- better-sqlite3 (auth only) · bcryptjs · jsonwebtoken (httpOnly session cookie)
- NextAuth v5 (Google + Microsoft OAuth)
- pnpm

## Running locally

**Requirements:** Node.js 18+ and pnpm (`npm i -g pnpm` if you don't have it).

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

That's it for local development — the defaults in `.env.example` work as-is. You do not need to configure SMTP or OAuth to run the app locally. Verification emails print to the terminal console instead.

If you want to change the JWT secret (recommended): open `.env.local` and replace `change-this-to-a-random-secret-in-production` with any random string.

### 3. Start the dev server

```bash
pnpm dev
```

Open http://localhost:3000. The auth database is created automatically at `data/auth.db` on first run.

### 4. See it with real data (recommended)

Create a demo account and populate it with 14 days of realistic journal entries and a 9-day streak:

```bash
node scripts/seed-demo-sqlite.js
```

Then:
1. Go to http://localhost:3000/login
2. Log in as `demo@unfilter.app` / `DemoUser2026!`
3. Open browser DevTools → Console tab
4. Paste the entire contents of `scripts/seed-demo-browser.js` and press Enter
5. Reload the page

You should see a fully populated journal, check-in history, and streak.

### Key routes to explore

| Route | What it is |
|---|---|
| `/landing` | Public landing page with the before/after slider |
| `/lab` | Distortion Lab — upload a photo, watch filters apply |
| `/detector` | Filter Detector — analyze a photo for filter use |
| `/check-in` | Daily skin check-in (works best on mobile/iPhone Safari) |
| `/journal` | Journal timeline and trends |
| `/confidence` | Media literacy cards |
| `/reality-check` | Daily filter education with streak tracking |
| `/settings` | Privacy controls, theme, text size |

## Project structure

```
src/
  app/            Next.js app router (marketing, app shell, auth API)
  components/     Shared UI (AppShell, SideNav, icons, primitives)
  features/       Feature modules (auth, onboarding, checkin, journal,
                  routine, learn, confidence, settings, streak)
  lib/            Imaging and storage utilities
  backend/        Server-side auth, db, security helpers
  styles/         Global CSS and design tokens
  middleware.ts   JWT session check and route protection
```

