// ============================================================
// Filter Detector — "This photo had something to hide."
//
// Analyzes any photo for signs of digital manipulation:
//   1. Skin smoothing (bilateral filter artifacts)
//   2. Blemish removal (unnaturally uniform skin)
//   3. Color grading (histogram shift, warm bias)
//   4. Sharpness mismatch (smooth skin + sharp edges = filtered)
//
// Uses the same CV primitives as the check-in pipeline
// but REVERSED: instead of measuring your skin health,
// it measures how much processing was done to the image.
// ============================================================

import { buildSkinMask } from "@/lib/imaging/retouch";

/* ---------- Types ---------- */

export interface FilterSignal {
  /** What type of manipulation was detected */
  type: "smoothing" | "blemishRemoval" | "colorGrading" | "sharpnessMismatch";
  /** 0-1 confidence that this manipulation is present */
  confidence: number;
  /** Plain-language explanation for teens */
  description: string;
  /** Technical explanation for judges */
  technical: string;
}

export type Verdict = "clean" | "subtle" | "filtered" | "heavy";

export interface DetectionResult {
  /** Overall verdict */
  verdict: Verdict;
  /** 0-100 overall manipulation score */
  score: number;
  /** Individual signals detected */
  signals: FilterSignal[];
  /** How much of the image was detected as skin (needed for reliable analysis) */
  skinPercent: number;
  /** Whether we had enough skin to analyze */
  reliable: boolean;
  /** Theme-aligned summary */
  summary: string;
}

/* ---------- Core Detection ---------- */

export function detectFilters(img: HTMLImageElement): DetectionResult {
  // Draw to analysis canvas
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return fallbackResult("Could not analyze this image.");
  }

  const maxDim = 500;
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;
  const totalPixels = width * height;

  // Build skin mask
  const skinMask = buildSkinMask(imageData);
  const skinPixels: number[] = [];
  const nonSkinPixels: number[] = [];
  for (let i = 0; i < totalPixels; i++) {
    if (skinMask[i]) skinPixels.push(i);
    else nonSkinPixels.push(i);
  }

  const skinPercent = Math.round((skinPixels.length / totalPixels) * 100);

  // Need at least 8% skin to do meaningful analysis
  if (skinPercent < 8) {
    return fallbackResult(
      "Not enough skin visible to analyze. Try a photo that shows more face or skin."
    );
  }

  const signals: FilterSignal[] = [];

  // ---- Signal 1: Skin Smoothing ----
  const smoothingResult = detectSmoothing(data, skinMask, skinPixels, width, height);
  if (smoothingResult.confidence > 0.25) {
    signals.push(smoothingResult);
  }

  // ---- Signal 2: Blemish Removal ----
  const blemishResult = detectBlemishRemoval(data, skinPixels);
  if (blemishResult.confidence > 0.25) {
    signals.push(blemishResult);
  }

  // ---- Signal 3: Color Grading ----
  const colorResult = detectColorGrading(data, skinPixels);
  if (colorResult.confidence > 0.25) {
    signals.push(colorResult);
  }

  // ---- Signal 4: Sharpness Mismatch ----
  const sharpnessResult = detectSharpnessMismatch(
    data, skinMask, skinPixels, nonSkinPixels, width, height
  );
  if (sharpnessResult.confidence > 0.25) {
    signals.push(sharpnessResult);
  }

  // ---- Composite Score ----
  const rawScore = signals.reduce((sum, s) => sum + s.confidence, 0) / 4;
  const score = Math.round(Math.min(100, rawScore * 120)); // slight boost

  let verdict: Verdict;
  if (score < 15) verdict = "clean";
  else if (score < 35) verdict = "subtle";
  else if (score < 60) verdict = "filtered";
  else verdict = "heavy";

  const summaries: Record<Verdict, string> = {
    clean: "This photo doesn't show obvious signs of filtering. What you see is likely close to real.",
    subtle: "This photo shows subtle signs of processing. Small enhancements that most people wouldn't notice.",
    filtered: "This photo has been filtered. Skin was smoothed, colors were shifted, and natural texture was removed.",
    heavy: "This photo is heavily manipulated. Almost nothing you're seeing is how the original looked.",
  };

  return {
    verdict,
    score,
    signals: signals.sort((a, b) => b.confidence - a.confidence),
    skinPercent,
    reliable: true,
    summary: summaries[verdict],
  };
}

