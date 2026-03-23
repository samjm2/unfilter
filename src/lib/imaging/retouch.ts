// ============================================================
// Retouch Engine — real skin retouching algorithms
//
// This does what Snapchat/TikTok/Facetune actually do:
//   1. Bilateral filter  — smooth skin texture, preserve edges
//   2. Blemish healing    — detect + clone-stamp pimples/acne
//   3. Under-eye lighten  — color-match dark circles to cheek skin
//
// Everything runs on raw Canvas pixel data. No server, no uploads.
// ============================================================

export type RetouchOptions = {
  /** 0-100: how aggressively to smooth skin texture (bilateral filter) */
  smoothing: number;
  /** 0-100: how aggressively to remove blemishes */
  blemishRemoval: number;
  /** 0-100: how much to lighten under-eye area */
  eyeBagRemoval: number;
};

export type BlemishRegion = {
  cx: number;
  cy: number;
  radius: number;
  pixels: Array<{ x: number; y: number }>;
};

// ---------- Skin Mask (HSV-based) ----------

/** Build a boolean skin mask from image data using HSV color ranges */
export function buildSkinMask(
  imageData: ImageData,
  customMask?: boolean[]
): boolean[] {
  if (customMask) return customMask;

  const { data, width, height } = imageData;
  const mask = new Array<boolean>(width * height);

  for (let i = 0; i < width * height; i++) {
    const p = i * 4;
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];

    // Convert to HSV
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    if (delta > 0) {
      if (max === r) h = 60 * (((g - b) / delta) % 6);
      else if (max === g) h = 60 * ((b - r) / delta + 2);
      else h = 60 * ((r - g) / delta + 4);
    }
    if (h < 0) h += 360;

    const s = max === 0 ? 0 : delta / max;
    const v = max / 255;

    // Skin tone detection in HSV space
    // Hue: 0-50° (red-yellow range covers most skin tones)
    // Saturation: 0.1-0.7 (some color, not gray or fully saturated)
    // Value: 0.2-0.95 (not too dark, not blown out)
    const isSkin =
      (h >= 0 && h <= 50) &&
      (s >= 0.1 && s <= 0.75) &&
      (v >= 0.2 && v <= 0.95) &&
      // RGB rule: skin has R > G > B generally
      r > 60 && g > 40 && r > g && (r - g) > 10;

    mask[i] = isSkin;
  }

  return mask;
}

// ---------- Bilateral Filter ----------

/**
 * Bilateral filter — smooths texture while preserving edges.
 * Only processes pixels within the skin mask.
 *
 * This is what makes retouched skin look smooth but not foggy.
 * Pores vanish (small color variations averaged out).
 * Edges stay sharp (nostril borders, eyelashes — big color jumps preserved).
 */
export function bilateralFilter(
  imageData: ImageData,
  mask: boolean[],
  strength: number // 0-100
): ImageData {
  if (strength <= 0) return imageData;

  const { data, width, height } = imageData;
  const output = new Uint8ClampedArray(data);

  // Scale parameters by strength
  const spatialSigma = 3 + (strength / 100) * 7; // 3-10 pixel radius
  const colorSigma = 15 + (strength / 100) * 45; // 15-60 color tolerance
  const radius = Math.ceil(spatialSigma * 1.5);

  // Precompute spatial gaussian weights
  const spatialWeights: number[] = [];
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      spatialWeights.push(
        Math.exp(-(dx * dx + dy * dy) / (2 * spatialSigma * spatialSigma))
      );
    }
  }

  const colorSigmaSq2 = 2 * colorSigma * colorSigma;
  const kernelSize = 2 * radius + 1;

  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      const idx = y * width + x;
      if (!mask[idx]) continue; // skip non-skin

      const p = idx * 4;
      const cr = data[p];
      const cg = data[p + 1];
      const cb = data[p + 2];

      let sumR = 0, sumG = 0, sumB = 0, sumW = 0;
      let ki = 0;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ni = (y + dy) * width + (x + dx);
          const np = ni * 4;
          const nr = data[np];
          const ng = data[np + 1];
          const nb = data[np + 2];

          // Color distance
          const colorDist = (cr - nr) * (cr - nr) + (cg - ng) * (cg - ng) + (cb - nb) * (cb - nb);
          const colorWeight = Math.exp(-colorDist / colorSigmaSq2);

          const w = spatialWeights[ki] * colorWeight;
          sumR += nr * w;
          sumG += ng * w;
          sumB += nb * w;
          sumW += w;
          ki++;
        }
      }

      if (sumW > 0) {
        output[p] = sumR / sumW;
        output[p + 1] = sumG / sumW;
        output[p + 2] = sumB / sumW;
      }
    }
  }

  return new ImageData(output, width, height);
}

