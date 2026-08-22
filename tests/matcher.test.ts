import assert from "node:assert/strict";
import test from "node:test";
import { analyzeText, type TermRecord } from "../src/lib/matcher.ts";

const records: TermRecord[] = [
  { term: "ionize", aliases: ["ionization"], subject: "CHEM", official: "电离", decoded: "electron leaves" },
  { term: "ionization energy", aliases: ["ionization energies"], subject: "CHEM", official: "电离能", decoded: "energy needed" },
  { term: "successive ionization energies", aliases: [], subject: "CHEM", official: "连续电离能", decoded: "successive energy" },
  { term: "inflection", aliases: ["point of inflection"], subject: "MATH", official: "拐点", decoded: "switch" },
  { term: "shared", aliases: [], subject: "MATH", official: "数学", decoded: "math meaning" },
  { term: "shared", aliases: [], subject: "CHEM", official: "化学", decoded: "chem meaning" },
  { term: "universal", aliases: [], subject: "All", official: "通用", decoded: "all subjects" },
];

test("longest match claims overlapping text", () => {
  const matches = analyzeText("Compare successive ionization energies.", "CHEM", records);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].expression, "successive ionization energies");
});

test("aliases match case-insensitively while preserving source offsets", () => {
  const text = "At the POINT OF INFLECTION, describe the curve.";
  const [match] = analyzeText(text, "MATH", records);
  assert.equal(text.slice(match.start, match.end), "POINT OF INFLECTION");
  assert.equal(match.records[0].term, "inflection");
});

test("word boundaries avoid matching inside larger words", () => {
  assert.equal(analyzeText("The ionizational wording is unrelated.", "CHEM", records).length, 0);
});

test("a selected subject includes records marked All", () => {
  const matches = analyzeText("A universal idea and shared term.", "MATH", records);
  assert.deepEqual(matches.map((match) => match.records[0].subject), ["All", "MATH"]);
});

test("All mode keeps distinct subject meanings for the same expression", () => {
  const [match] = analyzeText("This is shared.", "All", records);
  assert.deepEqual(match.records.map((record) => record.subject), ["MATH", "CHEM"]);
});

test("specific subject excludes other subjects", () => {
  const [match] = analyzeText("This is shared.", "CHEM", records);
  assert.equal(match.records.length, 1);
  assert.equal(match.records[0].subject, "CHEM");
});
