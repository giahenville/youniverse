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
import { getActivityBrightness } from "../utils/relevance";

import {
  groupConnectionsByPair,
  getConnectionKey,
} from "../utils/relationships";

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

  const connectionGroups = useMemo(
    () => groupConnectionsByPair(connections),
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

      {Array.from(connectionGroups.entries()).map(
        ([pairKey, group]) => {
          const [firstId, secondId] =
            JSON.parse(pairKey) as [string, string];

          const first = thoughtMap.get(firstId);
          const second = thoughtMap.get(secondId);

          if (!first || !second) return null;

          const expanded =
            hoveredThoughtId === firstId ||
            hoveredThoughtId === secondId;

          const dimmed =
            hoveredThoughtId !== null && !expanded;

          if (!expanded) {
            return (
              <Connection
                key={pairKey}
                source={first}
                target={second}
                dimmed={dimmed}
              />
            );
          }

          return group.map((connection, index) => {
            const source = thoughtMap.get(
              connection.source
            );

            const target = thoughtMap.get(
              connection.target
            );

            if (!source || !target) return null;

            const offset =
              (index - (group.length - 1) / 2) * 0.7;

            const orientation =
              connection.source === firstId ? 1 : -1;

            return (
              <Connection
                key={getConnectionKey(connection)}
                source={source}
                target={target}
                relationshipType={
                  connection.relationshipType
                }
                expanded
                offset={offset * orientation}
              />
            );
          });
        }
      )}

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
            brightness={getActivityBrightness(thought)}
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
