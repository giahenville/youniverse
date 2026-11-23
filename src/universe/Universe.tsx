import { OrbitControls, Stars } from "@react-three/drei";
import type { Thought, ThoughtConnection } from "../types/thought";
import { ThoughtStar } from "./ThoughtStar";
import { Connection } from "./Connection";

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
  const thoughtMap = new Map(
    thoughts.map((thought) => [thought.id, thought])
  );

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

        return (
          <Connection
            key={`${connection.source}-${connection.target}`}
            source={source}
            target={target}
          />
        );
      })}

      {thoughts.map((thought) => (
        <ThoughtStar
          key={thought.id}
          thought={thought}
          selected={thought.id === selectedThoughtId}
          onSelect={onSelectThought}
        />
      ))}

      <OrbitControls enableDamping />
    </>
  );
}
