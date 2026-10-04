import { describe, expect, it } from "vitest";
import type { LineScore } from "../src/index.js";
import {
  DEFAULT_SCORE_CONFIG,
  finalScore,
  grade,
  RANKED_MIN_PARTICIPATION,
  SCORING_VERSION,
  VOICE_MATCH_SCORE_CONFIG,
} from "../src/index.js";
import { scoreSong } from "./helpers.js";

const perfect = scoreSong();

describe("song fixtures (guide Section 12.1)", () => {
  it("a perfect synthetic singer scores >= 980", () => {
    expect(perfect.total).toBeGreaterThanOrEqual(980);
    expect(perfect.grade).toBe("S");
    expect(perfect.ranked).toBe(true);
  });

  it("singing a perfect octave lower still scores >= 960 in key-invariant mode", () => {
    const low = scoreSong({ octave: -1, keyInvariant: true });
    expect(low.total).toBeGreaterThanOrEqual(960);
  });

  it("a constant 100-cent shift scores high key-invariant, lower in strict mode", () => {
    const strict = scoreSong({ cents: 100, keyInvariant: false });
    const invariant = scoreSong({ cents: 100, keyInvariant: true });
    expect(invariant.total).toBeGreaterThanOrEqual(980);
    expect(strict.total).toBeLessThan(invariant.total);
    expect(strict.breakdown.pitch).toBeCloseTo(0.8, 2);
  });

  it("total silence scores 0 and is flagged Incomplete (unranked)", () => {
    const silence = scoreSong({ silent: true });
    expect(silence.total).toBe(0);
    expect(silence.ranked).toBe(false);
    expect(silence.participation).toBe(0);
    expect(silence.grade).toBe("D");
  });

  it("skipping the second half caps the score near 500 and fails participation", () => {
    const half = scoreSong({ skipFromLine: 2 });
    expect(half.total).toBeGreaterThanOrEqual(450);
    expect(half.total).toBeLessThanOrEqual(550);
    expect(half.ranked).toBe(false); // 50% sung < 60% participation rule
  });

  it("random noise scores far below real singing", () => {
    const noise = scoreSong({ gibberishLyrics: true, seed: 42 });
    expect(perfect.total - noise.total).toBeGreaterThan(300);
    expect(noise.breakdown.lyric).toBeLessThan(0.5);
    expect(noise.breakdown.pitch).toBeLessThan(0.7);
  });

  it("singing the right words in the wrong order scores lower", () => {
    const reversed = scoreSong({ reversedLyrics: true });
    expect(reversed.total).toBeLessThan(perfect.total);
    expect(reversed.breakdown.lyric).toBeLessThan(perfect.breakdown.lyric);
  });

  it("is deterministic for identical input", () => {
    expect(scoreSong()).toEqual(scoreSong());
    expect(scoreSong({ gibberishLyrics: true, seed: 5 })).toEqual(scoreSong({ gibberishLyrics: true, seed: 5 }));
  });

  it("falls back to stability pitch without a reference and flags unranked pitch", () => {
    const stability = scoreSong({ refMissing: true });
    expect(stability.pitchMode).toBe("stability");
    expect(stability.rankedPitch).toBe(false);
    expect(stability.total).toBeGreaterThan(700);
  });
});

describe("finalScore plumbing", () => {
  const line = (overrides: Partial<LineScore>): LineScore => ({
    index: 0,
    weight: 1,
    lyric: 1,
    timing: 1,
    pitch: 1,
    pitchMode: "reference",
    sung: true,
    ...overrides,
  });

  it("applies the 1.25x Star Power weight", () => {
    const result = finalScore([
      line({ index: 0 }),
      line({ index: 1, star: true, lyric: 0, timing: 0, pitch: 0 }),
    ]);
    expect(result.total).toBe(444);
  });

  it("ignores Voice Match at zero weight and applies it at 10%", () => {
    expect(finalScore([line({ voice: 0 })], DEFAULT_SCORE_CONFIG).total).toBe(1000);
    expect(finalScore([line({ voice: 0 })], VOICE_MATCH_SCORE_CONFIG).total).toBe(900);
  });

  it("requires 60% participation to be ranked", () => {
    const sung = line({});
    const unsung = line({ lyric: 0, timing: 0, pitch: 0, sung: false });
    expect(finalScore([sung, sung, unsung, unsung]).ranked).toBe(false);
    const threeOfFour = finalScore([sung, sung, sung, unsung]);
    expect(threeOfFour.participation).toBeGreaterThanOrEqual(RANKED_MIN_PARTICIPATION);
    expect(threeOfFour.ranked).toBe(true);
  });

  it("returns a zero, unranked result for an empty song", () => {
    const empty = finalScore([]);
    expect(empty.total).toBe(0);
    expect(empty.ranked).toBe(false);
    expect(empty.grade).toBe("D");
  });

  it("grades exactly at the documented boundaries", () => {
    expect(grade(950)).toBe("S");
    expect(grade(949)).toBe("A");
    expect(grade(850)).toBe("A");
    expect(grade(700)).toBe("B");
    expect(grade(500)).toBe("C");
    expect(grade(499)).toBe("D");
  });

  it("stamps every result with the scoring version", () => {
    expect(finalScore([line({})]).scoringVersion).toBe(SCORING_VERSION);
  });
});
