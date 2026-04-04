"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/AppShell"
import { OnboardingGate } from "@/components/OnboardingGate"
import { IconArrowRight, IconFlame, IconShield } from "@/components/icons"
import { isDoneToday, markStreakToday } from "@/features/streak"
import { getPhotoForDay } from "@/features/reality-check/photos"

type Step = "spot" | "reveal" | "done"

/* ── 14 scenario templates (two per day-of-week, alternates weekly) ── */

const DAILY_SCENARIOS = [
  // Sunday – two options
  {
    edits: 3,
    label: "Snapchat selfie",
    what: "Auto skin smoothing (pores + pimples blurred), brightness +15%, slight warmth — applied before you even chose a lens",
    insight: "3 edits. Snapchat did all of them automatically.",
    distortion: { skinTexture: 20, faceShape: 5, lightingTone: 20, makeup: 0 },
  },
  {
    edits: 5,
    label: "Snapchat Glow filter",
    what: "Skin texture removal, eye whitening, soft-focus vignette, warm color cast, virtual highlight on cheekbones",
    insight: "5 edits — all invisible, all automatic. Snapchat's 'Glow' does this to every face.",
    distortion: { skinTexture: 35, faceShape: 10, lightingTone: 35, makeup: 15 },
  },
  // Monday
  {
    edits: 6,
    label: "Instagram story",
    what: "Texture smoothing, face slim, warm color grade, virtual blush, contour, highlights — a typical AR filter stack",
    insight: "6 edits. Instagram has 10,000+ filters that do this silently.",
    distortion: { skinTexture: 50, faceShape: 35, lightingTone: 30, makeup: 30 },
  },
  {
    edits: 4,
    label: "Instagram Reels",
    what: "Auto-enhance on upload, subtle face reshape, color grading, micro-smoothing on skin",
    insight: "4 changes happen automatically when you upload a Reel. Most creators don't even know.",
    distortion: { skinTexture: 30, faceShape: 20, lightingTone: 45, makeup: 10 },
  },
  // Tuesday
  {
    edits: 4,
    label: "Instagram brand collab",
    what: "Pore and acne removal, studio-quality color grade, brightness +18%, soft glow",
    insight: "4 invisible changes. The influencer was paid to look like this.",
    distortion: { skinTexture: 40, faceShape: 15, lightingTone: 70, makeup: 20 },
  },
  {
    edits: 8,
    label: "Magazine cover edit",
    what: "Professional retouching: skin smoothing, under-eye removal, jaw reshape, neck slim, teeth whiten, color grade, pore erase, blemish removal",
    insight: "8 edits. Every magazine cover goes through this. It's not real — it's a product.",
    distortion: { skinTexture: 70, faceShape: 45, lightingTone: 55, makeup: 40 },
  },
  // Wednesday
  {
    edits: 9,
    label: "Facetune'd post",
    what: "Full skin retouching, jaw reshape, virtual makeup, lighting simulation, eye enlarge, pimple eraser, pore removal, face slim, eye bag removal",
    insight: "9 edits. Facetune lets you do each one manually. Influencers use all of them.",
    distortion: { skinTexture: 80, faceShape: 60, lightingTone: 50, makeup: 55 },
  },
  {
    edits: 6,
    label: "Facetune 'Natural' preset",
    what: "Even the 'natural' preset applies: pore blur, undereye lighten, skin even, subtle slim, brightness boost, warmth shift",
    insight: "6 changes from a preset literally called 'Natural.' The name is the deception.",
    distortion: { skinTexture: 45, faceShape: 25, lightingTone: 40, makeup: 20 },
  },
  // Thursday
  {
    edits: 5,
    label: "TikTok fitness post",
    what: "TikTok \"Enhance\" (auto-smooth + face slim), contrast pop, acne removal, subtle sculpting",
    insight: "The 'no-filter' caption was a lie. TikTok's Enhance was on.",
    distortion: { skinTexture: 45, faceShape: 25, lightingTone: 40, makeup: 15 },
  },
  {
    edits: 3,
    label: "TikTok GRWM video",
    what: "Background auto-smooth on skin, lighting boost, subtle face reshape — all before the makeup even starts",
    insight: "3 edits were already applied before the 'Get Ready With Me' even began.",
    distortion: { skinTexture: 25, faceShape: 15, lightingTone: 30, makeup: 5 },
  },
  // Friday
  {
    edits: 7,
    label: "TikTok Bold Glamour",
    what: "AI-powered skin blur, eye brightening, nose slim, lip plump, full virtual makeup, contouring, highlight",
    insight: "7 changes. TikTok's Bold Glamour filter was so real millions couldn't tell.",
    distortion: { skinTexture: 55, faceShape: 40, lightingTone: 35, makeup: 45 },
  },
  {
    edits: 5,
    label: "YouTube thumbnail",
    what: "Skin airbrush, eye pop (saturation + brightness), contrast boost, teeth whitening, subtle face reshape",
    insight: "5 edits on a single thumbnail. Creators do this to every video preview.",
    distortion: { skinTexture: 40, faceShape: 20, lightingTone: 50, makeup: 25 },
  },
  // Saturday
  {
    edits: 4,
    label: "BeReal post",
    what: "Auto-exposure boost, white balance shift, subtle texture smooth, warmth correction",
    insight: "4 tweaks. Even \"no filter\" platforms process your photo.",
    distortion: { skinTexture: 30, faceShape: 10, lightingTone: 60, makeup: 25 },
  },
  {
    edits: 2,
    label: "iPhone Portrait Mode",
    what: "Computational skin smoothing in 'Deep Fusion' processing, plus background blur that pulls focus to the face",
    insight: "2 edits you never asked for. Your phone does this automatically in Portrait Mode.",
    distortion: { skinTexture: 15, faceShape: 5, lightingTone: 25, makeup: 0 },
  },
]

