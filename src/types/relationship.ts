export const RELATIONSHIP_TYPES = [
  "related_to",
  "prerequisite_for",
  "part_of",
  "applied_in",
  "explains",
  "contrasts_with",
  "inspired",
] as const;

export type RelationshipType =
  (typeof RELATIONSHIP_TYPES)[number];

export const RELATIONSHIP_LABELS:
  Record<RelationshipType, string> = {
    related_to: "Related to",
    prerequisite_for: "Prerequisite for",
    part_of: "Part of",
    applied_in: "Applied in",
    explains: "Explains",
    contrasts_with: "Contrasts with",
    inspired: "Inspired",
  };

export function isSymmetricRelationship(
  type: RelationshipType
): boolean {
  return (
    type === "related_to" ||
    type === "contrasts_with"
  );
}
