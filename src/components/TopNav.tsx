"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome,
  IconCamera,
  IconJournal,
  IconShield,
  IconBook,
  IconHelp,
  IconSettings,
  IconSparkle,
  IconX,
} from "@/components/icons";

const CORE_ITEMS = [
  { href: "/lab", label: "Distortion Lab", icon: IconCamera },
  { href: "/routine", label: "Barrier Safety", icon: IconShield },
  { href: "/journal", label: "Journal", icon: IconJournal },
];

const SUPPORT_ITEMS = [
  { href: "/check-in", label: "On-Device Insight", icon: IconSparkle },
  { href: "/learn", label: "Learn Hub", icon: IconBook },
  { href: "/help", label: "Skin Literacy Guide", icon: IconHelp },
];

const INFRA_ITEMS = [
  { href: "/", label: "Home", icon: IconHome },
  { href: "/settings", label: "Settings", icon: IconSettings },
];

export function TopNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="md:hidden sticky top-0 z-50 border-b border-[var(--border-light)] bg-[var(--bg-elevated)]/85 backdrop-blur-xl">
      <div className="flex items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--accent)]">
            <span className="text-white text-[13px] font-bold" style={{ fontFamily: "Fraunces" }}>U</span>
          </div>
          <span className="text-display text-[18px] text-[var(--text-primary)]">
            Unfilter
          </span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[var(--text-secondary)] hover:bg-[var(--warm-200)] transition"
          aria-label="Toggle menu"
        >
          {open ? (
            <IconX size={20} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="17" y2="6" />
              <line x1="3" y1="10" x2="17" y2="10" />
              <line x1="3" y1="14" x2="17" y2="14" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <nav className="animate-fade-up border-t border-[var(--border-light)] bg-[var(--bg-elevated)] px-5 py-4 space-y-1">
          <SectionLabel text="Core Systems" />
          {CORE_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3.5 rounded-[12px] px-4 py-3 text-[15px] font-medium transition ${
                  active
                    ? "bg-[var(--accent-light)] text-[var(--accent-dark)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--warm-200)]"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <SectionLabel text="Supporting Systems" />
          {SUPPORT_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3.5 rounded-[12px] px-4 py-3 text-[15px] font-medium transition ${
                  active
                    ? "bg-[var(--accent-light)] text-[var(--accent-dark)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--warm-200)]"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <SectionLabel text="Infrastructure" />
          {INFRA_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3.5 rounded-[12px] px-4 py-3 text-[15px] font-medium transition ${
                  active
                    ? "bg-[var(--accent-light)] text-[var(--accent-dark)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--warm-200)]"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
      {text}
    </p>
  );
}
