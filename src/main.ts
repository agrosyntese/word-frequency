import './styles.css';
import type { WordCount } from './core/types';
import { countWords, summarize } from './core/wordFrequency';
import { createChartPanel } from './ui/chartPanel';
import { setupForm, showError, type FormElements } from './ui/form';
import { renderSummary } from './ui/summary';
import { renderTable } from './ui/table';

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
const summaryElement = getElement<HTMLElement>('#summary');
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

function showResults(rows: WordCount[]): void {
  renderTable(tbody, rows);
  renderSummary(summaryElement, summarize(rows));
  chart.update(rows);
}

setupForm(formElements, {
  onSubmit: (text) => {
    const rows = countWords(text);
    showResults(rows);
    if (rows.length === 0) {
      showError(formElements, 'Nenhuma palavra encontrada no texto.');
    }
  },
  onClear: () => showResults([]),
});

showResults([]);
