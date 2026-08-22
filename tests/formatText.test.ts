import assert from "node:assert/strict";
import test from "node:test";
import { formatScientificText } from "../src/lib/formatText.ts";

test("preserves existing Unicode scientific notation", () => {
  for (const value of ["H₂O", "Cu²⁺", "SO₄²⁻", "NH₄⁺", "x²", "x₁", "f′(x)"]) {
    assert.equal(formatScientificText(value), value);
  }
});

test("converts explicit plain-text subscript and superscript notation", () => {
  assert.equal(formatScientificText("H_2O"), "H₂O");
  assert.equal(formatScientificText("SO4^2-"), "SO₄²⁻");
  assert.equal(formatScientificText("Mg^2+"), "Mg²⁺");
  assert.equal(formatScientificText("x^2"), "x²");
  assert.equal(formatScientificText("x_1"), "x₁");
});

test("does not convert unmarked ordinary numbers or prime symbols", () => {
  for (const value of ["450℃", "f'", "f''", "f′", "f″"]) {
    assert.equal(formatScientificText(value), value);
  }
});
