import { describe, expect, it } from "vitest";
import {
  normalizeTitle,
  hasDuplicateTitle,
} from "./thoughtValidation";

import type { Thought } from "../types/thought";

const thoughts: Thought[] = [
  {
    id: "A",
    title: "Computer Graphics",
    description: "",
    position: [0, 0, 0],
    color: "#a78bfa",
  },
];

describe("Thought title validation", () => {
  it("detects exact duplicates", () => {
    expect(
      hasDuplicateTitle("Computer Graphics", thoughts)
    ).toBe(true);
  });

  it("ignores capitalization", () => {
    expect(
      hasDuplicateTitle("computer graphics", thoughts)
    ).toBe(true);
  });

  it("ignores extra whitespace", () => {
    expect(
      hasDuplicateTitle("  Computer   Graphics ", thoughts)
    ).toBe(true);
  });

  it("allows different titles", () => {
    expect(
      hasDuplicateTitle("Linear Algebra", thoughts)
    ).toBe(false);
  });

  it("excludes the thought being edited", () => {
    expect(
      hasDuplicateTitle("Computer Graphics", thoughts, "A")
    ).toBe(false);
  });

  it("detects duplicates when renaming another thought", () => {
    expect(
      hasDuplicateTitle("Computer Graphics", thoughts, "B")
    ).toBe(true);
  });

  it("normalizes titles consistently", () => {
    expect(
      normalizeTitle("  COMPUTER   GRAPHICS  ")
    ).toBe("computer graphics");
  });
});
