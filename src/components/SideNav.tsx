"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store";
import {
  IconHome,
  IconCamera,
  IconJournal,
  IconShield,
  IconBook,
  IconSparkle,
  IconHelp,
  IconSettings,
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

export function SideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-[260px] shrink-0 border-r border-[var(--border-light)] bg-[var(--bg-elevated)]/80 backdrop-blur-sm h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 pt-7 pb-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--accent)] shadow-md shadow-[var(--accent-glow)]">
            <span className="text-white text-[17px] font-bold" style={{ fontFamily: "Fraunces" }}>
              U
            </span>
          </div>
          <div>
            <span className="text-display text-[20px] text-[var(--text-primary)]">
              Unfilter
            </span>
          </div>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <NavSection label="Core Systems" items={CORE_ITEMS} pathname={pathname} />
        <NavSection label="Supporting Systems" items={SUPPORT_ITEMS} pathname={pathname} />
        <NavSection label="Infrastructure" items={INFRA_ITEMS} pathname={pathname} />
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[var(--border-light)] px-4 py-4 space-y-1">
        {/* User + logout */}
        {user && (
          <div className="mt-3 mx-1 rounded-[14px] bg-[var(--warm-200)] px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                  {user.username}
                </p>
                <p className="text-[11px] text-[var(--text-tertiary)] truncate">
                  {user.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--coral)] transition shrink-0 ml-2"
              >
                Log out
              </button>
            </div>
          </div>
        )}

        {/* Privacy badge */}
        <div className="mt-2 mx-1 rounded-[14px] card-gradient-sage px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <IconShield size={16} className="text-[var(--accent)]" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
                100% On-Device
              </p>
              <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                Photos never leave your device
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

function NavSection({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <div className="mb-3">
      <p className="px-4 pt-2 pb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
        {label}
      </p>
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3.5 rounded-[12px] px-4 py-3 text-[15px] font-medium transition-all ${
              active
                ? "bg-[var(--accent-light)] text-[var(--accent-dark)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--warm-200)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Icon size={20} className={active ? "text-[var(--accent)]" : ""} />
            <span>{item.label}</span>
            {active && (
              <div className="ml-auto h-2 w-2 rounded-full bg-[var(--accent)]" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
