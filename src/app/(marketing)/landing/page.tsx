"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ============================================================
// Landing Page — "The Reveal"
//
// The page itself demonstrates unfiltering. Sections move from
// blurred/distorted to sharp/real. The visitor experiences the
// product's core idea just by scrolling.
// ============================================================

function useAOS() {
  useEffect(() => {
    const elements = document.querySelectorAll("[data-aos]");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("aos-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ---- Interactive before/after slider ----

// Unsplash portrait — royalty-free, face-cropped. Shows real skin texture.
const SLIDER_PHOTO =
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=840&h=1050&fit=crop&crop=face&auto=format&q=85";

// CSS filter stack that approximates what TikTok/Snapchat apply automatically
const FILTER_STACK =
  "brightness(1.10) contrast(0.88) saturate(1.25) blur(0.6px) sepia(0.06)";

function FilterSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPos(pct);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      handleMove(clientX);
    };
    const onUp = () => { dragging.current = false; };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="landing-slider relative aspect-[4/5] sm:aspect-[3/4] w-full max-w-[420px] mx-auto rounded-[24px] overflow-hidden cursor-col-resize select-none touch-none"
      onMouseDown={(e) => { dragging.current = true; handleMove(e.clientX); }}
      onTouchStart={(e) => { dragging.current = true; handleMove(e.touches[0].clientX); }}
    >
      {/* "Filtered" side — full width, filter stack applied */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SLIDER_PHOTO}
        alt="Filtered face"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: FILTER_STACK }}
        draggable={false}
      />
      {/* Makeup/glow overlay on filtered side */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,220,200,0.18) 0%, rgba(230,160,130,0.22) 55%, rgba(200,100,90,0.14) 100%)",
          mixBlendMode: "soft-light",
        }}
      />

      {/* "Real" side — unfiltered, clipped to left of slider */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${pos}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SLIDER_PHOTO}
          alt="Real face"
          className="absolute inset-0 h-full object-cover"
          style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : "420px", maxWidth: "none" }}
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-white/80 z-10"
        style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M6 10L3 10M3 10L5.5 7.5M3 10L5.5 12.5" stroke="#2a231c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 10L17 10M17 10L14.5 7.5M17 10L14.5 12.5" stroke="#2a231c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 z-10 rounded-full bg-black/50 backdrop-blur-sm px-3 py-1.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/90">Filtered</span>
      </div>
      <div className="absolute bottom-4 right-4 z-10 rounded-full bg-white/80 backdrop-blur-sm px-3 py-1.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#2a231c]">Real</span>
      </div>
    </div>
  );
}

// ---- Scroll-aware counter ----

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1200;
          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

// ---- Main page ----

