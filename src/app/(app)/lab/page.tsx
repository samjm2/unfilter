"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { OnboardingGate } from "@/components/OnboardingGate";
import { IconCamera, IconShield, IconArrowRight, IconSparkle } from "@/components/icons";
import { applyRetouch, type RetouchOptions, type BlemishRegion } from "@/lib/imaging/retouch";

// ============================================================
// Distortion Lab — Guided-first, progressive disclosure
//
// First-time flow:
//   1. Upload photo (or use demo)
//   2. Auto-apply "Beauty Filter" preset
//   3. Show before/after with overlay explanations
//   4. Reveal distortion score
//   5. THEN unlock full controls
// ============================================================

/* ---------- Types ---------- */

type CompareMode = "slider" | "side-by-side" | "heatmap";
type CategoryKey = keyof DistortionState;
type GuidedStep = "upload" | "reveal" | "explain-1" | "explain-2" | "score" | "explore";

type DistortionState = {
  skinTexture: number;
  faceShape: number;
  lightingTone: number;
  makeup: number;
};

/* ---------- Presets ---------- */

const ZERO: DistortionState = { skinTexture: 0, faceShape: 0, lightingTone: 0, makeup: 0 };

type PresetInfo = {
  id: string;
  label: string;
  platform: string;
  state: DistortionState;
  description: string;
};

const PRESETS: PresetInfo[] = [
  {
    id: "natural",
    label: "No Filter",
    platform: "",
    state: { ...ZERO },
    description: "What your camera actually captured. Real skin.",
  },
  {
    id: "snapchat",
    label: "Snapchat Style",
    platform: "Snapchat",
    state: { skinTexture: 55, faceShape: 40, lightingTone: 20, makeup: 15 },
    description: "Snapchat's default camera applies skin smoothing and subtle face reshaping before you even pick a filter. Pimples, pores, and acne are blurred away automatically. Their \"Lens\" system uses AR to slim your jaw and enlarge your eyes in real time.",
  },
  {
    id: "instagram",
    label: "Instagram Style",
    platform: "Instagram",
    state: { skinTexture: 35, faceShape: 15, lightingTone: 55, makeup: 25 },
    description: "Instagram's filters are built around lighting and color grading — warm tones, boosted saturation, and soft glow that makes skin look airbrushed. Their AR effects add virtual makeup and smooth skin texture. The \"beauty\" category alone has 10,000+ community filters.",
  },
  {
    id: "tiktok",
    label: "TikTok Style",
    platform: "TikTok",
    state: { skinTexture: 60, faceShape: 45, lightingTone: 35, makeup: 40 },
    description: "TikTok's built-in \"Enhance\" mode applies skin smoothing, face slimming, and eye enlargement automatically — it's ON by default for many users. Their \"Bold Glamour\" filter went viral because it was almost impossible to detect, even when covering the camera with a hand.",
  },
  {
    id: "facetune",
    label: "Facetune Style",
    platform: "Facetune",
    state: { skinTexture: 80, faceShape: 60, lightingTone: 45, makeup: 50 },
    description: "Facetune is a dedicated retouching app used by influencers before posting anywhere. It offers pimple/acne removal, jaw reshaping, nose slimming, teeth whitening, and full skin retexturing. The result often looks nothing like the original photo.",
  },
  {
    id: "bereal",
    label: "BeReal Style",
    platform: "BeReal",
    state: { skinTexture: 15, faceShape: 5, lightingTone: 10, makeup: 0 },
    description: "BeReal markets itself as \"authentic\" with no filters — but the front camera still applies auto-exposure and white balance that subtly brightens skin. Even \"no filter\" platforms process your image. True raw is rarer than you think.",
  },
];

const BEAUTY_PRESET = PRESETS[3].state; // TikTok style for guided flow

/* ---------- Educational Content ---------- */

