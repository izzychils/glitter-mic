/** Small numeric + text helpers shared across the scoring modules. */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Normalize a lyric/STT word for fuzzy comparison:
 * lowercase, Unicode NFKD (strips accented forms), keep letters, numbers and apostrophes.
 */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}']/gu, "");
}

/** Classic Levenshtein edit distance (insert/delete/substitute, all cost 1). */
export function levenshtein(a: string, b: string): number {
  const n = a.length;
  const m = b.length;
  if (n === 0) return m;
  if (m === 0) return n;

  let previous = new Array<number>(m + 1);
  let current = new Array<number>(m + 1);
  for (let j = 0; j <= m; j++) previous[j] = j;

  for (let i = 1; i <= n; i++) {
    current[0] = i;
    for (let j = 1; j <= m; j++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1, // delete from a
        current[j - 1] + 1, // insert into a
        previous[j - 1] + substitutionCost // substitute
      );
    }
    [previous, current] = [current, previous];
  }

  return previous[m];
}

/** 1 = identical strings, 0 = no characters in common (proportional to edit distance). */
export function charSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const distance = levenshtein(a, b);
  return 1 - distance / Math.max(a.length, b.length, 1);
}
