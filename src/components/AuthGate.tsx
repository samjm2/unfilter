"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/features/auth/store";

/*  ================================================================
    AUTH GATE — Protects the entire app behind authentication.
    Public routes: /login, /signup, /api/*
    Everything else requires a valid session.
    ================================================================ */

const PUBLIC_PATHS = ["/login", "/signup", "/landing"];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, initialized, loading, initialize } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth on mount
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  // Redirect logic
  useEffect(() => {
    if (!initialized || loading) return;

    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

    if (!user && !isPublic) {
      // Not logged in, trying to access protected route
      router.replace("/login");
    } else if (user && isPublic) {
      // Logged in, trying to access login/signup
      router.replace("/");
    }
  }, [user, initialized, loading, pathname, router]);

  // Show loading while checking session
  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center animate-fade-up">
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[var(--accent)] mx-auto mb-4">
            <span
              className="text-white text-[18px] font-bold"
              style={{ fontFamily: "Fraunces" }}
            >
              U
            </span>
          </div>
          <p className="text-[14px] text-[var(--text-tertiary)]">Loading…</p>
        </div>
      </div>
    );
  }

  // On public pages without user, or protected pages with user — render
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if ((!user && isPublic) || user) {
    return <>{children}</>;
  }

  // Fallback — loading or redirecting
  return null;
}
