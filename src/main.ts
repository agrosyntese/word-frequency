import './styles.css';
import { filterRows } from './core/filter';
import { removeStopwords } from './core/stopwords';
import type { WordCount } from './core/types';
import { countWords, summarize } from './core/wordFrequency';
import { createChartPanel } from './ui/chartPanel';
import { setupForm, showError, type FormElements } from './ui/form';
import { renderSummary } from './ui/summary';
import { renderTable } from './ui/table';
import { downloadCsv, renderFilterStatus } from './ui/toolbar';

function getElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Element not found: ${selector}`);
  return element;
}

const formElements: FormElements = {
  form: getElement<HTMLFormElement>('#text-form'),
  input: getElement<HTMLTextAreaElement>('#text-input'),
  error: getElement<HTMLElement>('#error-message'),
  counter: getElement<HTMLElement>('#char-counter'),
  clearButton: getElement<HTMLButtonElement>('#clear-button'),
};
const stopwordsToggle = getElement<HTMLInputElement>('#stopwords-toggle');
const summaryElement = getElement<HTMLElement>('#summary');
const toolbar = getElement<HTMLElement>('#table-toolbar');
const filterInput = getElement<HTMLInputElement>('#filter-input');
const filterStatus = getElement<HTMLElement>('#filter-status');
const exportButton = getElement<HTMLButtonElement>('#export-button');
const tbody = getElement<HTMLTableSectionElement>('#frequency-table tbody');
const chart = createChartPanel({
  container: getElement<HTMLElement>('#chart-container'),
  caption: getElement<HTMLElement>('#chart-caption'),
  toggleButtons: [...document.querySelectorAll<HTMLButtonElement>('.view-toggle button')],
  barWrapper: getElement<HTMLElement>('#bar-wrapper'),
  barCanvas: getElement<HTMLCanvasElement>('#bar-chart'),
  cloudWrapper: getElement<HTMLElement>('#cloud-wrapper'),
  cloudCanvas: getElement<HTMLCanvasElement>('#cloud-chart'),
});

let allRows: WordCount[] = [];
let visibleRows: WordCount[] = [];
let tableRows: WordCount[] = [];

function emptyTableMessage(): string {
  if (allRows.length === 0) return 'Nenhuma análise ainda. Digite um texto e clique em Translate.';
  if (visibleRows.length === 0) return 'Todas as palavras são comuns. Desmarque "Ignorar palavras comuns" para vê-las.';
  return `Nenhuma palavra contém "${filterInput.value.trim()}".`;
}

function render(): void {
  visibleRows = stopwordsToggle.checked ? removeStopwords(allRows) : allRows;
  renderSummary(summaryElement, summarize(allRows), allRows.length - visibleRows.length);
  chart.update(visibleRows);
  toolbar.hidden = allRows.length === 0;
  renderFilteredTable();
}

// The filter only affects the table, so typing in it doesn't redraw the charts.
function renderFilteredTable(): void {
  tableRows = filterRows(visibleRows, filterInput.value);
  renderFilterStatus(filterStatus, tableRows.length, visibleRows.length, filterInput.value);
  exportButton.disabled = tableRows.length === 0;
  renderTable(tbody, tableRows, emptyTableMessage());
}

setupForm(formElements, {
  onSubmit: (text) => {
    allRows = countWords(text);
    render();
    if (allRows.length === 0) {
      showError(formElements, 'Nenhuma palavra encontrada no texto.');
    }
  },
  onClear: () => {
    allRows = [];
    filterInput.value = '';
    render();
  },
});

stopwordsToggle.addEventListener('change', render);
filterInput.addEventListener('input', renderFilteredTable);
exportButton.addEventListener('click', () => downloadCsv(tableRows));

render();