/* ---------- Signal 1: Skin Smoothing ---------- */

function detectSmoothing(
  data: Uint8ClampedArray,
  mask: boolean[],
  skinPixels: number[],
  width: number,
  height: number,
): FilterSignal {
  // Real skin has high-frequency texture (pores, fine lines).
  // Bilateral filtering removes these but preserves edges.
  // Measure: local luminance variance within skin regions.
  // Low variance = smoothed. High variance = natural.

  const rad = 2;
  let varianceSum = 0;
  let sampleCount = 0;

  for (let y = rad; y < height - rad; y += 4) {
    for (let x = rad; x < width - rad; x += 4) {
      const idx = y * width + x;
      if (!mask[idx]) continue;

      const p = idx * 4;
      const centerLum = data[p] * 0.299 + data[p + 1] * 0.587 + data[p + 2] * 0.114;

      let sumDiffSq = 0;
      let neighbors = 0;

      for (let dy = -rad; dy <= rad; dy++) {
        for (let dx = -rad; dx <= rad; dx++) {
          if (dx === 0 && dy === 0) continue;
          const ni = (y + dy) * width + (x + dx);
          if (!mask[ni]) continue;
          const np = ni * 4;
          const nLum = data[np] * 0.299 + data[np + 1] * 0.587 + data[np + 2] * 0.114;
          const diff = centerLum - nLum;
          sumDiffSq += diff * diff;
          neighbors++;
        }
      }

      if (neighbors > 3) {
        varianceSum += Math.sqrt(sumDiffSq / neighbors);
        sampleCount++;
      }
    }
  }

  if (sampleCount === 0) return emptySignal("smoothing");

  const avgVariance = varianceSum / sampleCount;

  // Real skin: variance ~6-18. Filtered: ~1-5. Very filtered: <2.
  // Map to confidence: lower variance = higher smoothing confidence
  let confidence: number;
  if (avgVariance < 2) confidence = 0.95;
  else if (avgVariance < 4) confidence = 0.75;
  else if (avgVariance < 6) confidence = 0.5;
  else if (avgVariance < 8) confidence = 0.3;
  else if (avgVariance < 10) confidence = 0.15;
  else confidence = 0.05;

  return {
    type: "smoothing",
    confidence,
    description: confidence > 0.5
      ? "Skin texture has been artificially smoothed — pores and natural detail are missing from areas where they should exist."
      : confidence > 0.25
      ? "Some skin smoothing detected — texture is softer than typical unfiltered skin."
      : "Minimal smoothing. Skin texture looks mostly natural.",
    technical: `Skin region local variance: ${avgVariance.toFixed(1)} (natural range: 6-18, filtered: <5). Sampling ${sampleCount} skin patches at 2px radius.`,
  };
}

/* ---------- Signal 2: Blemish Removal ---------- */

