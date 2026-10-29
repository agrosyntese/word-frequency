import { describe, expect, it } from 'vitest';
import { toCsv } from './csv';

describe('toCsv', () => {
  it('writes a BOM, a header and one line per word', () => {
    const csv = toCsv([
      { word: 'não', count: 3 },
      { word: "don't", count: 1 },
    ]);
    expect(csv).toBe('\uFEFFpalavra;frequencia\r\nnão;3\r\ndon\'t;1\r\n');
  });

  it('writes only the header for no rows', () => {
    expect(toCsv([])).toBe('\uFEFFpalavra;frequencia\r\n');
  });

  it('quotes cells containing separators or quotes', () => {
    expect(toCsv([{ word: 'a;"b"', count: 1 }])).toContain('"a;""b""";1');
  });
});
