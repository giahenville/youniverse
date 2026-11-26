import type { ThoughtConnection } from "../types/thought";

export function getNeighbors(
  thoughtId: string,
  connections: ThoughtConnection[]
): Set<string> {
  const neighbors = new Set<string>();

  for (const connection of connections) {
    if (connection.source === thoughtId) {
      neighbors.add(connection.target);
    } else if (connection.target === thoughtId) {
      neighbors.add(connection.source);
    }
  }

  return neighbors;
}
