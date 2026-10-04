import type {
  Difficulty,
  Frame,
  Grade,
  Line,
  LineScore,
  PitchMode,
  RefPoint,
  ScoreBreakdown,
  ScoreConfig,
  ScoreResult,
} from "./types.js";
import { alignLine, lyricLineScore } from "./lyrics.js";
import { pitchLineScore, stabilityPitchScore } from "./pitch.js";
import { timingLineScore } from "./timing.js";

/** Bump when formulas or tolerances change so old sessions stay explainable. */
export const SCORING_VERSION = "1.0.0";

/** Ranked defaults: Lyrics 40 / Pitch 35 / Timing 25 (guide Section 8.8). */
export const DEFAULT_SCORE_CONFIG: ScoreConfig = { wL: 0.4, wP: 0.35, wT: 0.25, wV: 0 };

/** Optional Voice Match room setting: 10% voice, the others scaled by 0.9. */
export const VOICE_MATCH_SCORE_CONFIG: ScoreConfig = { wL: 0.36, wP: 0.315, wT: 0.225, wV: 0.1 };

/** Minimum fraction of lines with detected singing for a ranked result. */
export const RANKED_MIN_PARTICIPATION = 0.6;

/** Star Power lines are worth this much more in the final score. */
export const STAR_MULTIPLIER = 1.25;

export function grade(total: number): Grade {
  if (total >= 950) return "S";
  if (total >= 850) return "A";
  if (total >= 700) return "B";
  if (total >= 500) return "C";
  return "D";
}

export interface ScoreLineInput {
  line: Line;
  /** STT words heard during the line window; omit when STT is unavailable. */
  heardWords?: string[];
  /** Singer frames at ~50 Hz. */
  frames: Frame[];
  /**
   * Reference pitch contour at ~50 Hz. May span the whole song: only points inside
   * the line window are used, so one contour can be passed for every line.
   * Omit (or pass meaninglessly empty) to use stability pitch mode.
   */
  refContour?: RefPoint[];
  /** Device calibration latency in seconds. */
  latency?: number;
  difficulty?: Difficulty;
  /** Defaults to key-invariant (true), per the build guide. */
  keyInvariant?: boolean;
  /** Optional Voice Match similarity 0..1. */
  voice?: number;
}

/**
 * Score one line end to end: fuzzy lyric alignment + voice-activity timing + pitch.
 *
 * When no reference contour is available, pitch falls back to stability scoring and
 * the line is marked `pitchMode: "stability"` so it never blends into ranked results.
 */
export function scoreLine(input: ScoreLineInput): LineScore {
  const { line, frames, heardWords, refContour } = input;
  const latency = input.latency ?? 0;
  const difficulty = input.difficulty ?? "normal";
  const keyInvariant = input.keyInvariant ?? true;

  const alignment = heardWords ? alignLine(line.words, heardWords) : undefined;
  const lyric = alignment ? lyricLineScore(alignment) : 0;
  const timing = timingLineScore(line, frames, latency, difficulty);

  // Scope the reference to this line's window: judging a line against the whole
  // song's contour would let one sung passage raise every other line's pitch score.
  const lineRef = (refContour ?? []).filter((point) => point.t >= line.start && point.t <= line.end);
  const hasReference = lineRef.some((point) => point.f0 !== null);
  const pitch = hasReference
    ? pitchLineScore(frames, lineRef, { keyInvariant, difficulty, latency })
    : stabilityPitchScore(frames, line, latency);

  return {
    index: line.index,
    weight: line.weight,
    star: line.star,
    lyric,
    timing,
    pitch,
    voice: input.voice,
    pitchMode: hasReference ? "reference" : "stability",
    sung: timing > 0,
    alignment,
  };
}

/** Fraction of lines where singing was detected (0..1). */
export function participationRate(lines: LineScore[]): number {
  if (lines.length === 0) return 0;
  return lines.filter((line) => line.sung).length / lines.length;
}

/**
 * Song score 0..1000:
 *
 *   songScore = 1000 * sum(line_i * weight_i * star_i) / sum(weight_i * star_i)
 *
 * `weight_i` is the line's word count and `star_i` is 1.25 for Star Power lines.
 * Skipped lines must be passed in as zero-scored lines: the denominator is the
 * whole song, so stopping early can never beat finishing.
 */
export function finalScore(lines: LineScore[], config: ScoreConfig = DEFAULT_SCORE_CONFIG): ScoreResult {
  let numerator = 0;
  let denominator = 0;
  let lyricSum = 0;
  let pitchSum = 0;
  let timingSum = 0;
  let voiceSum = 0;

  for (const line of lines) {
    const weight = line.weight * (line.star ? STAR_MULTIPLIER : 1);
    const lineScore =
      config.wL * line.lyric + config.wP * line.pitch + config.wT * line.timing + config.wV * (line.voice ?? 0);
    numerator += lineScore * weight;
    denominator += weight;
    lyricSum += line.lyric * weight;
    pitchSum += line.pitch * weight;
    timingSum += line.timing * weight;
    voiceSum += (line.voice ?? 0) * weight;
  }

  const total = denominator > 0 ? Math.round((numerator / denominator) * 1000) : 0;
  const breakdown: ScoreBreakdown =
    denominator > 0
      ? {
          lyric: lyricSum / denominator,
          pitch: pitchSum / denominator,
          timing: timingSum / denominator,
          voice: voiceSum / denominator,
        }
      : { lyric: 0, pitch: 0, timing: 0, voice: 0 };

  const participation = participationRate(lines);
  const modes = new Set(lines.map((line) => line.pitchMode));
  const pitchMode: PitchMode | "mixed" = modes.size > 1 ? "mixed" : modes.has("stability") ? "stability" : "reference";

  return {
    total,
    grade: grade(total),
    breakdown,
    participation,
    ranked: lines.length > 0 && participation >= RANKED_MIN_PARTICIPATION,
    rankedPitch: !modes.has("stability"),
    pitchMode,
    scoringVersion: SCORING_VERSION,
  };
}

export interface RankedEntry {
  lyric: number;
  pitch: number;
  timing: number;
  submittedAt: number;
}

/**
 * Tie-breakers in order (guide Section 8.9): higher lyric accuracy, then pitch,
 * then timing, then the earlier submission. Use with `array.sort(compareForRanking)`.
 */
export function compareForRanking(a: RankedEntry, b: RankedEntry): number {
  if (b.lyric !== a.lyric) return b.lyric - a.lyric;
  if (b.pitch !== a.pitch) return b.pitch - a.pitch;
  if (b.timing !== a.timing) return b.timing - a.timing;
  return a.submittedAt - b.submittedAt;
}
