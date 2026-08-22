import fs from "node:fs/promises";
import path from "node:path";
import XLSX from "xlsx";
import { formatScientificText } from "../src/lib/formatText.mjs";

const source = path.resolve("data/exam_semantic_decoder_terms.xlsx");
const destination = path.resolve("src/generated/terms.json");
const expectedHeaders = ["term", "aliases", "subject", "official", "decoded"];
const allowedSubjects = new Set(["MATH", "CHEM", "PHYSICS", "All"]);

const workbook = XLSX.readFile(source);
const sheetName = workbook.SheetNames[0];
if (!sheetName) throw new Error("The Excel database has no worksheet.");

const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "", raw: false });
const actualHeaders = Object.keys(rows[0] ?? {});
for (const header of expectedHeaders) {
  if (!actualHeaders.includes(header)) throw new Error(`Missing required Excel column: ${header}`);
}

const terms = rows.map((row, index) => {
  const record = Object.fromEntries(expectedHeaders.map((header) => [header, String(row[header] ?? "").trim()]));
  for (const field of ["term", "subject", "official", "decoded"]) {
    if (!record[field]) throw new Error(`Row ${index + 2} is missing ${field}.`);
  }
  if (!allowedSubjects.has(record.subject)) throw new Error(`Row ${index + 2} has unsupported subject: ${record.subject}`);
  return {
    term: record.term,
    aliases: record.aliases.split(",").map((alias) => alias.trim()).filter(Boolean),
    subject: record.subject,
    official: formatScientificText(record.official),
    decoded: formatScientificText(record.decoded),
  };
});

await fs.mkdir(path.dirname(destination), { recursive: true });
await fs.writeFile(destination, `${JSON.stringify(terms, null, 2)}\n`, "utf8");
console.log(`Generated ${terms.length} terms from ${path.relative(process.cwd(), source)}.`);
