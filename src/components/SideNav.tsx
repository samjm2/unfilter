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
  IconSearch,
  IconUsers,
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
  { href: "/detector", label: "Filter Detector", icon: IconSearch },
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

const CONNECT: NavItem[] = [
  { href: "/community", label: "Trusted Circle", icon: IconUsers },
];

interface SideNavProps {
  isOpen: boolean;
}

export function SideNav({ isOpen }: SideNavProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <aside className="flex flex-col w-[220px] shrink-0 border-r border-[var(--border-light)] bg-[var(--bg-primary)] sticky top-[48px] h-[calc(100vh-48px)] overflow-y-auto">

      <nav className="flex-1 px-2.5 pt-4 pb-2">
        {/* Primary */}
        <div className="mb-2">
          {PRIMARY.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>

        <Divider />

        {/* Your Routine */}
        <div className="mb-2">
          <SectionLabel text="Your Routine" />
          {YOUR_ROUTINE.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>

        <Divider />

        {/* Learn */}
        <div className="mb-2">
          <SectionLabel text="Learn" />
          {LEARN.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>

        <Divider />

        {/* Connect */}
        <div className="mb-2">
          <SectionLabel text="Connect" />
          {CONNECT.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-2.5 pb-4 pt-3 border-t border-[var(--border-light)]">
        <NavLink
          item={{ href: "/settings", label: "Settings", icon: IconSettings }}
          pathname={pathname}
        />

        {/* Theme badge */}
        <div className="flex items-center gap-2 px-3 mt-3">
          <IconShield size={11} className="text-[var(--accent)] shrink-0" />
          <p className="text-[10px] text-[var(--text-muted)]">Nothing to hide.</p>
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
      className={`relative flex items-center gap-2.5 rounded-[8px] px-3 py-[7px] text-[13px] font-medium transition-all duration-150 ${
        active
          ? "bg-[var(--accent-light)] text-[var(--accent-dark)] font-semibold"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[var(--accent)] transition-all" />
      )}
      <Icon
        size={15}
        className={`transition-colors duration-150 ${active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}
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