export default function LandingPage() {
  useAOS();

  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* ---- NAV ---- */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border-light)] bg-[color:color-mix(in_srgb,var(--bg-primary)_88%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--accent)]">
              <span
                className="text-[13px] font-bold text-white"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                U
              </span>
            </div>
            <span className="text-display text-[18px] text-[var(--text-primary)]">
              Unfilter
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-[10px] px-4 py-2 text-[13px] font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-[10px] bg-[var(--accent)] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[var(--accent-dark)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ============================================================
          HERO — Split: bold copy left, interactive demo right
          ============================================================ */}
      <section className="relative bg-[var(--bg-primary)]">
        {/* Subtle mesh */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 20% 30%, rgba(194,88,64,0.06), transparent 70%), radial-gradient(ellipse 50% 60% at 80% 70%, rgba(107,127,94,0.05), transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-12 md:pt-24 md:pb-20">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            {/* Left — copy */}
            <div>
              <p
                data-aos="fade-up"
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--coral)]/30 bg-[var(--coral-light)] px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--coral)]"
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--coral)] animate-pulse" />
                Built by a teen, for teens
              </p>

              <h1
                data-aos="fade-up"
                data-aos-delay="100"
                className="text-display text-[clamp(36px,6.5vw,72px)] leading-[0.95] text-[var(--text-primary)]"
              >
                Every filter
                <br />
                is a <span className="relative inline-block">
                  lie
                  <svg aria-hidden="true" viewBox="0 0 100 14" className="absolute -bottom-1 left-0 w-full h-[14px] text-[var(--coral)]" fill="none" preserveAspectRatio="none">
                    <path d="M2 8C20 3 45 2 55 5C65 8 80 11 98 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M5 11C30 6 60 5 95 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                  </svg>
                </span>
                <span className="text-[var(--text-muted)]">.</span>
                <br />
                <span className="text-[var(--accent)]">See through it.</span>
              </h1>

              <p
                data-aos="fade-up"
                data-aos-delay="200"
                className="mt-7 max-w-lg text-[17px] leading-[1.8] text-[var(--text-secondary)]"
              >
                Filter literacy for the AI-face generation. Unfilter shows you what
                beauty filters actually do to a face, then lets you check in with
                your real skin privately, on-device. No cloud uploads. No diagnosis.
                No comparing yourself to a face that isn&apos;t real.
              </p>

              <div
                data-aos="fade-up"
                data-aos-delay="300"
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-2 rounded-[14px] bg-[var(--accent)] px-7 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[var(--accent-dark)] hover:shadow-lg hover:shadow-[var(--accent)]/15"
                >
                  Start for free
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-0.5">
                    <path d="M3 8h10m0 0L9.5 4.5M13 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-[14px] border border-[var(--border)] px-6 py-3.5 text-[15px] font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-secondary)]"
                >
                  Sign in
                </Link>
              </div>

              {/* Trust chips */}
              <div
                data-aos="fade-up"
                data-aos-delay="400"
                className="mt-8 flex flex-wrap gap-4 text-[12px] text-[var(--text-tertiary)]"
              >
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  On-device by default
                </span>
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
                  Educational, not clinical
                </span>
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  Zero shame design
                </span>
              </div>
            </div>

            {/* Right — interactive before/after */}
            <div data-aos="fade-left" data-aos-delay="200">
              <FilterSlider />
              <p className="mt-4 text-center text-[13px] text-[var(--text-muted)] italic" style={{ fontFamily: "Fraunces, serif" }}>
                Drag to see what filters hide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          STAT STRIP — Full-width, dark, punchy
          ============================================================ */}
      <section className="landing-stat-strip border-y border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: 95, suffix: "%", label: "of US teens 13–17 use social media", cite: "1" },
              { value: 46, suffix: "%", label: "say they're online “almost constantly”", cite: "2" },
              { value: 0, suffix: "", label: "photos uploaded to any Unfilter server", cite: "" },
              { value: 100, suffix: "%", label: "on-device skin analysis. Always.", cite: "" },
            ].map((stat, i) => (
              <div key={stat.label} data-aos="fade-up" data-aos-delay={String(i * 80)} className="text-center md:text-left">
                <p
                  className="text-[clamp(32px,5vw,48px)] font-semibold leading-none text-[var(--text-primary)]"
                  style={{ fontFamily: "Fraunces, serif" }}
                >
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  {stat.cite && (
                    <a href={`#source-${stat.cite}`} className="ml-1 align-super text-[12px] font-medium text-[var(--text-muted)] hover:text-[var(--accent)]">
                      {stat.cite}
                    </a>
                  )}
                </p>
                <p className="mt-2 text-[13px] leading-snug text-[var(--text-tertiary)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          WHAT IT DOES — Alternating feature blocks (no cards)
          ============================================================ */}
      <section className="px-6 py-20 md:py-28 bg-[var(--bg-primary)]">
        <div className="mx-auto max-w-6xl">
          <div data-aos="fade-up" className="mb-16 max-w-2xl">
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] mb-3">
              How it works
            </p>
            <h2 className="text-display text-[clamp(28px,4vw,44px)] text-[var(--text-primary)] leading-[1.05]">
              What Unfilter actually does.
            </h2>
          </div>

          <div className="space-y-20 md:space-y-28">
            {/* Feature 1 — Expose */}
            <div data-aos="fade-up" className="grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--coral-light)] text-[var(--coral)] text-[14px] font-bold" style={{ fontFamily: "Fraunces, serif" }}>1</span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--coral)]">Expose Distortion</span>
                </div>
                <h3 className="text-[clamp(22px,3vw,30px)] font-semibold leading-[1.15] text-[var(--text-primary)] mb-4">
                  Shows you what filters actually change
                </h3>
                <p className="text-[15px] leading-[1.8] text-[var(--text-secondary)] max-w-md">
                  The Distortion Lab and Filter Detector show you what beauty filters
                  actually do. Smoothed pores, reshaped jaws, faked lighting. Once you
                  see the tricks, filtered skin stops looking normal.
                </p>
              </div>
              {/* Mini distortion lab mockup */}
              <div className="rounded-[20px] aspect-[4/3] overflow-hidden bg-[var(--bg-card)] border border-[var(--border-light)] relative flex flex-col">
                <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 border-b border-[var(--border-light)]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--coral)]/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--gold)]/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]/60" />
                  <span className="ml-2 text-[10px] font-semibold text-[var(--text-muted)]">Distortion Lab</span>
                </div>
                <div className="flex flex-1 gap-0">
                  {/* Left — filtered */}
                  <div className="flex-1 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=300&fit=crop&crop=face&auto=format&q=70"
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full object-cover"
                      style={{ filter: "brightness(1.12) contrast(0.85) saturate(1.3) blur(0.5px)" }}
                    />
                    <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg,rgba(255,210,190,0.18)0%,rgba(220,140,110,0.2)100%)", mixBlendMode: "soft-light" }} />
                    <span className="absolute bottom-2 left-2 rounded-[4px] bg-[var(--coral)]/80 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">Illusion</span>
                  </div>
                  {/* Divider */}
                  <div className="w-[2px] bg-white/70 relative z-10 shrink-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white shadow flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M2 4H1M1 4L2 3M1 4L2 5" stroke="#666" strokeWidth="0.8" strokeLinecap="round"/><path d="M6 4H7M7 4L6 3M7 4L6 5" stroke="#666" strokeWidth="0.8" strokeLinecap="round"/></svg>
                    </div>
                  </div>
                  {/* Right — real */}
                  <div className="flex-1 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=300&fit=crop&crop=face&auto=format&q=70"
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-2 right-2 rounded-[4px] bg-[var(--accent)]/80 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">Truth</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 — Reflect */}
            <div data-aos="fade-up" className="grid gap-8 md:grid-cols-2 md:items-center">
              <div className="md:order-2">
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-light)] text-[var(--accent)] text-[14px] font-bold" style={{ fontFamily: "Fraunces, serif" }}>2</span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">Reflect Honestly</span>
                </div>
                <h3 className="text-[clamp(22px,3vw,30px)] font-semibold leading-[1.15] text-[var(--text-primary)] mb-4">
                  Private skin check-ins, no judgment
                </h3>
                <p className="text-[15px] leading-[1.8] text-[var(--text-secondary)] max-w-md">
                  Quick check-ins with no judgment. Your photo never leaves the device.
                  See how your skin actually changes over days and weeks instead of
                  how a filter makes it look.
                </p>
              </div>
              {/* Mini check-in journal mockup */}
              <div className="md:order-1 rounded-[20px] aspect-[4/3] overflow-hidden bg-[var(--bg-card)] border border-[var(--border-light)] flex flex-col p-4 gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-[var(--accent-light)] flex items-center justify-center">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/></svg>
                  </div>
                  <span className="text-[11px] font-semibold text-[var(--text-primary)]">Today&apos;s Check-In</span>
                  <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent-light)] px-1.5 py-0.5 rounded-full">Private</span>
                </div>
                <div className="flex gap-2">
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => (
                    <div key={d} className={`flex-1 rounded-[6px] py-1.5 text-center ${i < 5 ? "bg-[var(--accent-light)]" : "bg-[var(--bg-secondary)]"}`}>
                      <div className={`text-[7px] font-bold uppercase ${i < 5 ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>{d}</div>
                      {i < 5 && <div className="w-1 h-1 rounded-full bg-[var(--accent)] mx-auto mt-1" />}
                    </div>
                  ))}
                </div>
                <div className="flex-1 rounded-[10px] bg-[var(--bg-secondary)] px-3 py-2.5">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">5-day trend</p>
                  <div className="flex items-end gap-1 h-8">
                    {[60,45,70,55,80].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-[3px] bg-[var(--accent)]" style={{ height: `${h}%`, opacity: 0.4 + i * 0.12 }} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span className="text-[9px] text-[var(--text-muted)]">Photos stay on your device. Nothing uploaded.</span>
                </div>
              </div>
            </div>

            {/* Feature 3 — Protect */}
            <div data-aos="fade-up" className="grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--gold-light)] text-[var(--gold)] text-[14px] font-bold" style={{ fontFamily: "Fraunces, serif" }}>3</span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--gold)]">Stay Private</span>
                </div>
                <h3 className="text-[clamp(22px,3vw,30px)] font-semibold leading-[1.15] text-[var(--text-primary)] mb-4">
                  Nothing leaves your phone
                </h3>
                <p className="text-[15px] leading-[1.8] text-[var(--text-secondary)] max-w-md">
                  Photos, routines, and journals all stay on your device.
                  No cloud uploads, no ad profiles, no skin data getting sold.
                  Privacy is the whole point.
                </p>
              </div>
              {/* Mini privacy architecture mockup */}
              <div className="rounded-[20px] aspect-[4/3] overflow-hidden bg-[var(--bg-card)] border border-[var(--border-light)] flex flex-col items-center justify-center gap-3 p-5">
                {/* Phone icon */}
                <div className="rounded-[14px] border-2 border-[var(--accent)] bg-[var(--accent-lighter)] px-4 py-3 text-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" className="mx-auto mb-1"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1"/></svg>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--accent)]">Your Device</p>
                  <div className="mt-1.5 flex flex-wrap gap-1 justify-center">
                    {["Photos","Journal","Routine","Check-ins"].map((l) => (
                      <span key={l} className="rounded-[3px] bg-[var(--accent)]/15 px-1 py-0.5 text-[7px] font-semibold text-[var(--accent-dark)]">{l}</span>
                    ))}
                  </div>
                </div>
                {/* Blocked arrow to cloud */}
                <div className="flex items-center gap-2">
                  <div className="h-px w-8 border-t-2 border-dashed border-[var(--coral)]/40" />
                  <div className="rounded-full bg-[var(--coral)]/10 border border-[var(--coral)]/30 p-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </div>
                  <div className="h-px w-8 border-t-2 border-dashed border-[var(--coral)]/40" />
                </div>
                <div className="rounded-[10px] bg-[var(--bg-secondary)] px-3 py-2 text-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" className="mx-auto mb-1 opacity-40"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
                  <p className="text-[8px] font-semibold text-[var(--text-muted)]">Cloud / Server</p>
                  <p className="text-[7px] text-[var(--text-muted)] opacity-60">Never receives photos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FULL-BLEED QUOTE — Typographic break, no cards
          ============================================================ */}
      <section className="landing-quote-section border-y border-[var(--border-light)] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <blockquote
            data-aos="fade-up"
            className="text-display text-[clamp(24px,4vw,42px)] leading-[1.2] text-[var(--text-primary)]"
          >
            &ldquo;I built this because I watched my friends
            <span className="relative inline-block mx-1">
              hate their skin
              <svg aria-hidden="true" viewBox="0 0 180 70" className="pointer-events-none absolute -left-3 -top-3 h-[145%] w-[122%] text-[var(--coral)]" fill="none">
                <path d="M16 37C16 19 44 8 85 8C126 8 162 19 162 36C162 55 132 62 87 62C42 62 13 53 16 37Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </span>
            based on images that
            <em className="text-[var(--accent)]"> weren&apos;t even real</em>.&rdquo;
          </blockquote>
          <p data-aos="fade-up" data-aos-delay="100" className="mt-6 text-[14px] text-[var(--text-tertiary)]">
            The developer, 14 years old
          </p>
        </div>
      </section>

      {/* ============================================================
          WHY THIS MATTERS NOW — Evidence + researcher voice
          ============================================================ */}
      <section className="px-6 py-20 md:py-24 bg-[var(--bg-primary)]">
        <div className="mx-auto max-w-4xl">
          <div data-aos="fade-up" className="mb-10 max-w-2xl">
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] mb-3">
              Why this matters now
            </p>
            <h2 className="text-display text-[clamp(26px,4vw,40px)] text-[var(--text-primary)] leading-[1.1]">
              This isn&apos;t a vibe. It&apos;s a documented public-health concern.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div data-aos="fade-up" className="rounded-[18px] border border-[var(--border-light)] bg-[var(--bg-card)] p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--accent)] mb-2">
                US Surgeon General, 2023
              </p>
              <p className="text-[15px] leading-[1.75] text-[var(--text-secondary)]">
                The 2023 Surgeon General advisory found that adolescents who spend more than three
                hours per day on social media face roughly double the risk of experiencing symptoms
                of depression and anxiety.<sup><a href="#source-1" className="text-[var(--accent)] hover:underline">1</a></sup>
              </p>
            </div>

            <div data-aos="fade-up" data-aos-delay="100" className="rounded-[18px] border border-[var(--border-light)] bg-[var(--bg-card)] p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--accent)] mb-2">
                JAMA Facial Plastic Surgery, 2018
              </p>
              <p className="text-[15px] leading-[1.75] text-[var(--text-secondary)]">
                Dermatologists named the phenomenon &ldquo;Snapchat dysmorphia&rdquo;: patients
                arriving with filtered selfies asking surgeons to make their real face look like the
                edited image.<sup><a href="#source-3" className="text-[var(--accent)] hover:underline">3</a></sup>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA — Final, focused
          ============================================================ */}
      <section className="px-6 pb-20 pt-4 md:pb-28">
        <div
          data-aos="fade-up"
          className="landing-cta mx-auto max-w-4xl rounded-[28px] px-6 py-14 text-center md:px-12 md:py-20 relative overflow-hidden"
        >
          {/* Grain */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "128px 128px",
          }} />

          <div className="relative z-10">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Congressional App Challenge 2026
            </p>
            <h2 className="text-display text-[clamp(28px,4.5vw,44px)] leading-[1.06] text-[var(--text-primary)]">
              Stop comparing.
              <br />
              Start seeing.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-[1.8] text-[var(--text-secondary)]">
              Unfilter is free, private, and built by a freshman at Stevenson HS in
              IL-10 who got tired of watching filtered skin become everyone&apos;s standard.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-[14px] bg-[var(--accent)] px-7 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[var(--accent-dark)] hover:shadow-lg hover:shadow-[var(--accent)]/15"
              >
                Create your account
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-0.5">
                  <path d="M3 8h10m0 0L9.5 4.5M13 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-[14px] border border-[var(--border)] px-7 py-3.5 text-[15px] font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-card)]"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SOURCES
          ============================================================ */}
      <section className="border-t border-[var(--border-light)] px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] mb-4">
            Sources
          </p>
          <ol className="space-y-3 text-[12px] leading-[1.7] text-[var(--text-tertiary)]">
            <li id="source-1">
              <span className="font-semibold text-[var(--text-secondary)]">1.</span>{" "}
              US Surgeon General, <em>Social Media and Youth Mental Health Advisory</em> (2023).{" "}
              <a className="text-[var(--accent)] hover:underline" href="https://www.hhs.gov/surgeongeneral/priorities/youth-mental-health/social-media/index.html" target="_blank" rel="noreferrer">
                hhs.gov/surgeongeneral
              </a>
            </li>
            <li id="source-2">
              <span className="font-semibold text-[var(--text-secondary)]">2.</span>{" "}
              Pew Research Center, <em>Teens, Social Media and Technology 2023</em> (Dec 2023).{" "}
              <a className="text-[var(--accent)] hover:underline" href="https://www.pewresearch.org/internet/2023/12/11/teens-social-media-and-technology-2023/" target="_blank" rel="noreferrer">
                pewresearch.org
              </a>
            </li>
            <li id="source-3">
              <span className="font-semibold text-[var(--text-secondary)]">3.</span>{" "}
              Rajanala S, Maymone MBC, Vashi NA. <em>Selfies—Living in the Era of Filtered
              Photographs.</em> JAMA Facial Plastic Surgery, 2018.{" "}
              <a className="text-[var(--accent)] hover:underline" href="https://jamanetwork.com/journals/jamafacialplasticsurgery/fullarticle/2688763" target="_blank" rel="noreferrer">
                jamanetwork.com
              </a>
            </li>
          </ol>
          <p className="mt-6 text-[11px] text-[var(--text-muted)] italic">
            Stat values reflect figures reported at time of publication and should be verified before
            external citation. Additional researcher quotes will be added with explicit permission.
          </p>
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer className="border-t border-[var(--border-light)] px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 text-[11px] text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>Unfilter · Privacy-first filter literacy for teens · Built in IL-10</p>
          <div className="flex items-center gap-4">
            <p>Educational guidance only · Not medical advice</p>
            <Link href="/privacy" className="hover:text-[var(--accent)] transition">Privacy</Link>
            <Link href="/terms-of-service" className="hover:text-[var(--accent)] transition">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
