import { describe, expect, it } from "vitest";
import { alignLine, buildTimeline, lyricLineScore } from "../src/index.js";

function wordsFor(text: string) {
  return buildTimeline([{ t: 0, text }], 60)[0].words;
}

describe("alignLine", () => {
  it("marks exact matches as correct with no penalty", () => {
    const words = wordsFor("hello world again");
    const alignment = alignLine(words, ["hello", "world", "again"]);
    expect(alignment.inserted).toBe(0);
    expect(alignment.results.map((result) => result.status)).toEqual(["correct", "correct", "correct"]);
    expect(lyricLineScore(alignment)).toBe(1);
  });

  it("treats near-miss words as close instead of wrong", () => {
    const words = wordsFor("hello world again");
    const alignment = alignLine(words, ["hello", "wurld", "again"]);
    expect(alignment.results[1].status).toBe("close");
    expect(alignment.results[1].heard).toBe("wurld");
    const score = lyricLineScore(alignment);
    expect(score).toBeGreaterThan(0.85);
    expect(score).toBeLessThan(1);
  });

  it("marks skipped words as missed and uncredited", () => {
    const words = wordsFor("hello world again");
    const alignment = alignLine(words, ["hello", "again"]);
    expect(alignment.results.map((result) => result.status)).toContain("missed");
    expect(lyricLineScore(alignment)).toBeLessThan(0.8);
  });

  it("penalizes inserted extra words, capped at 25%", () => {
    const words = wordsFor("hello world again");
    const alignment = alignLine(words, ["hello", "world", "again", "yeah", "oh", "yeah"]);
    expect(alignment.inserted).toBe(3);
    expect(lyricLineScore(alignment)).toBeCloseTo(0.75, 5);
  });

  it("gives pure gibberish the wrong-word credit only", () => {
    const words = wordsFor("hello world again");
    const alignment = alignLine(words, ["zqxj", "wwww", "kkkk"]);
    expect(alignment.results.every((result) => result.status === "wrong")).toBe(true);
    expect(lyricLineScore(alignment)).toBeCloseTo(0.2, 5);
  });

  it("scores the right words in the wrong order lower than the right order", () => {
    const words = wordsFor("alpha bravo charlie delta");
    const inOrder = lyricLineScore(alignLine(words, ["alpha", "bravo", "charlie", "delta"]));
    const reversed = lyricLineScore(alignLine(words, ["delta", "charlie", "bravo", "alpha"]));
    expect(inOrder).toBe(1);
    expect(reversed).toBeLessThan(inOrder);
  });

  it("marks every word missed when nothing was heard", () => {
    const words = wordsFor("hello world again");
    const alignment = alignLine(words, []);
    expect(alignment.results.map((result) => result.status)).toEqual(["missed", "missed", "missed"]);
    expect(lyricLineScore(alignment)).toBe(0);
  });
});
