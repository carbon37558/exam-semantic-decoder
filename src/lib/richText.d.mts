export type RichTextCell = { v?: unknown; r?: string } | undefined;
export function richTextToUnicode(cell: RichTextCell): string;
