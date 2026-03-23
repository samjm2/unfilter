"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

/** Generate a warm skin-textured canvas with visible pores, pimples, acne, and eye bags */
function generateSkinTexture(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;

  // Base skin tone
  ctx.fillStyle = "#d4a882";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Natural color variation patches
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * CANVAS_W;
    const y = Math.random() * CANVAS_H;
    const r = 25 + Math.random() * 50;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${20 + Math.random() * 12}, ${40 + Math.random() * 15}%, ${65 + Math.random() * 10}%, 0.25)`;
    ctx.fill();
  }

  // Dense pore texture
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * CANVAS_W;
    const y = Math.random() * CANVAS_H;
    const size = 0.7 + Math.random() * 1.6;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(120, 80, 55, ${0.15 + Math.random() * 0.25})`;
    ctx.fill();
  }

  // Under-eye dark circles
  for (const xOff of [CANVAS_W * 0.32, CANVAS_W * 0.62]) {
    ctx.beginPath();
    ctx.ellipse(xOff, CANVAS_H * 0.32, 30, 10, 0, 0, Math.PI);
    ctx.fillStyle = "rgba(120, 80, 70, 0.16)";
    ctx.fill();
  }

  // Pimples with redness halo and highlight
  const pimples = [
    { x: 150, y: 180, r: 4 }, { x: 320, y: 200, r: 3.5 },
    { x: 200, y: 250, r: 5 }, { x: 380, y: 160, r: 3 },
    { x: 100, y: 220, r: 4.5 }, { x: 280, y: 280, r: 4 },
  ];
  for (const p of pimples) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(195, 100, 80, 0.1)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(190, 95, 75, ${0.22 + Math.random() * 0.12})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(240, 200, 180, 0.25)";
    ctx.fill();
  }

  // Redness patches
  for (const patch of [{ x: 160, y: 200, rx: 35, ry: 25 }, { x: 320, y: 210, rx: 35, ry: 25 }]) {
    ctx.beginPath();
    ctx.ellipse(patch.x, patch.y, patch.rx, patch.ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(190, 110, 90, 0.07)";
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
}

// Known blemish positions for the demo texture (matches generateSkinTexture pimples)
const DEMO_BLEMISHES: import("@/lib/imaging/retouch").BlemishRegion[] = [
  { cx: 150, cy: 180, radius: 6, pixels: [] },
  { cx: 320, cy: 200, radius: 5, pixels: [] },
  { cx: 200, cy: 250, radius: 7, pixels: [] },
  { cx: 380, cy: 160, radius: 5, pixels: [] },
  { cx: 100, cy: 220, radius: 6, pixels: [] },
  { cx: 280, cy: 280, radius: 6, pixels: [] },
].map((b) => {
  const pixels: Array<{ x: number; y: number }> = [];
  for (let dy = -b.radius; dy <= b.radius; dy++)
    for (let dx = -b.radius; dx <= b.radius; dx++)
      if (dx * dx + dy * dy <= b.radius * b.radius)
        pixels.push({ x: b.cx + dx, y: b.cy + dy });
  return { ...b, pixels };
});

const DEMO_UNDER_EYES = [
  { cx: CANVAS_W * 0.32, cy: CANVAS_H * 0.32, rx: 30, ry: 10 },
  { cx: CANVAS_W * 0.62, cy: CANVAS_H * 0.32, rx: 30, ry: 10 },
];

export function DistortionDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [smoothing, setSmoothing] = useState(0);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [textureDataUrl, setTextureDataUrl] = useState<string | null>(null);
  const [retouchedUrl, setRetouchedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const isUsingDemo = useRef(true);
  const retouchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generate skin texture on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    generateSkinTexture(canvas);
    setTextureDataUrl(canvas.toDataURL("image/png"));
    // Store original canvas for retouch processing
    const copy = document.createElement("canvas");
    copy.width = canvas.width;
    copy.height = canvas.height;
    copy.getContext("2d")!.drawImage(canvas, 0, 0);
    originalCanvasRef.current = copy;
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result);
        isUsingDemo.current = false;
        setUserPhoto(dataUrl);
        setRetouchedUrl(null);
        // Load into canvas for retouch
        const img = new Image();
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = Math.min(img.width, CANVAS_W);
          c.height = Math.round((img.height / img.width) * c.width);
          c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
          originalCanvasRef.current = c;
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const imageSrc = userPhoto ?? textureDataUrl;

  // Run retouch pipeline when smoothing changes (debounced)
  useEffect(() => {
    if (!originalCanvasRef.current || smoothing <= 0) {
      setRetouchedUrl(null);
      return;
    }

    if (retouchTimer.current) clearTimeout(retouchTimer.current);
    setIsProcessing(true);

    retouchTimer.current = setTimeout(async () => {
      const { applyRetouch } = await import("@/lib/imaging/retouch");

      const src = originalCanvasRef.current!;
      const work = document.createElement("canvas");
      work.width = src.width;
      work.height = src.height;
      work.getContext("2d")!.drawImage(src, 0, 0);

      const result = applyRetouch(
        work,
        { smoothing, blemishRemoval: Math.min(100, smoothing * 1.5), eyeBagRemoval: smoothing },
        isUsingDemo.current ? DEMO_BLEMISHES : undefined,
        isUsingDemo.current ? DEMO_UNDER_EYES : undefined,
      );

      setRetouchedUrl(result.toDataURL("image/jpeg", 0.92));
      setIsProcessing(false);
    }, 150);

    return () => { if (retouchTimer.current) clearTimeout(retouchTimer.current); };
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
          Drag the slider. Watch pimples vanish.
        </h3>
        <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
          Snapchat and TikTok do this automatically — before you even
          pick a filter. Pores, acne, eye bags: gone.
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

          {/* Retouched */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--coral)] mb-2">
              After &ldquo;beauty filter&rdquo;
            </p>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] border border-[var(--border-light)] bg-[var(--bg-secondary)]">
              {imageSrc ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={retouchedUrl ?? imageSrc}
                    alt="Retouched"
                    className="h-full w-full object-cover"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    </div>
                  )}
                </>
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
            Retouching
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
          aria-label="Retouching intensity"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-[var(--text-muted)]">
            No filter
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">
            Full retouch
          </span>
        </div>
      </div>

      {/* Impact message (appears after interaction) */}
      {hasInteracted && (
        <div className="px-5 pt-3 animate-fade-up">
          <div className="rounded-[var(--radius-md)] bg-[var(--coral-light)] border border-[var(--coral)]/15 px-4 py-3">
            <p className="text-[13px] font-semibold text-[var(--text-primary)]">
              {smoothing < 30
                ? "Even at low settings, pimples start fading. Snapchat applies this level automatically."
                : smoothing < 60
                  ? "Pores, acne, eye bags — all vanishing. TikTok's \"Enhance\" does this by default."
                  : "This is what most selfies look like before you see them. Every platform does this."}
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
