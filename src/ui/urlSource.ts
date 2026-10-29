import type { FetchedPage } from '../core/types';

const API_PATH = '/api/fetch-text';
const CLIENT_TIMEOUT_MS = 15_000;

function isFetchedPage(value: unknown): value is FetchedPage {
  if (typeof value !== 'object' || value === null) return false;
  const page = value as Record<string, unknown>;
  return (
    typeof page.url === 'string' &&
    typeof page.title === 'string' &&
    typeof page.text === 'string' &&
    typeof page.truncated === 'boolean'
  );
}

function errorMessage(value: unknown): string | null {
  if (typeof value !== 'object' || value === null) return null;
  const { error } = value as Record<string, unknown>;
  return typeof error === 'string' ? error : null;
}

export async function fetchPageText(url: string, signal: AbortSignal): Promise<FetchedPage> {
  let response: Response;
  try {
    response = await fetch(`${API_PATH}?url=${encodeURIComponent(url)}`, {
      signal: AbortSignal.any([signal, AbortSignal.timeout(CLIENT_TIMEOUT_MS)]),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new Error('O servidor demorou demais para responder.');
    }
    if (signal.aborted) throw error;
    throw new Error('Sem conexão com o servidor. Verifique sua internet.');
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(errorMessage(body) ?? 'Não foi possível analisar a página.');
  if (!isFetchedPage(body)) throw new Error('Resposta inválida do servidor.');
  return body;
}

export function renderSourceInfo(element: HTMLElement, page: FetchedPage | null): void {
  if (!page) {
    element.replaceChildren();
    element.hidden = true;
    return;
  }

  const link = document.createElement('a');
  const url = new URL(page.url);
  // The server only returns http(s) URLs; checked again because it becomes a clickable link.
  if (url.protocol === 'http:' || url.protocol === 'https:') link.href = url.href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = page.title || url.hostname;

  const chars = page.text.length.toLocaleString('pt-BR');
  const details = page.truncated
    ? ` · primeiros ${chars} caracteres analisados (página longa)`
    : ` · ${chars} caracteres analisados`;
  element.replaceChildren('Fonte: ', link, details);
  element.hidden = false;
}
