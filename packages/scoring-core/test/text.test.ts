import { describe, expect, it } from "vitest";
import { charSimilarity, levenshtein, mean, median, normalize } from "../src/index.js";

describe("normalize", () => {
  it("lowercases and strips punctuation", () => {
    expect(normalize("Hello, World!")).toBe("helloworld");
  });

  it("folds accents via NFKD", () => {
    expect(normalize("Naïve")).toBe("naive");
    expect(normalize("Café!!")).toBe("cafe");
  });

  it("keeps apostrophes", () => {
    expect(normalize("Don't")).toBe("don't");
  });
});

describe("levenshtein", () => {
  it("computes classic edit distances", () => {
    expect(levenshtein("kitten", "sitting")).toBe(3);
    expect(levenshtein("", "abc")).toBe(3);
    expect(levenshtein("abc", "")).toBe(3);
    expect(levenshtein("same", "same")).toBe(0);
  });
});

describe("charSimilarity", () => {
  it("is 1 for identical strings", () => {
    expect(charSimilarity("loving", "loving")).toBe(1);
  });

  it("scales with edit distance", () => {
    expect(charSimilarity("loving", "lovin")).toBeCloseTo(5 / 6, 5);
    expect(charSimilarity("cat", "dog")).toBe(0);
  });
});

describe("stats", () => {
  it("computes means and medians", () => {
    expect(mean([2, 4])).toBe(3);
    expect(mean([])).toBe(0);
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([])).toBe(0);
  });
});
