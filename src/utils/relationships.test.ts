import { describe, expect, it } from "vitest";

import {
  normalizeConnection,
  getConnectionKey,
} from "./relationships";

describe("Relationship normalization", () => {
  it("normalizes related_to connections", () => {
    expect(
      normalizeConnection("B", "A", "related_to")
    ).toEqual({
      source: "A",
      target: "B",
      relationshipType: "related_to",
      description: "",
    });
  });

  it("normalizes contrasts_with connections", () => {
    const connection = normalizeConnection(
      "B", "A", "contrasts_with"
    );

    expect(connection.source).toBe("A");
    expect(connection.target).toBe("B");
  });

  it.each([
    "prerequisite_for",
    "part_of",
    "applied_in",
    "explains",
    "inspired",
  ] as const)("preserves direction for %s", (type) => {
    const connection = normalizeConnection(
      "B", "A", type
    );

    expect(connection.source).toBe("B");
    expect(connection.target).toBe("A");
  });

  it("rejects self-connections", () => {
    expect(() =>
      normalizeConnection("A", "A")
    ).toThrow();
  });

  it("defaults to related_to", () => {
    expect(
      normalizeConnection("A", "B").relationshipType
    ).toBe("related_to");
  });

  it("trims relationship descriptions", () => {
    expect(
      normalizeConnection(
        "A", "B", "explains", "  Explanation  "
      ).description
    ).toBe("Explanation");
  });
});

describe("Connection identity", () => {
  it("identifies reversed symmetric edges equally", () => {
    expect(
      getConnectionKey(
        normalizeConnection("A", "B")
      )
    ).toBe(
      getConnectionKey(
        normalizeConnection("B", "A")
      )
    );
  });

  it("distinguishes reversed directional edges", () => {
    expect(
      getConnectionKey(
        normalizeConnection("A", "B", "explains")
      )
    ).not.toBe(
      getConnectionKey(
        normalizeConnection("B", "A", "explains")
      )
    );
  });

  it("distinguishes different relationship types", () => {
    expect(
      getConnectionKey(
        normalizeConnection("A", "B", "explains")
      )
    ).not.toBe(
      getConnectionKey(
        normalizeConnection("A", "B", "applied_in")
      )
    );
  });
});