function detectBlemishRemoval(
  data: Uint8ClampedArray,
  skinPixels: number[],
): FilterSignal {
  // Real skin has occasional dark/red spots (blemishes, freckles, moles).
  // Clone-stamp healing creates unnaturally uniform patches.
  // Measure: how uniform is the skin color distribution?
  // Too uniform = blemishes were removed.

  if (skinPixels.length < 50) return emptySignal("blemishRemoval");

  // Compute luminance histogram of skin pixels
  const bins = new Uint32Array(64);
  for (const i of skinPixels) {
    const p = i * 4;
    const lum = Math.round(data[p] * 0.299 + data[p + 1] * 0.587 + data[p + 2] * 0.114);
    const bin = Math.min(63, Math.floor(lum / 4));
    bins[bin]++;
  }

  // Measure histogram spread — real skin has a wider distribution
  // with occasional outliers (dark spots, highlights)
  let peakBin = 0;
  let peakCount = 0;
  for (let i = 0; i < 64; i++) {
    if (bins[i] > peakCount) {
      peakCount = bins[i];
      peakBin = i;
    }
  }

  // Count how much of the skin is concentrated in a narrow range
  let nearPeak = 0;
  const spread = 4; // +/- 4 bins = ~32 luminance values
  for (let i = Math.max(0, peakBin - spread); i <= Math.min(63, peakBin + spread); i++) {
    nearPeak += bins[i];
  }

  const concentration = nearPeak / skinPixels.length;

  // Real skin: ~40-65% near peak. Filtered: >70%. Heavy: >85%.
  let confidence: number;
  if (concentration > 0.88) confidence = 0.9;
  else if (concentration > 0.78) confidence = 0.65;
  else if (concentration > 0.68) confidence = 0.4;
  else if (concentration > 0.60) confidence = 0.2;
  else confidence = 0.05;

  return {
    type: "blemishRemoval",
    confidence,
    description: confidence > 0.5
      ? "Skin tone is unnaturally uniform — blemishes, freckles, and natural color variation appear to have been removed."
      : confidence > 0.25
      ? "Skin is more uniform than typical. Some spot removal or evening may have been applied."
      : "Natural skin variation present. No obvious blemish removal.",
    technical: `Luminance concentration near peak: ${(concentration * 100).toFixed(1)}% within ±${spread * 4} levels (natural: 40-65%, filtered: >70%). Peak bin: ${peakBin * 4}-${peakBin * 4 + 3}.`,
  };
}

/* ---------- Signal 3: Color Grading ---------- */

function detectColorGrading(
  data: Uint8ClampedArray,
  skinPixels: number[],
): FilterSignal {
  // Instagram-style color grading shifts the overall color balance:
  // - Warm filters boost red/yellow, reduce blue
  // - Saturation boost makes colors more vivid
  // - Contrast reduction flattens shadows
  // Detect by measuring channel balance and saturation distribution.

  let sumR = 0, sumG = 0, sumB = 0;
  let sumSat = 0;

  // Sample skin pixels only — warm backgrounds (wood, sunsets, beige walls)
  // were flagging unfiltered selfies as graded.
  const sampleStep = Math.max(1, Math.floor(skinPixels.length / 10000));
  let sampleCount = 0;

  for (let s = 0; s < skinPixels.length; s += sampleStep) {
    const p = skinPixels[s] * 4;
    const r = data[p], g = data[p + 1], b = data[p + 2];
    sumR += r;
    sumG += g;
    sumB += b;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    sumSat += max > 0 ? (max - min) / max : 0;
    sampleCount++;
  }

  const avgR = sumR / sampleCount;
  const avgG = sumG / sampleCount;
  const avgB = sumB / sampleCount;
  const avgSat = sumSat / sampleCount;

  // Skin is naturally warm: unfiltered R/B runs ~1.3-2.2 across skin tones
  const warmthRatio = avgB > 0 ? avgR / avgB : 1;
  const warmthShift = Math.max(0, warmthRatio - 2.2);

  // Skin saturation: natural ~0.25-0.55 across skin tones, boosted >0.55
  const satBoost = Math.max(0, avgSat - 0.55);

  // Combine warmth and saturation signals
  const rawConfidence = warmthShift * 2 + satBoost * 3;
  const confidence = Math.min(1, rawConfidence);

  return {
    type: "colorGrading",
    confidence,
    description: confidence > 0.5
      ? "Colors have been artificially enhanced — warm tones boosted, saturation increased. This is typical of Instagram and TikTok filters."
      : confidence > 0.25
      ? "Some color adjustment detected — slight warmth or saturation shift from natural."
      : "Colors appear mostly natural. No significant grading detected.",
    technical: `Skin R/G/B means: ${avgR.toFixed(0)}/${avgG.toFixed(0)}/${avgB.toFixed(0)}. Warmth ratio (R/B): ${warmthRatio.toFixed(2)} (natural skin: 1.3-2.2). Avg skin saturation: ${avgSat.toFixed(3)} (natural: 0.25-0.55).`,
  };
}

/* ---------- Signal 4: Sharpness Mismatch ---------- */

