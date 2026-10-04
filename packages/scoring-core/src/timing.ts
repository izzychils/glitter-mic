import type { Difficulty, Frame, Line } from "./types.js";
import { clamp } from "./text.js";

/**
 * Onset tolerances in seconds:
 * - `onsetFull`: this much error still scores 1.0
 * - `onsetZero`: this much error scores 0.0
 */
export interface OnsetTolerance {
  onsetFull: number;
  onsetZero: number;
}

export const TIMING_TOL: Record<Difficulty, OnsetTolerance> = {
  easy: { onsetFull: 0.45, onsetZero: 1.3 },
  normal: { onsetFull: 0.3, onsetZero: 1.0 },
  pro: { onsetFull: 0.2, onsetZero: 0.8 },
};

/**
 * Timing / sync score for one line, 0..1. Does not depend on STT at all:
 * - 60%: voiced coverage inside the line window
 * - 40%: onset accuracy (how close the first voiced frame is to the line start)
 *
 * Frame times are shifted by the device calibration `latency` before comparing,
 * so a Bluetooth headset with 200 ms of delay is not punished.
 */
export function timingLineScore(line: Line, frames: Frame[], latency: number, difficulty: Difficulty): number {
  const tolerance = TIMING_TOL[difficulty];
  const inWindow = frames.filter((frame) => {
    const corrected = frame.t - latency;
    return corrected >= line.start && corrected <= line.end;
  });
  if (inWindow.length === 0) return 0;

  const coverage = inWindow.filter((frame) => frame.voiced).length / inWindow.length;
  const firstVoiced = inWindow.find((frame) => frame.voiced);
  const onsetError = firstVoiced ? Math.abs(firstVoiced.t - latency - line.start) : tolerance.onsetZero;
  const onset =
    1 - clamp((onsetError - tolerance.onsetFull) / (tolerance.onsetZero - tolerance.onsetFull), 0, 1);

  return 0.6 * coverage + 0.4 * onset;
}
