import { Line, Text, Billboard } from "@react-three/drei";
import { Vector3, QuadraticBezierCurve3 } from "three";
import type { Thought } from "../types/thought";

import {
  RELATIONSHIP_LABELS,
  isSymmetricRelationship,
  type RelationshipType,
} from "../types/relationship";

type ConnectionProps = {
  source: Thought;
  target: Thought;
  dimmed?: boolean;
  expanded?: boolean;
  relationshipType?: RelationshipType;
  offset?: number;
};

export function Connection({
  source,
  target,
  dimmed = false,
  expanded = false,
  relationshipType = "related_to",
  offset = 0,
}: ConnectionProps) {
  const start = new Vector3(...source.position);
  const end = new Vector3(...target.position);

  const direction = end.clone().sub(start);

  if (direction.lengthSq() < 0.000001) {
    return null;
  }

  direction.normalize();

  const reference =
    Math.abs(direction.y) > 0.95
      ? new Vector3(1, 0, 0)
      : new Vector3(0, 1, 0);

  const perpendicular = new Vector3()
    .crossVectors(direction, reference)
    .normalize();

  const midpoint = start.clone()
    .add(end)
    .multiplyScalar(0.5);

  const control = midpoint.clone()
    .addScaledVector(perpendicular, offset);

  const curve = new QuadraticBezierCurve3(
    start,
    control,
    end
  );

  const points = curve.getPoints(24);
  const labelPosition = curve.getPoint(0.5);
  const arrowPosition = curve.getPoint(0.72);
  const tangent = curve.getTangent(0.72).normalize();

  const directional =
    !isSymmetricRelationship(relationshipType);

  const color = dimmed
    ? "#252535"
    : "#a78bfa";

  return (
    <group>
      <Line
        points={points}
        color={color}
        lineWidth={dimmed ? 1 : 1.5}
        transparent
        opacity={dimmed ? 0.05 : 0.65}
        depthWrite={!dimmed}
      />

      {expanded && !dimmed && (
        <>
          <Billboard position={labelPosition}>
            <Text
              fontSize={0.13}
              color="#ddd6fe"
              outlineWidth={0.012}
              outlineColor="#050510"
              anchorX="center"
              anchorY="middle"
            >
              {RELATIONSHIP_LABELS[relationshipType]}
            </Text>
          </Billboard>

          {directional && (
            <arrowHelper
              args={[
                tangent,
                arrowPosition,
                0.18,
                color,
                0.12,
                0.08,
              ]}
            />
          )}
        </>
      )}
    </group>
  );
}
