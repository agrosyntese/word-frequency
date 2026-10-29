import type { WordCount } from '../core/types';

export function renderTable(tbody: HTMLTableSectionElement, rows: WordCount[], emptyMessage: string): void {
  if (rows.length === 0) {
    tbody.replaceChildren(createEmptyRow(emptyMessage));
    return;
  }

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

function createEmptyRow(message: string): HTMLTableRowElement {
  const tr = document.createElement('tr');
  const td = document.createElement('td');
  td.colSpan = 2;
  td.className = 'empty-state';
  td.textContent = message;
  tr.append(td);
  return tr;
}
