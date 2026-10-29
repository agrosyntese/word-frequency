import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { fetchPage, MAX_BODY_BYTES, MAX_TEXT_CHARS, parseContentType, truncateAtWord } from './fetchPage';
import type { UrlPolicy } from './urlPolicy';

// The real policy blocks localhost, so tests against a local server use a permissive one.
let base = '';
let policy: UrlPolicy;

const server = http.createServer((req, res) => {
  const send = (type: string, body: string | Buffer, status = 200) => {
    res.writeHead(status, { 'Content-Type': type });
    res.end(body);
  };
  switch (req.url) {
    case '/page':
      return send('text/html; charset=utf-8', '<title>Teste</title><p>sol lua sol</p>');
    case '/plain':
      return send('text/plain; charset=utf-8', 'texto puro');
    case '/redirect':
      res.writeHead(302, { Location: '/page' });
      return res.end();
    case '/loop':
      res.writeHead(302, { Location: '/loop' });
      return res.end();
    case '/to-metadata':
      res.writeHead(302, { Location: 'http://169.254.169.254/latest/meta-data/' });
      return res.end();
    case '/missing':
      return send('text/html', 'not found', 404);
    case '/image':
      return send('image/png', Buffer.from([0x89, 0x50]));
    case '/huge':
      return send('text/plain', Buffer.alloc(MAX_BODY_BYTES + 1, 'a'));
    case '/long-text':
      return send('text/plain', 'palavra '.repeat(MAX_TEXT_CHARS / 4));
    case '/empty':
      return send('text/html', '<script>only()</script>');
    case '/slow':
      return; // never responds
    default:
      return send('text/plain', '', 500);
  }
});

beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  base = `http://127.0.0.1:${port}`;
  policy = {
    isBlockedAddress: (address) => address.startsWith('169.254.'),
    allowedPorts: ['', String(port)],
  };
});

afterAll(() => {
  server.closeAllConnections();
  server.close();
});

describe('fetchPage', () => {
  it('returns title and text of an HTML page', async () => {
    expect(await fetchPage(`${base}/page`, policy)).toEqual({
      url: `${base}/page`,
      title: 'Teste',
      text: 'sol lua sol',
      truncated: false,
    });
  });

  it('accepts plain text', async () => {
    expect((await fetchPage(`${base}/plain`, policy)).text).toBe('texto puro');
  });

  it('follows redirects and reports the final URL', async () => {
    expect((await fetchPage(`${base}/redirect`, policy)).url).toBe(`${base}/page`);
  });

  it('stops redirect loops', async () => {
    await expect(fetchPage(`${base}/loop`, policy)).rejects.toThrow('redirecionou vezes demais');
  });

  it('validates every redirect target', async () => {
    await expect(fetchPage(`${base}/to-metadata`, policy)).rejects.toThrow('não é permitido');
  });

  it('reports HTTP errors', async () => {
    await expect(fetchPage(`${base}/missing`, policy)).rejects.toThrow('erro 404');
  });

  it('rejects non-text content', async () => {
    await expect(fetchPage(`${base}/image`, policy)).rejects.toMatchObject({ status: 415 });
  });

  it('rejects bodies over the size limit', async () => {
    await expect(fetchPage(`${base}/huge`, policy)).rejects.toMatchObject({ status: 413 });
  });

  it('truncates very long text at a word boundary', async () => {
    const page = await fetchPage(`${base}/long-text`, policy);
    expect(page.truncated).toBe(true);
    expect(page.text.length).toBeLessThanOrEqual(MAX_TEXT_CHARS);
    expect(page.text.endsWith('palavra')).toBe(true);
  });

  it('rejects pages without text', async () => {
    await expect(fetchPage(`${base}/empty`, policy)).rejects.toMatchObject({ status: 422 });
  });

  it('times out slow sites', async () => {
    await expect(fetchPage(`${base}/slow`, policy)).rejects.toMatchObject({ status: 504 });
  }, 10_000);

  it('blocks localhost with the default policy', async () => {
    await expect(fetchPage(`${base}/page`)).rejects.toThrow('não é permitido');
  });
});

describe('parseContentType', () => {
  it('splits media type and charset', () => {
    expect(parseContentType('Text/HTML; Charset="ISO-8859-1"')).toEqual({ mediaType: 'text/html', charset: 'ISO-8859-1' });
    expect(parseContentType(undefined)).toEqual({ mediaType: '', charset: undefined });
  });
});

describe('truncateAtWord', () => {
  it('keeps short text and cuts long text at the last space', () => {
    expect(truncateAtWord('curto', 10)).toBe('curto');
    expect(truncateAtWord('uma frase longa', 10)).toBe('uma frase');
    expect(truncateAtWord('palavrasemespaco', 5)).toBe('palav');
  });
});
