import { Text } from "@react-three/drei";
import type { Thought } from "../types/thought";

type ThoughtStarProps = {
  radius: number;
  brightness: number;
  thought: Thought;
  selected: boolean;
  hovered: boolean;
  dimmed: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
};

export function ThoughtStar({
  radius,
  brightness,
  thought,
  selected,
  hovered,
  dimmed,
  onSelect,
  onHover,
}: ThoughtStarProps) {
  return (
    <group position={thought.position}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onSelect(thought.id);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
          onHover(thought.id);
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
          onHover(null);
        }}
      >
        <sphereGeometry args={[radius, 24, 24]} />

        <meshStandardMaterial
          color={dimmed ? "#151520" : thought.color}
          emissive={dimmed ? "#000000" : thought.color}
          emissiveIntensity={
            dimmed
              ? 0
              : hovered || selected
                ? 1.5
                : 0.7 * brightness
          }
          transparent={dimmed}
          opacity={dimmed ? 0.04 : 1}
          depthWrite={!dimmed}
        />
      </mesh>

      <Text
        position={[0, -(radius + 0.3), 0]}
        fontSize={0.25}
        color="white"
        fillOpacity={dimmed ? 0.08 : 1}
        anchorX="center"
        anchorY="middle"
      >
        {thought.title}
      </Text>
    </group>
  );
}
