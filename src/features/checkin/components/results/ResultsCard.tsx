"use client";

import { useState } from "react";
import type {
  SkinCategory,
  ActionPlan,
  RedFlagResult,
  SkinMetrics,
} from "../../types";
import type { CrossReferenceResult } from "../../utils/crossReference";

interface ResultsCardProps {
  categories: SkinCategory[];
  actionPlan: ActionPlan;
  redFlags: RedFlagResult;
  metrics: SkinMetrics;
  crossRef: CrossReferenceResult | null;
  onSave: () => void;
  onDiscard: () => void;
  onNewCheckIn: () => void;
}

export function ResultsCard({
  categories,
  actionPlan,
  redFlags,
  metrics,
  crossRef,
  onSave,
  onDiscard,
  onNewCheckIn,
}: ResultsCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  return (
    <div className="space-y-4">
      {/* Disclaimer banner */}
      <div className="rounded-[14px] bg-[var(--accent-lighter)] border border-[var(--accent-light)] px-4 py-3">
        <p className="text-[12px] font-semibold text-[var(--accent-dark)] mb-1">
          This is not a diagnosis.
        </p>
        <p className="text-[11px] text-[var(--accent-dark)]/80 leading-relaxed">
          Unfilter uses pattern recognition on your photo — not medical training.
          A doctor uses years of education, physical examination, your history,
          and tools this app doesn&apos;t have. When in doubt, talk to a trusted
          adult or healthcare provider.
        </p>
      </div>

      {/* Red flag alert (if triggered) */}
      {redFlags.triggered && (
        <div className="rounded-[16px] border-2 border-[var(--coral)]/30 bg-[var(--coral)]/5 p-5">
          <h3 className="text-[16px] font-semibold text-[var(--coral)] mb-2">
            We noticed something worth attention
          </h3>
          <ul className="mb-3 space-y-1.5">
            {redFlags.flags.map((f, i) => (
              <li key={i} className="text-[13px] text-[var(--coral)] flex gap-2">
                <span className="shrink-0 mt-0.5">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M7 4v3.5M7 9.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-[12px] bg-white/70 px-4 py-3 text-[13px] text-[var(--coral)] font-medium">
            {redFlags.message}
          </div>
          {redFlags.escalationLevel === "urgentCare" && (
            <p className="mt-2 text-[11px] text-[var(--coral)]/80">
              If you feel very unwell or the area is rapidly worsening, ask an
              adult to help you get medical attention today.
            </p>
          )}
        </div>
      )}

      {/* Cross-reference: camera vs self-report — truth vs perception */}
      {crossRef && !crossRef.aligned && crossRef.discrepancies.length > 0 && (
        <div className="rounded-[16px] border border-[var(--gold)]/30 bg-[var(--gold)]/5 p-5">
          <p className="label-evidence text-[var(--gold)] mb-2">Discrepancy detected</p>
          <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-1">
            Your photo revealed something you didn&apos;t mention
          </h3>
          <p className="text-[12px] text-[var(--text-secondary)] mb-4 leading-relaxed">
            {crossRef.summary}
          </p>

          <div className="space-y-3">
            {crossRef.discrepancies.map((d, i) => (
              <div
                key={i}
                className={`rounded-[12px] px-4 py-3 ${
                  d.severity === "important"
                    ? "bg-[var(--coral)]/8 border border-[var(--coral)]/20"
                    : d.severity === "noteworthy"
                    ? "bg-[var(--gold)]/10 border border-[var(--gold)]/20"
                    : "bg-[var(--bg-secondary)] border border-[var(--border-light)]"
                }`}
              >
                <div className="flex gap-3 mb-2">
                  <div className="flex-1">
                    <p className="label-evidence text-[var(--accent)] mb-0.5">
                      Camera truth
                    </p>
                    <p className="text-[12px] font-medium text-[var(--text-primary)]">
                      {d.cameraReading}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="label-evidence text-[var(--text-muted)] mb-0.5">
                      Your report
                    </p>
                    <p className="text-[12px] font-medium text-[var(--text-primary)]">
                      {d.userReported}
                    </p>
                  </div>
                </div>
                <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                  {d.message}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[10px] italic text-[var(--text-muted)]">
            Cameras see color and shape — they can&apos;t feel pain, itchiness, or
            how long something has been there. Your answers always matter more
            than what a camera detects.
          </p>
        </div>
      )}

      {/* What the camera measured — truth surface */}
      <div className="rounded-[16px] surface-truth p-5">
        <p className="label-evidence text-[var(--accent)] mb-2">Image analysis</p>
        <h3 className="text-[16px] font-semibold text-[var(--text-primary)] mb-1">
          What the camera measured
        </h3>
        <p className="text-[11px] text-[var(--text-muted)] mb-4">
          Real pixel measurements from your photo — not a diagnosis
        </p>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <MetricPill
            label="Redness"
            value={metrics.redness}
            desc={
              metrics.redness > 0.5
                ? "Above average"
                : metrics.redness > 0.25
                ? "Some redness"
                : "Low"
            }
          />
          <MetricPill
            label="Texture"
            value={metrics.texture}
            desc={
              metrics.texture > 0.5
                ? "Uneven"
                : metrics.texture > 0.25
                ? "Some variation"
                : "Smooth"
            }
          />
          <MetricPill
            label="Spots"
            value={Math.min(1, metrics.spotCount / 20)}
            desc={`${metrics.spotCount} detected`}
          />
          <MetricPill
            label="Evenness"
            value={metrics.uniformity}
            desc={
              metrics.uniformity > 0.7
                ? "Even tone"
                : metrics.uniformity > 0.4
                ? "Some variation"
                : "Uneven"
            }
          />
        </div>

        {metrics.skinPixelRatio !== undefined && (
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className="text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition"
          >
            {showMetrics ? "Hide details" : "How did we measure this?"}
          </button>
        )}

        {showMetrics && (
          <div className="mt-3 rounded-[10px] bg-[var(--bg-secondary)] px-3 py-2.5 animate-fade-up">
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mb-2">
              We analyzed your photo using computer vision — the same kind of math that
              Snapchat uses to find your face. Here&apos;s what we did:
            </p>
            <ul className="space-y-1">
              <li className="text-[10px] text-[var(--text-muted)]">
                <strong>Skin detection:</strong> Found skin pixels using color analysis (HSV color space).{" "}
                {metrics.skinPixelRatio !== undefined &&
                  `${Math.round(metrics.skinPixelRatio * 100)}% of your photo was identified as skin.`}
              </li>
              <li className="text-[10px] text-[var(--text-muted)]">
                <strong>Redness:</strong> Measured how red-shifted your skin pixels are compared to green and blue channels.
              </li>
              <li className="text-[10px] text-[var(--text-muted)]">
                <strong>Spots:</strong> Found dark or red clusters on your skin using flood-fill detection — the same algorithm that erases pimples in the Distortion Lab.
              </li>
              <li className="text-[10px] text-[var(--text-muted)]">
                <strong>Texture:</strong> Measured how much your skin color varies from pixel to pixel (high variation = rougher texture).
              </li>
              <li className="text-[10px] text-[var(--text-muted)]">
                <strong>Evenness:</strong> How consistent your skin tone is across the whole area.
              </li>
            </ul>
            <p className="mt-2 text-[10px] italic text-[var(--text-muted)]">
              Reliability: {Math.round(metrics.reliability * 100)}% — {
                metrics.reliability > 0.6
                  ? "good photo quality for analysis"
                  : "moderate — better lighting or closer crop would improve accuracy"
              }
            </p>
          </div>
        )}
      </div>

      {/* Educational categories */}
      <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm">
        <h3 className="text-[16px] font-semibold text-[var(--text-primary)] mb-1">
          What this might be
        </h3>
        <p className="text-[11px] text-[var(--text-muted)] mb-4">
          Based on your photo + answers — educational categories, not diagnoses
        </p>

        <div className="space-y-3">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="rounded-[14px] border border-[var(--border-light)] bg-[var(--bg-secondary)] p-4"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                  {cat.name}
                </span>
                <span className="flex items-center gap-1.5">
                  <SeverityBadge severity={cat.severity} />
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {Math.round(cat.confidence * 100)}% match
                  </span>
                </span>
              </div>
              {/* Confidence bar */}
              <div className="mb-2 h-1.5 w-full rounded-full bg-[var(--warm-300)]">
                <div
                  className="h-1.5 rounded-full bg-[var(--accent)] transition-all"
                  style={{ width: `${cat.confidence * 100}%` }}
                />
              </div>
              <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                {cat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Reliability note */}
        {metrics.reliability < 0.5 && (
          <div className="mt-3 rounded-[10px] bg-[var(--gold)]/10 px-3 py-2 text-[11px] text-[var(--gold)]">
            Reliability is low — retake with better lighting or closer crop for more accurate results.
          </div>
        )}
      </div>

      {/* Action Plan */}
      <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm">
        <h3 className="text-[16px] font-semibold text-[var(--text-primary)] mb-4">
          Your Action Plan
        </h3>

        <Section title="Do today" items={actionPlan.doItems} color="accent" />
        <Section title="Avoid for now" items={actionPlan.avoidItems} color="coral" />
        <Section title="Track this week" items={actionPlan.trackItems} color="gold" />

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-3 text-[12px] text-[var(--text-muted)] underline decoration-dotted hover:text-[var(--text-secondary)] transition"
        >
          {showDetails ? "Hide" : "Show"} product & ingredient tips
        </button>

        {showDetails && (
          <Section
            title="Product tips"
            items={actionPlan.productTips}
            color="accent"
          />
        )}
      </div>

      {/* Save / discard */}
      <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm">
        <h3 className="text-[13px] font-semibold text-[var(--text-primary)] mb-1">
          Save this check-in?
        </h3>
        <p className="text-[11px] text-[var(--text-muted)] mb-3">
          Saving stores a copy on your device so you can track changes over time.
          Photos are auto-deleted by default — only metrics are kept.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="flex-1 rounded-[12px] bg-[var(--accent)] py-2.5 text-[13px] font-semibold text-white transition hover:bg-[var(--accent-dark)]"
          >
            Save to Journal
          </button>
          <button
            onClick={onDiscard}
            className="flex-1 rounded-[12px] border border-[var(--border)] py-2.5 text-[13px] font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--bg-secondary)]"
          >
            Delete Now
          </button>
        </div>
        <button
          onClick={onNewCheckIn}
          className="mt-2 w-full text-center text-[12px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition"
        >
          Start a new check-in
        </button>
      </div>

      {/* Final disclaimer */}
      <div className="rounded-[10px] bg-[var(--bg-secondary)] px-4 py-3">
        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed text-center">
          Unfilter is an educational tool, not a medical device. It cannot diagnose, treat,
          or prevent any skin condition. If you are concerned about your skin, please see a
          healthcare professional. In an emergency, call 911.
        </p>
      </div>
    </div>
  );
}

/* ---- Helpers ---- */

function MetricPill({
  label,
  value,
  desc,
}: {
  label: string;
  value: number;
  desc: string;
}) {
  const pct = Math.round(value * 100);
  return (
    <div className="rounded-[12px] bg-[var(--bg-secondary)] px-3 py-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-semibold text-[var(--text-secondary)]">{label}</span>
        <span className="text-[11px] font-bold tabular-nums text-[var(--text-primary)]">{pct}%</span>
      </div>
      <div className="h-1 w-full rounded-full bg-[var(--warm-300)] mb-1">
        <div
          className="h-1 rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background:
              value > 0.6
                ? "var(--coral)"
                : value > 0.3
                ? "var(--gold)"
                : "var(--accent)",
          }}
        />
      </div>
      <p className="text-[10px] text-[var(--text-muted)]">{desc}</p>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: "low" | "medium" | "high" }) {
  const styles = {
    low: "bg-[var(--accent-light)] text-[var(--accent-dark)]",
    medium: "bg-[var(--gold)]/15 text-[var(--gold)]",
    high: "bg-[var(--coral)]/15 text-[var(--coral)]",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles[severity]}`}
    >
      {severity}
    </span>
  );
}

function Section({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: string;
}) {
  const dotColor: Record<string, string> = {
    accent: "bg-[var(--accent)]",
    coral: "bg-[var(--coral)]",
    gold: "bg-[var(--gold)]",
  };
  return (
    <div className="mb-4">
      <h4 className="mb-2 text-[13px] font-semibold text-[var(--text-primary)]">
        {title}
      </h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-[12px] text-[var(--text-secondary)]">
            <span
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotColor[color] ?? "bg-[var(--text-muted)]"}`}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
