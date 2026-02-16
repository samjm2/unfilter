# Unfilter

**Unfilter** is a privacy-first skin check-in + confidence coach for teens. It helps users capture a *redacted* photo of a skin concern (crop-first, optional face blur), answer a few quick context questions, and receive **educational guidance** plus conservative next steps — **not medical diagnosis**. The MVP focuses on a reliable check-in flow (quality gating + retake coaching), local journaling, and trend views that reduce anxiety and discourage unsafe “TikTok skincare roulette.”

> ⚠️ **Not medical advice.** Unfilter does not diagnose, treat, or prevent disease. If symptoms are severe, rapidly worsening, or concerning, the app guides users to ask a trusted adult or seek professional care.

---

## Demo

- **Screenshots / GIFs:** _(add once UI is ready)_
  - `docs/screenshots/dashboard.png`
  - `docs/screenshots/checkin-flow.gif`
  - `docs/screenshots/journal.png`

- **Core MVP flow:** Dashboard → New Check-in → Quality Gate → Context Questions → Education Summary → Save → Journal Timeline

---

## Features (MVP)

### Privacy-first capture (default)
- Crop to affected area (encouraged)
- Optional face blur if a face is present
- EXIF stripping on imported images (planned / in-progress)
- Auto-delete by default unless the user saves

### Reliability-first guidance
- Quality gate (blur / exposure / glare / framing) with retake coaching
- Lightweight “skin signal” proxies for **trend tracking**
  - redness distribution proxy
  - tone uniformity proxy
  - texture roughness proxy
  - spot/contrast proxy
  - reliability score (confidence gating)

### Context questions (prevents photo-only guessing)
- itch/pain, duration, spread, fever/feeling sick
- new products, location, meds
- optional sweat/sleep/stress

### Journal + trends
- Local, encrypted-by-design storage (MVP starts local; encryption hardening is roadmap)
- Timeline view + compare mode (side-by-side)

### Safety escalation
- “Safety check” red-flag routing (e.g., fever + rapid spread + swelling) → encourages trusted adult / care resources

---

## Tech Stack

- **Next.js (App Router) + TypeScript**
- **TailwindCSS**
- **shadcn/ui**
- State: **Zustand**
- Forms/validation: **React Hook Form + Zod**
- Storage: **IndexedDB** (planned via a thin storage abstraction)

> Node version: align with current Next.js requirements. :contentReference[oaicite:1]{index=1}

---

## Getting Started

### Prerequisites
- Node.js (see Next.js docs for recommended minimum)
- pnpm (recommended) or npm/yarn

### Install
```bash
git clone <YOUR_REPO_URL>
cd unfilter-app
pnpm install