function getScenarioForDay(): (typeof DAILY_SCENARIOS)[0] {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0-6
  const weekNumber = Math.floor(now.getTime() / (7 * 86_400_000))
  // Two scenarios per day-of-week, alternate by even/odd week
  const idx = dayOfWeek * 2 + (weekNumber % 2)
  return DAILY_SCENARIOS[idx]
}

function buildFilter(d: (typeof DAILY_SCENARIOS)[0]["distortion"]) {
  const blur = (d.skinTexture / 100) * 2.8
  const brightness = (1 + (d.skinTexture / 100) * 0.06) * (1 + (d.lightingTone / 100) * 0.22)
  const saturate = (1 + (d.lightingTone / 100) * 0.18) * (1 + (d.makeup / 100) * 0.12)
  const sepia = (d.lightingTone / 100) * 0.1
  return `blur(${blur.toFixed(2)}px) brightness(${brightness.toFixed(3)}) saturate(${saturate.toFixed(3)})${sepia > 0.005 ? ` sepia(${sepia.toFixed(3)})` : ""}`
}

export default function RealityCheckPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("spot")
  const [guess, setGuess] = useState(5)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [streakCount, setStreakCount] = useState(0)
  const alreadyDone = useRef(isDoneToday())

  const scenario = getScenarioForDay()
  const filterCSS = buildFilter(scenario.distortion)
  const todayPhoto = getPhotoForDay()

  const handleReveal = () => setStep("reveal")

  const handleComplete = () => {
    const count = markStreakToday()
    setStreakCount(count)
    setStep("done")
  }

  // already done today — show a brief message
  if (alreadyDone.current && step === "spot") {
    return (
      <OnboardingGate>
        <AppShell>
          <div className="mx-auto max-w-md pt-8 text-center animate-fade-up">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-light)] mx-auto mb-5">
              <IconFlame size={26} className="text-[var(--accent)]" />
            </div>
            <h2 className="text-display text-[24px] text-[var(--text-primary)] mb-2">Already done today.</h2>
            <p className="text-[14px] text-[var(--text-secondary)] mb-8">
              Come back tomorrow for a new photo.
            </p>
            <button onClick={() => router.push("/")} className="btn-primary px-8">
              Back to home
            </button>
          </div>
        </AppShell>
      </OnboardingGate>
    )
  }

  return (
    <OnboardingGate>
      <AppShell>
        <div className="mx-auto max-w-md animate-fade-up">

          {step === "spot" && (
            <>
              <div className="mb-6">
                <p className="label-evidence text-[var(--text-muted)] mb-2">
                  Daily reality check
                </p>
                <h1 className="text-display text-[28px] text-[var(--text-primary)] mb-2">
                  Find what&apos;s hidden.
                </h1>
                <p className="text-[14px] text-[var(--text-secondary)]">
                  This is a <span className="font-semibold text-[var(--text-primary)]">{scenario.label}</span>. How many edits were hidden before it was posted?
                </p>
              </div>

              <div className="card-elevated overflow-hidden mb-5 rounded-[16px] aspect-[4/5] relative">
                {!imgLoaded && !imgError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[var(--warm-200)] animate-pulse" />
                    <p className="text-[11px] text-[var(--text-muted)]">Loading today&apos;s photo…</p>
                  </div>
                )}
                {imgError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--warm-200)]">
                    <p className="text-[13px] text-[var(--text-muted)] mb-1">Photo unavailable</p>
                    <p className="text-[11px] text-[var(--text-muted)]">Check your connection and refresh</p>
                  </div>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={todayPhoto.url}
                  alt={todayPhoto.alt}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                  style={{ filter: filterCSS }}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgError(true)}
                />
              </div>

              <div className="card p-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[13px] font-semibold text-[var(--text-primary)]">My guess</p>
                  <span className="text-[22px] font-bold text-[var(--accent)]" style={{ fontFamily: "Fraunces, serif" }}>
                    {guess}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={guess}
                  onChange={(e) => setGuess(Number(e.target.value))}
                  className="w-full accent-[var(--accent)] h-2 rounded-full appearance-none bg-[var(--warm-300)] cursor-pointer"
                />
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-[var(--text-muted)]">1 edit</span>
                  <span className="text-[10px] text-[var(--text-muted)]">10 edits</span>
                </div>
              </div>

              <button onClick={handleReveal} className="w-full btn-primary py-4 text-[16px]">
                Reveal what&apos;s hidden
              </button>
            </>
          )}

          {step === "reveal" && (
            <>
              <div className="mb-5">
                <p className="label-evidence text-[var(--text-muted)] mb-2">Revealed</p>
                <h2 className="text-display text-[28px] text-[var(--text-primary)] mb-1">
                  {Math.abs(guess - scenario.edits) <= 1
                    ? "You saw through it."
                    : guess < scenario.edits
                    ? "They hid more than you thought."
                    : "You overestimated."}
                </h2>
                <p className="text-[14px] text-[var(--text-secondary)]">
                  You guessed <strong>{guess}</strong>. Hidden: <strong>{scenario.edits} edits</strong>.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                  <p className="label-evidence text-[var(--accent)] mb-1.5 px-1">Truth</p>
                  <div className="card-elevated overflow-hidden rounded-[14px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={todayPhoto.url} alt={`${todayPhoto.alt} — unedited`} className="w-full aspect-[4/5] object-cover" />
                  </div>
                </div>
                <div>
                  <p className="label-evidence text-[var(--coral)] mb-1.5 px-1">Illusion</p>
                  <div className="card-elevated overflow-hidden rounded-[14px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={todayPhoto.url}
                      alt={`${todayPhoto.alt} — with ${scenario.edits} hidden edits`}
                      className="w-full aspect-[4/5] object-cover"
                      style={{ filter: filterCSS }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[12px] bg-[var(--bg-secondary)] px-4 py-3 mb-4">
                <p className="label-evidence text-[var(--text-muted)] mb-1.5">
                  What was hidden
                </p>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{scenario.what}</p>
              </div>

              <button onClick={handleComplete} className="w-full btn-primary py-4 text-[16px] flex items-center justify-center gap-2">
                Mark complete
                <IconArrowRight size={16} />
              </button>
            </>
          )}

          {step === "done" && (
            <div className="text-center pt-4 animate-fade-up">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-light)] mx-auto mb-4">
                <IconFlame size={28} className="text-[var(--accent)]" />
              </div>

              <h2 className="text-display text-[26px] text-[var(--text-primary)] mb-1">
                {streakCount > 1 ? `Day ${streakCount}.` : "Day 1."}
              </h2>
              <p className="text-[14px] text-[var(--text-secondary)] mb-2">{scenario.insight}</p>
              <p className="text-[12px] italic text-[var(--text-muted)] mb-8">
                {streakCount >= 7
                  ? "One week of clear eyes."
                  : streakCount >= 3
                  ? "Three days of better pattern recognition."
                  : "Awareness builds over time."}
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => router.push("/check-in")}
                  className="w-full flex items-center justify-between rounded-[14px] bg-[var(--accent)] px-6 py-4 text-white transition hover:bg-[var(--accent-dark)]"
                >
                  <div className="text-left">
                    <p className="text-[15px] font-semibold">Check In Today</p>
                    <p className="text-[12px] text-white/70">Track how this affects how you feel</p>
                  </div>
                  <IconArrowRight size={16} className="opacity-70" />
                </button>

                <button
                  onClick={() => router.push("/")}
                  className="w-full rounded-[12px] border border-[var(--border-light)] bg-[var(--bg-card)] px-5 py-3 text-[14px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition"
                >
                  Back to home
                </button>
              </div>

              <div className="flex items-center gap-2 justify-center mt-8">
                <IconShield size={12} className="text-[var(--accent)]" />
                <p className="text-[11px] text-[var(--text-muted)]">No photos sent anywhere.</p>
              </div>
            </div>
          )}

        </div>
      </AppShell>
    </OnboardingGate>
  )
}
