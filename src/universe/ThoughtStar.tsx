import { Text } from "@react-three/drei";
import type { Thought } from "../types/thought";

type ThoughtStarProps = {
  thought: Thought;
  selected: boolean;
  onSelect: (id: string) => void;
};

export function ThoughtStar({
  thought,
  selected,
  onSelect,
}: ThoughtStarProps) {
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
