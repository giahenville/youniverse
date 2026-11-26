import { describe, expect, it } from "vitest";
import { getDegreeCentrality, getStarRadius } from "./graph";

describe("getDegreeCentrality", () => {
  const connections = [
    { source: "A", target: "B" },
    { source: "A", target: "C" },
    { source: "A", target: "D" },
    { source: "B", target: "D" },
  ];

  it("counts direct connections correctly", () => {
    const degrees = getDegreeCentrality(connections);

    expect(degrees.get("A")).toBe(3);
    expect(degrees.get("B")).toBe(2);
    expect(degrees.get("C")).toBe(1);
    expect(degrees.get("D")).toBe(2);
  });

  it("does not count duplicate connections twice", () => {
    const degrees = getDegreeCentrality([
      { source: "A", target: "B" },
      { source: "B", target: "A" },
    ]);

    expect(degrees.get("A")).toBe(1);
    expect(degrees.get("B")).toBe(1);
  });

  it("handles an empty graph", () => {
    expect(getDegreeCentrality([]).size).toBe(0);
  });

  it("allows isolated thoughts to default to zero", () => {
    const degrees = getDegreeCentrality(connections);

    expect(degrees.get("E") ?? 0).toBe(0);
  });
});

describe("getStarRadius", () => {
  it("preserves the original radius for isolated thoughts", () => {
    expect(getStarRadius(0)).toBeCloseTo(0.35);
  });

  it("increases radius as connections increase", () => {
    expect(getStarRadius(5)).toBeGreaterThan(getStarRadius(1));
    expect(getStarRadius(10)).toBeGreaterThan(getStarRadius(5));
  });

  it("grows logarithmically rather than linearly", () => {
    const earlyGrowth = getStarRadius(10) - getStarRadius(0);
    const laterGrowth = getStarRadius(20) - getStarRadius(10);

    expect(earlyGrowth).toBeGreaterThan(laterGrowth);
  });

  it("returns a finite radius for highly connected thoughts", () => {
    expect(Number.isFinite(getStarRadius(1000))).toBe(true);
  });
});