// ---------- Blemish Detection ----------

/**
 * Detect blemishes (pimples, acne, dark spots) on skin.
 * Looks for pixel clusters that are significantly darker or redder
 * than their local neighborhood.
 */
export function detectBlemishes(
  imageData: ImageData,
  mask: boolean[],
  sensitivity: number // 0-100
): BlemishRegion[] {
  if (sensitivity <= 0) return [];

  const { data, width, height } = imageData;
  const threshold = 30 - (sensitivity / 100) * 18; // 30 → 12 (higher sensitivity = lower threshold)
  const neighborRadius = 12;

  // Pass 1: find pixels darker/redder than neighborhood
  const flagged = new Uint8Array(width * height);

  for (let y = neighborRadius; y < height - neighborRadius; y++) {
    for (let x = neighborRadius; x < width - neighborRadius; x++) {
      const idx = y * width + x;
      if (!mask[idx]) continue;

      const p = idx * 4;
      const r = data[p], g = data[p + 1], b = data[p + 2];
      const lum = r * 0.299 + g * 0.587 + b * 0.114;

      // Compute local average luminance
      let sumLum = 0, count = 0;
      for (let dy = -neighborRadius; dy <= neighborRadius; dy += 3) {
        for (let dx = -neighborRadius; dx <= neighborRadius; dx += 3) {
          const ni = (y + dy) * width + (x + dx);
          if (mask[ni]) {
            const np = ni * 4;
            sumLum += data[np] * 0.299 + data[np + 1] * 0.587 + data[np + 2] * 0.114;
            count++;
          }
        }
      }

      if (count < 4) continue;
      const avgLum = sumLum / count;

      // Check if pixel is darker than neighborhood
      const darkDiff = avgLum - lum;
      // Check redness (blemishes tend to be redder)
      const redness = r - (g + b) / 2;
      const localRedness = (() => {
        let sr = 0, c2 = 0;
        for (let dy = -neighborRadius; dy <= neighborRadius; dy += 4) {
          for (let dx = -neighborRadius; dx <= neighborRadius; dx += 4) {
            const ni = (y + dy) * width + (x + dx);
            if (mask[ni]) {
              const np = ni * 4;
              sr += data[np] - (data[np + 1] + data[np + 2]) / 2;
              c2++;
            }
          }
        }
        return c2 > 0 ? sr / c2 : 0;
      })();

      if (darkDiff > threshold || (redness - localRedness) > threshold * 0.6) {
        flagged[idx] = 1;
      }
    }
  }

  // Pass 2: cluster flagged pixels into blemish regions (flood fill)
  const visited = new Uint8Array(width * height);
  const blemishes: BlemishRegion[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!flagged[idx] || visited[idx]) continue;

      // Flood fill to find connected region
      const pixels: Array<{ x: number; y: number }> = [];
      const stack = [{ x, y }];
      let sumX = 0, sumY = 0;

      while (stack.length > 0) {
        const pt = stack.pop()!;
        const pi = pt.y * width + pt.x;
        if (pt.x < 0 || pt.x >= width || pt.y < 0 || pt.y >= height) continue;
        if (visited[pi] || !flagged[pi]) continue;

        visited[pi] = 1;
        pixels.push(pt);
        sumX += pt.x;
        sumY += pt.y;

        stack.push({ x: pt.x + 1, y: pt.y });
        stack.push({ x: pt.x - 1, y: pt.y });
        stack.push({ x: pt.x, y: pt.y + 1 });
        stack.push({ x: pt.x, y: pt.y - 1 });
      }

      // Only keep clusters that are pimple-sized (3-80 pixels, roughly 2-10px radius)
      if (pixels.length >= 3 && pixels.length <= 80) {
        const cx = Math.round(sumX / pixels.length);
        const cy = Math.round(sumY / pixels.length);
        const radius = Math.ceil(Math.sqrt(pixels.length / Math.PI)) + 1;
        blemishes.push({ cx, cy, radius, pixels });
      }
    }
  }

  return blemishes;
}

