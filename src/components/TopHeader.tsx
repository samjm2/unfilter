"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useAuthStore } from "@/features/auth/store";

interface TopHeaderProps {
  sidebarOpen: boolean;
  onToggle: () => void;
}

export function TopHeader({ sidebarOpen, onToggle }: TopHeaderProps) {
  const { user } = useAuthStore();

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";

  return (
    <header className="sticky top-0 z-50 flex items-center h-[48px] border-b border-[var(--border-light)] bg-[var(--bg-elevated)]/92 backdrop-blur-xl shrink-0">

      {/* Left: toggle + logo */}
      <div className="flex items-center gap-0.5 pl-2.5">
        <button
          onClick={onToggle}
          className="flex h-7 w-7 items-center justify-center rounded-[7px] text-[var(--text-muted)] hover:bg-[var(--warm-200)] hover:text-[var(--text-secondary)] transition-colors duration-150"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            {sidebarOpen ? (
              <>
                <line x1="3.5" y1="3.5" x2="12.5" y2="12.5" />
                <line x1="12.5" y1="3.5" x2="3.5" y2="12.5" />
              </>
            ) : (
              <>
                <line x1="2.5" y1="5" x2="13.5" y2="5" />
                <line x1="2.5" y1="8.5" x2="13.5" y2="8.5" />
                <line x1="2.5" y1="12" x2="13.5" y2="12" />
              </>
            )}
          </svg>
        </button>

        <Link href="/" className="flex items-center gap-2 ml-1.5">
          <Logo size={26} />
        </Link>
      </div>

      <div className="flex-1" />

      {/* Right: user */}
      <div className="flex items-center gap-2 pr-3.5">
        {user && (
          <>
            <span className="text-[12px] text-[var(--text-muted)] hidden sm:block">
              {user.username}
            </span>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent-light)]">
              <span className="text-[10px] font-bold text-[var(--accent-dark)] leading-none">
                {initials}
              </span>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
