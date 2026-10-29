import { describe, expect, it } from 'vitest';
import { filterRows } from './filter';
import { countWords } from './wordFrequency';

const rows = countWords('não nação canção casa Casa caso');

describe('filterRows', () => {
  it('returns all rows for an empty or blank query', () => {
    expect(filterRows(rows, '')).toBe(rows);
    expect(filterRows(rows, '   ')).toBe(rows);
  });

  it('matches substrings, ignoring case', () => {
    expect(filterRows(rows, 'CAS').map(({ word }) => word)).toEqual(['casa', 'caso']);
  });

  it('ignores accents in both query and words', () => {
    expect(filterRows(rows, 'cao').map(({ word }) => word)).toEqual(['canção', 'nação']);
    expect(filterRows(rows, 'nã').map(({ word }) => word)).toEqual(['nação', 'não']);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterRows(rows, 'xyz')).toEqual([]);
  });
});
