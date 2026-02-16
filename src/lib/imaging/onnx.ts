import * as ort from "onnxruntime-web";

/**
 * Convert an HTMLImageElement to a Float32 tensor (1x3xHxW) normalized to [0,1].
 * This is a common input format for CV models (adjust if your model expects mean/std).
 */
export function imageToCHWTensor(
  img: HTMLImageElement,
  size: number
): { tensor: ort.Tensor; width: number; height: number } {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size); // RGBA

  const chw = new Float32Array(1 * 3 * size * size);
  let p = 0;
  for (let i = 0; i < size * size; i++) {
    const r = data[p] / 255;
    const g = data[p + 1] / 255;
    const b = data[p + 2] / 255;
    // CHW
    chw[i] = r;
    chw[i + size * size] = g;
    chw[i + 2 * size * size] = b;
    p += 4;
  }

  return { tensor: new ort.Tensor("float32", chw, [1, 3, size, size]), width: size, height: size };
}

export async function loadOnnxSession(modelUrl: string) {
  // wasm backend by default; good for client-side
  return await ort.InferenceSession.create(modelUrl, {
    executionProviders: ["wasm"],
    graphOptimizationLevel: "all",
  });
}
