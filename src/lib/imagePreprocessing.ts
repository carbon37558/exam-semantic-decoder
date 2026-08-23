export const MAX_OCR_IMAGE_EDGE = 2500;

export function fitWithinMaxEdge(width: number, height: number, maxEdge = MAX_OCR_IMAGE_EDGE) {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

function loadImage(file: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image could not be decoded."));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("Image could not be resized.")),
      type,
      0.92,
    );
  });
}

export async function prepareImageForOcr(file: File) {
  const image = await loadImage(file);
  const size = fitWithinMaxEdge(image.naturalWidth, image.naturalHeight);

  if (size.width === image.naturalWidth && size.height === image.naturalHeight) return file;

  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available.");

  context.drawImage(image, 0, 0, size.width, size.height);
  try {
    return await canvasToBlob(canvas, file.type);
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}
