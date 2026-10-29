import type { WordCount } from '../core/types';

const EMPTY_MESSAGE = 'Nenhuma análise ainda. Digite um texto e clique em Translate.';

export function renderTable(tbody: HTMLTableSectionElement, rows: WordCount[]): void {
  if (rows.length === 0) {
    tbody.replaceChildren(createEmptyRow());
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

function createEmptyRow(): HTMLTableRowElement {
  const tr = document.createElement('tr');
  const td = document.createElement('td');
  td.colSpan = 2;
  td.className = 'empty-state';
  td.textContent = EMPTY_MESSAGE;
  tr.append(td);
  return tr;
}
