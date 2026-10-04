import type { AlignmentResult, Word, WordResult, WordStatus } from "./types.js";
import { charSimilarity, normalize } from "./text.js";

/** Character-similarity thresholds that map an aligned pair to a status. */
export const WORD_STATUS_THRESHOLDS = {
  correct: 0.9,
  close: 0.7,
} as const;

/** Credit per aligned word status (guide Section 8.3). */
export const WORD_CREDIT: Record<WordStatus, number> = {
  correct: 1,
  close: 0.8,
  wrong: 0.2,
  missed: 0,
};

/** Max fraction of a line's score that inserted extra words can remove. */
export const MAX_INSERTION_PENALTY = 0.25;

/**
 * Order-aware fuzzy alignment between expected lyric words and STT output.
 *
 * Dynamic programming over words: skip expected (missed), skip heard (inserted),
 * or pair them with a substitution cost of (1 - character similarity). Ties prefer
 * pairing (diagonal) so a sung word is never counted as missed when plausible.
 */
export function alignLine(expected: Word[], heard: string[]): AlignmentResult {
  const n = expected.length;
  const m = heard.length;
  const heardNorm = heard.map((word) => normalize(word));
  const substitutionCost = (i: number, j: number) => 1 - charSimilarity(expected[i].norm, heardNorm[j]);

  // dp[i][j] = cheapest alignment of expected[0..i) against heard[0..j)
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = 1; i <= n; i++) dp[i][0] = i; // all expected words missed
  for (let j = 1; j <= m; j++) dp[0][j] = j; // all heard words inserted

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // word not heard
        dp[i][j - 1] + 1, // extra word heard
        dp[i - 1][j - 1] + substitutionCost(i - 1, j - 1) // paired
      );
    }
  }

  const results: WordResult[] = [];
  let inserted = 0;
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    const diagonal = i > 0 && j > 0 ? dp[i - 1][j - 1] + substitutionCost(i - 1, j - 1) : Number.POSITIVE_INFINITY;
    if (i > 0 && j > 0 && Math.abs(dp[i][j] - diagonal) < 1e-9) {
      const similarity = charSimilarity(expected[i - 1].norm, heardNorm[j - 1]);
      const status: WordStatus =
        similarity >= WORD_STATUS_THRESHOLDS.correct
          ? "correct"
          : similarity >= WORD_STATUS_THRESHOLDS.close
            ? "close"
            : "wrong";
      results.unshift({ expected: expected[i - 1], heard: heard[j - 1], status });
      i--;
      j--;
    } else if (i > 0 && Math.abs(dp[i][j] - (dp[i - 1][j] + 1)) < 1e-9) {
      results.unshift({ expected: expected[i - 1], status: "missed" });
      i--;
    } else {
      inserted++;
      j--;
    }
  }

  return { results, inserted };
}

/**
 * Line lyric accuracy in 0..1 with a capped penalty for extra inserted words.
 */
export function lyricLineScore(alignment: AlignmentResult): number {
  const base =
    alignment.results.reduce((sum, word) => sum + WORD_CREDIT[word.status], 0) /
    Math.max(1, alignment.results.length);
  const penalty = Math.min(
    MAX_INSERTION_PENALTY,
    (alignment.inserted / Math.max(1, alignment.results.length)) * MAX_INSERTION_PENALTY
  );
  return Math.max(0, base - penalty);
}
