import type { ThoughtConnection } from "../types/thought";

import {
  isSymmetricRelationship,
  type RelationshipType,
} from "../types/relationship";

export function normalizeConnection(
  source: string,
  target: string,
  relationshipType: RelationshipType = "related_to",
  description: string = ""
): ThoughtConnection {
  if (source === target) {
    throw new Error(
      "A thought cannot connect to itself."
    );
  }

  if (
    isSymmetricRelationship(relationshipType) &&
    source > target
  ) {
    [source, target] = [target, source];
  }

  return {
    source,
    target,
    relationshipType,
    description: description.trim(),
  };
}

export function getConnectionKey(
  connection: ThoughtConnection
): string {
  const normalized = normalizeConnection(
    connection.source,
    connection.target,
    connection.relationshipType
  );

  return JSON.stringify([
    normalized.source,
    normalized.target,
    normalized.relationshipType,
  ]);
}

export function groupConnectionsByPair(
  connections: ThoughtConnection[]
): Map<string, ThoughtConnection[]> {
  const groups = new Map<string, ThoughtConnection[]>();

  for (const connection of connections) {
    const endpoints = [
      connection.source,
      connection.target,
    ].sort();

    const key = JSON.stringify(endpoints);

    const group = groups.get(key);

    if (group) {
      group.push(connection);
    } else {
      groups.set(key, [connection]);
    }
  }

  return groups;
}
