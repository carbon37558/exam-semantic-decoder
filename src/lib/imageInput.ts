export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateImage(file: Pick<File, "size" | "type">) {
  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) return "Choose a JPG, PNG, or WEBP image.";
  if (file.size > MAX_IMAGE_BYTES) return "Image must be 3MB or smaller.";
  return null;
}
