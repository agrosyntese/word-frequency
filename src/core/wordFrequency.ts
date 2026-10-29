import type { Summary, WordCount } from './types';

export const MAX_CHARS = 2048;

// Letters/digits, optionally joined by inner apostrophes or hyphens ("don't", "guarda-chuva").
const WORD_PATTERN = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;

export function extractWords(text: string): string[] {
  const matches = text.match(WORD_PATTERN) ?? [];
  return matches.map((word) => word.replace(/’/g, "'").toLocaleLowerCase());
}

export function countWords(text: string): WordCount[] {
  const counts = new Map<string, number>();
  for (const word of extractWords(text)) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return [...counts]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
}

export function summarize(rows: WordCount[]): Summary {
  const total = rows.reduce((sum, { count }) => sum + count, 0);
  return { total, unique: rows.length };
}
