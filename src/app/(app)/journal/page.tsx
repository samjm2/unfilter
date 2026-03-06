"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { OnboardingGate } from "@/components/OnboardingGate";
import { OnDeviceBadge } from "@/components/OnDeviceBadge";
import { useJournalStore } from "@/features/journal/store";

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
  const { entries: insightEntries } = useJournalStore();
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
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

          <div className="mb-6 animate-fade-up stagger-1">
            <OnDeviceBadge />
          </div>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr] animate-fade-up stagger-2">
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

              <div className="card p-4">
                <h2 className="mb-2 text-[16px] font-semibold text-[var(--text-primary)]">On-Device Insight Link</h2>
                <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
                  You have {insightEntries.length} private check-in record{insightEntries.length === 1 ? "" : "s"}. Use those for context, then reflect here without scoring appearance.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6 animate-fade-up stagger-3">
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
          </section>
        </div>
      </AppShell>
    </OnboardingGate>
  );
}
