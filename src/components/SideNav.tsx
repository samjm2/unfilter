"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome,
  IconCamera,
  IconJournal,
  IconShield,
  IconBook,
  IconSparkle,
  IconHelp,
  IconSettings,
  IconFlame,
} from "@/components/icons";

/* ---------- Navigation structure ---------- */

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

const PRIMARY: NavItem[] = [
  { href: "/", label: "Home", icon: IconHome },
  { href: "/lab", label: "Distortion Lab", icon: IconCamera },
];

const YOUR_ROUTINE: NavItem[] = [
  { href: "/reality-check", label: "Reality Check", icon: IconFlame },
  { href: "/check-in", label: "Check-In", icon: IconSparkle },
  { href: "/routine", label: "Routine Safety", icon: IconShield },
  { href: "/journal", label: "Journal", icon: IconJournal },
];

const LEARN: NavItem[] = [
  { href: "/learn", label: "Learn Hub", icon: IconBook },
  { href: "/help", label: "Skin Guide", icon: IconHelp },
  { href: "/confidence", label: "Confidence", icon: IconSparkle },
];

interface SideNavProps {
  isOpen: boolean;
}

export function SideNav({ isOpen }: SideNavProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <aside className="flex flex-col w-[220px] shrink-0 border-r border-[var(--border-light)] bg-[var(--bg-primary)] sticky top-[52px] h-[calc(100vh-52px)] overflow-y-auto">

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-3 pb-2">
        {/* Primary */}
        <div className="mb-1">
          {PRIMARY.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>

        <Divider />

        {/* Your Routine */}
        <div className="mb-1">
          <SectionLabel text="Your Routine" />
          {YOUR_ROUTINE.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>

        <Divider />

        {/* Learn */}
        <div className="mb-1">
          <SectionLabel text="Learn" />
          {LEARN.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-1.5 border-t border-[var(--border-light)] pt-3">
        <NavLink
          item={{ href: "/settings", label: "Settings", icon: IconSettings }}
          pathname={pathname}
        />

        {/* Privacy badge */}
        <div className="mx-1 rounded-[10px] border border-[var(--accent-light)] bg-[var(--accent-lighter)] px-3 py-2">
          <div className="flex items-center gap-2">
            <IconShield size={13} className="text-[var(--accent)] shrink-0" />
            <p className="text-[11px] font-medium text-[var(--accent-dark)]">100% On-Device</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-[9px] px-3 py-2 text-[13px] font-medium transition-all ${
        active
          ? "bg-[var(--accent-light)] text-[var(--accent-dark)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
      }`}
    >
      <Icon
        size={16}
        className={active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}
      />
      <span>{item.label}</span>
    </Link>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
      {text}
    </p>
  );
}

function Divider() {
  return <div className="mx-2 my-1.5 h-px bg-[var(--border-light)]" />;
}
