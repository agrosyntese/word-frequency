import { describe, expect, it } from 'vitest';
import { scaleFontSizes } from './wordCloud';

describe('scaleFontSizes', () => {
  it('maps the highest count to maxSize and the lowest to minSize', () => {
    expect(scaleFontSizes([9, 4, 1], 10, 40)).toEqual([40, 25, 10]);
  });

  it('gives equal counts the same size', () => {
    const sizes = scaleFontSizes([5, 3, 3, 1], 12, 60);
    expect(sizes[1]).toBe(sizes[2]);
  });

  it('uses the middle size when all counts are equal', () => {
    expect(scaleFontSizes([2, 2, 2], 10, 30)).toEqual([20, 20, 20]);
  });

  it('returns an empty list for no counts', () => {
    expect(scaleFontSizes([], 10, 30)).toEqual([]);
  });
});