const EDUCATION: Record<CategoryKey, { title: string; changed: string; matters: string; whoDoesThis: string }> = {
  skinTexture: {
    title: "Skin Texture",
    changed: "Erases pimples, acne, pores, fine lines, and scars. Removes under-eye bags and dark circles. Makes skin look like plastic.",
    matters: "Real skin has pores and texture. When every photo is smoothed, you start believing normal skin is flawed.",
    whoDoesThis: "Snapchat and TikTok apply this automatically — before you even choose a filter. Facetune lets influencers erase individual pimples. Instagram AR effects do it in real time on video calls.",
  },
  faceShape: {
    title: "Face Shape",
    changed: "Enlarges eyes, slims jawline, narrows nose, plumps lips, lifts cheekbones.",
    matters: "These proportions are geometrically impossible. No one can look like a warped photo.",
    whoDoesThis: "Snapchat's Lens system reshapes faces using 3D mesh tracking. TikTok's \"Enhance\" slims faces by default. Facetune offers manual jaw, nose, and lip reshaping tools that influencers use on every post.",
  },
  lightingTone: {
    title: "Lighting & Tone",
    changed: "Boosts brightness, fakes studio lighting, adds warm glow, increases saturation.",
    matters: "Professional lighting costs thousands. Filters fake it, making real selfies look 'worse' by comparison.",
    whoDoesThis: "Instagram built its entire brand on color grading filters (Valencia, Clarendon, Juno). TikTok's lighting effects simulate ring lights and golden hour. Even BeReal adjusts exposure automatically.",
  },
  makeup: {
    title: "Makeup Sim",
    changed: "Adds virtual foundation, blush, contour, lip color, eyeliner, and lashes — all digitally painted on.",
    matters: "Digital makeup is always flawless — no skill, no cost, no smudging. It creates a standard that doesn't exist in real life.",
    whoDoesThis: "TikTok's \"Bold Glamour\" filter applies full makeup so realistically it went viral — millions couldn't tell it was fake. Snapchat and Instagram both offer AR makeup try-on filters, often sponsored by beauty brands.",
  },
};

const CATEGORY_ORDER: CategoryKey[] = ["skinTexture", "faceShape", "lightingTone", "makeup"];

/* ---------- Guided Step Overlays ---------- */

const GUIDED_OVERLAYS: Partial<Record<GuidedStep, { title: string; body: string; cta: string }>> = {
  reveal: {
    title: "This is what TikTok does automatically.",
    body: "We just applied the same techniques that Snapchat, TikTok, and Instagram use — often before you even choose a filter. Drag the divider to compare.",
    cta: "What changed?",
  },
  "explain-1": {
    title: "4 invisible manipulations.",
    body: "Pimples and pores erased (Snapchat does this by default). Face reshaped (TikTok's \"Enhance\" mode). Lighting faked (Instagram's signature). Makeup painted on digitally (TikTok's \"Bold Glamour\").",
    cta: "Why does this matter?",
  },
  "explain-2": {
    title: "You were already real.",
    body: "Billions of these filtered photos train your brain to see normal skin as flawed. Every platform profits from making you feel like you need a filter. Understanding the trick is the first step.",
    cta: "See your distortion score",
  },
};

/* ---------- Demo image metadata (blemish + under-eye positions) ---------- */

const DEMO_BLEMISHES: BlemishRegion[] = [
  { cx: 160, cy: 280, radius: 7, pixels: [] },
  { cx: 250, cy: 300, radius: 6, pixels: [] },
  { cx: 175, cy: 350, radius: 8, pixels: [] },
  { cx: 230, cy: 260, radius: 5, pixels: [] },
  { cx: 300, cy: 330, radius: 6, pixels: [] },
  { cx: 140, cy: 320, radius: 5, pixels: [] },
  { cx: 200, cy: 380, radius: 7, pixels: [] },
  { cx: 270, cy: 370, radius: 6, pixels: [] },
].map((b) => {
  // Generate pixel list for each blemish circle
  const pixels: Array<{ x: number; y: number }> = [];
  for (let dy = -b.radius; dy <= b.radius; dy++) {
    for (let dx = -b.radius; dx <= b.radius; dx++) {
      if (dx * dx + dy * dy <= b.radius * b.radius) {
        pixels.push({ x: b.cx + dx, y: b.cy + dy });
      }
    }
  }
  return { ...b, pixels };
});

const DEMO_UNDER_EYES = [
  { cx: 130, cy: 195, rx: 35, ry: 12 },
  { cx: 250, cy: 195, rx: 35, ry: 12 },
];

/* ---------- Filter Computation ---------- */

/** CSS filter for lighting + makeup only (skinTexture handled by retouch engine) */
function computeFilterCSS(s: DistortionState): string {
  const ltBright = 1 + (s.lightingTone / 100) * 0.22;
  const ltContrast = 1 - (s.lightingTone / 100) * 0.1;
  const ltSaturate = 1 + (s.lightingTone / 100) * 0.18;
  const warmth = (s.lightingTone / 100) * 0.1;
  const mkSaturate = 1 + (s.makeup / 100) * 0.12;
  const mkContrast = 1 + (s.makeup / 100) * 0.04;

  const parts = [
    `brightness(${ltBright.toFixed(3)})`,
    `contrast(${(ltContrast * mkContrast).toFixed(3)})`,
    `saturate(${(ltSaturate * mkSaturate).toFixed(3)})`,
  ];
  if (warmth > 0.005) parts.push(`sepia(${warmth.toFixed(3)})`);
  return parts.join(" ");
}

