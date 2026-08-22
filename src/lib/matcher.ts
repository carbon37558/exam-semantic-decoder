export type Subject = "MATH" | "CHEM" | "PHYSICS" | "All";

export type TermRecord = { term: string; aliases: string[]; subject: Subject; official: string; decoded: string };
export type Match = { start: number; end: number; expression: string; records: TermRecord[] };
type Candidate = { expression: string; record: TermRecord };

function isWordCharacter(character: string | undefined) {
  return character ? /[\p{L}\p{N}_]/u.test(character) : false;
}

function hasValidBoundaries(text: string, start: number, end: number, expression: string) {
  return !(isWordCharacter(expression[0]) && isWordCharacter(text[start - 1]))
    && !(isWordCharacter(expression[expression.length - 1]) && isWordCharacter(text[end]));
}

export function analyzeText(text: string, selectedSubject: Subject, records: TermRecord[]): Match[] {
  const eligible = records.filter((record) => selectedSubject === "All" || record.subject === selectedSubject || record.subject === "All");
  const candidates: Candidate[] = eligible.flatMap((record) => [record.term, ...record.aliases]
    .map((expression) => expression.trim()).filter(Boolean)
    .map((expression) => ({ expression, record })))
    .sort((a, b) => b.expression.length - a.expression.length);
  const lowerText = text.toLocaleLowerCase("en");
  const claimed = new Array(text.length).fill(false);
  const byRange = new Map<string, Match>();

  for (const candidate of candidates) {
    const expression = candidate.expression.toLocaleLowerCase("en");
    let from = 0;
    while (from <= lowerText.length - expression.length) {
      const start = lowerText.indexOf(expression, from);
      if (start === -1) break;
      const end = start + expression.length;
      const key = `${start}:${end}`;
      const existing = byRange.get(key);
      const overlaps = claimed.slice(start, end).some(Boolean);
      if ((existing || !overlaps) && hasValidBoundaries(text, start, end, candidate.expression)) {
        if (existing) {
          if (!existing.records.some((record) => record.term === candidate.record.term && record.subject === candidate.record.subject)) existing.records.push(candidate.record);
        } else {
          byRange.set(key, { start, end, expression: candidate.expression, records: [candidate.record] });
          for (let index = start; index < end; index += 1) claimed[index] = true;
        }
      }
      from = start + 1;
    }
  }
  return [...byRange.values()].sort((a, b) => a.start - b.start);
}
