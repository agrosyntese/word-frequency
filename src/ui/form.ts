import { MAX_CHARS } from '../core/wordFrequency';

type FormElements = {
  form: HTMLFormElement;
  input: HTMLTextAreaElement;
  error: HTMLElement;
};

export function setupForm({ form, input, error }: FormElements, onSubmit: (text: string) => void): void {
  input.maxLength = MAX_CHARS;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value;

    if (text.trim() === '') {
      showError(input, error, 'Digite ou cole um texto antes de analisar.');
      return;
    }

    hideError(input, error);
    onSubmit(text);
  });

  input.addEventListener('input', () => hideError(input, error));
}

export function showError(input: HTMLTextAreaElement, error: HTMLElement, message: string): void {
  error.textContent = message;
  error.hidden = false;
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-describedby', error.id);
}

export function hideError(input: HTMLTextAreaElement, error: HTMLElement): void {
  error.textContent = '';
  error.hidden = true;
  input.removeAttribute('aria-invalid');
  input.removeAttribute('aria-describedby');
}
