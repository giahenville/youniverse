import { Line } from "@react-three/drei";
import type { Thought } from "../types/thought";

type ConnectionProps = {
  source: Thought;
  target: Thought;
};

export function Connection({ source, target }: ConnectionProps) {
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
