"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { OnboardingGate } from "@/components/OnboardingGate";
import { OnDeviceBadge } from "@/components/OnDeviceBadge";

export default function DistortionLabPage() {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [smoothing, setSmoothing] = useState(35);
  const [lighting, setLighting] = useState<"harsh" | "studio">("studio");

  const processedStyle = useMemo(() => {
    const blur = 0.4 + smoothing / 30;
    const contrast = lighting === "studio" ? 0.9 : 1.2;
    const brightness = lighting === "studio" ? 1.12 : 0.96;

    return {
      filter: `blur(${blur.toFixed(2)}px) contrast(${contrast}) brightness(${brightness}) saturate(0.96)`,
    } as const;
  }, [smoothing, lighting]);

  return (
    <OnboardingGate>
      <AppShell>
        <div className="mx-auto max-w-5xl">
          <header className="mb-6 animate-fade-up">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
              Flagship Experience
            </p>
            <h1 className="mt-2 text-display text-[clamp(28px,4vw,40px)] text-[var(--text-primary)]">
              Distortion Lab
            </h1>
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-[var(--text-secondary)]">
              This is a science demonstration of how digital edits change skin perception. It is not a beauty filter.
            </p>
          </header>

          <div className="mb-6 animate-fade-up stagger-1">
            <OnDeviceBadge />
          </div>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr] animate-fade-up stagger-2">
            <div className="card-elevated p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">Side-by-Side Comparison</h2>
                <label className="text-[12px] font-medium text-[var(--text-tertiary)]">
                  Upload photo
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setPhotoDataUrl(String(reader.result));
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <PreviewCard label="Original" image={photoDataUrl} />
                <PreviewCard label="Distorted" image={photoDataUrl} style={processedStyle} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="card p-4">
                <h2 className="mb-3 text-[16px] font-semibold text-[var(--text-primary)]">Controls</h2>

                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between text-[13px] text-[var(--text-secondary)]">
                    <span>Smoothing</span>
                    <span className="font-semibold text-[var(--text-primary)]">{smoothing}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={smoothing}
                    onChange={(e) => setSmoothing(Number(e.target.value))}
                    className="w-full"
                    aria-label="Smoothing slider"
                  />
                </div>

                <div>
                  <p className="mb-2 text-[13px] text-[var(--text-secondary)]">Lighting</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLighting("harsh")}
                      className={`rounded-[10px] px-3 py-2 text-[13px] font-semibold transition ${
                        lighting === "harsh"
                          ? "bg-[var(--accent-light)] text-[var(--accent-dark)]"
                          : "bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                      }`}
                    >
                      Harsh
                    </button>
                    <button
                      type="button"
                      onClick={() => setLighting("studio")}
                      className={`rounded-[10px] px-3 py-2 text-[13px] font-semibold transition ${
                        lighting === "studio"
                          ? "bg-[var(--accent-light)] text-[var(--accent-dark)]"
                          : "bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                      }`}
                    >
                      Studio
                    </button>
                  </div>
                </div>
              </div>

              <div className="card p-4">
                <h2 className="mb-3 text-[16px] font-semibold text-[var(--text-primary)]">What Changed?</h2>
                <ul className="space-y-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                  <li><strong className="text-[var(--text-primary)]">Texture smoothing:</strong> fine details are blurred as smoothing increases.</li>
                  <li><strong className="text-[var(--text-primary)]">Edge softening:</strong> transitions between skin features become less defined.</li>
                  <li><strong className="text-[var(--text-primary)]">Contrast compression:</strong> studio-style settings flatten tonal differences.</li>
                  <li><strong className="text-[var(--text-primary)]">Pore visibility:</strong> pores become less visible under blur and even lighting.</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </AppShell>
    </OnboardingGate>
  );
}

function PreviewCard({
  label,
  image,
  style,
}: {
  label: string;
  image: string | null;
  style?: React.CSSProperties;
}) {
  return (
    <div>
      <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{label}</p>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] border border-[var(--border-light)] bg-[var(--bg-secondary)]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="Preview" className="h-full w-full object-cover" style={style} />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-6 text-center">
            <p className="text-[13px] text-[var(--text-tertiary)]">Upload a photo to run the distortion demo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
