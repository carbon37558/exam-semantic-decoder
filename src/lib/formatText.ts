const subscriptDigits: Record<string, string> = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
  "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
};

const superscriptCharacters: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  "+": "⁺", "-": "⁻",
};

const translate = (value: string, characters: Record<string, string>) =>
  [...value].map((character) => characters[character] ?? character).join("");

export function formatScientificText(value: string) {
  return value
    .replace(/\b((?:[A-Z][a-z]?)+)(\d+)\^(?=\d+[+-]?)/g, (_, formula, digits) =>
      `${formula}${translate(digits, subscriptDigits)}^`,
    )
    .replace(/_([0-9]+)/g, (_, digits) => translate(digits, subscriptDigits))
    .replace(/\^([0-9]+)([+-]?)/g, (_, digits, sign) =>
      translate(`${digits}${sign}`, superscriptCharacters),
    );
}
