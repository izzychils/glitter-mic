import type { Frame, Line, LrcLine, RefPoint } from "../src/index.js";
import { buildTimeline, finalScore, scoreLine } from "../src/index.js";

export const FRAME_RATE = 50;
export const SONG_DURATION = 12;

/** Four short lines over 12 seconds. */
export function makeLrc(): LrcLine[] {
  return [
    { t: 0, text: "hello world again" },
    { t: 3, text: "sing it loud now" },
    { t: 6, text: "feel the rhythm" },
    { t: 9, text: "one more time" },
  ];
}

export function makeLines(): Line[] {
  return buildTimeline(makeLrc(), SONG_DURATION);
}

export interface SingerOptions {
  /** Constant transposition in cents. */
  cents?: number;
  /** Octave shift (-1 = one octave lower). */
  octave?: number;
  /** False = the microphone hears nothing. */
  voiced?: boolean;
  clarity?: number;
  duration?: number;
  /** Random per-frame wobble amplitude in cents (needs `random`). */
  wobbleCents?: number;
  random?: () => number;
}

/** Synthetic singer frames at 50 Hz, matching what the web/app pitch tracker emits. */
export function singerFrames(options: SingerOptions = {}): Frame[] {
  const duration = options.duration ?? SONG_DURATION;
  const voiced = options.voiced ?? true;
  const frames: Frame[] = [];
  const count = Math.round(duration * FRAME_RATE);

  for (let i = 0; i < count; i++) {
    const t = i / FRAME_RATE;
    let f0 = 220;
    if (options.cents) f0 *= 2 ** (options.cents / 1200);
    if (options.octave) f0 *= 2 ** options.octave;
    if (options.wobbleCents && options.random) {
      f0 *= 2 ** (((options.random() * 2 - 1) * options.wobbleCents) / 1200);
    }
    frames.push({
      t,
      f0: voiced ? f0 : null,
      clarity: options.clarity ?? 0.9,
      voiced,
      rms: voiced ? 0.1 : 0.001,
    });
  }
  return frames;
}

/** Reference vocal contour: steady 220 Hz for the whole song. */
export function referenceContour(duration = SONG_DURATION): RefPoint[] {
  const count = Math.round(duration * FRAME_RATE);
  return Array.from({ length: count }, (_, i) => ({ t: i / FRAME_RATE, f0: 220 }));
}

export function wordsOf(line: Line): string[] {
  return line.words.map((word) => word.text);
}

/** Deterministic PRNG (mulberry32) so "random" fixtures never flake. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function gibberishWord(random: () => number): string {
  const letters = "qzxjkvwy";
  const length = 4 + Math.floor(random() * 4);
  let word = "";
  for (let i = 0; i < length; i++) word += letters[Math.floor(random() * letters.length)];
  return word;
}

export interface SongFixtureOptions {
  cents?: number;
  octave?: number;
  /** Total silence: no voice at all. */
  silent?: boolean;
  /** Skip singing from this line index onwards (lines count as zero). */
  skipFromLine?: number;
  /** Sing unrelated gibberish words with erratic pitch. */
  gibberishLyrics?: boolean;
  /** Sing the right words in reverse order. */
  reversedLyrics?: boolean;
  keyInvariant?: boolean;
  /** No reference contour available -> stability pitch fallback. */
  refMissing?: boolean;
  seed?: number;
}

/** Score a full song with a synthetic singer, exactly the way the apps will. */
export function scoreSong(options: SongFixtureOptions = {}) {
  const lines = makeLines();
  const random = mulberry32(options.seed ?? 7);
  const frames = options.silent
    ? singerFrames({ voiced: false })
    : singerFrames({
        cents: options.cents,
        octave: options.octave,
        wobbleCents: options.gibberishLyrics ? 600 : undefined,
        random: options.gibberishLyrics ? random : undefined,
      });
  const refContour = options.refMissing ? [] : referenceContour();

  const lineScores = lines.map((line, index) => {
    const skipped = Boolean(options.silent) || (options.skipFromLine !== undefined && index >= options.skipFromLine);
    const lineFrames = skipped
      ? frames.map((frame) =>
          frame.t >= line.start && frame.t <= line.end ? { ...frame, voiced: false, f0: null } : frame
        )
      : frames;

    let heard = wordsOf(line);
    if (options.gibberishLyrics) heard = line.words.map(() => gibberishWord(random));
    else if (options.reversedLyrics) heard = [...heard].reverse();

    return scoreLine({
      line,
      heardWords: skipped ? [] : heard,
      frames: lineFrames,
      refContour,
      latency: 0,
      difficulty: "normal",
      keyInvariant: options.keyInvariant ?? true,
    });
  });

  return finalScore(lineScores);
}
