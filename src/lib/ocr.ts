import type { Worker as TesseractWorker } from "tesseract.js";
import { prepareImageForOcr } from "./imagePreprocessing";

let workerPromise: Promise<TesseractWorker> | null = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = import("tesseract.js").then(({ createWorker }) => createWorker("eng"));
  }
  return workerPromise;
}

async function terminateWorker() {
  const currentWorker = workerPromise;
  workerPromise = null;
  if (!currentWorker) return;
  try {
    await (await currentWorker).terminate();
  } catch {
    // A failed worker has nothing left to reuse.
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => { void terminateWorker(); }, { once: true });
}

export async function recognizeImage(file: File) {
  const image = await prepareImageForOcr(file);
  try {
    const worker = await getWorker();
    const result = await worker.recognize(image);
    return result.data.text;
  } catch (error) {
    await terminateWorker();
    throw error;
  }
}
