import type { Summary } from '../core/types';

export function renderSummary(element: HTMLElement, summary: Summary): void {
  if (summary.total === 0) {
    element.textContent = '';
    element.hidden = true;
    return;
  }

  const total = `${summary.total} ${summary.total === 1 ? 'palavra' : 'palavras'}`;
  const unique = `${summary.unique} ${summary.unique === 1 ? 'única' : 'únicas'}`;
  element.textContent = `${total} · ${unique}`;
  element.hidden = false;
}
