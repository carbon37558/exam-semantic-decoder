import assert from "node:assert/strict";
import test from "node:test";
import XLSX from "xlsx";
import { richTextToUnicode } from "../src/lib/richText.mjs";

const run = (text: string, align?: "subscript" | "superscript") =>
  `<r>${align ? `<rPr><vertAlign val="${align}"/></rPr>` : ""}<t>${text}</t></r>`;

test("converts Excel rich-text chemistry formatting to Unicode", () => {
  assert.equal(richTextToUnicode({ r: run("H") + run("2", "subscript") + run("O") }), "H₂O");
  assert.equal(richTextToUnicode({ r: run("CO") + run("2", "subscript") }), "CO₂");
  assert.equal(richTextToUnicode({ r: run("SO") + run("4", "subscript") + run("2-", "superscript") }), "SO₄²⁻");
  assert.equal(richTextToUnicode({ r: run("Cu") + run("2+", "superscript") }), "Cu²⁺");
  assert.equal(richTextToUnicode({ r: run("NH") + run("4", "subscript") + run("+", "superscript") }), "NH₄⁺");
});

test("converts Excel rich-text mathematics formatting and primes to Unicode", () => {
  assert.equal(richTextToUnicode({ r: run("x") + run("2", "superscript") }), "x²");
  assert.equal(richTextToUnicode({ r: run("x") + run("1", "subscript") }), "x₁");
  assert.equal(richTextToUnicode({ v: "f'(x)" }), "f′(x)");
  assert.equal(richTextToUnicode({ v: "f''(x)" }), "f″(x)");
});

test("reads superscript and subscript runs from the current Excel database", () => {
  const workbook = XLSX.readFile("data/exam_semantic_decoder_terms.xlsx", { cellHTML: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string> & { __rowNum__: number }>(sheet, { defval: "" });
  const decodedFor = (term: string) => {
    const row = rows.find((record) => record.term === term);
    assert.ok(row, `Missing Excel term: ${term}`);
    return richTextToUnicode(sheet[XLSX.utils.encode_cell({ r: row.__rowNum__, c: 4 })]);
  };

  assert.equal(decodedFor("second derivative"), "f″，d²y/dx²");
  assert.equal(decodedFor("quadratic"), "最高次方是x²，画出来是抛物线");
  assert.equal(decodedFor("gradient"), "m=(y₂-y₁)/(x₂-x₁)");
});
