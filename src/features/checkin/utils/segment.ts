import * as ort from "onnxruntime-web";
import { imageToCHWTensor, loadOnnxSession } from "@/lib/imaging/onnx";


/**
 * Runs a segmentation model and returns a mask (Uint8Array 0/1).
 * Assumes output is (1x1xHxW) logits/probabilities — adjust names as needed.
 */
export async function runSegmentation(
  imgEl: HTMLImageElement,
  modelPath = "/models/skin_seg.onnx",
  inputSize = 256,
  threshold = 0.5
) {
  const session = await loadOnnxSession(modelPath);
  const { tensor } = imageToCHWTensor(imgEl, inputSize);

  // You MUST match your model's input name. Common: "input", "images", "x"
  const feeds: Record<string, ort.Tensor> = {};
  const inputName = session.inputNames[0];
  feeds[inputName] = tensor;

  const results = await session.run(feeds);
  const outName = session.outputNames[0];
  const out = results[outName] as ort.Tensor; // float32

  // out.dims could be [1,1,H,W] or [1,H,W]
  const data = out.data as Float32Array;
  const H = out.dims[out.dims.length - 2];
  const W = out.dims[out.dims.length - 1];

  const mask = new Uint8Array(H * W);
  for (let i = 0; i < H * W; i++) {
    mask[i] = data[i] >= threshold ? 1 : 0;
  }

  return { mask, width: W, height: H };
}
