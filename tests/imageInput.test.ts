import assert from "node:assert/strict";
import test from "node:test";
import { MAX_IMAGE_BYTES, applyOcrText, validateImage } from "../src/lib/imageInput.ts";

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
