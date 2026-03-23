"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { OnboardingGate } from "@/components/OnboardingGate";
import {
  IconCamera,
  IconJournal,
  IconShield,
  IconSparkle,
  IconArrowRight,
  IconFlame,
} from "@/components/icons";
import { useAuthStore } from "@/features/auth/store";
import { useJournalStore } from "@/features/journal/store";
import { getStreak, isDoneToday } from "@/features/streak";

const JOURNEY = [
  {
    step: 1,
    label: "Awareness",
    title: "See what filters are doing",
    desc: "Watch a beauty filter change a photo in real time — then understand the tricks behind it.",
    href: "/lab",
    icon: IconCamera,
    color: "var(--accent)",
    bg: "bg-[var(--accent-light)]",
  },
  {
    step: 2,
    label: "Reflection",
    title: "Check in with your skin",
    desc: "Take a quick photo and get an honest, private assessment — no uploading, no judgment.",
    href: "/check-in",
    icon: IconSparkle,
    color: "var(--gold)",
    bg: "bg-[var(--gold-light)]",
  },
  {
    step: 3,
    label: "Action",
    title: "Make sure your routine is safe",
    desc: "Select your products and ingredients — the copilot flags conflicts and scores your routine.",
    href: "/routine",
    icon: IconShield,
    color: "var(--coral)",
    bg: "bg-[var(--coral-light)]",
  },
  {
    step: 4,
    label: "Tracking",
    title: "Track your progress over time",
    desc: "Your journal collects check-ins, confidence scores, and routine changes — all on-device.",
    href: "/journal",
    icon: IconJournal,
    color: "var(--amber)",
    bg: "bg-[var(--gold-light)]",
  },
];

function getLabStats(): { total: number; edits: number } {
  if (typeof window === "undefined") return { total: 0, edits: 0 };
  try {
    const raw = localStorage.getItem("unfilter-lab-runs");
    if (!raw) return { total: 0, edits: 0 };
    return JSON.parse(raw);
  } catch {
    return { total: 0, edits: 0 };
  }
}

// rough count of unique days with journal activity
function daysActiveFromEntries(entries: { createdAt?: number; timestamp?: number }[]) {
  const seen = new Set<string>();
  entries.forEach((e) => {
    const ts = e.createdAt ?? e.timestamp ?? 0;
    if (ts) seen.add(new Date(ts).toISOString().slice(0, 10));
  });
  return seen.size;
}