function computeFaceTransform(faceShape: number): string {
  if (faceShape <= 0) return "none";
  return `scaleX(${(1 - (faceShape / 100) * 0.06).toFixed(3)}) scaleY(${(1 + (faceShape / 100) * 0.03).toFixed(3)})`;
}

function computeMakeupOverlay(makeup: number): number {
  return (makeup / 100) * 0.22;
}

function getDistortionInfo(s: DistortionState) {
  const avg = (s.skinTexture + s.faceShape + s.lightingTone + s.makeup) / 4;
  const changes: string[] = [];
  if (s.skinTexture > 8) changes.push("Texture smoothing");
  if (s.faceShape > 8) changes.push("Face reshaping");
  if (s.lightingTone > 8) changes.push("Lighting alteration");
  if (s.makeup > 8) changes.push("Makeup overlay");
  let level: "None" | "Low" | "Moderate" | "High" = "None";
  if (avg > 55) level = "High";
  else if (avg > 25) level = "Moderate";
  else if (avg > 5) level = "Low";
  return { level, score: Math.round(avg), changes };
}

const LEVEL_COLORS = { None: "var(--accent)", Low: "var(--gold)", Moderate: "var(--amber)", High: "var(--coral)" } as const;

/* ---------- Demo Image ---------- */

function generateDemoImage(): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 500;
    const ctx = canvas.getContext("2d")!;

    // Warm skin-tone gradient background
    const grad = ctx.createLinearGradient(0, 0, 0, 500);
    grad.addColorStop(0, "#e8c9a8");
    grad.addColorStop(0.4, "#d4a574");
    grad.addColorStop(1, "#c49060");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 500);

    // Natural color variation patches
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 400;
      const y = Math.random() * 500;
      const r = 25 + Math.random() * 50;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${20 + Math.random() * 12}, ${40 + Math.random() * 15}%, ${65 + Math.random() * 10}%, 0.25)`;
      ctx.fill();
    }

    // Dense pore texture (visible at close range)
    for (let i = 0; i < 10000; i++) {
      const x = Math.random() * 400;
      const y = Math.random() * 500;
      const size = Math.random() * 2 + 0.4;
      const alpha = Math.random() * 0.18;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${100 + Math.random() * 60}, ${70 + Math.random() * 40}, ${50 + Math.random() * 30}, ${alpha})`;
      ctx.fill();
    }

    // Under-eye dark circles (two crescent shapes)
    for (const xOff of [130, 250]) {
      ctx.beginPath();
      ctx.ellipse(xOff, 195, 35, 12, 0, 0, Math.PI);
      ctx.fillStyle = "rgba(120, 80, 70, 0.18)";
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(xOff, 198, 30, 8, 0, 0, Math.PI);
      ctx.fillStyle = "rgba(100, 65, 60, 0.12)";
      ctx.fill();
    }

    // Acne / pimples — raised bumps with redness and highlight
    const pimples = [
      { x: 160, y: 280, r: 5 }, { x: 250, y: 300, r: 4 },
      { x: 175, y: 350, r: 6 }, { x: 230, y: 260, r: 3.5 },
      { x: 300, y: 330, r: 4.5 }, { x: 140, y: 320, r: 3 },
      { x: 200, y: 380, r: 5.5 }, { x: 270, y: 370, r: 4 },
    ];
    for (const p of pimples) {
      // Redness halo
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(195, 100, 80, 0.12)`;
      ctx.fill();
      // Main bump
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(190, 95, 75, ${0.25 + Math.random() * 0.15})`;
      ctx.fill();
      // Highlight (raised look)
      ctx.beginPath();
      ctx.arc(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240, 200, 180, 0.3)`;
      ctx.fill();
    }

    // Redness patches (cheeks, nose)
    for (const patch of [{ x: 140, y: 290, rx: 45, ry: 30 }, { x: 260, y: 290, rx: 45, ry: 30 }, { x: 200, y: 250, rx: 20, ry: 25 }]) {
      ctx.beginPath();
      ctx.ellipse(patch.x, patch.y, patch.rx, patch.ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(190, 110, 90, 0.08)";
      ctx.fill();
    }

    // Fine texture noise
    const imageData = ctx.getImageData(0, 0, 400, 500);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 16;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);

    // Larger blemish scars / hyperpigmentation
    for (let i = 0; i < 4; i++) {
      const x = 130 + Math.random() * 140;
      const y = 250 + Math.random() * 150;
      ctx.beginPath();
      ctx.ellipse(x, y, 4 + Math.random() * 3, 3 + Math.random() * 2, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(150, 90, 70, ${0.12 + Math.random() * 0.1})`;
      ctx.fill();
    }

    resolve(canvas.toDataURL("image/jpeg", 0.92));
  });
}

/* ============================================================
   Main Page Component
   ============================================================ */

