import type { Summary } from '../core/types';

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count.toLocaleString('pt-BR')} ${count === 1 ? singular : pluralForm}`;
}

export function renderSummary(element: HTMLElement, summary: Summary, hiddenStopwords: number): void {
  if (summary.total === 0) {
    element.textContent = '';
    element.hidden = true;
    return;
  }

  const parts = [plural(summary.total, 'palavra', 'palavras'), plural(summary.unique, 'única', 'únicas')];
  if (hiddenStopwords > 0) {
    parts.push(plural(hiddenStopwords, 'comum oculta', 'comuns ocultas'));
  }
  element.textContent = parts.join(' · ');
  element.hidden = false;
}
