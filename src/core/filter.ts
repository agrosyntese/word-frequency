import type { WordCount } from './types';

// Case- and accent-insensitive, so "nao" finds "não".
function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();
}

export function filterRows(rows: WordCount[], query: string): WordCount[] {
  const needle = normalize(query.trim());
  if (needle === '') return rows;
  return rows.filter(({ word }) => normalize(word).includes(needle));
}
