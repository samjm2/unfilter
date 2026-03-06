"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { OnboardingGate } from "@/components/OnboardingGate";
import { OnDeviceBadge } from "@/components/OnDeviceBadge";

type ActiveId = "aha" | "bha" | "retinoid" | "benzoyl" | "vitamin-c" | "none";

type ActiveUse = {
  id: string;
  active: ActiveId;
  frequency: number;
  notes: string;
};

const ACTIVE_OPTIONS: { id: ActiveId; label: string }[] = [
  { id: "aha", label: "AHAs (glycolic/lactic)" },
  { id: "bha", label: "BHA (salicylic acid)" },
  { id: "retinoid", label: "Retinoid (retinol/adapalene)" },
  { id: "benzoyl", label: "Benzoyl peroxide" },
  { id: "vitamin-c", label: "Vitamin C" },
  { id: "none", label: "No active ingredient" },
];

const STORAGE_KEY = "unfilter-barrier-copilot-v1";

export default function BarrierCopilotPage() {
  const [entries, setEntries] = useState<ActiveUse[]>([]);
  const [barrierResetMode, setBarrierResetMode] = useState(true);
  const [draft, setDraft] = useState<ActiveUse>({
    id: "",
    active: "none",
    frequency: 0,
    notes: "",
  });

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as { entries: ActiveUse[]; barrierResetMode: boolean };
      setEntries(parsed.entries ?? []);
      setBarrierResetMode(parsed.barrierResetMode ?? true);
    } catch {
      // Ignore invalid local state.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ entries, barrierResetMode })
    );
  }, [entries, barrierResetMode]);

  const warnings = useMemo(() => {
    const list: string[] = [];
    const activeIds = new Set(entries.map((entry) => entry.active));

    const retinoid = entries.find((entry) => entry.active === "retinoid");
    const aha = entries.find((entry) => entry.active === "aha");
    const bha = entries.find((entry) => entry.active === "bha");

    entries.forEach((entry) => {
      if (entry.active !== "none" && entry.frequency > 4) {
        list.push(`${labelFor(entry.active)} is logged ${entry.frequency}x/week. Consider reducing frequency.`);
      }
    });

    if (activeIds.has("retinoid") && (activeIds.has("aha") || activeIds.has("bha"))) {
      list.push("Stacking detected: retinoids + acids can increase irritation risk.");
    }

    if (retinoid && retinoid.frequency > 3) {
      list.push("Retinoid frequency is high for teen barrier tolerance. Increase slowly.");
    }

    if ((aha && aha.frequency > 3) || (bha && bha.frequency > 4)) {
      list.push("Frequent exfoliation increases barrier stress risk.");
    }

    if (barrierResetMode && entries.some((entry) => entry.active !== "none" && entry.frequency > 0)) {
      list.push("Barrier Reset Mode is on. Pause active ingredients until stinging/redness settles.");
    }

    return list;
  }, [entries, barrierResetMode]);

  return (
    <OnboardingGate>
      <AppShell>
        <div className="mx-auto max-w-4xl">
          <header className="mb-6 animate-fade-up">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--amber)]">
              Safety Dashboard
            </p>
            <h1 className="mt-2 text-display text-[clamp(28px,4vw,40px)] text-[var(--text-primary)]">
              Barrier Safety Copilot
            </h1>
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-[var(--text-secondary)]">
              Track active ingredient frequency, detect risky stacks, and protect your skin barrier from trend-driven overcorrection.
            </p>
          </header>

          <div className="mb-6 animate-fade-up stagger-1">
            <OnDeviceBadge />
          </div>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr] animate-fade-up stagger-2">
            <div className="card-elevated p-4">
              <h2 className="mb-3 text-[16px] font-semibold text-[var(--text-primary)]">Ingredient Frequency Tracker</h2>

              <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="text-[13px] text-[var(--text-secondary)]">
                  Active Ingredient
                  <select
                    value={draft.active}
                    onChange={(e) => setDraft((prev) => ({ ...prev, active: e.target.value as ActiveId }))}
                    className="mt-1 w-full rounded-[10px] border border-[var(--border-light)] bg-[var(--bg-card)] px-3 py-2 text-[14px] text-[var(--text-primary)]"
                  >
                    {ACTIVE_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                </label>

                <label className="text-[13px] text-[var(--text-secondary)]">
                  Frequency per Week
                  <input
                    type="number"
                    min={0}
                    max={14}
                    value={draft.frequency}
                    onChange={(e) => setDraft((prev) => ({ ...prev, frequency: Number(e.target.value) || 0 }))}
                    className="mt-1 w-full rounded-[10px] border border-[var(--border-light)] bg-[var(--bg-card)] px-3 py-2 text-[14px] text-[var(--text-primary)]"
                  />
                </label>
              </div>

              <label className="mb-3 block text-[13px] text-[var(--text-secondary)]">
                Notes
                <input
                  type="text"
                  value={draft.notes}
                  onChange={(e) => setDraft((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional context (new product, stinging, etc.)"
                  className="mt-1 w-full rounded-[10px] border border-[var(--border-light)] bg-[var(--bg-card)] px-3 py-2 text-[14px] text-[var(--text-primary)]"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  const entry: ActiveUse = {
                    ...draft,
                    id: `entry-${Date.now()}`,
                  };
                  setEntries((prev) => [entry, ...prev]);
                  setDraft({ id: "", active: "none", frequency: 0, notes: "" });
                }}
                className="btn-primary px-4 py-2.5 text-[14px]"
              >
                Add to Tracker
              </button>

              <div className="mt-4 space-y-2">
                {entries.length === 0 && (
                  <p className="rounded-[10px] bg-[var(--bg-secondary)] px-3 py-2 text-[13px] text-[var(--text-tertiary)]">
                    No actives tracked yet.
                  </p>
                )}
                {entries.map((entry) => (
                  <div key={entry.id} className="rounded-[10px] border border-[var(--border-light)] px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[13px] font-semibold text-[var(--text-primary)]">{labelFor(entry.active)}</p>
                      <button
                        type="button"
                        onClick={() => setEntries((prev) => prev.filter((item) => item.id !== entry.id))}
                        className="text-[12px] font-medium text-[var(--text-muted)] hover:text-[var(--coral)]"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-[12px] text-[var(--text-secondary)]">{entry.frequency}x/week</p>
                    {entry.notes ? <p className="text-[12px] text-[var(--text-tertiary)]">{entry.notes}</p> : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="card p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">Barrier Reset Mode</h2>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={barrierResetMode}
                    onClick={() => setBarrierResetMode((value) => !value)}
                    className={`relative h-7 w-12 rounded-full transition ${barrierResetMode ? "bg-[var(--accent)]" : "bg-[var(--warm-400)]"}`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${barrierResetMode ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </div>
                <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
                  Use gentle cleanser + moisturizer + SPF only. Reintroduce one active at a time after skin is calm for at least 7 days.
                </p>
              </div>

              <div className="card p-4">
                <h2 className="mb-2 text-[16px] font-semibold text-[var(--text-primary)]">Active Ingredient Warnings</h2>
                {warnings.length === 0 ? (
                  <p className="text-[13px] text-[var(--text-secondary)]">No major risks detected right now.</p>
                ) : (
                  <ul className="space-y-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                    {warnings.map((warning) => (
                      <li key={warning} className="rounded-[10px] bg-[var(--warm-100)] px-3 py-2">
                        {warning}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="card p-4">
                <h2 className="mb-2 text-[16px] font-semibold text-[var(--text-primary)]">Stacking Detection</h2>
                <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
                  The copilot flags common irritation stacks such as acids + retinoids and high-frequency exfoliation. This tool is educational and not diagnostic.
                </p>
              </div>
            </div>
          </section>
        </div>
      </AppShell>
    </OnboardingGate>
  );
}

function labelFor(active: ActiveId) {
  return ACTIVE_OPTIONS.find((option) => option.id === active)?.label ?? "Unknown";
}
