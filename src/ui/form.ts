import { toHttpUrl } from '../core/url';
import { MAX_CHARS } from '../core/wordFrequency';

const COUNTER_WARNING_RATIO = 0.9;
const SUBMIT_LABEL = 'Translate';
const LOADING_LABEL = 'Analisando…';

export type Source = { kind: 'text'; text: string } | { kind: 'url'; url: string };
type SourceKind = Source['kind'];

export type FormElements = {
  form: HTMLFormElement;
  sourceButtons: HTMLButtonElement[];
  textPanel: HTMLElement;
  urlPanel: HTMLElement;
  input: HTMLTextAreaElement;
  urlInput: HTMLInputElement;
  urlHint: HTMLElement;
  error: HTMLElement;
  counter: HTMLElement;
  submitButton: HTMLButtonElement;
  clearButton: HTMLButtonElement;
};

type FormHandlers = {
  onSubmit: (source: Source) => void;
  onClear: () => void;
};

export function setupForm(elements: FormElements, { onSubmit, onClear }: FormHandlers): void {
  const { form, sourceButtons, input, urlInput, counter, clearButton } = elements;
  input.maxLength = MAX_CHARS;
  updateCounter(input, counter);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const source = readSource(elements);
    if (typeof source === 'string') {
      showError(elements, source);
      return;
    }
    hideError(elements);
    onSubmit(source);
  });

  input.addEventListener('input', () => {
    hideError(elements);
    updateCounter(input, counter);
  });
  urlInput.addEventListener('input', () => hideError(elements));

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  for (const button of sourceButtons) {
    button.addEventListener('click', () => {
      const next = button.dataset.source;
      if ((next === 'text' || next === 'url') && next !== currentKind(elements)) {
        setSourceKind(elements, next);
        activeInput(elements).focus();
      }
    });
  }

  clearButton.addEventListener('click', () => {
    input.value = '';
    urlInput.value = '';
    hideError(elements);
    updateCounter(input, counter);
    onClear();
    activeInput(elements).focus();
  });
}

// Returns the source to analyze, or an error message for the user.
function readSource(elements: FormElements): Source | string {
  const { input, urlInput } = elements;
  if (currentKind(elements) === 'text') {
    return input.value.trim() === '' ? 'Digite ou cole um texto antes de analisar.' : { kind: 'text', text: input.value };
  }
  if (urlInput.value.trim() === '') return 'Digite o endereço da página.';
  const url = toHttpUrl(urlInput.value);
  return url === null ? 'URL inválida. Use um endereço completo, como https://exemplo.com.' : { kind: 'url', url };
}

function currentKind({ urlPanel }: FormElements): SourceKind {
  return urlPanel.hidden ? 'text' : 'url';
}

function setSourceKind(elements: FormElements, next: SourceKind): void {
  hideError(elements);
  elements.textPanel.hidden = next !== 'text';
  elements.urlPanel.hidden = next !== 'url';
  elements.counter.hidden = next !== 'text';
  for (const button of elements.sourceButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.source === next));
  }
}

function activeInput(elements: FormElements): HTMLTextAreaElement | HTMLInputElement {
  return currentKind(elements) === 'text' ? elements.input : elements.urlInput;
}

// Each input keeps its own counter/hint description; the error is prepended while shown.
function baseDescription({ input, counter, urlHint }: FormElements, target: HTMLElement): string {
  return target === input ? counter.id : urlHint.id;
}

export function showError(elements: FormElements, message: string): void {
  const target = activeInput(elements);
  elements.error.textContent = message;
  elements.error.hidden = false;
  target.setAttribute('aria-invalid', 'true');
  target.setAttribute('aria-describedby', `${elements.error.id} ${baseDescription(elements, target)}`);
}

function hideError(elements: FormElements): void {
  elements.error.textContent = '';
  elements.error.hidden = true;
  for (const target of [elements.input, elements.urlInput]) {
    target.removeAttribute('aria-invalid');
    target.setAttribute('aria-describedby', baseDescription(elements, target));
  }
}

export function setLoading({ form, submitButton }: FormElements, loading: boolean): void {
  submitButton.disabled = loading;
  submitButton.textContent = loading ? LOADING_LABEL : SUBMIT_LABEL;
  form.setAttribute('aria-busy', String(loading));
}

function updateCounter(input: HTMLTextAreaElement, counter: HTMLElement): void {
  const length = input.value.length;
  counter.textContent = `${length} / ${MAX_CHARS}`;
  counter.classList.toggle('counter-warning', length >= MAX_CHARS * COUNTER_WARNING_RATIO);
}
