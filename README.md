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

## Local development

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000.

Copy `.env.example` to `.env.local` and fill in `JWT_SECRET`, SMTP credentials (used for verification emails — logs to console in development), and `NEXT_PUBLIC_APP_URL`. The auth database is created automatically at `data/auth.db` on first run.

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

## Demo data

To populate a fresh install with realistic demo data for video recording:

```bash
node scripts/seed-demo-sqlite.js
```

Then log in as `demo@unfilter.app` / `DemoUser2026!` and paste the contents of `scripts/seed-demo-browser.js` into the browser DevTools console. Reload the page — you should see 14 days of journal entries and a 9-day streak.

