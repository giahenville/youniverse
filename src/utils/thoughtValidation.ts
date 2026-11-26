import type { Thought } from "../types/thought";

export function normalizeTitle(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function hasDuplicateTitle(
  title: string,
  thoughts: Thought[],
  excludeId?: string
): boolean {
  const normalized = normalizeTitle(title);

  return thoughts.some(
    (thought) =>
      thought.id !== excludeId &&
      normalizeTitle(thought.title) === normalized
  );
}
