import http, { type IncomingMessage } from 'node:http';
import https from 'node:https';
import type { FetchedPage } from '../src/core/types.js';
import { decodePlainText, extractFromHtml, type ExtractedText } from './extractText.js';
import {
  BLOCKED_ADDRESS_CODE,
  createSafeLookup,
  DEFAULT_POLICY,
  FetchPageError,
  validateTargetUrl,
  type UrlPolicy,
} from './urlPolicy.js';

export const TIMEOUT_MS = 5000;
export const MAX_BODY_BYTES = 2_000_000;
export const MAX_TEXT_CHARS = 100_000;
const MAX_REDIRECTS = 3;
const USER_AGENT = 'WordFrequencyBot/1.0 (+https://github.com/agrosyntese/word-frequency)';
const HTML_TYPES = ['text/html', 'application/xhtml+xml'];

export async function fetchPage(rawUrl: string, policy: UrlPolicy = DEFAULT_POLICY): Promise<FetchedPage> {
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  try {
    let url = validateTargetUrl(rawUrl, policy);

    for (let redirects = 0; ; redirects++) {
      const response = await get(url, policy, signal);
      const status = response.statusCode ?? 0;
      const location = response.headers.location;

      if (status >= 300 && status < 400 && location) {
        response.resume();
        if (redirects >= MAX_REDIRECTS) throw new FetchPageError('A página redirecionou vezes demais.', 502);
        url = validateTargetUrl(new URL(location, url).href, policy);
        continue;
      }
      if (status < 200 || status >= 300) {
        response.resume();
        throw new FetchPageError(`O site respondeu com erro ${status}.`, 502);
      }

      const { mediaType, charset } = parseContentType(response.headers['content-type']);
      const isHtml = HTML_TYPES.includes(mediaType);
      if (!isHtml && mediaType !== 'text/plain') {
        response.resume();
        throw new FetchPageError('Esse endereço não é uma página de texto (HTML ou texto puro).', 415);
      }

      const body = await readBody(response);
      const extracted: ExtractedText = isHtml
        ? extractFromHtml(body, charset)
        : { title: '', text: decodePlainText(body, charset) };
      if (extracted.text === '') throw new FetchPageError('Nenhum texto encontrado na página.', 422);

      const text = truncateAtWord(extracted.text, MAX_TEXT_CHARS);
      return { url: url.href, title: extracted.title, text, truncated: text.length < extracted.text.length };
    }
  } catch (error) {
    throw toFetchPageError(error);
  }
}

function get(url: URL, policy: UrlPolicy, signal: AbortSignal): Promise<IncomingMessage> {
  const client = url.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    const request = client.get(url, {
      signal,
      lookup: createSafeLookup(policy.isBlockedAddress),
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html, application/xhtml+xml, text/plain;q=0.9' },
    });
    request.once('response', resolve);
    request.once('error', reject);
  });
}

async function readBody(response: IncomingMessage): Promise<Buffer> {
  const tooLarge = new FetchPageError('A página é grande demais para analisar.', 413);
  if (Number(response.headers['content-length']) > MAX_BODY_BYTES) {
    response.destroy();
    throw tooLarge;
  }

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of response) {
    const buffer = chunk as Buffer;
    size += buffer.length;
    if (size > MAX_BODY_BYTES) {
      response.destroy();
      throw tooLarge;
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

export function parseContentType(header: string | undefined): { mediaType: string; charset?: string } {
  const [mediaType = '', ...params] = (header ?? '').split(';').map((part) => part.trim());
  const charsetParam = params.find((param) => param.toLowerCase().startsWith('charset='));
  const charset = charsetParam?.slice('charset='.length).replace(/^"|"$/g, '') || undefined;
  return { mediaType: mediaType.toLowerCase(), charset };
}

export function truncateAtWord(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');
  return lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
}

function toFetchPageError(error: unknown): FetchPageError {
  if (error instanceof FetchPageError) return error;
  if (error instanceof Error) {
    const code = 'code' in error ? error.code : undefined;
    if (code === BLOCKED_ADDRESS_CODE) return new FetchPageError('Esse endereço não é permitido.', 400);
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return new FetchPageError('O site demorou demais para responder.', 504);
    }
    if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') {
      return new FetchPageError('Não foi possível encontrar esse site.', 502);
    }
    if (typeof code === 'string' && (code.startsWith('ECONN') || code.startsWith('ERR_TLS') || code.includes('CERT'))) {
      return new FetchPageError('Não foi possível conectar ao site.', 502);
    }
  }
  console.error('Unexpected error fetching page:', error);
  return new FetchPageError('Erro inesperado ao buscar a página.', 500);
}
