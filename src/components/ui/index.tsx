"use client";

import { type ReactNode } from "react";

/* ============================================================
   Unfilter UI Primitives — Warm Wellness Design System
   Large, modern, intentional. No emoji fallbacks.
   ============================================================ */

export function ButtonPrimary({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button onClick={onClick} className={`btn-primary ${className}`}>
      {children}
    </button>
  );
}

export function ButtonSecondary({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button onClick={onClick} className={`btn-secondary ${className}`}>
      {children}
    </button>
  );
}

export function ButtonText({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button onClick={onClick} className={`btn-ghost ${className}`}>
      {children}
    </button>
  );
}

export function TrustChip({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[var(--warm-200)] px-4 py-2 text-[13px] font-semibold tracking-[0.01em] text-[var(--warm-700)]">
      <span className="text-[var(--accent)]">{icon}</span>
      {label}
    </span>
  );
}

export function CalloutPanel({
  icon,
  children,
  variant = "sage",
}: {
  icon?: ReactNode;
  children: ReactNode;
  variant?: "sage" | "warm" | "coral";
}) {
  const styles = {
    sage: "card-gradient-sage",
    warm: "card-gradient-warm",
    coral: "card-gradient-coral",
  };

  return (
    <div className={`${styles[variant]} rounded-[var(--radius-md)] px-6 py-5`}>
      <div className="flex gap-4 items-start">
        {icon && (
          <div className={`icon-container icon-sm ${
            variant === "sage" ? "icon-sage" : variant === "coral" ? "icon-coral" : "icon-warm"
          }`}>
            {icon}
          </div>
        )}
        <div className="text-[15px] leading-[1.65] font-medium text-[var(--text-secondary)]">
          {children}
        </div>
      </div>
    </div>
  );
}

export function FeatureItem({
  icon,
  title,
  desc,
  className = "",
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  className?: string;
}) {
  return (
    <div className={`flex gap-4 items-start ${className}`}>
      <div className="icon-container icon-md icon-sage rounded-[14px]">
        {icon}
      </div>
      <div>
        <p className="text-[16px] font-semibold text-[var(--text-primary)] leading-tight">
          {title}
        </p>
        <p className="mt-1 text-[14px] text-[var(--text-secondary)] leading-snug">
          {desc}
        </p>
      </div>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[12px] font-bold tracking-[0.1em] uppercase text-[var(--text-muted)] mb-4">
      {children}
    </p>
  );
}

export function Divider() {
  return (
    <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent my-8" />
  );
}

export function PageHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon?: ReactNode;
}) {
  return (
    <div className="mb-10 animate-fade-up">
      {icon && (
        <div className="icon-container icon-lg icon-sage rounded-[18px] mb-5">
          {icon}
        </div>
      )}
      <h1 className="text-display text-[clamp(28px,4vw,40px)] text-[var(--text-primary)]">
        {title}
      </h1>
      <p className="mt-3 text-[17px] text-[var(--text-secondary)] leading-relaxed max-w-xl">
        {subtitle}
      </p>
    </div>
  );
}