// ---------- Blemish Healing ----------

/**
 * Clone-stamp heal each blemish.
 * Samples clean skin from a ring around the blemish and
 * paints over the blemish with interpolated clean skin.
 */
export function healBlemishes(
  imageData: ImageData,
  blemishes: BlemishRegion[],
  mask: boolean[]
): ImageData {
  if (blemishes.length === 0) return imageData;

  const { data, width, height } = imageData;
  const output = new Uint8ClampedArray(data);

  for (const b of blemishes) {
    // Sample clean skin from ring around blemish
    const sampleRadius = b.radius + 4;
    let sumR = 0, sumG = 0, sumB = 0, count = 0;

    for (let dy = -sampleRadius; dy <= sampleRadius; dy++) {
      for (let dx = -sampleRadius; dx <= sampleRadius; dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Only sample from the ring (outside blemish, inside sample radius)
        if (dist < b.radius || dist > sampleRadius) continue;

        const sx = b.cx + dx;
        const sy = b.cy + dy;
        if (sx < 0 || sx >= width || sy < 0 || sy >= height) continue;

        const si = sy * width + sx;
        if (!mask[si]) continue;

        // Skip if this pixel is also a blemish pixel
        const isBlemishPixel = b.pixels.some((p) => p.x === sx && p.y === sy);
        if (isBlemishPixel) continue;

        const sp = si * 4;
        sumR += data[sp];
        sumG += data[sp + 1];
        sumB += data[sp + 2];
        count++;
      }
    }

    if (count === 0) continue;

    const avgR = sumR / count;
    const avgG = sumG / count;
    const avgB = sumB / count;

    // Paint over blemish pixels with sampled skin, feathered at edges
    for (const px of b.pixels) {
      const pi = (px.y * width + px.x) * 4;
      const distFromCenter = Math.sqrt(
        (px.x - b.cx) * (px.x - b.cx) + (px.y - b.cy) * (px.y - b.cy)
      );

      // Feather: full replacement at center, blend at edges
      const blend = Math.max(0, Math.min(1, 1 - distFromCenter / (b.radius * 1.5)));
      const smoothBlend = blend * blend * (3 - 2 * blend); // smoothstep

      output[pi] = data[pi] + (avgR - data[pi]) * smoothBlend;
      output[pi + 1] = data[pi + 1] + (avgG - data[pi + 1]) * smoothBlend;
      output[pi + 2] = data[pi + 2] + (avgB - data[pi + 2]) * smoothBlend;
    }
  }

  return new ImageData(output, width, height);
}

// ---------- Under-Eye Lightening ----------

/**
 * Lighten under-eye dark circles by blending toward surrounding cheek skin.
 * Uses provided regions (from face mesh landmarks or manual coords).
 */
