import { describe, expect, it } from "vitest";

import {
  normalizeConnection,
  groupConnectionsByPair,
} from "./relationships";

describe("Relationship grouping", () => {
  it("groups different relationship types together", () => {
    const groups = groupConnectionsByPair([
      normalizeConnection("A", "B", "explains"),
      normalizeConnection("A", "B", "applied_in"),
      normalizeConnection("A", "B", "related_to"),
    ]);

    expect(groups.size).toBe(1);
    expect(groups.get('["A","B"]')).toHaveLength(3);
  });

  it("groups reversed directional relationships", () => {
    const groups = groupConnectionsByPair([
      normalizeConnection("A", "B", "explains"),
      normalizeConnection("B", "A", "explains"),
    ]);

    expect(groups.size).toBe(1);
    expect(groups.get('["A","B"]')).toHaveLength(2);
  });

  it("preserves original semantic direction", () => {
    const connection = normalizeConnection(
      "B", "A", "explains"
    );

    const groups = groupConnectionsByPair([
      connection,
    ]);

    expect(groups.get('["A","B"]')).toEqual([
      connection,
    ]);
  });

  it("keeps unrelated pairs separate", () => {
    const groups = groupConnectionsByPair([
      normalizeConnection("A", "B"),
      normalizeConnection("A", "C"),
      normalizeConnection("B", "C"),
    ]);

    expect(groups.size).toBe(3);
  });

  it("handles an empty graph", () => {
    expect(
      groupConnectionsByPair([]).size
    ).toBe(0);
  });
});
