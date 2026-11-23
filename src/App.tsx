
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Text } from "@react-three/drei";
import "./App.css";
import { Line } from "@react-three/drei";
import { useState } from "react";

type Thought = {
  id: string;
  title: string;
  position: [number, number, number];
  color: string;
};

const thoughts: Thought[] = [
  {
    id: "ai",
    title: "Artificial Intelligence",
    position: [-2.5, 1, 0],
    color: "#a78bfa",
  },
  {
    id: "quantum",
    title: "Quantum Computing",
    position: [2.5, 1, 0],
    color: "#67e8f9",
  },
  {
    id: "research",
    title: "Research",
    position: [0, -2, 0],
    color: "#f9a8d4",
  },
];


type ThoughtConnection = {
  source: string;
  target: string;
};

const connections: ThoughtConnection[] = [
  { source: "ai", target: "research" },
  { source: "quantum", target: "research" },
];


function ThoughtStar({
  thought,
  selected,
  onSelect,
}: {
  thought: Thought;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <group position={thought.position}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onSelect(thought.id);
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshStandardMaterial
          color={thought.color}
          emissive={thought.color}
          emissiveIntensity={selected ? 1.5 : 0.7}
        />
      </mesh>

      <Text
        position={[0, -0.65, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {thought.title}
      </Text>
    </group>
  );
}


function Connection({
  source,
  target,
}: {
  source: Thought;
  target: Thought;
}) {
  return (
    <Line
      points={[source.position, target.position]}
      color="#64748b"
      lineWidth={1}
      transparent
      opacity={0.55}
    />
  );
}

function Universe({
  selectedThoughtId,
  onSelectThought,
  }: {
  selectedThoughtId: string | null;
  onSelectThought: (id: string) => void;
  }) {
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

      {thoughts.map((thought) => (
        <ThoughtStar
          key={thought.id}
          thought={thought}
          selected={thought.id === selectedThoughtId}
          onSelect={onSelectThought}
        />
      ))}

      {connections.map((connection) => {
        const source = thoughts.find(
          (thought) => thought.id === connection.source
        );

        const target = thoughts.find(
          (thought) => thought.id === connection.target
        );

        if (!source || !target) {
          return null;
        }

        return (
          <Connection
            key={`${connection.source}-${connection.target}`}
            source={source}
            target={target}
          />
        );
})}


      <OrbitControls enableDamping />
    </>
  );
}

function App() {
  const [selectedThoughtId, setSelectedThoughtId] =
  useState<string | null>(null);

  const selectedThought =
    thoughts.find((thought) => thought.id === selectedThoughtId) ?? null;
  
return (
  <main className="universe-container">
    <div className="universe-header">
      <h1>YoUniverse</h1>
      <p>Your mind. Your universe. Always evolving.</p>
    </div>

    <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
      <Universe
        selectedThoughtId={selectedThoughtId}
        onSelectThought={setSelectedThoughtId}
      />
    </Canvas>

    {selectedThought && (
      <aside className="thought-panel">
        <button
          className="close-button"
          onClick={() => setSelectedThoughtId(null)}
          aria-label="Close thought panel"
        >
          ×
        </button>

        <span className="panel-eyebrow">THOUGHT</span>
        <h2>{selectedThought.title}</h2>
        <p>
          This is a thought in your universe. Soon, you'll be
          able to add notes, explore connections, and see how
          your ideas evolve.
        </p>

        <div className="thought-meta">
          <span>Thought ID</span>
          <code>{selectedThought.id}</code>
        </div>
      </aside>
    )}
  </main>
);

}

export default App;
