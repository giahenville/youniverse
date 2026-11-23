import type {
  Thought,
  ThoughtConnection,
} from "../types/thought";

export const initialThoughts: Thought[] = [
  {
    id: "ai",
    title: "Artificial Intelligence",
    description: "Exploring how machines learn, reason, and interact with humans.",
    position: [-2.5, 1, 0],
    color: "#a78bfa",
  },
  {
    id: "quantum",
    title: "Quantum Computing",
    description: "Learning about qubits, quantum gates, and quantum algorithms.",
    position: [2.5, 1, 0],
    color: "#67e8f9",
  },
  {
    id: "research",
    title: "Research",
    description: "Questions, discoveries, and ideas worth investigating.",
    position: [0, -2, 0],
    color: "#f9a8d4",
  },
];

export const initialConnections: ThoughtConnection[] = [
  { source: "ai", target: "research" },
  { source: "quantum", target: "research" },
];
