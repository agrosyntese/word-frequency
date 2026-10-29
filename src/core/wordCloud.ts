// Square-root scale: area grows with frequency, so one dominant word doesn't dwarf the rest.
export function scaleFontSizes(counts: number[], minSize: number, maxSize: number): number[] {
  if (counts.length === 0) return [];

  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  if (minCount === maxCount) {
    return counts.map(() => Math.round((minSize + maxSize) / 2));
  }

  const minRoot = Math.sqrt(minCount);
  const rootRange = Math.sqrt(maxCount) - minRoot;
  return counts.map((count) => {
    const ratio = (Math.sqrt(count) - minRoot) / rootRange;
    return Math.round(minSize + ratio * (maxSize - minSize));
  });
}
