import { create } from "zustand";

/*  ================================================================
    AUTH STORE — Client-side session management
    Manages login state, user info, and auth API calls.
    All skin data stays in separate Zustand stores with
    localStorage persistence — this store only tracks WHO is logged in.
    ================================================================ */

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<{ ok: boolean; errors?: string[] }>;
  login: (email: string, password: string) => Promise<{ ok: boolean; errors?: string[]; needsVerification?: boolean }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    try {
      set({ loading: true });

      // Shared-device safety: if this is a fresh browser session (no
      // sessionStorage flag), sign out automatically so a new user
      // doesn't land on someone else's account.
      const sessionActive = window.sessionStorage.getItem("unfilter_active");
      if (!sessionActive) {
        // Clear the server-side cookie
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        set({ user: null, initialized: true, loading: false });
        return;
      }

      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.user) {
          set({ user: data.user, initialized: true, loading: false });
          return;
        }
      }
      set({ user: null, initialized: true, loading: false });
    } catch {
      set({ user: null, initialized: true, loading: false });
    }
  },

  signup: async (username, email, password) => {
    set({ loading: true });
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      set({ loading: false });
      return { ok: data.ok, errors: data.errors };
    } catch {
      set({ loading: false });
      return { ok: false, errors: ["Network error. Please try again."] };
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.ok && data.user) {
        // Mark this browser tab/session as actively logged in
        window.sessionStorage.setItem("unfilter_active", "1");
        set({ user: data.user, loading: false });
        return { ok: true };
      }

      set({ loading: false });
      return {
        ok: false,
        errors: data.errors,
        needsVerification: data.needsVerification,
      };
    } catch {
      set({ loading: false });
      return { ok: false, errors: ["Network error. Please try again."] };
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Still clear local state even if request fails
    }
    window.sessionStorage.removeItem("unfilter_active");
    set({ user: null });
  },
}));
