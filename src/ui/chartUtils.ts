import type { WordCount } from '../core/types';

export type WordChart = { update: (rows: WordCount[]) => void };

export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function timesLabel(count: number): string {
  return `${count} ${count === 1 ? 'vez' : 'vezes'}`;
}

export function describe(kind: string, rows: WordCount[]): string {
  const items = rows.map(({ word, count }) => `${word}: ${count}`).join(', ');
  return `${kind} com as palavras mais frequentes. ${items}.`;
}
