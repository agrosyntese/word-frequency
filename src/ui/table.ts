import type { WordCount } from '../core/types';

export function renderTable(tbody: HTMLTableSectionElement, rows: WordCount[]): void {
  const fragment = document.createDocumentFragment();

  for (const { word, count } of rows) {
    const tr = document.createElement('tr');
    const wordCell = document.createElement('td');
    const countCell = document.createElement('td');
    wordCell.textContent = word;
    countCell.textContent = String(count);
    tr.append(wordCell, countCell);
    fragment.append(tr);
  }

  tbody.replaceChildren(fragment);
}
