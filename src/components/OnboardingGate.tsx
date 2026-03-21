"use client";

import { useEffect, useState } from "react";

/**
 * Thin client-side gate that waits for Zustand stores to hydrate
 * before rendering children, preventing flash-of-wrong-state.
 *
 * Route-level redirects (onboarding → login → terms) are handled
 * entirely in middleware.ts, not here.
 */
export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)]">
        <div className="h-8 w-8 rounded-full bg-[var(--accent-lighter)] animate-pulse" />
      </div>
    );
  }

  return <>{children}</>;
}
