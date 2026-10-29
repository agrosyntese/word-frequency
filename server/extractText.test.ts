import { describe, expect, it } from 'vitest';
import { decodePlainText, extractFromHtml } from './extractText';

const html = (body: string, head = '<title>Página</title>') =>
  Buffer.from(`<!doctype html><html><head><meta charset="utf-8">${head}</head><body>${body}</body></html>`);

describe('extractFromHtml', () => {
  it('returns the title and the visible text', () => {
    expect(extractFromHtml(html('<p>Olá, mundo!</p>'))).toEqual({ title: 'Página', text: 'Olá, mundo!' });
  });

  it('drops scripts, styles, navigation and page chrome', () => {
    const body = `<header>Menu topo</header><nav>Início Sobre</nav><p>Conteúdo</p>
      <script>var codigo = 1;</script><style>p { color: red }</style><aside>Anúncio</aside>
      <footer>Rodapé</footer><form><button>Enviar</button></form><div hidden>Oculto</div>`;
    expect(extractFromHtml(html(body)).text).toBe('Conteúdo');
  });

  it('separates words across block elements but not inline ones', () => {
    const body = '<h1>Título</h1><p>um<br>dois</p><ul><li>três</li><li>quatro</li></ul><p>pa<b>la</b>vra</p>';
    expect(extractFromHtml(html(body)).text).toBe('Título um dois três quatro palavra');
  });

  it('prefers <main> content when present', () => {
    expect(extractFromHtml(html('<div>Lateral</div><main><p>Principal</p></main>')).text).toBe('Principal');
  });

  it('uses a single <article> when there is no <main>', () => {
    expect(extractFromHtml(html('<div>Lateral</div><article>Artigo</article>')).text).toBe('Artigo');
  });

  it('decodes HTML entities', () => {
    expect(extractFromHtml(html('<p>caf&eacute; &amp; p&atilde;o &#8212; ok</p>')).text).toBe('café & pão — ok');
  });

  it('decodes legacy charsets from the HTTP header or meta tag', () => {
    const latin1 = Buffer.from('<html><head><title>Ação</title></head><body><p>coração</p></body></html>', 'latin1');
    expect(extractFromHtml(latin1, 'iso-8859-1')).toEqual({ title: 'Ação', text: 'coração' });

    const withMeta = Buffer.concat([
      Buffer.from('<html><head><meta charset="windows-1252"></head><body><p>'),
      Buffer.from('não', 'latin1'),
      Buffer.from('</p></body></html>'),
    ]);
    expect(extractFromHtml(withMeta).text).toBe('não');
  });

  it('returns empty text for pages without prose', () => {
    expect(extractFromHtml(html('<script>x()</script>')).text).toBe('');
  });
});

describe('decodePlainText', () => {
  it('decodes with the given charset and normalizes whitespace', () => {
    expect(decodePlainText(Buffer.from('ação\n\n  pão', 'latin1'), 'latin1')).toBe('ação pão');
  });

  it('falls back to UTF-8 for unknown charsets', () => {
    expect(decodePlainText(Buffer.from('olá'), 'not-a-charset')).toBe('olá');
  });
});
