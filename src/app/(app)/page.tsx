"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { OnboardingGate } from "@/components/OnboardingGate";
import {
  IconCamera,
  IconJournal,
  IconShield,
  IconSparkle,
  IconBook,
} from "@/components/icons";
import { useAuthStore } from "@/features/auth/store";

export default function HomePage() {
  const { user } = useAuthStore();
  const firstName = user?.username?.split(" ")[0] ?? "there";

  return (
    <OnboardingGate>
      <AppShell>
        <div className="mx-auto max-w-2xl">
          {/* Privacy banner — top of page */}
          <div className="mb-8 flex items-center gap-3 rounded-[12px] border border-[var(--accent-light)] bg-[var(--accent-lighter)] px-4 py-3 animate-fade-up">
            <IconShield size={16} className="text-[var(--accent)] shrink-0" />
            <p className="text-[12px] font-medium text-[var(--accent-dark)]">
              100% on-device processing. Photos never leave this device.
            </p>
          </div>

          {/* Warm welcome — not a wall of text */}
          <section className="mb-10 animate-fade-up stagger-1">
            <p className="text-[13px] font-medium text-[var(--accent)] mb-2">
              Welcome back, {firstName}
            </p>
            <h1 className="text-display text-[clamp(28px,5vw,42px)] text-[var(--text-primary)] leading-tight">
              What would you like<br />to explore today?
            </h1>
          </section>

          {/* Core actions — clean, spaced, inviting */}
          <section className="mb-10 space-y-3 animate-fade-up stagger-2">
            <ActionCard
              href="/lab"
              icon={<IconCamera size={22} />}
              iconBg="bg-[var(--accent-light)] text-[var(--accent)]"
              title="Distortion Lab"
              desc="See how filters really change your photos"
            />
            <ActionCard
              href="/routine"
              icon={<IconShield size={22} />}
              iconBg="bg-[var(--coral-light)] text-[var(--coral)]"
              title="Barrier Safety Copilot"
              desc="Check your routine for ingredient conflicts"
            />
            <ActionCard
              href="/journal"
              icon={<IconJournal size={22} />}
              iconBg="bg-[var(--gold-light)] text-[var(--gold)]"
              title="Skin Journal"
              desc="Track your skin and confidence over time"
            />
          </section>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent mb-8" />

          {/* Secondary links — quiet, not competing */}
          <section className="mb-6 animate-fade-up stagger-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-3 px-1">
              More
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <QuickLink href="/check-in" icon={<IconSparkle size={15} />} label="Check-In" />
              <QuickLink href="/learn" icon={<IconBook size={15} />} label="Learn Hub" />
              <QuickLink href="/confidence" icon={<IconSparkle size={15} />} label="Confidence" />
            </div>
          </section>
        </div>
      </AppShell>
    </OnboardingGate>
  );
}

/* --- Action Card --- */

function ActionCard({
  href,
  icon,
  iconBg,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-[14px] border border-[var(--border-light)] bg-[var(--bg-card)] px-5 py-4 transition-all hover:border-[var(--border-hover)] hover:shadow-sm"
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-[var(--text-primary)]">{title}</p>
        <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">{desc}</p>
      </div>
      <span className="text-[var(--text-muted)] group-hover:text-[var(--text-tertiary)] transition text-[14px] shrink-0">
        &rarr;
      </span>
    </Link>
  );
}

/* --- Quick Link --- */

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-[10px] bg-[var(--bg-secondary)] px-3.5 py-3 text-[12px] font-medium text-[var(--text-secondary)] hover:bg-[var(--warm-300)] transition"
    >
      <span className="text-[var(--text-muted)]">{icon}</span>
      {label}
    </Link>
  );
}
