import type { Line, LrcLine, Word } from "./types.js";
import { normalize } from "./text.js";

/** Long instrumental gaps are capped so a line never claims the whole gap. */
export const MAX_LINE_WINDOW_SECONDS = 8;

/** Degenerate (zero-length) windows still get a tiny slice so words are scorable. */
const MIN_LINE_WINDOW_SECONDS = 0.25;

const LRC_LINE = /^\[(\d{1,3}):(\d{1,2}(?:\.\d{1,3})?)\](.*)$/;

/**
 * Parse LRC text into `{ t, text }` entries.
 * Metadata tags such as `[ar:Artist]` and blank lines are ignored.
 */
export function parseLrc(lrcText: string): LrcLine[] {
  const lines: LrcLine[] = [];
  for (const raw of lrcText.split(/\r?\n/)) {
    const match = LRC_LINE.exec(raw.trim());
    if (!match) continue;
    const minutes = Number.parseInt(match[1], 10);
    const seconds = Number.parseFloat(match[2]);
    const text = match[3].trim();
    if (!text) continue;
    lines.push({ t: minutes * 60 + seconds, text });
  }
  return lines;
}

/**
 * Convert line-level LRC into lines with word-level timing.
 *
 * LRC only carries line timestamps, so each word's duration is interpolated by its
 * character share of the line window, capped at MAX_LINE_WINDOW_SECONDS.
 * Word-level STT alignment (Phase 6/9) can later replace these estimates.
 */
export function buildTimeline(lrc: LrcLine[], songDuration: number): Line[] {
  return lrc
    .map((entry, index) => {
      const start = entry.t;
      const nextStart = lrc[index + 1]?.t ?? songDuration;
      let window = Math.min(nextStart - start, MAX_LINE_WINDOW_SECONDS);
      if (!Number.isFinite(window) || window <= 0) window = MIN_LINE_WINDOW_SECONDS;

      const tokens = entry.text.split(/\s+/).filter(Boolean);
      const totalChars = tokens.reduce((sum, token) => sum + token.length, 0) || 1;

      let cursor = start;
      const words: Word[] = tokens.map((token) => {
        const duration = (token.length / totalChars) * window;
        const word: Word = {
          text: token,
          norm: normalize(token),
          start: cursor,
          end: cursor + duration,
        };
        cursor += duration;
        return word;
      });

      const line: Line = {
        index,
        start,
        end: start + window,
        words,
        weight: Math.max(1, tokens.length),
      };
      return line;
    })
    .filter((line) => line.words.length > 0);
}
