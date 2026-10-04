import { describe, expect, it } from "vitest";
import { buildTimeline, MAX_LINE_WINDOW_SECONDS, normalize, parseLrc } from "../src/index.js";

describe("parseLrc", () => {
  it("parses timestamps and skips metadata + blank lines", () => {
    const parsed = parseLrc("[ar:Someone]\n[00:12.50] hello world\n\n[01:05.25] next line\n[bad]");
    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toEqual({ t: 12.5, text: "hello world" });
    expect(parsed[1].t).toBeCloseTo(65.25, 5);
    expect(parsed[1].text).toBe("next line");
  });
});

describe("buildTimeline", () => {
  it("interpolates word timing by character share inside the line window", () => {
    const lines = buildTimeline([{ t: 0, text: "ab cd" }, { t: 2, text: "x" }], 10);
    const [first, second] = lines;

    expect(first.words).toHaveLength(2);
    expect(first.words[0].start).toBe(0);
    expect(first.words[0].end).toBeCloseTo(1, 5);
    expect(first.words[1].start).toBeCloseTo(1, 5);
    expect(first.words[1].end).toBeCloseTo(2, 5);
    expect(first.end).toBeCloseTo(2, 5);

    expect(second.words).toHaveLength(1);
    expect(second.start).toBe(2);
  });

  it("caps long instrumental gaps at the max line window", () => {
    const [first] = buildTimeline([{ t: 0, text: "a b c" }, { t: 30, text: "later" }], 40);
    expect(first.end - first.start).toBeCloseTo(MAX_LINE_WINDOW_SECONDS, 5);
  });

  it("normalizes each word and drops empty lines", () => {
    const lines = buildTimeline([{ t: 0, text: "Hey, You!" }, { t: 4, text: "   " }], 10);
    expect(lines).toHaveLength(1);
    expect(lines[0].words[0].norm).toBe(normalize("Hey,"));
    expect(lines[0].weight).toBe(2);
  });
});
