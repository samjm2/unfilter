"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { useAuthStore } from "@/features/auth/store";
import {
  type AccessibilityPreferences,
  type TextSize,
  type ThemeMode,
  applyPreferencesToDocument,
  getDefaultPreferences,
  loadPreferences,
  savePreferences,
} from "@/features/settings/preferences";

const TEXT_SIZE_OPTIONS: { value: TextSize; label: string; preview: string }[] = [
  { value: "small", label: "Small", preview: "Aa" },
  { value: "medium", label: "Medium", preview: "Aa" },
  { value: "large", label: "Large", preview: "Aa" },
];

const THEME_OPTIONS: { value: ThemeMode; label: string; description: string }[] = [
  { value: "light", label: "Light", description: "Bright, clean surfaces" },
  { value: "dark", label: "Dark", description: "Low-light friendly" },
];

function useAccessibilityPreferences() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(getDefaultPreferences);

  useEffect(() => {
    const loaded = loadPreferences();
    applyPreferencesToDocument(loaded);
    setPreferences(loaded);
  }, []);

  const updatePreferences = (updates: Partial<AccessibilityPreferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...updates };
      savePreferences(next);
      applyPreferencesToDocument(next);
      return next;
    });
  };

  return { preferences, updatePreferences };
}

export default function SettingsPage() {
  const { preferences, updatePreferences } = useAccessibilityPreferences();
  const { logout } = useAuthStore();
  const router = useRouter();
  const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const contrastEnabled = preferences.contrast === "high";
  const textSizeLabel = useMemo(
    () => TEXT_SIZE_OPTIONS.find((option) => option.value === preferences.textSize)?.label ?? "Medium",
    [preferences.textSize]
  );

  useEffect(() => {
    const raw = window.localStorage.getItem("unfilter-auto-delete-enabled");
    if (raw === null) {
      window.localStorage.setItem("unfilter-auto-delete-enabled", "true");
      setAutoDeleteEnabled(true);
      return;
    }
    setAutoDeleteEnabled(raw === "true");
  }, []);

  const handleLogout = useCallback(async (saveData: boolean) => {
    if (!saveData) {
      // Clear all unfilter local data before logging out
      for (let i = window.localStorage.length - 1; i >= 0; i -= 1) {
        const key = window.localStorage.key(i);
        if (!key || !key.startsWith("unfilter-")) continue;
        // Keep preferences (accessibility settings) — clear everything else
        if (key === "unfilter-preferences") continue;
        window.localStorage.removeItem(key);
      }
    }
    await logout();
    router.replace("/login");
  }, [logout, router]);

  const toggleAutoDelete = () => {
    setAutoDeleteEnabled((current) => {
      const next = !current;
      window.localStorage.setItem("unfilter-auto-delete-enabled", String(next));
      return next;
    });
  };

  const exportLocalData = () => {
    const exportPayload: Record<string, string> = {};
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith("unfilter-")) continue;
      const value = window.localStorage.getItem(key);
      if (value !== null) exportPayload[key] = value;
    }

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `unfilter-data-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const deleteAllLocalData = () => {
    for (let i = window.localStorage.length - 1; i >= 0; i -= 1) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith("unfilter-")) continue;
      window.localStorage.removeItem(key);
    }
    window.location.reload();
  };

  return (
    <AppShell>
      <div className="max-w-3xl animate-fade-up">
        <div className="mb-8">
          <h1 className="text-display text-[clamp(30px,4vw,42px)] text-[var(--text-primary)] mb-3">Settings</h1>
          <p className="text-[16px] text-[var(--text-secondary)] max-w-xl">
            Customize readability and appearance. Your choices are saved locally on this device.
          </p>
        </div>

        <section className="card-elevated p-6 md:p-7 mb-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-title text-[19px] text-[var(--text-primary)]">Text Size</p>
              <p className="text-[14px] text-[var(--text-tertiary)]">Current: {textSizeLabel}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {TEXT_SIZE_OPTIONS.map((option) => {
              const active = preferences.textSize === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updatePreferences({ textSize: option.value })}
                  className={`rounded-[14px] border px-4 py-4 text-center transition-all ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent-light)] shadow-sm"
                      : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-hover)]"
                  }`}
                >
                  <p
                    className={`leading-none mb-2 ${
                      option.value === "small"
                        ? "text-[16px]"
                        : option.value === "large"
                          ? "text-[24px]"
                          : "text-[20px]"
                    }`}
                  >
                    {option.preview}
                  </p>
                  <p
                    className={`text-[13px] font-semibold ${
                      active ? "text-[var(--accent-dark)]" : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {option.label}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="card-elevated p-6 md:p-7 mb-5">
          <div className="mb-4">
            <p className="text-title text-[19px] text-[var(--text-primary)]">Appearance</p>
            <p className="text-[14px] text-[var(--text-tertiary)]">Switch between light and dark mode</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {THEME_OPTIONS.map((option) => {
              const active = preferences.theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updatePreferences({ theme: option.value })}
                  className={`rounded-[14px] border px-4 py-4 text-left transition-all ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent-light)] shadow-sm"
                      : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-hover)]"
                  }`}
                >
                  <p className="text-[15px] font-semibold text-[var(--text-primary)] mb-1">{option.label}</p>
                  <p className="text-[13px] text-[var(--text-tertiary)]">{option.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="card-elevated p-6 md:p-7">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-title text-[19px] text-[var(--text-primary)] mb-1">High Contrast</p>
              <p className="text-[14px] text-[var(--text-tertiary)]">
                Increases contrast for text, borders, and surfaces for improved legibility.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={contrastEnabled}
              onClick={() => updatePreferences({ contrast: contrastEnabled ? "normal" : "high" })}
              className={`relative shrink-0 h-8 w-14 rounded-full transition ${
                contrastEnabled ? "bg-[var(--accent)]" : "bg-[var(--warm-400)]"
              }`}
            >
              <span
                className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  contrastEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </section>

        <section className="card-elevated p-6 md:p-7 mt-5">
          <div className="mb-4">
            <p className="text-title text-[19px] text-[var(--text-primary)]">Privacy Controls</p>
            <p className="text-[14px] text-[var(--text-tertiary)]">
              On-device processing, auto-delete defaults, and local data controls.
            </p>
          </div>

          <div className="rounded-[14px] bg-[var(--bg-secondary)] px-4 py-3 mb-3">
            <p className="text-[13px] font-semibold text-[var(--text-primary)]">Photos never leave your device</p>
            <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
              Unfilter runs skin and distortion processing locally. No cloud photo upload.
            </p>
          </div>

          <div className="flex items-start justify-between gap-5 rounded-[14px] bg-[var(--bg-secondary)] px-4 py-3 mb-3">
            <div>
              <p className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">Auto-delete defaults</p>
              <p className="text-[12px] text-[var(--text-tertiary)]">
                Enabled by default to reduce retained photo data.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoDeleteEnabled}
              onClick={toggleAutoDelete}
              className={`relative shrink-0 h-8 w-14 rounded-full transition ${
                autoDeleteEnabled ? "bg-[var(--accent)]" : "bg-[var(--warm-400)]"
              }`}
            >
              <span
                className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  autoDeleteEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportLocalData}
              className="rounded-[10px] border border-[var(--border)] px-4 py-2 text-[13px] font-semibold text-[var(--text-primary)] hover:bg-[var(--warm-200)]"
            >
              Export My Data
            </button>
            <button
              type="button"
              onClick={deleteAllLocalData}
              className="rounded-[10px] border border-[var(--coral)]/30 bg-[var(--coral)]/10 px-4 py-2 text-[13px] font-semibold text-[var(--coral)] hover:bg-[var(--coral)]/20"
            >
              Delete My Data
            </button>
          </div>
        </section>

        {/* Session & Account */}
        <section className="card-elevated p-6 md:p-7 mt-5">
          <div className="mb-4">
            <p className="text-title text-[19px] text-[var(--text-primary)]">Session</p>
            <p className="text-[14px] text-[var(--text-tertiary)]">
              For shared devices, sign out when you&apos;re done to protect your data.
            </p>
          </div>

          {!showLogoutConfirm ? (
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="rounded-[10px] border border-[var(--border)] px-4 py-2.5 text-[13px] font-semibold text-[var(--text-primary)] hover:bg-[var(--warm-200)] transition w-full text-left"
            >
              Sign Out
            </button>
          ) : (
            <div className="rounded-[14px] bg-[var(--bg-secondary)] p-4 animate-fade-up">
              <p className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">
                Save your progress?
              </p>
              <p className="text-[12px] text-[var(--text-tertiary)] mb-4">
                Your journal entries, routine data, and check-in history are stored on this device.
                Choose whether to keep them for next time or clear everything.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleLogout(true)}
                  className="rounded-[10px] bg-[var(--accent)] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[var(--accent-dark)] transition"
                >
                  Save &amp; Sign Out
                </button>
                <button
                  type="button"
                  onClick={() => handleLogout(false)}
                  className="rounded-[10px] border border-[var(--coral)]/30 bg-[var(--coral)]/10 px-4 py-2 text-[13px] font-semibold text-[var(--coral)] hover:bg-[var(--coral)]/20 transition"
                >
                  Clear Data &amp; Sign Out
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="rounded-[10px] px-4 py-2 text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
