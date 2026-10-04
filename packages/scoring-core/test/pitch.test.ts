import { describe, expect, it } from "vitest";
import { foldOctave, hzToCents, pitchLineScore, stabilityPitchScore } from "../src/index.js";
import { makeLines, mulberry32, referenceContour, singerFrames } from "./helpers.js";

const [firstLine] = makeLines();
const reference = referenceContour();

const normalOptions = { keyInvariant: true, difficulty: "normal", latency: 0 } as const;

describe("cents helpers", () => {
  it("converts octaves to 1200 cents", () => {
    expect(hzToCents(440, 220)).toBeCloseTo(1200, 6);
    expect(hzToCents(220, 220)).toBe(0);
  });

  it("folds any cents value into [-600, 600)", () => {
    expect(foldOctave(1200)).toBe(0);
    expect(foldOctave(-1200)).toBe(0);
    expect(foldOctave(1300)).toBeCloseTo(100, 6);
    expect(foldOctave(-1300)).toBeCloseTo(-100, 6);
    expect(foldOctave(600)).toBe(-600);
  });
});

describe("pitchLineScore", () => {
  it("scores a perfectly in-tune singer near 1", () => {
    expect(pitchLineScore(singerFrames(), reference, normalOptions)).toBeGreaterThan(0.98);
  });

  it("does not punish singing an octave lower in key-invariant mode", () => {
    expect(pitchLineScore(singerFrames({ octave: -1 }), reference, normalOptions)).toBeGreaterThan(0.95);
  });

  it("removes a constant key shift only in key-invariant mode", () => {
    const shifted = singerFrames({ cents: 100 });
    const strict = pitchLineScore(shifted, reference, { ...normalOptions, keyInvariant: false });
    const invariant = pitchLineScore(shifted, reference, normalOptions);
    expect(strict).toBeCloseTo(0.8, 2);
    expect(invariant).toBeGreaterThan(0.98);
  });

  it("returns 0 when the singer was silent over voiced reference moments", () => {
    expect(pitchLineScore(singerFrames({ voiced: false }), reference, normalOptions)).toBe(0);
  });

  it("returns 0 when the reference has no voiced moments", () => {
    const nulled = reference.map((point) => ({ t: point.t, f0: null }));
    expect(pitchLineScore(singerFrames(), nulled, normalOptions)).toBe(0);
  });

  it("ignores unvoiced reference moments", () => {
    const partial = reference.map((point, index) => (index % 2 === 0 ? point : { t: point.t, f0: null }));
    expect(pitchLineScore(singerFrames(), partial, normalOptions)).toBeGreaterThan(0.98);
  });
});

describe("stabilityPitchScore (no reference fallback)", () => {
  it("rewards steady held notes", () => {
    expect(stabilityPitchScore(singerFrames(), firstLine, 0)).toBeGreaterThan(0.9);
  });

  it("penalizes erratic wobble", () => {
    const wobbly = singerFrames({ wobbleCents: 500, random: mulberry32(11) });
    expect(stabilityPitchScore(wobbly, firstLine, 0)).toBeLessThan(0.5);
  });

  it("is 0 for silence", () => {
    expect(stabilityPitchScore(singerFrames({ voiced: false }), firstLine, 0)).toBe(0);
  });
});