export function lightenUnderEyes(
  imageData: ImageData,
  regions: Array<{ cx: number; cy: number; rx: number; ry: number }>,
  strength: number // 0-100
): ImageData {
  if (strength <= 0 || regions.length === 0) return imageData;

  const { data, width, height } = imageData;
  const output = new Uint8ClampedArray(data);
  const intensity = strength / 100;

  for (const region of regions) {
    // Sample reference brightness from just below the under-eye region (cheek)
    let refR = 0, refG = 0, refB = 0, refCount = 0;
    for (let dy = region.ry; dy < region.ry + 8; dy++) {
      for (let dx = -region.rx; dx <= region.rx; dx++) {
        const sx = region.cx + dx;
        const sy = region.cy + dy;
        if (sx < 0 || sx >= width || sy < 0 || sy >= height) continue;
        const sp = (sy * width + sx) * 4;
        refR += data[sp];
        refG += data[sp + 1];
        refB += data[sp + 2];
        refCount++;
      }
    }

    if (refCount === 0) continue;
    refR /= refCount;
    refG /= refCount;
    refB /= refCount;

    // Lighten the under-eye ellipse toward reference color
    for (let dy = -region.ry; dy <= region.ry; dy++) {
      for (let dx = -region.rx; dx <= region.rx; dx++) {
        // Ellipse check
        const ex = dx / region.rx;
        const ey = dy / region.ry;
        if (ex * ex + ey * ey > 1) continue;

        const px = region.cx + dx;
        const py = region.cy + dy;
        if (px < 0 || px >= width || py < 0 || py >= height) continue;

        const pi = (py * width + px) * 4;

        // Feather from edge (stronger in center)
        const edgeDist = 1 - Math.sqrt(ex * ex + ey * ey);
        const blend = edgeDist * edgeDist * intensity;

        // Only lighten — don't darken if reference is darker
        const curLum = data[pi] * 0.299 + data[pi + 1] * 0.587 + data[pi + 2] * 0.114;
        const refLum = refR * 0.299 + refG * 0.587 + refB * 0.114;
        if (refLum <= curLum) continue;

        output[pi] = data[pi] + (refR - data[pi]) * blend;
        output[pi + 1] = data[pi + 1] + (refG - data[pi + 1]) * blend;
        output[pi + 2] = data[pi + 2] + (refB - data[pi + 2]) * blend;
      }
    }
  }

  return new ImageData(output, width, height);
}

// ---------- Full Pipeline ----------

/**
 * Apply the full retouching pipeline to a canvas.
 * Returns a new canvas with the retouched image.
 */
export function applyRetouch(
  sourceCanvas: HTMLCanvasElement,
  options: RetouchOptions,
  knownBlemishes?: BlemishRegion[],
  knownUnderEyes?: Array<{ cx: number; cy: number; rx: number; ry: number }>,
  customSkinMask?: boolean[]
): HTMLCanvasElement {
  const { width, height } = sourceCanvas;
  const ctx = sourceCanvas.getContext("2d", { willReadFrequently: true })!;
  let imageData = ctx.getImageData(0, 0, width, height);

  // Step 1: Build skin mask
  const mask = buildSkinMask(imageData, customSkinMask);

  // Step 2: Detect blemishes (or use known positions)
  const blemishes =
    knownBlemishes ?? detectBlemishes(imageData, mask, options.blemishRemoval);

  // Step 3: Heal blemishes (do this BEFORE smoothing for best results)
  if (options.blemishRemoval > 0) {
    imageData = healBlemishes(imageData, blemishes, mask);
  }

  // Step 4: Bilateral filter on skin regions
  if (options.smoothing > 0) {
    imageData = bilateralFilter(imageData, mask, options.smoothing);
  }

  // Step 5: Under-eye lightening
  if (options.eyeBagRemoval > 0 && knownUnderEyes) {
    imageData = lightenUnderEyes(imageData, knownUnderEyes, options.eyeBagRemoval);
  }

  // Write to output canvas
  const outCanvas = document.createElement("canvas");
  outCanvas.width = width;
  outCanvas.height = height;
  const outCtx = outCanvas.getContext("2d")!;
  outCtx.putImageData(imageData, 0, 0);

  return outCanvas;
}
