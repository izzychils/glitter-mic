/** Difficulty presets change the scoring tolerances, never the formula shape. */
export type Difficulty = "easy" | "normal" | "pro";

/** One parsed LRC line: seconds + raw text. */
export interface LrcLine {
  t: number;
  text: string;
}

/** A single lyric word with interpolated timing (line-level LRC -> word level). */
export interface Word {
  text: string;
  /** Normalized form used for fuzzy comparison. */
  norm: string;
  start: number;
  end: number;
}

/** A lyric line with its scoring window and weight (number of words). */
export interface Line {
  index: number;
  start: number;
  end: number;
  words: Word[];
  /** Line weight: more words => more score contribution. */
  weight: number;
  /** Star Power line: worth 1.25x in the final score. */
  star?: boolean;
}

/** One analysis frame from the client or server pitch tracker (~50 Hz). */
export interface Frame {
  /** Audio-context time in seconds. */
  t: number;
  /** Fundamental frequency in Hz, or null when unvoiced/unclear. */
  f0: number | null;
  /** Pitch confidence 0..1. */
  clarity: number;
  /** Voice activity flag (rms + clarity + range gate). */
  voiced: boolean;
  /** Optional RMS energy, kept for anti-bleed checks. */
  rms?: number;
}

/** A reference (original vocal) pitch point at ~50 Hz. */
export interface RefPoint {
  t: number;
  f0: number | null;
}

export type WordStatus = "correct" | "close" | "wrong" | "missed";

export interface WordResult {
  expected: Word;
  /** Raw word heard by STT, if any. */
  heard?: string;
  status: WordStatus;
}

export interface AlignmentResult {
  results: WordResult[];
  /** Words heard that were not in the expected line (penalized). */
  inserted: number;
}

/** Whether pitch was judged against a reference contour or self-consistency. */
export type PitchMode = "reference" | "stability";

/** Per-line outcome. Components are 0..1. */
export interface LineScore {
  index: number;
  weight: number;
  star?: boolean;
  lyric: number;
  timing: number;
  pitch: number;
  /** Optional Voice Match similarity, 0..1. */
  voice?: number;
  pitchMode: PitchMode;
  /** True when voice activity was detected in the line window. */
  sung: boolean;
  alignment?: AlignmentResult;
}

export interface ScoreConfig {
  /** Lyric accuracy weight. */
  wL: number;
  /** Pitch accuracy weight. */
  wP: number;
  /** Timing weight. */
  wT: number;
  /** Optional Voice Match weight. */
  wV: number;
}

export interface ScoreBreakdown {
  lyric: number;
  pitch: number;
  timing: number;
  voice: number;
}

export type Grade = "S" | "A" | "B" | "C" | "D";

export interface ScoreResult {
  /** 0..1000 */
  total: number;
  grade: Grade;
  breakdown: ScoreBreakdown;
  /** Fraction of lines with detected singing (0..1). */
  participation: number;
  /** Eligible for leaderboards (enough participation). */
  ranked: boolean;
  /** False when any line used stability pitch, so it cannot compare to reference runs. */
  rankedPitch: boolean;
  pitchMode: PitchMode | "mixed";
  scoringVersion: string;
}
