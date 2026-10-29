import './styles.css';
import { countWords } from './core/wordFrequency';
import { setupForm, showError } from './ui/form';
import { renderTable } from './ui/table';

function getElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Element not found: ${selector}`);
  return element;
}

const form = getElement<HTMLFormElement>('#text-form');
const input = getElement<HTMLTextAreaElement>('#text-input');
const error = getElement<HTMLElement>('#error-message');
const tbody = getElement<HTMLTableSectionElement>('#frequency-table tbody');

setupForm({ form, input, error }, (text) => {
  const rows = countWords(text);
  if (rows.length === 0) {
    showError(input, error, 'Nenhuma palavra encontrada no texto.');
  }
  renderTable(tbody, rows);
});
