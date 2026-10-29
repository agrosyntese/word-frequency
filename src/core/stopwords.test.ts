import { describe, expect, it } from 'vitest';
import { removeStopwords, STOPWORDS } from './stopwords';
import { countWords } from './wordFrequency';

describe('removeStopwords', () => {
  it('removes common Portuguese words', () => {
    const rows = removeStopwords(countWords('O gato e o rato não são amigos da casa'));
    expect(rows.map(({ word }) => word)).toEqual(['amigos', 'casa', 'gato', 'rato']);
  });

  it('removes common English words, including contractions', () => {
    const rows = removeStopwords(countWords("The cat doesn’t like the dog and it's fine"));
    expect(rows.map(({ word }) => word)).toEqual(['cat', 'dog', 'fine', 'like']);
  });

  it('keeps counts and order of the remaining words', () => {
    expect(removeStopwords(countWords('de ideias ideias de mundo'))).toEqual([
      { word: 'ideias', count: 2 },
      { word: 'mundo', count: 1 },
    ]);
  });

  it('returns an empty list when every word is common', () => {
    expect(removeStopwords(countWords('o a de que'))).toEqual([]);
  });

  it('stores words in the same normalized form countWords produces', () => {
    for (const word of STOPWORDS) {
      expect(countWords(word).map((row) => row.word)).toEqual([word]);
    }
  });
});
