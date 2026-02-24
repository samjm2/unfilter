"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome,
  IconCamera,
  IconJournal,
  IconDroplet,
  IconBook,
  IconSparkle,
  IconUsers,
  IconHelp,
  IconSettings,
  IconShield,
} from "@/components/icons";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: IconHome },
  { href: "/check-in", label: "Check-in", icon: IconCamera },
  { href: "/journal", label: "Journal", icon: IconJournal },
  { href: "/routine", label: "Routine", icon: IconDroplet },
  { href: "/learn", label: "Learn", icon: IconBook },
  { href: "/confidence", label: "Confidence", icon: IconSparkle },
  { href: "/community", label: "Trusted Circle", icon: IconUsers },
];

const BOTTOM_ITEMS = [
  { href: "/help", label: "Help", icon: IconHelp },
  { href: "/settings", label: "Settings", icon: IconSettings },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-[260px] shrink-0 border-r border-[var(--border-light)] bg-white/50 backdrop-blur-sm h-screen sticky top-0">
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
        {NAV_ITEMS.map((item) => {
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
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[var(--border-light)] px-4 py-4 space-y-1">
        {BOTTOM_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 rounded-[12px] px-4 py-2.5 text-[14px] font-medium transition-all ${
                active
                  ? "bg-[var(--accent-light)] text-[var(--accent-dark)]"
                  : "text-[var(--text-tertiary)] hover:bg-[var(--warm-200)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Privacy badge */}
        <div className="mt-4 mx-1 rounded-[14px] card-gradient-sage px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <IconShield size={16} className="text-[var(--accent)]" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
                100% On-Device
              </p>
              <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                Your data never leaves your phone
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
