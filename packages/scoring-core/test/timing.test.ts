import { describe, expect, it } from "vitest";
import { timingLineScore } from "../src/index.js";
import { makeLines, singerFrames } from "./helpers.js";

const [firstLine] = makeLines();

describe("timingLineScore", () => {
  it("gives a fully voiced, on-time line ~1.0", () => {
    expect(timingLineScore(firstLine, singerFrames(), 0, "normal")).toBeGreaterThan(0.95);
  });

  it("returns 0 when no frames fall inside the window", () => {
    const outside = singerFrames().filter((frame) => frame.t > firstLine.end + 1);
    expect(timingLineScore(firstLine, outside, 0, "normal")).toBe(0);
  });

  it("returns 0 for total silence", () => {
    expect(timingLineScore(firstLine, singerFrames({ voiced: false }), 0, "normal")).toBe(0);
  });

  it("compensates a calibrated latency offset", () => {
    const latency = 0.15;
    const delayed = singerFrames().map((frame) => ({ ...frame, t: frame.t + latency }));
    expect(timingLineScore(firstLine, delayed, latency, "normal")).toBeGreaterThan(0.95);
  });

  it("punishes a late vocal entrance without zeroing the line", () => {
    const late = singerFrames().map((frame) =>
      frame.t < firstLine.start + 0.6 ? { ...frame, voiced: false, f0: null } : frame
    );
    const score = timingLineScore(firstLine, late, 0, "normal");
    expect(score).toBeLessThan(0.95);
    expect(score).toBeGreaterThan(0.4);
  });

  it("is more forgiving on easy than on pro", () => {
    const late = singerFrames().map((frame) =>
      frame.t < firstLine.start + 0.45 ? { ...frame, voiced: false, f0: null } : frame
    );
    expect(timingLineScore(firstLine, late, 0, "easy")).toBeGreaterThan(timingLineScore(firstLine, late, 0, "pro"));
  });
});
