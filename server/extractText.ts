import { loadBuffer } from 'cheerio';

export type ExtractedText = { title: string; text: string };

// Content that is never prose: code, media, navigation and page chrome.
const REMOVED_SELECTOR = [
  'script', 'style', 'noscript', 'template', 'svg', 'canvas', 'iframe', 'object',
  'nav', 'header', 'footer', 'aside', 'form', 'button', 'select', '[aria-hidden="true"]', '[hidden]',
].join(', ');

// Elements that separate words visually; inline ones (b, a, span…) may sit inside a word.
const BLOCK_ELEMENTS = new Set([
  'address', 'article', 'blockquote', 'br', 'dd', 'div', 'dl', 'dt', 'figcaption', 'figure', 'h1', 'h2',
  'h3', 'h4', 'h5', 'h6', 'hr', 'li', 'main', 'ol', 'p', 'pre', 'section', 'table', 'td', 'th', 'tr', 'ul',
]);

type TextNode = { type: string; data?: string; name?: string; children?: TextNode[] };

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function extractFromHtml(html: Buffer, charset?: string): ExtractedText {
  const $ = loadBuffer(html, { encoding: { transportLayerEncodingLabel: charset } });
  const title = normalizeWhitespace($('title').first().text());

  $(REMOVED_SELECTOR).remove();
  const main = $('main').first();
  const articles = $('article');
  const root = main.length > 0 ? main : articles.length === 1 ? articles : $('body');

  const parts: string[] = [];
  collectText(root.get() as TextNode[], parts);
  return { title, text: normalizeWhitespace(parts.join('')) };
}

function collectText(nodes: TextNode[], parts: string[]): void {
  for (const node of nodes) {
    if (node.type === 'text') {
      parts.push(node.data ?? '');
      continue;
    }
    const isBlock = node.name !== undefined && BLOCK_ELEMENTS.has(node.name);
    if (isBlock) parts.push(' ');
    if (node.children) collectText(node.children, parts);
    if (isBlock) parts.push(' ');
  }
}

export function decodePlainText(body: Buffer, charset?: string): string {
  let decoder: TextDecoder;
  try {
    decoder = new TextDecoder(charset ?? 'utf-8');
  } catch {
    decoder = new TextDecoder('utf-8');
  }
  return normalizeWhitespace(decoder.decode(body));
}
