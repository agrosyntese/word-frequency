import { describe, expect, it } from 'vitest';
import { countWords, extractWords } from './wordFrequency';

describe('extractWords', () => {
  it('ignores punctuation', () => {
    expect(extractWords('Olá, mundo! Tudo bem?')).toEqual(['olá', 'mundo', 'tudo', 'bem']);
  });

  it('keeps accents, inner hyphens and apostrophes', () => {
    expect(extractWords("Não, o guarda-chuva don't")).toEqual(['não', 'o', 'guarda-chuva', "don't"]);
  });

  it('normalizes curly apostrophes', () => {
    expect(extractWords('don’t')).toEqual(["don't"]);
  });

  it('drops leading and trailing hyphens or quotes', () => {
    expect(extractWords("-teste- 'aspas'")).toEqual(['teste', 'aspas']);
  });

  it('counts numbers as words', () => {
    expect(extractWords('em 2024 e 2025')).toEqual(['em', '2024', 'e', '2025']);
  });

  it('returns an empty list for blank text', () => {
    expect(extractWords('')).toEqual([]);
    expect(extractWords('   \n\t ')).toEqual([]);
    expect(extractWords('!!! ...')).toEqual([]);
  });
});

describe('countWords', () => {
  it('is case-insensitive', () => {
    expect(countWords('Casa casa CASA')).toEqual([{ word: 'casa', count: 3 }]);
  });

  it('sorts by descending frequency', () => {
    expect(countWords('b a b c b a')).toEqual([
      { word: 'b', count: 3 },
      { word: 'a', count: 2 },
      { word: 'c', count: 1 },
    ]);
  });

  it('breaks ties alphabetically', () => {
    expect(countWords('pera uva abacate')).toEqual([
      { word: 'abacate', count: 1 },
      { word: 'pera', count: 1 },
      { word: 'uva', count: 1 },
    ]);
  });

  it('handles line breaks and multiple spaces', () => {
    expect(countWords('um\n\num   um\tdois')).toEqual([
      { word: 'um', count: 3 },
      { word: 'dois', count: 1 },
    ]);
  });

  it('returns an empty list for empty text', () => {
    expect(countWords('')).toEqual([]);
  });
});
