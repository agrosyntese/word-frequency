import { toCsv } from '../core/csv';
import type { WordCount } from '../core/types';

const CSV_FILENAME = 'frequencia-palavras.csv';

export function renderFilterStatus(element: HTMLElement, shown: number, total: number, query: string): void {
  element.textContent = query.trim() === '' ? '' : `${shown} de ${total}`;
}

export function downloadCsv(rows: WordCount[]): void {
  const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = CSV_FILENAME;
  link.click();
  URL.revokeObjectURL(url);
}
