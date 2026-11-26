import { describe, expect, it } from "vitest";
import type { Thought } from "../types/thought";

import {
  parseTimestamp,
  getLastActivity,
  getTemporalRelevance,
  getThoughtBrightness,
  getActivityStage,
  getActivityBrightness,
  MINIMUM_BRIGHTNESS,
} from "./relevance";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.parse("2026-11-26T12:00:00Z");

function daysAgo(days: number): string {
  return new Date(NOW - days * DAY).toISOString();
}

function makeThought(
  overrides: Partial<Thought> = {}
): Thought {
  return {
    id: "test",
    title: "Linear Algebra",
    description: "",
    position: [0, 0, 0],
    color: "#a78bfa",
    ...overrides,
  };
}

describe("Timestamp parsing", () => {
  it("parses ISO timestamps", () => {
    expect(parseTimestamp("2026-11-26T12:00:00Z"))
      .toBe(NOW);
  });

  it("interprets SQLite timestamps as UTC", () => {
    expect(parseTimestamp("2026-11-26 12:00:00"))
      .toBe(NOW);
  });

  it("handles missing timestamps", () => {
    expect(parseTimestamp(null)).toBeNull();
    expect(parseTimestamp(undefined)).toBeNull();
  });

  it("handles invalid timestamps", () => {
    expect(parseTimestamp("invalid")).toBeNull();
  });
});

describe("Last activity", () => {
  it("uses the most recent valid timestamp", () => {
    const thought = makeThought({
      createdAt: daysAgo(90),
      updatedAt: daysAgo(5),
      lastEngagedAt: daysAgo(30),
    });

    expect(getLastActivity(thought))
      .toBe(NOW - 5 * DAY);
  });

  it("ignores invalid timestamps", () => {
    const thought = makeThought({
      createdAt: daysAgo(10),
      updatedAt: "invalid",
    });

    expect(getLastActivity(thought))
      .toBe(NOW - 10 * DAY);
  });
});

describe("Temporal relevance", () => {
  it.each([
    [0, 1],
    [30, 0.5],
    [60, 0.25],
    [90, 0.125],
  ])("calculates relevance after %i days", (days, expected) => {
    const thought = makeThought({
      createdAt: daysAgo(days),
    });

    expect(getTemporalRelevance(thought, NOW))
      .toBeCloseTo(expected);
  });

  it("restores relevance after engagement", () => {
    const thought = makeThought({
      createdAt: daysAgo(90),
      lastEngagedAt: daysAgo(0),
    });

    expect(getTemporalRelevance(thought, NOW))
      .toBe(1);
  });

  it("restores relevance after editing", () => {
    const thought = makeThought({
      createdAt: daysAgo(90),
      updatedAt: daysAgo(0),
    });

    expect(getTemporalRelevance(thought, NOW))
      .toBe(1);
  });

  it("handles future timestamps", () => {
    const thought = makeThought({
      createdAt: daysAgo(-5),
    });

    expect(getTemporalRelevance(thought, NOW))
      .toBe(1);
  });

  it("handles thoughts without timestamps", () => {
    expect(getTemporalRelevance(makeThought(), NOW))
      .toBe(1);
  });
});

describe("Adaptive brightness", () => {
  it("gives recent thoughts full brightness", () => {
    const thought = makeThought({
      createdAt: daysAgo(0),
    });

    expect(getThoughtBrightness(thought, NOW))
      .toBe(1);
  });

  it("calculates brightness after one half-life", () => {
    const thought = makeThought({
      createdAt: daysAgo(30),
    });

    expect(getThoughtBrightness(thought, NOW))
      .toBeCloseTo(0.7);
  });

  it("preserves a minimum brightness", () => {
    const thought = makeThought({
      createdAt: daysAgo(10000),
    });

    expect(getThoughtBrightness(thought, NOW))
      .toBeGreaterThanOrEqual(MINIMUM_BRIGHTNESS);
  });

  it("keeps demonstration thoughts fully visible", () => {
    expect(getThoughtBrightness(makeThought(), NOW))
      .toBe(1);
  });
});

describe("Activity stages", () => {
  it.each([
    [0, "recent"],
    [29, "recent"],
    [30, "cooling"],
    [89, "cooling"],
    [90, "inactive"],
    [365, "inactive"],
  ])("classifies activity after %i days", (days, expected) => {
    const thought = makeThought({
      createdAt: daysAgo(days),
    });

    expect(getActivityStage(thought, NOW))
      .toBe(expected);
  });

  it("restores recent status after engagement", () => {
    const thought = makeThought({
      createdAt: daysAgo(365),
      lastEngagedAt: daysAgo(0),
    });

    expect(getActivityStage(thought, NOW))
      .toBe("recent");
  });

  it("handles missing timestamps", () => {
    expect(getActivityStage(makeThought(), NOW))
      .toBe("recent");
  });

  it("handles future timestamps", () => {
    const thought = makeThought({
      createdAt: daysAgo(-1),
    });

    expect(getActivityStage(thought, NOW))
      .toBe("recent");
  });
});

describe("Categorical brightness", () => {
  it.each([
    [0, 1],
    [30, 0.5],
    [90, 0.2],
  ])("assigns brightness after %i days", (days, expected) => {
    const thought = makeThought({
      createdAt: daysAgo(days),
    });

    expect(getActivityBrightness(thought, NOW))
      .toBe(expected);
  });
});
