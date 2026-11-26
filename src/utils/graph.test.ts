import { describe, expect, it } from "vitest";
import { getThoughtsWithinDepth } from "./graph";
import type { ThoughtConnection } from "../types/thought";

const connections: ThoughtConnection[] = [
  { source: "A", target: "B" },
  { source: "A", target: "C" },
  { source: "B", target: "D" },
  { source: "C", target: "D" },
  { source: "D", target: "E" },
];

describe("getThoughtsWithinDepth", () => {
  it("returns only the origin at depth zero", () => {
    expect(
      getThoughtsWithinDepth("A", connections, 0)
    ).toEqual(new Set(["A"]));
  });

  it("finds immediate neighbors at depth one", () => {
    expect(
      getThoughtsWithinDepth("A", connections, 1)
    ).toEqual(new Set(["A", "B", "C"]));
  });

  it("finds indirect neighbors at depth two", () => {
    expect(
      getThoughtsWithinDepth("A", connections, 2)
    ).toEqual(new Set(["A", "B", "C", "D"]));
  });

  it("handles cycles and multiple paths", () => {
    expect(
      getThoughtsWithinDepth("A", connections, 10)
    ).toEqual(new Set(["A", "B", "C", "D", "E"]));
  });

  it("handles isolated thoughts", () => {
    expect(
      getThoughtsWithinDepth("F", connections, 3)
    ).toEqual(new Set(["F"]));
  });

  it("traverses connections in both directions", () => {
    expect(
      getThoughtsWithinDepth("E", connections, 1)
    ).toEqual(new Set(["E", "D"]));
  });

  it("handles an empty graph", () => {
    expect(
      getThoughtsWithinDepth("A", [], 3)
    ).toEqual(new Set(["A"]));
  });
});
