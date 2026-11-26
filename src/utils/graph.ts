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

export function buildAdjacencyList(
  connections: ThoughtConnection[]
): Map<string, Set<string>> {
  const adjacency = new Map<string, Set<string>>();

  for (const { source, target } of connections) {
    if (!adjacency.has(source)) {
      adjacency.set(source, new Set<string>());
    }

    if (!adjacency.has(target)) {
      adjacency.set(target, new Set<string>());
    }

    adjacency.get(source)!.add(target);
    adjacency.get(target)!.add(source);
  }

  return adjacency;
}

export function getThoughtsWithinDepth(
  thoughtId: string,
  connections: ThoughtConnection[],
  maxDepth: number
): Set<string> {
  const adjacency = buildAdjacencyList(connections);

  const visited = new Set<string>([thoughtId]);

  const queue: { id: string; depth: number }[] = [
    { id: thoughtId, depth: 0 },
  ];

  let head = 0;

  while (head < queue.length) {
    const current = queue[head];
    head++;

    if (current.depth >= maxDepth) {
      continue;
    }

    const neighbors =
      adjacency.get(current.id) ?? new Set<string>();

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);

        queue.push({
          id: neighbor,
          depth: current.depth + 1,
        });
      }
    }
  }

  return visited;
}

export function getDegreeCentrality(
  connections: ThoughtConnection[]
): Map<string, number> {
  const adjacency = buildAdjacencyList(connections);
  const degrees = new Map<string, number>();

  for (const [thoughtId, neighbors] of adjacency) {
    degrees.set(thoughtId, neighbors.size);
  }

  return degrees;
}

export function getStarRadius(degree: number): number {
  const baseRadius = 0.35;
  const growthFactor = 0.15;

  return baseRadius + growthFactor * Math.log1p(degree);
}
