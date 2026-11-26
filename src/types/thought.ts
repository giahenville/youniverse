import type { RelationshipType } from "./relationship";

export type Thought = {
  id: string;
  title: string;
  description: string;
  position: [number, number, number];
  color: string;
  createdAt?: string;
  updatedAt?: string;
  lastEngagedAt?: string | null;
  engagementCount?: number;
};

export type ThoughtConnection = {
  source: string;
  target: string;
  relationshipType?: RelationshipType;
  description?: string;
  createdAt?: string;
};
