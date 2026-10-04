import type { Difficulty, Frame, Line, RefPoint } from "./types.js";
import { clamp, median, mean } from "./text.js";

/**
 * Pitch tolerances in cents:
 * - `fullCents`: error this small still scores 1.0
 * - `zeroCents`: error this large scores 0.0
 */
export interface PitchTolerance {
  fullCents: number;
  zeroCents: number;
}

export const PITCH_TOL: Record<Difficulty, PitchTolerance> = {
  easy: { fullCents: 60, zeroCents: 400 },
  normal: { fullCents: 50, zeroCents: 300 },
  pro: { fullCents: 35, zeroCents: 200 },
};

/** Minimum pitch clarity for a frame to count as a real vocal pitch. */
export const DEFAULT_CLARITY_THRESHOLD = 0.85;

/** Cents difference between a detected frequency and a reference frequency. */
export function hzToCents(frequency: number, reference: number): number {
  return 1200 * Math.log2(frequency / reference);
}

/** Map any cents value into [-600, 600) so octave differences vanish. */
export function foldOctave(cents: number): number {
  return ((((cents + 600) % 1200) + 1200) % 1200) - 600;
}

/** Nearest analysis frame to time `t`, or null when the gap is too large. */
export function nearestFrame(frames: Frame[], t: number, tolerance = 0.05): Frame | null {
  let best: Frame | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const frame of frames) {
    const distance = Math.abs(frame.t - t);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = frame;
    }
  }
  return best && bestDistance <= tolerance ? best : null;
}

export interface PitchLineOptions {
  /** Remove the singer's constant key offset (median error) before scoring. */
  keyInvariant: boolean;
  difficulty: Difficulty;
  /** Device calibration latency in seconds, added to reference time before lookup. */
  latency: number;
  /** Override the clarity gate (default 0.85). */
  clarityThreshold?: number;
}

/**
 * Reference-based pitch accuracy for one line, 0..1.
 *
 * Only reference moments where the original vocal is voiced are judged. The singer's
 * error is measured in cents, octave-folded (a man an octave lower is still correct),
 * and optionally key-shifted by the median error in "key-invariant" mode, so changing
 * the key does not tank the score. Silent or unclear frames score 0 for that moment.
 */
export function pitchLineScore(frames: Frame[], refContour: RefPoint[], options: PitchLineOptions): number {
  const { fullCents, zeroCents } = PITCH_TOL[options.difficulty];
  const clarityMin = options.clarityThreshold ?? DEFAULT_CLARITY_THRESHOLD;

  // NaN marks "reference voiced but the singer was silent/unclear".
  const centsErrors: number[] = [];
  for (const reference of refContour) {
    if (!reference.f0) continue;
    const frame = nearestFrame(frames, reference.t + options.latency);
    if (!frame || !frame.f0 || frame.clarity < clarityMin) {
      centsErrors.push(Number.NaN);
      continue;
    }
    centsErrors.push(foldOctave(hzToCents(frame.f0, reference.f0)));
  }
  if (centsErrors.length === 0) return 0;

  const valid = centsErrors.filter((value) => Number.isFinite(value));
  const keyShift = options.keyInvariant && valid.length > 0 ? median(valid) : 0;

  const scores = centsErrors.map((error) => {
    if (!Number.isFinite(error)) return 0;
    const corrected = Math.abs(foldOctave(error - keyShift));
    return 1 - clamp((corrected - fullCents) / (zeroCents - fullCents), 0, 1);
  });

  return mean(scores);
}

/** Jitter tolerances in cents for the no-reference fallback: <=35 steady, >=120 wobbling. */
export const STABILITY_TOLERANCE = { steadyCents: 35, unstableCents: 120 } as const;

/**
 * Fallback pitch score when no reference contour exists: reward steady held notes,
 * penalize erratic wobble and jumps, scaled by how much of the line was voiced.
 * Results from this mode are flagged "stability" and are NOT ranked against
 * reference-based scores (guide Section 8.5).
 */
export function stabilityPitchScore(frames: Frame[], line: Line, latency: number): number {
  const inWindow = frames.filter((frame) => {
    const corrected = frame.t - latency;
    return corrected >= line.start && corrected <= line.end;
  });
  if (inWindow.length === 0) return 0;

  const voiced = inWindow.filter((frame): frame is Frame & { f0: number } => frame.voiced && frame.f0 !== null);
  const coverage = voiced.length / inWindow.length;
  if (voiced.length < 2) return 0;

  const jumps: number[] = [];
  for (let i = 1; i < voiced.length; i++) {
    jumps.push(Math.abs(hzToCents(voiced[i].f0, voiced[i - 1].f0)));
  }
  const jitter = median(jumps);
  const steadiness =
    1 -
    clamp(
      (jitter - STABILITY_TOLERANCE.steadyCents) /
        (STABILITY_TOLERANCE.unstableCents - STABILITY_TOLERANCE.steadyCents),
      0,
      1
    );

  return coverage * steadiness;
}
