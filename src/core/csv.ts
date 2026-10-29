import type { WordCount } from './types';

// Semicolon so Excel in pt-BR splits columns; BOM so it reads accents as UTF-8.
export const CSV_SEPARATOR = ';';
const BOM = '\uFEFF';
const HEADER = ['palavra', 'frequencia'];

function escapeCell(value: string): string {
  return /[";\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toCsv(rows: WordCount[]): string {
  const lines = [HEADER, ...rows.map(({ word, count }) => [word, String(count)])];
  return BOM + lines.map((cells) => cells.map(escapeCell).join(CSV_SEPARATOR)).join('\r\n') + '\r\n';
}
