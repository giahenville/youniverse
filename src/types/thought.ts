export type Thought = {
  id: string;
  title: string;
  position: [number, number, number];
  color: string;
};

export type ThoughtConnection = {
  source: string;
  target: string;
};
