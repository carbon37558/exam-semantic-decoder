import assert from "node:assert/strict";
import test from "node:test";
import { MAX_IMAGE_BYTES, applyOcrText, validateImage } from "../src/lib/imageInput.ts";
import { fitWithinMaxEdge } from "../src/lib/imagePreprocessing.ts";

test("accepts supported image formats within 3MB", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp"]) {
    assert.equal(validateImage({ type, size: MAX_IMAGE_BYTES }), null);
  }
});

test("rejects unsupported formats and oversized images", () => {
  assert.match(validateImage({ type: "image/gif", size: 100 }) ?? "", /JPG/);
  assert.match(validateImage({ type: "image/jpeg", size: MAX_IMAGE_BYTES + 1 }) ?? "", /3MB/);
});

test("OCR text is replaced or appended only after an explicit choice", () => {
  assert.equal(applyOcrText("Existing", "Recognized", "replace"), "Recognized");
  assert.equal(applyOcrText("Existing", "Recognized", "append"), "Existing\n\nRecognized");
  assert.equal(applyOcrText("", "Recognized", "append"), "Recognized");
});

test("OCR images are proportionally limited to a 2500px longest edge", () => {
  assert.deepEqual(fitWithinMaxEdge(4000, 3000), { width: 2500, height: 1875 });
  assert.deepEqual(fitWithinMaxEdge(3000, 4000), { width: 1875, height: 2500 });
});

test("OCR images within the limit keep their original dimensions", () => {
  assert.deepEqual(fitWithinMaxEdge(1400, 500), { width: 1400, height: 500 });
});
