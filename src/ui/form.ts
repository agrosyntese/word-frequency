import { MAX_CHARS } from '../core/wordFrequency';

const COUNTER_WARNING_RATIO = 0.9;

export type FormElements = {
  form: HTMLFormElement;
  input: HTMLTextAreaElement;
  error: HTMLElement;
  counter: HTMLElement;
  clearButton: HTMLButtonElement;
};

type FormHandlers = {
  onSubmit: (text: string) => void;
  onClear: () => void;
};

export function setupForm(elements: FormElements, { onSubmit, onClear }: FormHandlers): void {
  const { form, input, counter, clearButton } = elements;
  input.maxLength = MAX_CHARS;
  updateCounter(input, counter);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value;

    if (text.trim() === '') {
      showError(elements, 'Digite ou cole um texto antes de analisar.');
      return;
    }

    hideError(elements);
    onSubmit(text);
  });

  input.addEventListener('input', () => {
    hideError(elements);
    updateCounter(input, counter);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  clearButton.addEventListener('click', () => {
    input.value = '';
    hideError(elements);
    updateCounter(input, counter);
    onClear();
    input.focus();
  });
}

export function showError({ input, error, counter }: FormElements, message: string): void {
  error.textContent = message;
  error.hidden = false;
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-describedby', `${error.id} ${counter.id}`);
}

function hideError({ input, error, counter }: FormElements): void {
  error.textContent = '';
  error.hidden = true;
  input.removeAttribute('aria-invalid');
  input.setAttribute('aria-describedby', counter.id);
}

function updateCounter(input: HTMLTextAreaElement, counter: HTMLElement): void {
  const length = input.value.length;
  counter.textContent = `${length} / ${MAX_CHARS}`;
  counter.classList.toggle('counter-warning', length >= MAX_CHARS * COUNTER_WARNING_RATIO);
}
