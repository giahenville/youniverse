import type { Thought } from "../types/thought";

type ThoughtPanelProps = {
  thought: Thought;
  onClose: () => void;
};

export function ThoughtPanel({ thought, onClose }: ThoughtPanelProps) {
  return (
    <aside className="thought-panel">
      <button
        className="close-button"
        onClick={onClose}
        aria-label="Close thought panel"
      >
        ×
      </button>

      <span className="panel-eyebrow">THOUGHT</span>
      <h2>{thought.title}</h2>

      <p>
        This is a thought in your universe. Soon, you'll be
        able to add notes, explore connections, and see how
        your ideas evolve.
      </p>

      <div className="thought-meta">
        <span>Thought ID</span>
        <code>{thought.id}</code>
      </div>
    </aside>
  );
}
