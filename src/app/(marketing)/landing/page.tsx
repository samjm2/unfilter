"use client";

import { useEffect } from "react";
import Link from "next/link";

// Lightweight AOS — intersection observer that adds .aos-visible
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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function LandingPage() {
  useAOS();

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border-light)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--accent)]">
              <span className="text-white text-[13px] font-bold" style={{ fontFamily: "Fraunces" }}>U</span>
            </div>
            <span className="text-display text-[18px] text-[var(--text-primary)]">Unfilter</span>
          </div>
          <Link
            href="/login"
            className="rounded-[10px] bg-[var(--accent)] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[var(--accent-dark)] transition"
          >
            Open App
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <p
            data-aos="fade-up"
            className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)] mb-4"
          >
            Skin Literacy for Teens
          </p>
          <h1
            data-aos="fade-up"
            data-aos-delay="100"
            className="text-display text-[clamp(36px,7vw,64px)] text-[var(--text-primary)] leading-[1.1]"
          >
            See Skin Clearly.
          </h1>
          <p
            data-aos="fade-up"
            data-aos-delay="200"
            className="mt-5 text-[17px] leading-[1.7] text-[var(--text-secondary)] max-w-lg mx-auto"
          >
            Filters distort reality. Unfilter shows you how — and teaches
            you to build safe skincare routines, all without leaving your device.
          </p>
          <div data-aos="fade-up" data-aos-delay="300" className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-[12px] bg-[var(--accent)] px-6 py-3 text-[15px] font-semibold text-white hover:bg-[var(--accent-dark)] transition shadow-sm"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="rounded-[12px] border border-[var(--border)] px-6 py-3 text-[15px] font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-5xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
      </div>

      {/* What is Unfilter — 3 pillars, no paragraphs */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <p
            data-aos="fade-up"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] text-center mb-10"
          >
            What Unfilter Does
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FeatureCard
              delay="0"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              }
              title="Distortion Lab"
              desc="Upload a photo and see exactly how smoothing, lighting, and reshaping distort reality."
            />
            <FeatureCard
              delay="100"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              }
              title="Barrier Safety Copilot"
              desc="Build your routine. The copilot cross-checks every ingredient pair for conflicts."
            />
            <FeatureCard
              delay="200"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                </svg>
              }
              title="Skin Journal"
              desc="Track confidence and skin over time. Everything stays private on your device."
            />
          </div>
        </div>
      </section>

      {/* Privacy — the differentiator */}
      <section className="px-6 py-16 md:py-20 bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-3xl text-center">
          <div
            data-aos="zoom-in"
            className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-light)] mb-5"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h2
            data-aos="fade-up"
            className="text-display text-[clamp(24px,4vw,36px)] text-[var(--text-primary)] mb-4"
          >
            Your photos never leave this device.
          </h2>
          <p data-aos="fade-up" data-aos-delay="100" className="text-[15px] text-[var(--text-tertiary)] leading-relaxed max-w-md mx-auto">
            No cloud uploads. No server-side processing. Auto-delete enabled
            by default. Built for privacy from the first line of code.
          </p>
        </div>
      </section>

      {/* How it works — 3 steps */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <p
            data-aos="fade-up"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] text-center mb-12"
          >
            How It Works
          </p>

          <div className="space-y-10 md:space-y-14">
            <StepRow
              num="01"
              title="Explore the distortion"
              desc="Upload any photo. Drag the sliders to see how smoothing, reshaping, and lighting manipulate images."
              direction="right"
            />
            <StepRow
              num="02"
              title="Check your routine"
              desc="Select the ingredients in your products. The copilot instantly flags conflicts and stacking risks."
              direction="left"
            />
            <StepRow
              num="03"
              title="Learn and track"
              desc="Read quick flashcards on skin science. Journal your confidence and routine changes over time."
              direction="right"
            />
          </div>
        </div>
      </section>

      {/* Built for */}
      <section className="px-6 py-16 md:py-20 bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            data-aos="fade-up"
            className="text-display text-[clamp(22px,3.5vw,32px)] text-[var(--text-primary)] mb-4"
          >
            Built for teens, by a teen.
          </h2>
          <p
            data-aos="fade-up"
            data-aos-delay="100"
            className="text-[15px] text-[var(--text-tertiary)] leading-relaxed max-w-md mx-auto mb-3"
          >
            Created for the Congressional App Challenge 2025 (IL-10).
            Designed to teach skin literacy without shame, fear, or data collection.
          </p>
          <p
            data-aos="fade-up"
            data-aos-delay="200"
            className="text-[12px] text-[var(--text-muted)]"
          >
            Educational guidance only — not medical advice.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center" data-aos="fade-up">
          <h2 className="text-display text-[clamp(26px,4vw,40px)] text-[var(--text-primary)] mb-4">
            Ready to see clearly?
          </h2>
          <Link
            href="/signup"
            className="inline-flex rounded-[12px] bg-[var(--accent)] px-7 py-3.5 text-[16px] font-semibold text-white hover:bg-[var(--accent-dark)] transition shadow-sm"
          >
            Get Started — Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-light)] px-6 py-6">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <p className="text-[11px] text-[var(--text-muted)]">
            Unfilter &middot; Privacy-first skin literacy
          </p>
          <p className="text-[11px] text-[var(--text-muted)]">
            Congressional App Challenge 2025
          </p>
        </div>
      </footer>
    </main>
  );
}

/* --- Feature Card --- */

function FeatureCard({
  icon,
  title,
  desc,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay: string;
}) {
  return (
    <div
      data-aos="fade-up"
      data-aos-delay={delay}
      className="rounded-[16px] border border-[var(--border-light)] bg-[var(--bg-card)] p-6 text-center"
    >
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-[var(--accent-lighter)] text-[var(--accent)] mb-4">
        {icon}
      </div>
      <h3 className="text-[16px] font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-[13px] leading-relaxed text-[var(--text-tertiary)]">{desc}</p>
    </div>
  );
}

/* --- Step Row --- */

function StepRow({
  num,
  title,
  desc,
  direction,
}: {
  num: string;
  title: string;
  desc: string;
  direction: "left" | "right";
}) {
  return (
    <div
      data-aos={direction === "right" ? "fade-right" : "fade-left"}
      className="flex items-start gap-5 md:gap-8"
    >
      <span
        className="shrink-0 text-[32px] font-bold leading-none text-[var(--warm-400)]"
        style={{ fontFamily: "Fraunces, serif" }}
      >
        {num}
      </span>
      <div>
        <h3 className="text-[17px] font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
        <p className="text-[14px] leading-relaxed text-[var(--text-tertiary)] max-w-md">{desc}</p>
      </div>
    </div>
  );
}
