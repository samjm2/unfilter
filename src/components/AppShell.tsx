"use client";

import { useEffect, useState } from "react";
import { SideNav } from "./SideNav";
import { TopHeader } from "./TopHeader";

const STORAGE_KEY = "unfilter-sidebar-open";

export function AppShell({ children }: { children: React.ReactNode }) {
  // Default open on desktop; persist preference
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    // If stored, use it; otherwise default to open
    if (stored !== null) {
      setSidebarOpen(stored === "true");
    }
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  // Don't flash the wrong sidebar state on first render
  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="h-[52px] border-b border-[var(--border-light)] bg-[var(--bg-elevated)]" />
        <div className="flex flex-1">
          <div className="w-[220px] border-r border-[var(--border-light)] bg-[var(--bg-primary)]" />
          <main className="flex-1 px-6 py-8 md:px-10 md:py-10">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopHeader sidebarOpen={sidebarOpen} onToggle={toggleSidebar} />

      <div className="flex flex-1 min-h-0">
        <SideNav isOpen={sidebarOpen} />

        <main className="flex-1 min-w-0 overflow-auto px-6 py-8 md:px-10 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
