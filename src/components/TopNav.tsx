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

/* ---------- Navigation structure (mirrors SideNav) ---------- */

const PRIMARY = [
  { href: "/", label: "Home", icon: IconHome },
  { href: "/lab", label: "Distortion Lab", icon: IconCamera },
];

const YOUR_ROUTINE = [
  { href: "/check-in", label: "Check-In", icon: IconSparkle },
  { href: "/routine", label: "Routine Safety", icon: IconShield },
  { href: "/journal", label: "Journal", icon: IconJournal },
];

const LEARN = [
  { href: "/learn", label: "Learn Hub", icon: IconBook },
  { href: "/help", label: "Skin Guide", icon: IconHelp },
  { href: "/confidence", label: "Confidence", icon: IconSparkle },
];

const BOTTOM = [
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
          <span className="text-display text-[18px] text-[var(--text-primary)]">Unfilter</span>
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
          {PRIMARY.map((item) => <MobileLink key={item.href} item={item} pathname={pathname} onClose={() => setOpen(false)} />)}

          <SectionLabel text="Your Routine" />
          {YOUR_ROUTINE.map((item) => <MobileLink key={item.href} item={item} pathname={pathname} onClose={() => setOpen(false)} />)}

          <SectionLabel text="Learn" />
          {LEARN.map((item) => <MobileLink key={item.href} item={item} pathname={pathname} onClose={() => setOpen(false)} />)}

          <div className="mx-2 my-2 h-px bg-[var(--border-light)]" />
          {BOTTOM.map((item) => <MobileLink key={item.href} item={item} pathname={pathname} onClose={() => setOpen(false)} />)}
        </nav>
      )}
    </header>
  );
}

function MobileLink({
  item,
  pathname,
  onClose,
}: {
  item: { href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }> };
  pathname: string;
  onClose: () => void;
}) {
  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClose}
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
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
      {text}
    </p>
  );
}
