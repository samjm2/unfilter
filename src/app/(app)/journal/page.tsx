"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { OnboardingGate } from "@/components/OnboardingGate";
import { OnDeviceBadge } from "@/components/OnDeviceBadge";
import { IconShield } from "@/components/icons";
import { useJournalStore } from "@/features/journal/store";
import type { JournalEntry } from "@/features/journal/types";

type ReflectionEntry = {
  id: string;
  weekOf: string;
  confidence: number;
  routineChange: string;
  observation: string;
  createdAt: number;
};

const STORAGE_KEY = "unfilter-confidence-journal-v1";

export default function JournalPage() {
  const { entries: insightEntries, _hasHydrated, deleteEntry } = useJournalStore();
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"reflections" | "checkins">("checkins");
  const [expandedCheckin, setExpandedCheckin] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    weekOf: new Date().toISOString().slice(0, 10),
    confidence: 6,
    routineChange: "",
    observation: "",
  });

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as ReflectionEntry[];
      setReflections(Array.isArray(parsed) ? parsed : []);
    } catch {
      // Ignore invalid local state.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reflections));
  }, [reflections]);

  const handleDeleteCheckin = useCallback((id: string) => {
    deleteEntry(id);
    setExpandedCheckin(null);
  }, [deleteEntry]);

  const insights = useMemo(() => {
    if (reflections.length < 2) {
      return ["Add at least two weekly entries to unlock pattern insights."];
    }

    const sorted = [...reflections].sort((a, b) => a.createdAt - b.createdAt);
    const dropsAfterChange = sorted.filter((entry, index) => {
      if (!entry.routineChange.trim() || index === 0) return false;
      const previous = sorted[index - 1];
      return entry.confidence < previous.confidence;
    }).length;

    const avgConfidence = Math.round(
      sorted.reduce((sum, item) => sum + item.confidence, 0) / sorted.length
    );

    const notesWithStress = sorted.filter((entry) => /stress|exam|sleep|period|anx/i.test(entry.observation)).length;

    const generated: string[] = [];
    generated.push(`Average weekly confidence: ${avgConfidence}/10.`);

    if (dropsAfterChange > 0) {
      generated.push("Confidence drops when routines change quickly. Consider spacing changes by at least 2 weeks.");
    } else {
      generated.push("No clear confidence drop after routine edits so far. Keep making one change at a time.");
    }

    if (notesWithStress > 0) {
      generated.push("Multiple notes mention stress or low sleep. Lifestyle load may be affecting skin confidence.");
    }

    return generated;
  }, [reflections]);

  return (
    <OnboardingGate>
      <AppShell>
        <div className="mx-auto max-w-4xl">
          <header className="mb-6 animate-fade-up">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--coral)]">
              Reflection System
            </p>
            <h1 className="mt-2 text-display text-[clamp(28px,4vw,40px)] text-[var(--text-primary)]">
              Confidence & Skin Journal
            </h1>
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-[var(--text-secondary)]">
              Track patterns, not appearance scores. Capture confidence, routine changes, and skin observations week by week.
            </p>
          </header>

          {/* Privacy badge */}
          <div className="mb-6 animate-fade-up stagger-1">
            <OnDeviceBadge />
          </div>

          {/* Tab switcher */}
          <div className="mb-6 flex items-center gap-1 rounded-[10px] bg-[var(--bg-secondary)] p-1 animate-fade-up stagger-2">
            <button
              type="button"
              onClick={() => setActiveTab("checkins")}
              className={`flex-1 rounded-[8px] px-3 py-2.5 text-[13px] font-semibold transition ${
                activeTab === "checkins"
                  ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              Check-In Records {insightEntries.length > 0 && `(${insightEntries.length})`}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reflections")}
              className={`flex-1 rounded-[8px] px-3 py-2.5 text-[13px] font-semibold transition ${
                activeTab === "reflections"
                  ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              Weekly Reflections {reflections.length > 0 && `(${reflections.length})`}
            </button>
          </div>

          {/* ===================== CHECK-IN RECORDS TAB ===================== */}
          {activeTab === "checkins" && (
            <section className="animate-fade-up">
              {!_hasHydrated ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="card-elevated h-16 animate-pulse bg-[var(--bg-secondary)]" />
                  ))}
                </div>
              ) : insightEntries.length === 0 ? (
                <div className="card-elevated p-6 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-lighter)] mb-3">
                    <IconShield size={20} className="text-[var(--accent)]" />
                  </div>
                  <p className="text-[15px] font-semibold text-[var(--text-primary)] mb-1">
                    No check-in records yet
                  </p>
                  <p className="text-[13px] text-[var(--text-tertiary)] mb-4 max-w-sm mx-auto">
                    Complete a private skin check-in to see your records here. All data stays on this device.
                  </p>
                  <Link
                    href="/check-in"
                    className="btn-primary inline-flex px-4 py-2.5 text-[13px]"
                  >
                    Start Check-In
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {insightEntries.map((entry) => (
                    <CheckinRecordCard
                      key={entry.id}
                      entry={entry}
                      isExpanded={expandedCheckin === entry.id}
                      onToggle={() => setExpandedCheckin(expandedCheckin === entry.id ? null : entry.id)}
                      onDelete={() => handleDeleteCheckin(entry.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ===================== REFLECTIONS TAB ===================== */}
          {activeTab === "reflections" && (
            <section className="animate-fade-up">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr]">
                {/* Weekly reflection form */}
                <div className="card-elevated p-4">
                  <h2 className="mb-3 text-[16px] font-semibold text-[var(--text-primary)]">Weekly Reflection</h2>

                  <label className="mb-3 block text-[13px] text-[var(--text-secondary)]">
                    Week of
                    <input
                      type="date"
                      value={draft.weekOf}
                      onChange={(e) => setDraft((prev) => ({ ...prev, weekOf: e.target.value }))}
                      className="mt-1 w-full rounded-[10px] border border-[var(--border-light)] bg-[var(--bg-card)] px-3 py-2 text-[14px] text-[var(--text-primary)]"
                    />
                  </label>

                  <div className="mb-3">
                    <div className="mb-2 flex items-center justify-between text-[13px] text-[var(--text-secondary)]">
                      <span>Weekly confidence slider</span>
                      <span className="font-semibold text-[var(--text-primary)]">{draft.confidence}/10</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={draft.confidence}
                      onChange={(e) => setDraft((prev) => ({ ...prev, confidence: Number(e.target.value) }))}
                      className="w-full"
                      aria-label="Weekly confidence"
                    />
                  </div>

                  <label className="mb-3 block text-[13px] text-[var(--text-secondary)]">
                    Routine change log
                    <textarea
                      value={draft.routineChange}
                      onChange={(e) => setDraft((prev) => ({ ...prev, routineChange: e.target.value }))}
                      rows={3}
                      placeholder="What changed this week? (new active, reduced frequency, simplified routine...)"
                      className="mt-1 w-full rounded-[10px] border border-[var(--border-light)] bg-[var(--bg-card)] px-3 py-2 text-[14px] text-[var(--text-primary)]"
                    />
                  </label>

                  <label className="mb-3 block text-[13px] text-[var(--text-secondary)]">
                    Skin observation notes
                    <textarea
                      value={draft.observation}
                      onChange={(e) => setDraft((prev) => ({ ...prev, observation: e.target.value }))}
                      rows={3}
                      placeholder="What did you notice this week? (comfort, irritation, confidence moments...)"
                      className="mt-1 w-full rounded-[10px] border border-[var(--border-light)] bg-[var(--bg-card)] px-3 py-2 text-[14px] text-[var(--text-primary)]"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      const entry: ReflectionEntry = {
                        id: `reflection-${Date.now()}`,
                        weekOf: draft.weekOf,
                        confidence: draft.confidence,
                        routineChange: draft.routineChange.trim(),
                        observation: draft.observation.trim(),
                        createdAt: Date.now(),
                      };
                      setReflections((prev) => [entry, ...prev]);
                      setDraft((prev) => ({ ...prev, routineChange: "", observation: "" }));
                    }}
                    className="btn-primary px-4 py-2.5 text-[14px]"
                  >
                    Save Weekly Entry
                  </button>
                </div>

                {/* Insights */}
                <div className="space-y-4">
                  <div className="card p-4">
                    <h2 className="mb-2 text-[16px] font-semibold text-[var(--text-primary)]">Pattern Insights</h2>
                    <ul className="space-y-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                      {insights.map((insight) => (
                        <li key={insight} className="rounded-[10px] bg-[var(--bg-secondary)] px-3 py-2">
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {insightEntries.length > 0 && (
                    <div className="card p-4">
                      <div className="flex items-center gap-2">
                        <IconShield size={14} className="text-[var(--accent)] shrink-0" />
                        <p className="text-[13px] text-[var(--text-secondary)]">
                          You have <strong>{insightEntries.length}</strong> private check-in record{insightEntries.length === 1 ? "" : "s"}.{" "}
                          <button
                            type="button"
                            onClick={() => setActiveTab("checkins")}
                            className="text-[var(--accent)] font-semibold hover:underline"
                          >
                            View records
                          </button>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Past reflections */}
              <div className="mt-6">
                <h2 className="mb-3 text-[16px] font-semibold text-[var(--text-primary)]">Recent Weekly Entries</h2>
                <div className="space-y-2">
                  {reflections.length === 0 ? (
                    <p className="card px-4 py-3 text-[13px] text-[var(--text-tertiary)]">No weekly entries yet.</p>
                  ) : (
                    reflections.map((entry) => (
                      <article key={entry.id} className="card p-4">
                        <div className="mb-1 flex items-center justify-between gap-3">
                          <p className="text-[14px] font-semibold text-[var(--text-primary)]">Week of {entry.weekOf}</p>
                          <p className="text-[12px] font-semibold text-[var(--accent-dark)]">Confidence {entry.confidence}/10</p>
                        </div>
                        {entry.routineChange ? (
                          <p className="text-[13px] text-[var(--text-secondary)]"><strong>Routine change:</strong> {entry.routineChange}</p>
                        ) : null}
                        {entry.observation ? (
                          <p className="mt-1 text-[13px] text-[var(--text-secondary)]"><strong>Observation:</strong> {entry.observation}</p>
                        ) : null}
                      </article>
                    ))
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </AppShell>
    </OnboardingGate>
  );
}

/* ---------- Check-In Record Card ---------- */

const SEVERITY_COLORS = {
  low: "bg-[var(--accent-lighter)] text-[var(--accent)]",
  medium: "bg-[var(--gold-light)] text-[var(--gold)]",
  high: "bg-[var(--coral-light)] text-[var(--coral)]",
} as const;

function CheckinRecordCard({
  entry,
  isExpanded,
  onToggle,
  onDelete,
}: {
  entry: JournalEntry;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const date = new Date(entry.timestamp);
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const maxSeverity = entry.categories.reduce<"low" | "medium" | "high">(
    (max, cat) => {
      const order = { low: 0, medium: 1, high: 2 };
      return order[cat.severity] > order[max] ? cat.severity : max;
    },
    "low"
  );

  return (
    <div className="card-elevated overflow-hidden">
      {/* Summary row — always visible */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-4 py-3.5 text-left hover:bg-[var(--bg-secondary)] transition"
      >
        {/* Photo thumbnail or placeholder */}
        <div className="h-11 w-11 shrink-0 rounded-[10px] bg-[var(--bg-secondary)] overflow-hidden">
          {entry.photoDataUrl ? (
            <img
              src={entry.photoDataUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[var(--text-muted)]">
              <IconShield size={16} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-[var(--text-primary)]">{dateStr}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-[var(--text-muted)]">{timeStr}</span>
            {entry.categories.length > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${SEVERITY_COLORS[maxSeverity]}`}>
                {maxSeverity}
              </span>
            )}
            {entry.hadRedFlags && (
              <span className="rounded-full bg-[var(--coral-light)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--coral)]">
                Red Flag
              </span>
            )}
          </div>
        </div>

        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"
          className={`shrink-0 text-[var(--text-muted)] transition-transform ${isExpanded ? "rotate-180" : ""}`}
        >
          <path d="M3 5L6 8L9 5" />
        </svg>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-[var(--border-light)] px-4 py-4 space-y-4 animate-fade-up">
          {/* Photo (larger) */}
          {entry.photoDataUrl && (
            <div className="rounded-[12px] overflow-hidden bg-[var(--bg-secondary)] max-w-xs">
              <img
                src={entry.photoDataUrl}
                alt="Check-in photo"
                className="w-full"
              />
            </div>
          )}

          {/* Metrics */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)] mb-2">
              Metrics Snapshot
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <MetricPill label="Redness" value={entry.metrics.redness} />
              <MetricPill label="Texture" value={entry.metrics.texture} />
              <MetricPill label="Spots" value={entry.metrics.spotCount} />
              <MetricPill label="Uniformity" value={entry.metrics.uniformity} />
              <MetricPill label="Reliability" value={entry.metrics.reliability} />
            </div>
          </div>

          {/* Categories */}
          {entry.categories.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)] mb-2">
                Categories Detected
              </p>
              <div className="flex flex-wrap gap-1.5">
                {entry.categories.map((cat) => (
                  <span
                    key={cat.name}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${SEVERITY_COLORS[cat.severity]}`}
                  >
                    {cat.name} ({Math.round(cat.confidence * 100)}%)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Symptom context */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)] mb-2">
              Context
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
              <ContextRow label="Itch/Pain" value={entry.symptoms.itchOrPain} />
              <ContextRow label="Duration" value={entry.symptoms.duration} />
              <ContextRow label="Spreading" value={entry.symptoms.spreading ? "Yes" : "No"} />
              <ContextRow label="Stress" value={entry.symptoms.stressLevel} />
              {entry.symptoms.newProducts && (
                <ContextRow label="New products" value={entry.symptoms.newProducts} />
              )}
              {entry.symptoms.location && (
                <ContextRow label="Location" value={entry.symptoms.location} />
              )}
            </div>
          </div>

          {/* Note */}
          {entry.note && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)] mb-1">Note</p>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{entry.note}</p>
            </div>
          )}

          {/* Tags */}
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entry.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-tertiary)]">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Delete */}
          <div className="pt-2 border-t border-[var(--border-light)]">
            <button
              type="button"
              onClick={onDelete}
              className="text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--coral)] transition"
            >
              Delete this record
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[8px] bg-[var(--bg-secondary)] px-2.5 py-1.5">
      <p className="text-[10px] text-[var(--text-muted)]">{label}</p>
      <p className="text-[13px] font-semibold text-[var(--text-primary)] tabular-nums">{value}</p>
    </div>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="text-[var(--text-secondary)] font-medium capitalize">{value}</span>
    </div>
  );
}
