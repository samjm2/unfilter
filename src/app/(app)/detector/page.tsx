"use client";

import { useCallback, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { OnboardingGate } from "@/components/OnboardingGate";
import { IconSearch, IconShield, IconArrowRight, IconChevronDown } from "@/components/icons";
import { detectFilters, type DetectionResult, type FilterSignal } from "@/features/detector";

type PageState = "upload" | "analyzing" | "results";

export default function DetectorPage() {
  const [state, setState] = useState<PageState>("upload");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTech, setShowTech] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
    setState("analyzing");

    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      try {
        const detection = detectFilters(img);
        setResult(detection);
        setState("results");
      } catch {
        setError("Couldn't analyze this image. Try a different photo.");
        setState("upload");
      }
    };
    img.onerror = () => {
      setError("This image couldn't be loaded. Try a JPEG or PNG.");
      setPhotoUrl(null);
      setState("upload");
    };
    img.src = url;
  }, []);

  const handleReset = useCallback(() => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(null);
    setResult(null);
    setError(null);
    setShowTech(false);
    setState("upload");
  }, [photoUrl]);

  // ---- Upload ----
  if (state === "upload") {
    return (
      <OnboardingGate>
        <AppShell>
          <div className="mx-auto max-w-lg flex flex-col items-center justify-center" style={{ minHeight: "60vh" }}>
            <div className="text-center animate-reveal">
              <p className="label-evidence text-[var(--text-muted)] mb-4">Filter Detector</p>
              <h1 className="text-display text-[clamp(28px,5vw,42px)] text-[var(--text-primary)] mb-3 leading-[1.05]">
                Does this photo have<br />
                <span className="text-editorial gradient-text">something to hide?</span>
              </h1>
              <p className="text-[14px] text-[var(--text-tertiary)] mb-10 max-w-sm mx-auto leading-relaxed">
                Drop any photo — a screenshot from Instagram, a TikTok save,
                an influencer&apos;s post — and we&apos;ll tell you what was done to it.
              </p>

              {error && (
                <div className="mb-6 rounded-[12px] border border-[var(--coral)]/20 bg-[var(--coral)]/5 px-4 py-3">
                  <p className="text-[13px] text-[var(--coral)] font-medium">{error}</p>
                </div>
              )}

              <label className="btn-primary cursor-pointer text-[15px] !py-4 !px-8 inline-flex items-center gap-2.5">
                <IconSearch size={18} />
                Analyze a Photo
                <input type="file" accept="image/*" className="sr-only" onChange={handleFile} />
              </label>

              <div className="mt-10 flex items-center gap-2 justify-center">
                <IconShield size={11} className="text-[var(--accent)]" />
                <p className="text-[11px] text-[var(--text-muted)]">
                  Nothing to hide. Analysis runs on your device.
                </p>
              </div>
            </div>
          </div>
        </AppShell>
      </OnboardingGate>
    );
  }

  // ---- Analyzing ----
  if (state === "analyzing") {
    return (
      <OnboardingGate>
        <AppShell>
          <div className="mx-auto max-w-md flex flex-col items-center justify-center" style={{ minHeight: "50vh" }}>
            <div className="animate-fade-up text-center">
              <div className="relative mx-auto mb-6">
                <div className="h-16 w-16 rounded-full border-2 border-[var(--accent)]/20 border-t-[var(--accent)] animate-spin mx-auto" />
              </div>
              <p className="text-[15px] font-semibold text-[var(--text-primary)] mb-1">
                Looking for hidden changes...
              </p>
              <p className="text-[12px] text-[var(--text-muted)]">
                Analyzing skin texture, color balance, and sharpness patterns
              </p>
            </div>
          </div>
        </AppShell>
      </OnboardingGate>
    );
  }

  // ---- Results ----
  if (!result || !photoUrl) return null;

  const verdictColors: Record<string, string> = {
    clean: "var(--accent)",
    subtle: "var(--gold)",
    filtered: "var(--coral)",
    heavy: "var(--coral)",
  };

  const verdictLabels: Record<string, string> = {
    clean: "Nothing Hidden",
    subtle: "Subtle Changes",
    filtered: "Filtered",
    heavy: "Heavily Manipulated",
  };

  return (
    <OnboardingGate>
      <AppShell>
        <div className="mx-auto max-w-2xl animate-reveal">
          <p className="label-evidence text-[var(--text-muted)] mb-2">Filter Detector</p>
          <h1 className="text-display text-[clamp(22px,4vw,30px)] text-[var(--text-primary)] mb-6">
            {result.verdict === "clean"
              ? "This photo has nothing to hide."
              : result.verdict === "subtle"
              ? "This photo was lightly touched up."
              : "This photo had something to hide."}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 mb-8">
            {/* Photo + verdict overlay */}
            <div className="relative">
              <div className="card-elevated overflow-hidden rounded-[16px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt="Analyzed photo"
                  className="w-full aspect-[4/5] object-cover"
                />
              </div>

              {/* Verdict badge */}
              <div
                className="absolute top-4 left-4 rounded-[8px] px-3 py-1.5 backdrop-blur-sm"
                style={{
                  background: `color-mix(in srgb, ${verdictColors[result.verdict]} 15%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${verdictColors[result.verdict]} 30%, transparent)`,
                }}
              >
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.1em]"
                  style={{ color: verdictColors[result.verdict] }}
                >
                  {verdictLabels[result.verdict]}
                </p>
              </div>

              {/* Score */}
              <div className="absolute bottom-4 right-4 rounded-[10px] bg-black/60 backdrop-blur-sm px-3 py-2 text-center">
                <p className="text-[24px] font-bold text-white leading-none" style={{ fontFamily: "Fraunces, serif" }}>
                  {result.score}
                </p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-white/60 mt-0.5">
                  Manipulation
                </p>
              </div>
            </div>

            {/* Analysis breakdown */}
            <div className="space-y-4">
              {/* Summary */}
              <div className="rounded-[14px] bg-[var(--bg-secondary)] px-5 py-4">
                <p className="text-[14px] text-[var(--text-primary)] leading-relaxed font-medium">
                  {result.summary}
                </p>
                {result.skinPercent > 0 && (
                  <p className="text-[11px] text-[var(--text-muted)] mt-2">
                    Analyzed {result.skinPercent}% of the image as skin.
                  </p>
                )}
              </div>

              {/* Signals */}
              {result.signals.length > 0 && (
                <div className="space-y-2">
                  {result.signals.map((signal) => (
                    <SignalCard key={signal.type} signal={signal} showTech={showTech} />
                  ))}
                </div>
              )}

              {result.signals.length === 0 && result.reliable && (
                <div className="rounded-[14px] bg-[var(--accent-lighter)] border border-[var(--accent-light)] px-5 py-4">
                  <p className="text-[13px] text-[var(--accent-dark)] font-medium">
                    No manipulation signals detected. This appears to be an unfiltered photo.
                  </p>
                </div>
              )}

              {/* Tech toggle */}
              <button
                onClick={() => setShowTech((p) => !p)}
                className="text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition flex items-center gap-1"
              >
                <IconChevronDown
                  size={12}
                  className={`transition-transform ${showTech ? "rotate-180" : ""}`}
                />
                {showTech ? "Hide technical details" : "Show the math (for judges)"}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={handleReset}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <IconSearch size={16} />
              Analyze Another Photo
            </button>
            <a
              href="/lab"
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              Try the Distortion Lab
              <IconArrowRight size={14} />
            </a>
          </div>

          {/* Educational footer */}
          <div className="rounded-[14px] bg-[var(--bg-secondary)] px-5 py-4 mb-6">
            <p className="label-evidence text-[var(--text-muted)] mb-2">How this works</p>
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
              The detector analyzes pixel patterns that filtering leaves behind.
              Skin smoothing removes texture. Blemish removal creates unnaturally uniform areas.
              Color grading shifts the color balance. Beauty filters smooth skin while keeping eyes sharp —
              that mismatch is the strongest signal. These are the same techniques used in digital forensics.
            </p>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <IconShield size={11} className="text-[var(--accent)]" />
            <p className="text-[11px] text-[var(--text-muted)]">
              Nothing to hide. The photo never left your device.
            </p>
          </div>
        </div>
      </AppShell>
    </OnboardingGate>
  );
}