export default function DistortionLabPage() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  const [photo, setPhoto] = useState<string | null>(null);
  const [retouchedPhoto, setRetouchedPhoto] = useState<string | null>(null);
  const [isRetouching, setIsRetouching] = useState(false);
  const [state, setState] = useState<DistortionState>({ ...ZERO });
  const [compareMode, setCompareMode] = useState<CompareMode>("slider");
  const [expandedCategory, setExpandedCategory] = useState<CategoryKey | null>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const heatmapCanvasRef = useRef<HTMLCanvasElement>(null);
  const isUsingDemo = useRef(false);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const retouchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Guided flow state
  const [guidedStep, setGuidedStep] = useState<GuidedStep>("upload");
  const [hasCompletedGuide, setHasCompletedGuide] = useState(false);
  const trackedThisSession = useRef(false);

  const filterCSS = useMemo(() => computeFilterCSS(state), [state]);
  const faceTransform = useMemo(() => computeFaceTransform(state.faceShape), [state.faceShape]);
  const makeupOpacity = useMemo(() => computeMakeupOverlay(state.makeup), [state.makeup]);
  const distortion = useMemo(() => getDistortionInfo(state), [state]);
  const svgDisplaceScale = useMemo(() => (state.faceShape / 100) * 14, [state.faceShape]);
  const hasAnyDistortion = distortion.score > 0;

  // Load photo onto a hidden canvas for retouch processing
  const loadOriginalCanvas = useCallback((dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      originalCanvasRef.current = canvas;
    };
    img.src = dataUrl;
  }, []);

  // Run retouch pipeline when skinTexture changes (debounced)
  useEffect(() => {
    if (!photo || !originalCanvasRef.current) {
      setRetouchedPhoto(null);
      return;
    }

    const skinVal = state.skinTexture;
    if (skinVal <= 0) {
      setRetouchedPhoto(null);
      return;
    }

    // Debounce: wait 150ms after last slider change
    if (retouchTimerRef.current) clearTimeout(retouchTimerRef.current);

    setIsRetouching(true);
    retouchTimerRef.current = setTimeout(() => {
      // Clone the original canvas so we don't mutate it
      const src = originalCanvasRef.current!;
      const workCanvas = document.createElement("canvas");
      workCanvas.width = src.width;
      workCanvas.height = src.height;
      const workCtx = workCanvas.getContext("2d")!;
      workCtx.drawImage(src, 0, 0);

      const opts: RetouchOptions = {
        smoothing: skinVal,
        blemishRemoval: Math.min(100, skinVal * 1.5), // blemishes go faster than smoothing
        eyeBagRemoval: skinVal,
      };

      const result = applyRetouch(
        workCanvas,
        opts,
        isUsingDemo.current ? DEMO_BLEMISHES : undefined,
        isUsingDemo.current ? DEMO_UNDER_EYES : undefined,
        isUsingDemo.current
          ? undefined // demo is all skin — HSV mask works fine
          : undefined // real photos use HSV auto-detection
      );

      setRetouchedPhoto(result.toDataURL("image/jpeg", 0.92));
      setIsRetouching(false);
    }, 150);

    return () => {
      if (retouchTimerRef.current) clearTimeout(retouchTimerRef.current);
    };
  }, [photo, state.skinTexture]);

  // Check if guide was already completed in a previous session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const done = window.localStorage.getItem("unfilter-lab-guided-done");
      if (done === "1") {
        setHasCompletedGuide(true);
        setGuidedStep("explore");
      }
    }
  }, []);

  // Auto-load demo image
  useEffect(() => {
    if (isDemo && !photo) {
      generateDemoImage().then((dataUrl) => {
        isUsingDemo.current = true;
        loadOriginalCanvas(dataUrl);
        setPhoto(dataUrl);
        if (!hasCompletedGuide) {
          setTimeout(() => {
            setState(BEAUTY_PRESET);
            setGuidedStep("reveal");
          }, 600);
        } else {
          setGuidedStep("explore");
        }
      });
    }
  }, [isDemo, photo, hasCompletedGuide, loadOriginalCanvas]);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      isUsingDemo.current = false;
      loadOriginalCanvas(dataUrl);
      setPhoto(dataUrl);
      if (!hasCompletedGuide) {
        setTimeout(() => {
          setState(BEAUTY_PRESET);
          setGuidedStep("reveal");
        }, 600);
      } else {
        setGuidedStep("explore");
      }
    };
    reader.readAsDataURL(file);
  }, [hasCompletedGuide, loadOriginalCanvas]);

  const advanceGuide = useCallback(() => {
    const sequence: GuidedStep[] = ["reveal", "explain-1", "explain-2", "score", "explore"];
    const idx = sequence.indexOf(guidedStep);
    if (idx < sequence.length - 1) {
      const next = sequence[idx + 1];
      setGuidedStep(next);
      if (next === "explore") {
        setHasCompletedGuide(true);
        window.localStorage.setItem("unfilter-lab-guided-done", "1");
        // track this run (once per session)
        if (!trackedThisSession.current) {
          trackedThisSession.current = true;
          try {
            const raw = localStorage.getItem("unfilter-lab-runs");
            const data = raw ? JSON.parse(raw) : { total: 0, edits: 0 };
            data.total = (data.total || 0) + 1;
            data.edits = (data.edits || 0) + distortion.score;
            localStorage.setItem("unfilter-lab-runs", JSON.stringify(data));
          } catch {}
        }
      }
    }
  }, [guidedStep, distortion.score]);

  const skipGuide = useCallback(() => {
    setGuidedStep("explore");
    setHasCompletedGuide(true);
    window.localStorage.setItem("unfilter-lab-guided-done", "1");
  }, []);

  const setSlider = useCallback((key: CategoryKey, value: number) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyPreset = useCallback((preset: DistortionState) => {
    setState(preset);
  }, []);

  // Slider drag
  const dragging = useRef(false);
  const onPointerDown = useCallback(() => { dragging.current = true; }, []);
  const onPointerUp = useCallback(() => { dragging.current = false; }, []);
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    setSliderPos(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
  }, []);

  // Heatmap
  useEffect(() => {
    if (compareMode !== "heatmap" || !photo || !heatmapCanvasRef.current) return;
    const canvas = heatmapCanvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      const w = Math.min(img.width, 600);
      const h = Math.round((img.height / img.width) * w);
      canvas.width = w;
      canvas.height = h;
      ctx.filter = "none";
      ctx.drawImage(img, 0, 0, w, h);
      const original = ctx.getImageData(0, 0, w, h);
      ctx.filter = filterCSS;
      ctx.drawImage(img, 0, 0, w, h);
      const filtered = ctx.getImageData(0, 0, w, h);
      const output = ctx.createImageData(w, h);
      for (let i = 0; i < original.data.length; i += 4) {
        const diff = (Math.abs(original.data[i] - filtered.data[i]) + Math.abs(original.data[i + 1] - filtered.data[i + 1]) + Math.abs(original.data[i + 2] - filtered.data[i + 2])) / 3;
        const intensity = Math.min(255, diff * 4);
        if (intensity < 128) {
          output.data[i] = Math.round((intensity / 128) * 255);
          output.data[i + 1] = Math.round((intensity / 128) * 200);
          output.data[i + 2] = Math.round(180 - (intensity / 128) * 180);
        } else {
          output.data[i] = 255;
          output.data[i + 1] = Math.round(200 - ((intensity - 128) / 127) * 200);
          output.data[i + 2] = 0;
        }
        output.data[i + 3] = Math.max(60, intensity);
      }
      ctx.filter = "none";
      ctx.drawImage(img, 0, 0, w, h);
      ctx.globalAlpha = 0.7;
      ctx.putImageData(output, 0, 0);
      ctx.globalAlpha = 1;
    };
    img.src = photo;
  }, [compareMode, photo, filterCSS]);

  const showControls = guidedStep === "explore";
  const overlay = GUIDED_OVERLAYS[guidedStep];

  // ---- Upload screen ----
  if (guidedStep === "upload" && !photo) {
    return (
      <OnboardingGate>
        <AppShell>
          <div className="mx-auto max-w-lg flex flex-col items-center justify-center" style={{ minHeight: "60vh" }}>
            <div className="text-center animate-fade-up">
              <h1 className="text-display text-[clamp(28px,5vw,40px)] text-[var(--text-primary)] mb-3">
                See what filters<br />really do.
              </h1>
              <p className="text-[15px] text-[var(--text-secondary)] mb-8 max-w-sm mx-auto">
                Upload a photo and we&apos;ll show you exactly how a beauty filter
                changes it — step by step.
              </p>

              <label className="btn-primary cursor-pointer text-[16px] !py-4 !px-8 inline-flex items-center gap-2">
                <IconCamera size={20} />
                Upload a Photo
                <input type="file" accept="image/*" capture="user" className="sr-only" onChange={handleFile} />
              </label>

              <button
                onClick={() => {
                  generateDemoImage().then((dataUrl) => {
                    isUsingDemo.current = true;
                    loadOriginalCanvas(dataUrl);
                    setPhoto(dataUrl);
                    setTimeout(() => {
                      setState(BEAUTY_PRESET);
                      setGuidedStep("reveal");
                    }, 600);
                  });
                }}
                className="mt-4 block mx-auto text-[13px] font-medium text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition"
              >
                or use a demo image
              </button>
            </div>

            <div className="mt-12 flex items-center gap-2 animate-fade-in stagger-3">
              <IconShield size={13} className="text-[var(--accent)]" />
              <p className="text-[11px] text-[var(--text-muted)]">
                Your photo never leaves this device.
              </p>
            </div>
          </div>
        </AppShell>
      </OnboardingGate>
    );
  }

  // ---- Main lab view (photo loaded) ----
  return (
    <OnboardingGate>
      <AppShell>
        <svg className="absolute h-0 w-0" aria-hidden="true">
          <defs>
            <filter id="face-displace">
              <feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="3" seed="2" result="turb" />
              <feDisplacementMap in="SourceGraphic" in2="turb" scale={svgDisplaceScale} xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>

        <div className="mx-auto max-w-6xl">
          {/* Header — compact when in guided mode */}
          {showControls && (
            <header className="mb-6 animate-fade-up">
              <h1 className="text-display text-[clamp(22px,4vw,32px)] text-[var(--text-primary)]">
                Distortion Lab
              </h1>
              <p className="mt-1 text-[14px] text-[var(--text-tertiary)]">
                Every beauty filter is just a combination of simple tricks.
              </p>
            </header>
          )}

          <div className={`grid grid-cols-1 gap-6 ${showControls ? "lg:grid-cols-[1.2fr_1fr]" : "max-w-2xl mx-auto"} animate-fade-up stagger-1`}>

            {/* Image preview */}
            <div className="space-y-4">
              {/* Compare mode tabs — only in explore mode */}
              {showControls && (
                <div className="flex items-center gap-1 rounded-[10px] bg-[var(--bg-secondary)] p-1">
                  {(["slider", "side-by-side", "heatmap"] as CompareMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setCompareMode(mode)}
                      className={`flex-1 rounded-[8px] px-3 py-2 text-[12px] font-semibold transition ${
                        compareMode === mode
                          ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                          : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                      }`}
                    >
                      {mode === "side-by-side" ? "Side by Side" : mode === "slider" ? "Slider" : "Heatmap"}
                    </button>
                  ))}
                </div>
              )}

              <div className="card-elevated overflow-hidden relative">
                {/* Slider compare (default for guided + explore) */}
                {(compareMode === "slider" || !showControls) && (
                  <div
                    ref={sliderContainerRef}
                    className="relative aspect-[4/5] cursor-col-resize select-none overflow-hidden"
                    onPointerDown={onPointerDown}
                    onPointerUp={onPointerUp}
                    onPointerLeave={onPointerUp}
                    onPointerMove={onPointerMove}
                  >
                    {/* Filtered (full) — uses retouched photo for skin, CSS for lighting/makeup */}
                    <div className="absolute inset-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={retouchedPhoto ?? photo!}
                        alt="Filtered"
                        className="h-full w-full object-cover"
                        style={{
                          filter: `${filterCSS}${svgDisplaceScale > 0 ? " url(#face-displace)" : ""}`,
                          transform: faceTransform,
                        }}
                      />
                      {isRetouching && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                          <div className="h-6 w-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        </div>
                      )}
                      {makeupOpacity > 0 && (
                        <div
                          className="pointer-events-none absolute inset-0"
                          style={{
                            background: `linear-gradient(180deg, rgba(200,140,120,${makeupOpacity * 0.5}) 0%, rgba(190,100,90,${makeupOpacity}) 60%, rgba(180,70,70,${makeupOpacity * 0.8}) 100%)`,
                            mixBlendMode: "soft-light",
                          }}
                        />
                      )}
                    </div>
                    {/* Original (clipped) */}
                    <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo!}
                        alt="Original"
                        className="h-full object-cover"
                        style={{ width: `${sliderContainerRef.current?.offsetWidth ?? 600}px`, maxWidth: "none" }}
                      />
                    </div>
                    {/* Divider */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow-lg"
                      style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#666" strokeWidth="1.5">
                          <path d="M4 2L1 7L4 12" />
                          <path d="M10 2L13 7L10 12" />
                        </svg>
                      </div>
                    </div>
                    <span className="absolute top-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">Real</span>
                    <span className="absolute top-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">Filtered</span>
                  </div>
                )}

                {showControls && compareMode === "side-by-side" && (
                  <div className="grid grid-cols-2 gap-px bg-[var(--border-light)]">
                    <div className="bg-[var(--bg-card)]">
                      <p className="px-4 pt-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">Real Skin</p>
                      <div className="aspect-[4/5] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo!} alt="Original" className="h-full w-full object-cover" />
                      </div>
                    </div>
                    <div className="bg-[var(--bg-card)]">
                      <p className="px-4 pt-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--coral)]">Filtered</p>
                      <div className="aspect-[4/5] overflow-hidden">
                        <div className="relative h-full w-full">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={retouchedPhoto ?? photo!} alt="Filtered" className="h-full w-full object-cover" style={{ filter: `${filterCSS}${svgDisplaceScale > 0 ? " url(#face-displace)" : ""}`, transform: faceTransform }} />
                          {makeupOpacity > 0 && (
                            <div className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(200,140,120,${makeupOpacity * 0.5}) 0%, rgba(190,100,90,${makeupOpacity}) 60%, rgba(180,70,70,${makeupOpacity * 0.8}) 100%)`, mixBlendMode: "soft-light" }} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {showControls && compareMode === "heatmap" && (
                  <div className="relative">
                    <canvas ref={heatmapCanvasRef} className="w-full" style={{ aspectRatio: "4/5", objectFit: "cover" }} />
                    {!hasAnyDistortion && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-card)]/80">
                        <p className="text-[13px] text-[var(--text-tertiary)]">Move a slider to see the heatmap.</p>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-[8px] bg-black/60 px-3 py-2 backdrop-blur-sm">
                      <div className="h-2 flex-1 rounded-full" style={{ background: "linear-gradient(90deg, #335599, #ddcc44, #cc3322)" }} />
                      <div className="flex gap-3 text-[9px] font-semibold uppercase tracking-wider text-white/80">
                        <span>Low</span><span>High</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Guided overlay */}
                {overlay && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-6 pb-6 pt-16">
                    <h2 className="text-[20px] font-bold text-white mb-2 leading-tight" style={{ fontFamily: "Fraunces, serif" }}>
                      {overlay.title}
                    </h2>
                    <p className="text-[14px] text-white/80 leading-relaxed mb-5 max-w-md">
                      {overlay.body}
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={advanceGuide}
                        className="flex items-center gap-2 rounded-[10px] bg-white px-5 py-2.5 text-[14px] font-semibold text-[var(--text-primary)] transition hover:bg-white/90"
                      >
                        {overlay.cta}
                        <IconArrowRight size={16} />
                      </button>
                      <button
                        onClick={skipGuide}
                        className="text-[12px] font-medium text-white/60 hover:text-white/80 transition"
                      >
                        Skip intro
                      </button>
                    </div>
                  </div>
                )}

                {/* Score reveal step */}
                {guidedStep === "score" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="text-center animate-scale-in">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/60 mb-2">
                        Distortion Level
                      </p>
                      <p
                        className="text-[72px] font-bold leading-none mb-1"
                        style={{ color: LEVEL_COLORS[distortion.level], fontFamily: "Fraunces, serif" }}
                      >
                        {distortion.score}%
                      </p>
                      <p className="text-[16px] font-semibold text-white/80 mb-6">
                        {distortion.level} distortion
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {distortion.changes.map((c) => (
                          <span key={c} className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium text-white/80">
                            {c}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={advanceGuide}
                        className="flex items-center gap-2 rounded-[10px] bg-white px-6 py-3 text-[15px] font-semibold text-[var(--text-primary)] mx-auto transition hover:bg-white/90"
                      >
                        Explore the controls
                        <IconArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Change photo — only in explore mode */}
              {showControls && (
                <label className="btn-secondary cursor-pointer text-[12px] !py-2 !px-4 w-fit">
                  Change Photo
                  <input type="file" accept="image/*" capture="user" className="sr-only" onChange={handleFile} />
                </label>
              )}
            </div>

            {/* Controls panel — only in explore mode */}
            {showControls && (
              <div className="space-y-4 animate-fade-up">
                {/* Platform Presets */}
                <div className="card p-4">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">What each platform does</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {PRESETS.map((p) => {
                      const isActive = CATEGORY_ORDER.every((k) => state[k] === p.state[k]);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => applyPreset(p.state)}
                          className={`rounded-[8px] px-3 py-1.5 text-[12px] font-semibold transition ${
                            isActive ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--warm-300)]"
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                  {/* Show description of currently active preset */}
                  {(() => {
                    const active = PRESETS.find((p) => CATEGORY_ORDER.every((k) => state[k] === p.state[k]));
                    return active?.description ? (
                      <div className="rounded-[10px] bg-[var(--bg-secondary)] px-4 py-3 animate-fade-up">
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--coral)] mb-1">
                          {active.platform ? `How ${active.platform} works` : "No filter"}
                        </p>
                        <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">{active.description}</p>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Sliders */}
                <div className="card p-4">
                  <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">Distortion Controls</p>
                  <div className="space-y-5">
                    {CATEGORY_ORDER.map((key) => {
                      const ed = EDUCATION[key];
                      const isExpanded = expandedCategory === key;
                      const value = state[key];
                      return (
                        <div key={key}>
                          <div className="mb-2 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setExpandedCategory(isExpanded ? null : key)}
                              className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition"
                            >
                              {ed.title}
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                                <path d="M3 5L6 8L9 5" />
                              </svg>
                            </button>
                            <span className="text-[13px] font-bold tabular-nums text-[var(--text-primary)]">{value}%</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={value}
                            onChange={(e) => setSlider(key, Number(e.target.value))}
                            className="w-full accent-[var(--accent)] h-1.5 rounded-full appearance-none bg-[var(--warm-300)] cursor-pointer"
                          />
                          {isExpanded && (
                            <div className="mt-3 rounded-[10px] bg-[var(--bg-secondary)] px-4 py-3 animate-fade-up">
                              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--coral)] mb-1">What changed</p>
                              <p className="text-[12px] leading-relaxed text-[var(--text-secondary)] mb-2">{ed.changed}</p>
                              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-1">Who does this</p>
                              <p className="text-[12px] leading-relaxed text-[var(--text-secondary)] mb-2">{ed.whoDoesThis}</p>
                              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--accent)] mb-1">Why this matters</p>
                              <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">{ed.matters}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Distortion Meter */}
                <div className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">Distortion Meter</p>
                    <span className="text-[14px] font-bold" style={{ color: LEVEL_COLORS[distortion.level] }}>{distortion.level}</span>
                  </div>
                  <div className="mb-3 h-2 w-full rounded-full bg-[var(--warm-300)] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${distortion.score}%`, background: LEVEL_COLORS[distortion.level] }} />
                  </div>
                  {distortion.changes.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {distortion.changes.map((c) => (
                        <span key={c} className="rounded-full bg-[var(--bg-secondary)] px-2.5 py-1 text-[10px] font-semibold text-[var(--text-tertiary)]">{c}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[var(--text-muted)]">No distortions applied. This is real skin.</p>
                  )}
                </div>

                {/* Privacy */}
                <div className="rounded-[10px] border border-[var(--accent-light)] bg-[var(--accent-lighter)] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <IconShield size={14} className="text-[var(--accent)] shrink-0" />
                    <p className="text-[11px] font-medium text-[var(--accent-dark)]">Your photo never leaves this device.</p>
                  </div>
                </div>

                {/* What you just saw */}
                <div className="card p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)] mb-2">What you just saw</p>
                  <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed mb-4">
                    {distortion.score <= 5
                      ? "No distortions applied. This is what real skin actually looks like."
                      : distortion.score <= 25
                      ? "Even lightly edited images can shift your perception over time."
                      : distortion.score <= 55
                      ? "This level of editing is typical of most lifestyle photos you see daily."
                      : "Heavy editing. This image looks nothing like the original."}
                  </p>

                  <div className="space-y-2">
                    <a
                      href="/check-in"
                      className="group flex items-center gap-3 rounded-[10px] bg-[var(--accent)] px-4 py-3 text-white transition hover:bg-[var(--accent-dark)]"
                    >
                      <IconSparkle size={18} className="shrink-0 opacity-90" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold leading-tight">Check In Today</p>
                        <p className="text-[11px] text-white/70 leading-tight mt-0.5">Track how seeing this makes you feel</p>
                      </div>
                      <IconArrowRight size={14} className="shrink-0 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                    </a>

                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href="/journal"
                        className="group flex items-center gap-2 rounded-[10px] border border-[var(--border-light)] bg-[var(--bg-secondary)] px-3 py-2.5 transition hover:border-[var(--border-hover)]"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-semibold text-[var(--text-primary)] leading-tight">Save to Journal</p>
                        </div>
                        <IconArrowRight size={12} className="shrink-0 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setPhoto(null);
                          setRetouchedPhoto(null);
                          originalCanvasRef.current = null;
                          setGuidedStep("upload");
                          setHasCompletedGuide(true);
                        }}
                        className="flex items-center gap-2 rounded-[10px] border border-[var(--border-light)] bg-[var(--bg-secondary)] px-3 py-2.5 transition hover:border-[var(--border-hover)] text-left w-full"
                      >
                        <p className="text-[12px] font-semibold text-[var(--text-primary)] leading-tight">Try another</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Educational footer — only in explore mode */}
          {showControls && (
            <section className="mt-10 mb-8 animate-fade-up stagger-3">
              <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent mb-8" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-5">How platforms manipulate your photos</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {CATEGORY_ORDER.map((key) => (
                  <div key={key} className="card p-4">
                    <h3 className="text-[13px] font-semibold text-[var(--text-primary)] mb-2">{EDUCATION[key].title}</h3>
                    <p className="text-[12px] leading-relaxed text-[var(--text-tertiary)] mb-2">{EDUCATION[key].changed}</p>
                    <p className="text-[11px] leading-relaxed text-[var(--text-muted)] italic">{EDUCATION[key].whoDoesThis}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </AppShell>
    </OnboardingGate>
  );
}
