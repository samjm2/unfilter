"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

// ============================================================
// Inline Distortion Demo — the 60-second hook
//
// Generates a realistic skin-texture canvas on mount so the
// demo works instantly without requiring a photo upload.
// A single smoothing slider lets the user watch texture
// vanish in real time — the exact distortion Instagram applies.
//
// Optional: user can upload their own photo for full impact.
// ============================================================

const CANVAS_W = 480;
const CANVAS_H = 360;

/** Generate a warm skin-textured canvas with visible pores + variation */
function generateSkinTexture(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;

  // Base skin tone
  ctx.fillStyle = "#d4a882";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Subtle warm patches (natural skin color variation)
  const patches = 40;
  for (let i = 0; i < patches; i++) {
    const x = Math.random() * CANVAS_W;
    const y = Math.random() * CANVAS_H;
    const r = 30 + Math.random() * 60;
    const hueShift = Math.random() * 12 - 6;
    const lightShift = Math.random() * 8 - 4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${24 + hueShift}, ${45 + lightShift}%, ${68 + lightShift}%)`;
    ctx.globalAlpha = 0.3;
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Pores — tiny dark dots scattered across
  const poreCount = 600;
  for (let i = 0; i < poreCount; i++) {
    const x = Math.random() * CANVAS_W;
    const y = Math.random() * CANVAS_H;
    const size = 0.8 + Math.random() * 1.8;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(120, 80, 55, ${0.15 + Math.random() * 0.25})`;
    ctx.fill();
  }

  // Fine texture noise
  const imageData = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 14;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);

  // A few slightly larger "blemish" spots
  for (let i = 0; i < 8; i++) {
    const x = 40 + Math.random() * (CANVAS_W - 80);
    const y = 40 + Math.random() * (CANVAS_H - 80);
    const r = 3 + Math.random() * 5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(180, 100, 80, ${0.15 + Math.random() * 0.2})`;
    ctx.fill();
  }
}

export function DistortionDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [smoothing, setSmoothing] = useState(0);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [textureDataUrl, setTextureDataUrl] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Generate skin texture on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    generateSkinTexture(canvas);
    setTextureDataUrl(canvas.toDataURL("image/png"));
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setUserPhoto(String(reader.result));
      reader.readAsDataURL(file);
    },
    [],
  );

  const imageSrc = userPhoto ?? textureDataUrl;

  const processedStyle = useMemo(() => {
    const blur = smoothing / 25;
    return {
      filter: `blur(${blur.toFixed(2)}px) contrast(0.92) brightness(1.08) saturate(0.96)`,
    } as const;
  }, [smoothing]);

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSmoothing(Number(e.target.value));
    if (!hasInteracted) setHasInteracted(true);
  };

  return (
    <div className="card-elevated overflow-hidden">
      {/* Hidden canvas for texture generation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1 w-6 rounded-full bg-[var(--coral)]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--coral)]">
            Try it now
          </span>
        </div>
        <h3 className="text-title text-[18px] text-[var(--text-primary)]">
          Drag the slider. Watch skin disappear.
        </h3>
        <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
          This is the exact type of smoothing Instagram and TikTok apply to
          every selfie.
        </p>
      </div>

      {/* Comparison */}
      <div className="px-5">
        <div className="grid grid-cols-2 gap-3">
          {/* Original */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--accent)] mb-2">
              Real skin
            </p>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] border border-[var(--border-light)] bg-[var(--bg-secondary)]">
              {imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageSrc}
                  alt="Original"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 rounded-full border-2 border-[var(--border-hover)] border-t-[var(--accent)] animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Distorted */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--coral)] mb-2">
              After &ldquo;beauty filter&rdquo;
            </p>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] border border-[var(--border-light)] bg-[var(--bg-secondary)]">
              {imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageSrc}
                  alt="Distorted"
                  className="h-full w-full object-cover"
                  style={processedStyle}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 rounded-full border-2 border-[var(--border-hover)] border-t-[var(--coral)] animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="px-5 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-semibold text-[var(--text-secondary)]">
            Smoothing
          </span>
          <span className="text-[14px] font-bold text-[var(--text-primary)]">
            {smoothing}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={smoothing}
          onChange={handleSlider}
          className="w-full accent-[var(--coral)] h-2 rounded-full appearance-none bg-[var(--warm-300)] cursor-pointer"
          aria-label="Smoothing intensity"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-[var(--text-muted)]">
            No filter
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">
            Full smoothing
          </span>
        </div>
      </div>

      {/* Impact message (appears after interaction) */}
      {hasInteracted && (
        <div className="px-5 pt-3 animate-fade-up">
          <div className="rounded-[var(--radius-md)] bg-[var(--coral-light)] border border-[var(--coral)]/15 px-4 py-3">
            <p className="text-[13px] font-semibold text-[var(--text-primary)]">
              {smoothing < 30
                ? "Even a little smoothing hides real texture."
                : smoothing < 60
                  ? "Pores, texture, blemishes — all vanishing. This is what you're comparing yourself to."
                  : "This is what most selfies on social media look like before you ever see them."}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-5 pt-4 pb-5 flex items-center gap-3">
        <label className="btn-secondary cursor-pointer text-[13px] !py-2.5 !px-4">
          Try your own photo
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>
        <Link
          href="/lab"
          className="text-[13px] font-semibold text-[var(--accent)] hover:text-[var(--accent-dark)] transition"
        >
          Open full Distortion Lab &rarr;
        </Link>
      </div>
    </div>
  );
}
