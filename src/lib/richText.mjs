const subscriptCharacters = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
  "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎",
};

const superscriptCharacters = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾", "n": "ⁿ",
};

const decodeXml = (value) => value
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replace(/&#([0-9]+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'")
  .replace(/&amp;/g, "&");

const translate = (value, characters) =>
  [...value].map((character) => characters[character] ?? character).join("");

const normalizePrimes = (value) => value.replace(/f''/g, "f″").replace(/f'/g, "f′");

export function richTextToUnicode(cell) {
  if (!cell?.r?.includes("<r>")) return normalizePrimes(String(cell?.v ?? ""));

  const runs = [...cell.r.matchAll(/<r>([\s\S]*?)<\/r>/g)];
  const value = runs.map(([, run]) => {
    const text = run.match(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/)?.[1] ?? "";
    const decoded = decodeXml(text);
    if (/<vertAlign\s+val="subscript"\s*\/>/.test(run)) {
      return translate(decoded, subscriptCharacters);
    }
    if (/<vertAlign\s+val="superscript"\s*\/>/.test(run)) {
      return translate(decoded, superscriptCharacters);
    }
    return decoded;
  }).join("");

  return normalizePrimes(value);
}
