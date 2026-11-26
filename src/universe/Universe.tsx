import { getDegreeCentrality, getStarRadius } from "../utils/graph";
import { useState, useMemo } from "react";
import { OrbitControls, Stars } from "@react-three/drei";

import type {
  Thought,
  ThoughtConnection,
} from "../types/thought";

import { ThoughtStar } from "./ThoughtStar";
import { Connection } from "./Connection";
import { getNeighbors } from "../utils/graph";

type UniverseProps = {
  thoughts: Thought[];
  connections: ThoughtConnection[];
  selectedThoughtId: string | null;
  onSelectThought: (id: string) => void;
};

export function Universe({
  thoughts,
  connections,
  selectedThoughtId,
  onSelectThought,
}: UniverseProps) {
  const [hoveredThoughtId, setHoveredThoughtId] =
    useState<string | null>(null);

  const degrees = useMemo(
    () => getDegreeCentrality(connections),
    [connections]
  );

  const thoughtMap = new Map(
    thoughts.map((thought) => [thought.id, thought])
  );

  const neighbors = hoveredThoughtId
    ? getNeighbors(hoveredThoughtId, connections)
    : new Set<string>();

  return (
    <>
      <color attach="background" args={["#050510"]} />

      <ambientLight intensity={1.5} />

      <Stars
        radius={100}
        depth={50}
        count={1500}
        factor={4}
        fade
      />

      {connections.map((connection) => {
        const source = thoughtMap.get(connection.source);
        const target = thoughtMap.get(connection.target);

        if (!source || !target) return null;

        const dimmed =
          hoveredThoughtId !== null &&
          connection.source !== hoveredThoughtId &&
          connection.target !== hoveredThoughtId;

        return (
          <Connection
            key={`${connection.source}-${connection.target}`}
            source={source}
            target={target}
            dimmed={dimmed}
          />
        );
      })}

      {thoughts.map((thought) => {
        const selected = thought.id === selectedThoughtId;
        const hovered = thought.id === hoveredThoughtId;

        const dimmed =
          hoveredThoughtId !== null &&
          !hovered &&
          !neighbors.has(thought.id);

        return (
          <ThoughtStar
            radius={getStarRadius(degrees.get(thought.id) ?? 0)}
            key={thought.id}
            thought={thought}
            selected={selected}
            hovered={hovered}
            dimmed={dimmed}
            onSelect={onSelectThought}
            onHover={setHoveredThoughtId}
          />
        );
      })}

      <OrbitControls enableDamping />
    </>
  );
}
