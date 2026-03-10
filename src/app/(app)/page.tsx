"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { OnboardingGate } from "@/components/OnboardingGate";
import { OnDeviceBadge } from "@/components/OnDeviceBadge";
import { DistortionDemo } from "@/components/DistortionDemo";
import {
  IconCamera,
  IconJournal,
  IconShield,
  IconSparkle,
  IconBook,
  IconSettings,
} from "@/components/icons";

export default function HomePage() {
  return (
    <OnboardingGate>
      <AppShell>
        <div className="mx-auto max-w-4xl">
          {/* Hero */}
          <section className="mb-8 animate-fade-up">
            <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
              Privacy-First Digital Skin Literacy
            </p>
            <h1 className="text-display text-[clamp(34px,6vw,56px)] text-[var(--text-primary)]">
              See Skin Clearly.
            </h1>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[var(--text-secondary)]">
              Filters hide what real skin looks like. Unfilter shows you the
              difference — and protects you from skincare trends that do more
              harm than good.
            </p>
          </section>

          {/* Distortion Demo — the 60-second hook */}
          <section className="mb-8 animate-fade-up stagger-1">
            <DistortionDemo />
          </section>

          {/* Three pillar CTAs */}
          <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3 animate-fade-up stagger-2">
            <PrimaryAction
              href="/lab"
              icon={<IconCamera size={18} />}
              label="Full Distortion Lab"
            />
            <PrimaryAction
              href="/routine"
              icon={<IconShield size={18} />}
              label="Barrier Safety"
            />
            <PrimaryAction
              href="/journal"
              icon={<IconJournal size={18} />}
              label="Skin Journal"
            />
          </section>

          {/* Privacy badge */}
          <section className="mb-8 animate-fade-up stagger-3">
            <OnDeviceBadge />
            <p className="mt-2 text-[12px] text-[var(--text-muted)]">
              Photos never leave your device. Auto-delete is enabled by default.
            </p>
          </section>

          {/* Core systems */}
          <section className="mb-8 animate-fade-up stagger-4">
            <h2 className="mb-3 text-title text-[20px] text-[var(--text-primary)]">
              Core Systems
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <SystemCard
                title="Distortion Lab"
                description="See how smoothing, lighting, and contrast distort real skin side-by-side."
                href="/lab"
                icon={<IconCamera size={18} />}
              />
              <SystemCard
                title="Barrier Safety Copilot"
                description="Warns about ingredient overuse, conflicts, and risky TikTok stacking."
                href="/routine"
                icon={<IconShield size={18} />}
              />
              <SystemCard
                title="Confidence & Skin Journal"
                description="Track confidence patterns, routine changes, and skin observations over time."
                href="/journal"
                icon={<IconJournal size={18} />}
              />
            </div>
          </section>

          {/* Supporting systems */}
          <section className="mb-8 animate-fade-up stagger-5">
            <h2 className="mb-3 text-title text-[18px] text-[var(--text-primary)]">
              Supporting Systems
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <SupportCard
                title="On-Device Skin Insight"
                description="Private capture and observation — no cloud upload."
                href="/check-in"
                icon={<IconSparkle size={17} />}
              />
              <SupportCard
                title="Help & Escalation"
                description="Red flags, conversation scripts, and who to talk to."
                href="/help"
                icon={<IconSparkle size={17} />}
              />
              <SupportCard
                title="Learn Hub"
                description="Myth-busting and practical skin literacy content."
                href="/learn"
                icon={<IconBook size={17} />}
              />
            </div>
          </section>

          {/* Infrastructure */}
          <section className="animate-fade-up stagger-6">
            <h2 className="mb-3 text-title text-[18px] text-[var(--text-primary)]">
              Infrastructure
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <SupportCard
                title="Accessibility + Privacy Controls"
                description="Text size, dark mode, high contrast, data export and deletion."
                href="/settings"
                icon={<IconSettings size={17} />}
              />
              <SupportCard
                title="Authentication"
                description="Account access with local-only data management."
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
    <Link
      href={href}
      className="card-interactive block rounded-[var(--radius-md)] p-4"
    >
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--accent-light)] text-[var(--accent-dark)]">
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">
        {description}
      </p>
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
    <Link
      href={href}
      className="card block rounded-[var(--radius-md)] p-4 hover:bg-[var(--bg-card)] transition-colors"
    >
      <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--warm-200)] text-[var(--text-primary)]">
        {icon}
      </div>
      <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-tertiary)]">
        {description}
      </p>
    </Link>
  );
}