function detectSharpnessMismatch(
  data: Uint8ClampedArray,
  mask: boolean[],
  skinPixels: number[],
  nonSkinPixels: number[],
  width: number,
  height: number,
): FilterSignal {
  // The tell-tale sign of beauty filters: skin is smooth but
  // eyes, eyebrows, and hair remain sharp. Real photos have
  // similar sharpness everywhere. Filters create a mismatch.
  //
  // Measure: Laplacian variance on skin vs non-skin regions.
  // Big gap = selective smoothing = filtered.

  const skinSharpness = measureRegionSharpness(data, mask, true, width, height);
  const nonSkinSharpness = measureRegionSharpness(data, mask, false, width, height);

  if (skinSharpness < 0 || nonSkinSharpness < 0) return emptySignal("sharpnessMismatch");

  // Ratio: how much sharper is non-skin vs skin?
  // Natural: ratio ~1.0-2.0 (non-skin slightly sharper due to hair/eyes)
  // Filtered: ratio >2.5 (skin smoothed, edges preserved)
  const ratio = nonSkinSharpness > 0 ? nonSkinSharpness / Math.max(0.5, skinSharpness) : 1;

  let confidence: number;
  if (ratio > 5.0) confidence = 0.95;
  else if (ratio > 3.5) confidence = 0.75;
  else if (ratio > 2.5) confidence = 0.5;
  else if (ratio > 2.0) confidence = 0.25;
  else confidence = 0.05;

  return {
    type: "sharpnessMismatch",
    confidence,
    description: confidence > 0.5
      ? "Skin areas are significantly smoother than the rest of the image — a clear sign of selective beauty filtering. Eyes and hair are sharp, but skin was blurred."
      : confidence > 0.25
      ? "Slight difference in sharpness between skin and non-skin areas. Could indicate mild filtering."
      : "Sharpness is consistent across the image. No selective smoothing detected.",
    technical: `Laplacian variance — skin: ${skinSharpness.toFixed(1)}, non-skin: ${nonSkinSharpness.toFixed(1)}, ratio: ${ratio.toFixed(2)} (natural: 1.0-2.0, filtered: >2.5).`,
  };
}

/** Measure average Laplacian variance for skin or non-skin regions */
function measureRegionSharpness(
  data: Uint8ClampedArray,
  mask: boolean[],
  measureSkin: boolean,
  width: number,
  height: number,
): number {
  let varianceSum = 0;
  let count = 0;

  // Laplacian kernel: [0, -1, 0; -1, 4, -1; 0, -1, 0]
  for (let y = 1; y < height - 1; y += 3) {
    for (let x = 1; x < width - 1; x += 3) {
      const idx = y * width + x;
      if (mask[idx] !== measureSkin) continue;

      const p = idx * 4;
      const lum = data[p] * 0.299 + data[p + 1] * 0.587 + data[p + 2] * 0.114;

      const top = ((y - 1) * width + x) * 4;
      const bot = ((y + 1) * width + x) * 4;
      const lft = (y * width + (x - 1)) * 4;
      const rgt = (y * width + (x + 1)) * 4;

      const topLum = data[top] * 0.299 + data[top + 1] * 0.587 + data[top + 2] * 0.114;
      const botLum = data[bot] * 0.299 + data[bot + 1] * 0.587 + data[bot + 2] * 0.114;
      const lftLum = data[lft] * 0.299 + data[lft + 1] * 0.587 + data[lft + 2] * 0.114;
      const rgtLum = data[rgt] * 0.299 + data[rgt + 1] * 0.587 + data[rgt + 2] * 0.114;

      const laplacian = 4 * lum - topLum - botLum - lftLum - rgtLum;
      varianceSum += laplacian * laplacian;
      count++;
    }
  }

  return count > 10 ? varianceSum / count : -1;
}

/* ---------- Helpers ---------- */

function emptySignal(type: FilterSignal["type"]): FilterSignal {
  return {
    type,
    confidence: 0,
    description: "Not enough data to analyze this signal.",
    technical: "Insufficient pixel data for this metric.",
  };
}

function fallbackResult(reason: string): DetectionResult {
  return {
    verdict: "clean",
    score: 0,
    signals: [],
    skinPercent: 0,
    reliable: false,
    summary: reason,
  };
}
