"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { OnboardingGate } from "@/components/OnboardingGate";
import { useOnboardingStore } from "@/features/onboarding/store";
import { CalloutPanel, SectionLabel } from "@/components/ui";
import {
  IconCamera,
  IconJournal,
  IconDroplet,
  IconBook,
  IconSparkle,
  IconShield,
  IconArrowRight,
} from "@/components/icons";

const QUICK_ACTIONS = [
  {
    href: "/check-in",
    Icon: IconCamera,
    title: "New Check-in",
    desc: "Photo-based skin guidance",
    gradient: "from-[#e8f0eb] to-[#d4e5da]",
    iconBg: "icon-sage",
  },
  {
    href: "/journal",
    Icon: IconJournal,
    title: "Skin Journal",
    desc: "Track your progress",
    gradient: "from-[#f3efe8] to-[#e8e1d6]",
    iconBg: "icon-warm",
  },
  {
    href: "/routine",
    Icon: IconDroplet,
    title: "Routine Builder",
    desc: "Simple, safe routines",
    gradient: "from-[#fef5f2] to-[#fdeee8]",
    iconBg: "icon-coral",
  },
  {
    href: "/learn",
    Icon: IconBook,
    title: "Learn Hub",
    desc: "Real info, no myths",
    gradient: "from-[#e8f0eb] to-[#f2f7f4]",
    iconBg: "icon-sage",
  },
  {
    href: "/confidence",
    Icon: IconSparkle,
    title: "Confidence Mode",
    desc: "Filters vs reality",
    gradient: "from-[#f0ebf5] to-[#e8e1f0]",
    iconBg: "icon-warm",
  },
];

export default function HomePage() {
  const profile = useOnboardingStore((s) => s.profile);
  const isUnder13 = profile.ageGroup === "under13";

  return (
    <OnboardingGate>
      <AppShell>
        <div className="max-w-4xl">
          {/* Hero section */}
          <div className="mb-12 animate-fade-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-1.5 w-12 rounded-full bg-[var(--accent)]" />
              <span className="text-[13px] font-bold tracking-[0.08em] uppercase text-[var(--accent)]">
                Dashboard
              </span>
            </div>
            <h1 className="text-display text-[clamp(32px,5vw,48px)] text-[var(--text-primary)] mb-4">
              Welcome back
              {profile.goals.length > 0 && (
                <span className="gradient-text">.</span>
              )}
            </h1>
            <p className="text-[18px] text-[var(--text-secondary)] leading-relaxed max-w-lg">
              {isUnder13
                ? "Explore skin health guides and confidence tools — your private learning space."
                : "Your private skin health coach. Pick up where you left off."}
            </p>

            {/* Goal chips */}
            {profile.goals.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mt-6">
                {profile.goals.map((g) => (
                  <span
                    key={g}
                    className="rounded-full card-gradient-sage px-4 py-2 text-[13px] font-semibold text-[var(--accent-dark)]"
                  >
                    {g === "acne" && "Breakouts"}
                    {g === "irritation" && "Irritation"}
                    {g === "routine" && "Routine"}
                    {g === "confidence" && "Confidence"}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {QUICK_ACTIONS.filter(
              (a) => !isUnder13 || a.href !== "/check-in"
            ).map((action, i) => {
              const Icon = action.Icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`group relative overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br ${action.gradient} p-6 transition-all hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 active:scale-[0.98] animate-fade-up`}
                  style={{
                    animationDelay: `${150 + i * 80}ms`,
                    animationFillMode: "both",
                  }}
                >
                  {/* Icon */}
                  <div className={`icon-container icon-lg ${action.iconBg} rounded-[18px] mb-5`}>
                    <Icon size={28} />
                  </div>

                  {/* Text */}
                  <h3 className="text-title text-[18px] text-[var(--text-primary)] mb-1">
                    {action.title}
                  </h3>
                  <p className="text-[14px] text-[var(--text-secondary)]">
                    {action.desc}
                  </p>

                  {/* Arrow */}
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconArrowRight size={18} className="text-[var(--text-tertiary)]" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Privacy card */}
          <div
            className="animate-fade-up"
            style={{ animationDelay: "600ms", animationFillMode: "both" }}
          >
            <CalloutPanel
              icon={<IconShield size={20} />}
              variant="sage"
            >
              <strong>Private by design.</strong> Everything runs on your device.
              Photos are never uploaded. Data auto-deletes unless you choose to
              save it.
            </CalloutPanel>
          </div>

          {/* Disclaimer */}
          <p
            className="mt-8 text-[13px] text-[var(--text-muted)] leading-relaxed max-w-md animate-fade-in"
            style={{ animationDelay: "700ms", animationFillMode: "both" }}
          >
            Unfilter provides educational guidance only — not medical diagnosis.
            Always consult a healthcare provider for medical concerns.
          </p>
        </div>
      </AppShell>
    </OnboardingGate>
  );
}
