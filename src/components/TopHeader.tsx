"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store";
import { IconSettings } from "@/components/icons";

interface TopHeaderProps {
  sidebarOpen: boolean;
  onToggle: () => void;
}

export function TopHeader({ sidebarOpen, onToggle }: TopHeaderProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-50 flex items-center h-[52px] border-b border-[var(--border-light)] bg-[var(--bg-elevated)]/90 backdrop-blur-xl shrink-0">

      {/* ── Hamburger + Logo ── */}
      <div className="flex items-center gap-1 pl-3 pr-4">
        {/* Hamburger toggle */}
        <button
          onClick={onToggle}
          className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[var(--text-muted)] hover:bg-[var(--warm-200)] hover:text-[var(--text-secondary)] transition"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? (
            /* X / close */
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <line x1="3" y1="3" x2="13" y2="13" />
              <line x1="13" y1="3" x2="3" y2="13" />
            </svg>
          ) : (
            /* Hamburger */
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <line x1="2" y1="5" x2="14" y2="5" />
              <line x1="2" y1="8.5" x2="14" y2="8.5" />
              <line x1="2" y1="12" x2="14" y2="12" />
            </svg>
          )}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 ml-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-[var(--accent)]">
            <span
              className="text-white text-[12px] font-bold"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              U
            </span>
          </div>
          <span className="text-display text-[17px] text-[var(--text-primary)]">
            Unfilter
          </span>
        </Link>
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Right side ── */}
      <div className="flex items-center gap-1 pr-4">
        <Link
          href="/settings"
          className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[var(--text-muted)] hover:bg-[var(--warm-200)] hover:text-[var(--text-secondary)] transition"
          aria-label="Settings"
        >
          <IconSettings size={15} />
        </Link>

        {user && (
          <div className="flex items-center gap-2.5 ml-1 pl-3 border-l border-[var(--border-light)]">
            {/* Avatar */}
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-light)]">
              <span className="text-[11px] font-bold text-[var(--accent-dark)]">
                {initials}
              </span>
            </div>
            <span className="text-[13px] font-medium text-[var(--text-secondary)] max-w-[140px] truncate hidden sm:block">
              {user.username}
            </span>
            <button
              onClick={handleLogout}
              className="text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--coral)] transition"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