/* ---- Signal Card ---- */

function SignalCard({ signal, showTech }: { signal: FilterSignal; showTech: boolean }) {
  const typeLabels: Record<string, string> = {
    smoothing: "Skin Smoothing",
    blemishRemoval: "Blemish Removal",
    colorGrading: "Color Grading",
    sharpnessMismatch: "Selective Sharpness",
  };

  const pct = Math.round(signal.confidence * 100);
  const color =
    signal.confidence > 0.6 ? "var(--coral)"
    : signal.confidence > 0.35 ? "var(--gold)"
    : "var(--accent)";

  return (
    <div className="rounded-[12px] surface-truth px-4 py-3">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[13px] font-semibold text-[var(--text-primary)]">
          {typeLabels[signal.type] ?? signal.type}
        </p>
        <span
          className="text-[11px] font-bold tabular-nums"
          style={{ color }}
        >
          {pct}%
        </span>
      </div>

      {/* Confidence bar */}
      <div className="meter-track mb-2">
        <div
          className="meter-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        {signal.description}
      </p>

      {showTech && (
        <p className="mt-2 text-[10px] font-mono text-[var(--text-muted)] leading-relaxed bg-[var(--bg-secondary)] rounded-[8px] px-3 py-2">
          {signal.technical}
        </p>
      )}
    </div>
  );
}
