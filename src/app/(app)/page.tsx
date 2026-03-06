"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { OnboardingGate } from "@/components/OnboardingGate";
import { OnDeviceBadge } from "@/components/OnDeviceBadge";
import { IconCamera, IconJournal, IconShield, IconSparkle, IconBook, IconSettings } from "@/components/icons";

export default function HomePage() {
  return (
    <OnboardingGate>
      <AppShell>
        <div className="mx-auto max-w-4xl">
          <section className="mb-8 animate-fade-up">
            <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
              Privacy-First Digital Skin Literacy
            </p>
            <h1 className="text-display text-[clamp(34px,6vw,56px)] text-[var(--text-primary)]">
              See Skin Clearly.
            </h1>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[var(--text-secondary)]">
              A privacy-first platform that helps teens understand how filters distort skin perception and protects them from harmful skincare overuse.
            </p>
          </section>

          <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3 animate-fade-up stagger-1">
            <PrimaryAction href="/lab" icon={<IconCamera size={18} />} label="Start Distortion Lab" />
            <PrimaryAction href="/routine" icon={<IconShield size={18} />} label="Check Barrier Safety" />
            <PrimaryAction href="/journal" icon={<IconJournal size={18} />} label="Open Journal" />
          </section>

          <section className="mb-6 animate-fade-up stagger-2">
            <OnDeviceBadge />
            <p className="mt-2 text-[12px] text-[var(--text-muted)]">
              Photos never leave your device. Auto-delete is enabled by default.
            </p>
          </section>

          <section className="mb-8 animate-fade-up stagger-3">
            <h2 className="mb-3 text-title text-[20px] text-[var(--text-primary)]">Core Systems</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <SystemCard
                title="Distortion Lab"
                description="Flagship science demo to reveal smoothing, lighting, and contrast distortion side-by-side."
                href="/lab"
                icon={<IconCamera size={18} />}
              />
              <SystemCard
                title="Barrier Safety Copilot"
                description="Practical safety dashboard that warns about overuse, ingredient conflicts, and risky stacking."
                href="/routine"
                icon={<IconShield size={18} />}
              />
              <SystemCard
                title="Confidence & Skin Journal"
                description="Reflection-first journal that tracks confidence patterns, routine changes, and skin observations."
                href="/journal"
                icon={<IconJournal size={18} />}
              />
            </div>
          </section>

          <section className="mb-8 animate-fade-up stagger-4">
            <h2 className="mb-3 text-title text-[18px] text-[var(--text-primary)]">Supporting Systems</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <SupportCard
                title="On-Device Skin Insight"
                description="Optional private capture and observation support."
                href="/check-in"
                icon={<IconSparkle size={17} />}
              />
              <SupportCard
                title="Teen Skin Literacy Guide"
                description="Educational assistant scope: distortion, ingredient interactions, simple routines, escalation guidance."
                href="/help"
                icon={<IconSparkle size={17} />}
              />
              <SupportCard
                title="Learn Hub"
                description="Structured myth-busting and practical literacy content."
                href="/learn"
                icon={<IconBook size={17} />}
              />
            </div>
          </section>

          <section className="animate-fade-up stagger-5">
            <h2 className="mb-3 text-title text-[18px] text-[var(--text-primary)]">Infrastructure</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <SupportCard
                title="Onboarding + Privacy Controls"
                description="Explain on-device processing, consent, and safe usage from the start."
                href="/settings"
                icon={<IconSettings size={17} />}
              />
              <SupportCard
                title="Authentication + Data Management"
                description="Account access with local export/deletion controls and auto-delete defaults."
                href="/settings"
                icon={<IconSettings size={17} />}
              />
            </div>
          </section>
        </div>
      </AppShell>
    </OnboardingGate>
  );
}

function PrimaryAction({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="btn-primary justify-center px-5 py-4 text-[15px]"
    >
      {icon}
      {label}
    </Link>
  );
}

function SystemCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} className="card-interactive block rounded-[var(--radius-md)] p-4">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--accent-light)] text-[var(--accent-dark)]">
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">{description}</p>
    </Link>
  );
}

function SupportCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} className="card block rounded-[var(--radius-md)] p-4 hover:bg-[var(--bg-card)] transition-colors">
      <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--warm-200)] text-[var(--text-primary)]">
        {icon}
      </div>
      <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-tertiary)]">{description}</p>
    </Link>
  );
}
