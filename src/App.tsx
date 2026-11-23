import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";

import { Universe } from "./universe/Universe";
import { ThoughtPanel } from "./components/ThoughtPanel";
import { initialThoughts, initialConnections } from "./data/sampleThoughts";
import { loadThoughts, saveThought, updateThought, deleteThought } from "./data/thoughtRepository";
import type { Thought, ThoughtConnection } from "./types/thought";
import { loadConnections, saveConnection, deleteConnection } from "./data/connectionRepository";

import "./App.css";

function App() {
  const [thoughts, setThoughts] = useState<Thought[]>(initialThoughts);
  const [connections, setConnections] =
    useState<ThoughtConnection[]>(initialConnections);
  const [selectedThoughtId, setSelectedThoughtId] =
    useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [newThoughtTitle, setNewThoughtTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function initializeThoughts() {
      try {
        const savedThoughts = await loadThoughts();
        const savedConnections = await loadConnections();

        if (active) {
          setThoughts([...initialThoughts, ...savedThoughts]);
          setConnections([...initialConnections, ...savedConnections]);
        }
      } catch (err) {
        console.error("Failed to load thoughts:", err);

        if (active) {
          setError("Could not load saved thoughts from SQLite.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    initializeThoughts();

    return () => {
      active = false;
    };
  }, []);

  const selectedThought =
    thoughts.find(
      (thought) => thought.id === selectedThoughtId
    ) ?? null;

  async function createThought() {
    const title = newThoughtTitle.trim();

    if (!title || isSaving || isLoading || error) return;

    const newThought: Thought = {
      id: crypto.randomUUID(),
      title,
      description: "",
      position: [
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 2,
      ],
      color: "#a78bfa",
    };

    setIsSaving(true);

    try {
      await saveThought(newThought);

      setThoughts((previousThoughts) => [
        ...previousThoughts,
        newThought,
      ]);

      setSelectedThoughtId(newThought.id);
      setNewThoughtTitle("");
      setIsCreating(false);
      setError(null);
    } catch (err) {
      console.error("Failed to save thought:", err);
      setError("Could not save your thought. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="universe-container">
      <div className="universe-header">
        <h1>YoUniverse</h1>
        <p>Your mind. Your universe. Always evolving.</p>
      </div>

      <button
        className="new-thought-button"
        onClick={() => {
          setError(null);
          setIsCreating(true);
        }}
        disabled={isLoading}
      >
        + New Thought
      </button>

      {isLoading && (
        <p className="database-status" role="status">
          Loading your universe...
        </p>
      )}

      {error && (
        <p className="database-error" role="alert">
          {error}
        </p>
      )}

      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        <Universe
          thoughts={thoughts}
          connections={connections}
          selectedThoughtId={selectedThoughtId}
          onSelectThought={setSelectedThoughtId}
        />
      </Canvas>

      {selectedThought && (
        <ThoughtPanel
          thought={selectedThought}
          onClose={() => setSelectedThoughtId(null)}
          isDemo={initialThoughts.some(
            (sample) => sample.id === selectedThought.id
          )}
          connections={connections}
          onDisconnect={async (targetId) => {
            await deleteConnection(selectedThought.id, targetId);

            setConnections((previousConnections) =>
              previousConnections.filter(
                (connection) =>
                  !(
                    (connection.source === selectedThought.id &&
                      connection.target === targetId) ||
                    (connection.source === targetId &&
                      connection.target === selectedThought.id)
                  )
              )
            );
          }}
          availableThoughts={thoughts.filter(
            (thought) =>
              !initialThoughts.some((sample) => sample.id === thought.id)
          )}
          onConnect={async (targetId) => {
            const connection = await saveConnection(
              selectedThought.id,
              targetId
            );

            setConnections((previousConnections) => {
              const exists = previousConnections.some(
                (existing) =>
                  existing.source === connection.source &&
                  existing.target === connection.target
              );

              return exists
                ? previousConnections
                : [...previousConnections, connection];
            });
          }}
          onSave={async (updatedThought) => {
            await updateThought(updatedThought);
            setThoughts((previousThoughts) =>
              previousThoughts.map((existingThought) =>
                existingThought.id === updatedThought.id
                  ? updatedThought
                  : existingThought
              )
            );
          }}
          onDelete={async (id) => {
            await deleteThought(id);
            setThoughts((previousThoughts) =>
              previousThoughts.filter((thought) => thought.id !== id)
            );
            setConnections((previousConnections) =>
              previousConnections.filter(
                (connection) =>
                  connection.source !== id && connection.target !== id
              )
            );
            setSelectedThoughtId(null);
          }}
        />
      )}

      {isCreating && (
        <div className="create-thought-overlay">
          <form
            className="create-thought-form"
            onSubmit={(event) => {
              event.preventDefault();
              void createThought();
            }}
          >
            <h2>Create a Thought</h2>

            <label htmlFor="thought-title">
              What are you thinking about?
            </label>

            <input
              id="thought-title"
              type="text"
              value={newThoughtTitle}
              onChange={(event) =>
                setNewThoughtTitle(event.target.value)
              }
              placeholder="An idea, question, memory..."
              autoFocus
              maxLength={120}
              disabled={isSaving}
              required
            />

            <div className="create-thought-actions">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setIsCreating(false);
                  setNewThoughtTitle("");
                  setError(null);
                }}
              >
                Cancel
              </button>

              <button type="submit" disabled={isSaving || isLoading}>
                {isSaving ? "Saving..." : "Create Thought"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

export default App;