export default function HomePage() {
  const { user } = useAuthStore();
  const { entries, _hasHydrated } = useJournalStore();
  const router = useRouter();
  const name = user?.username ?? "there";

  const [streak, setStreak] = useState({ count: 0, done: false });
  const [labStats, setLabStats] = useState({ total: 0, edits: 0 });

  useEffect(() => {
    const s = getStreak();
    setStreak({ count: s.count, done: isDoneToday() });
    setLabStats(getLabStats());
  }, []);

  const daysActive = _hasHydrated
    ? Math.max(daysActiveFromEntries(entries), labStats.total > 0 ? 1 : 0)
    : 0;
  const hasActivity = entries.length > 0 || labStats.total > 0;

  return (
    <OnboardingGate>
      <AppShell>
        <div className="mx-auto max-w-2xl">

          <p className="text-[13px] text-[var(--text-muted)] mb-6 animate-fade-up">
            Hi {name}
          </p>

          {/* Main CTA */}
          <section className="mb-10 animate-fade-up stagger-1">
            <h1 className="text-display text-[clamp(30px,6vw,48px)] text-[var(--text-primary)] leading-[1.1] mb-4">
              See what filters<br />
              <span className="gradient-text">actually do.</span>
            </h1>
            <p className="text-[16px] leading-relaxed text-[var(--text-secondary)] max-w-md mb-8">
              Upload a selfie and watch it change in real time.
              Everything stays on your device.
            </p>

            <button
              onClick={() => router.push("/lab")}
              className="group w-full flex items-center justify-between rounded-[16px] bg-[var(--accent)] px-7 py-5 text-white transition-all hover:bg-[var(--accent-dark)] hover:shadow-lg hover:shadow-[var(--accent)]/15 active:scale-[0.99]"
            >
              <div className="text-left">
                <p className="text-[18px] font-semibold mb-0.5">Try the Distortion Lab</p>
                <p className="text-[13px] text-white/70">See how beauty filters manipulate photos</p>
              </div>
              <IconArrowRight size={22} className="shrink-0 opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => router.push("/lab?demo=true")}
              className="mt-3 w-full rounded-[12px] border border-[var(--border-light)] bg-[var(--bg-card)] px-5 py-3.5 text-[14px] font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-hover)] hover:bg-[var(--bg-secondary)]"
            >
              Use a demo image instead
            </button>
          </section>

          {/* Daily reality check card */}
          <section className="mb-8 animate-fade-up stagger-2">
            <Link
              href="/reality-check"
              className={`group flex items-center gap-4 rounded-[14px] border px-5 py-4 transition-all ${
                streak.done
                  ? "border-[var(--accent-light)] bg-[var(--accent-lighter)]"
                  : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-hover)] hover:shadow-sm"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] ${
                  streak.done ? "bg-[var(--accent-light)]" : "bg-[var(--warm-200)]"
                }`}
              >
                <IconFlame
                  size={20}
                  className={streak.done ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                    {streak.done ? "Done for today" : "Today's Reality Check"}
                  </p>
                  {streak.count > 0 && (
                    <span className="rounded-full bg-[var(--accent-light)] px-2 py-0.5 text-[11px] font-bold text-[var(--accent)]">
                      {streak.count} day{streak.count !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-[var(--text-tertiary)]">
                  {streak.done
                    ? "You spotted today's edits."
                    : "30 seconds · spot the filter edits"}
                </p>
              </div>

              {!streak.done && (
                <IconArrowRight size={16} className="shrink-0 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition" />
              )}
            </Link>
          </section>

          {/* Journey steps */}
          <section className="mb-10 animate-fade-up stagger-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-[var(--border)] to-transparent" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Your journey
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-[var(--border)] to-transparent" />
            </div>

            <div className="space-y-3">
              {JOURNEY.map((j) => {
                const Icon = j.icon;
                return (
                  <Link
                    key={j.step}
                    href={j.href}
                    className="group flex items-start gap-4 rounded-[14px] border border-[var(--border-light)] bg-[var(--bg-card)] px-5 py-4 transition-all hover:border-[var(--border-hover)] hover:shadow-sm"
                  >
                    <div className="flex flex-col items-center gap-1.5 pt-0.5">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] ${j.bg}`}
                        style={{ color: j.color }}
                      >
                        <Icon size={20} />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        Step {j.step}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-[15px] font-semibold text-[var(--text-primary)] mb-1">{j.title}</p>
                      <p className="text-[13px] text-[var(--text-tertiary)] leading-relaxed">{j.desc}</p>
                    </div>

                    <IconArrowRight
                      size={16}
                      className="shrink-0 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition mt-2"
                    />
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Progress stats — only render when user has done something */}
          {_hasHydrated && hasActivity && (
            <section className="mb-10 animate-fade-up stagger-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-3">
                Your Progress
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Days Active", value: daysActive },
                  { label: "Lab Runs", value: labStats.total },
                  { label: "Check-Ins", value: entries.length },
                  { label: "Edits Spotted", value: labStats.edits },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-[12px] border border-[var(--border-light)] bg-[var(--bg-card)] px-4 py-3.5"
                  >
                    <p
                      className="text-[24px] font-bold text-[var(--text-primary)] leading-none mb-1.5"
                      style={{ fontFamily: "Fraunces, serif" }}
                    >
                      {value}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">{label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[12px] italic text-[var(--text-muted)]">
                {daysActive >= 7
                  ? "One week of clear eyes."
                  : daysActive >= 3
                  ? "Building awareness."
                  : "Every day counts."}
              </p>
            </section>
          )}

          <div className="flex items-center gap-2.5 justify-center mb-4 animate-fade-in stagger-3">
            <IconShield size={13} className="text-[var(--accent)]" />
            <p className="text-[11px] text-[var(--text-muted)]">
              Everything runs on your device. Nothing is uploaded.
            </p>
          </div>

        </div>
      </AppShell>
    </OnboardingGate>
  );
}
