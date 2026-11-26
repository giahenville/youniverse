import { Line } from "@react-three/drei";
import type { Thought } from "../types/thought";

type ConnectionProps = {
  source: Thought;
  target: Thought;
  dimmed?: boolean;
};

export function Connection({
  source,
  target,
  dimmed = false,
}: ConnectionProps) {
  return (
    <Line
      points={[source.position, target.position]}
      color={dimmed ? "#252535" : "#a78bfa"}
      lineWidth={dimmed ? 1 : 1.5}
      transparent
      opacity={dimmed ? 0.05 : 0.65}
      depthWrite={!dimmed}
    />
  );
}
