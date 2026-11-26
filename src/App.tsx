import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";

import { Universe } from "./universe/Universe";
import { ThoughtPanel } from "./components/ThoughtPanel";

import { loadThoughts, saveThought, updateThought, deleteThought, recordThoughtEngagement } from "./data/thoughtRepository";
import type { Thought, ThoughtConnection } from "./types/thought";
import {
  loadConnections,
  saveConnection,
  deleteConnection,
  updateConnectionDescription,
} from "./data/connectionRepository";

import { getConnectionKey } from "./utils/relationships";
import { hasDuplicateTitle } from "./utils/thoughtValidation";

import "./App.css";

function App() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [connections, setConnections] =
    useState<ThoughtConnection[]>([]);
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
          setThoughts(savedThoughts);
          setConnections(savedConnections);
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

  async function selectThought(id: string) {
    if (id === selectedThoughtId) return;

    setSelectedThoughtId(id);

    if (isLoading) return;

    try {
      const engagement = await recordThoughtEngagement(id);

      setThoughts((previousThoughts) =>
        previousThoughts.map((thought) =>
          thought.id === id
            ? {
                ...thought,
                ...engagement,
              }
            : thought
        )
      );
    } catch (err) {
      console.error("Failed to record engagement:", err);
      setError("Could not record thought engagement.");
    }
  }

  async function createThought() {
    const title = newThoughtTitle.trim();

    if (!title || isSaving || isLoading) return;

    if (hasDuplicateTitle(title, thoughts)) {
      setError("A thought with this title already exists.");
      return;
    }

    setError(null);

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
      const savedThought = await saveThought(newThought);

      setThoughts((previousThoughts) => [
        ...previousThoughts,
        savedThought,
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
          onSelectThought={selectThought}
        />
      </Canvas>

      {selectedThought && (
        <ThoughtPanel
          thought={selectedThought}
          onClose={() => setSelectedThoughtId(null)}
          isDemo={false}
          connections={connections}
          onDisconnect={async (connection) => {
            await deleteConnection(
              connection.source,
              connection.target,
              connection.relationshipType
            );

            const key = getConnectionKey(connection);

            setConnections((previousConnections) =>
              previousConnections.filter(
                (existing) => getConnectionKey(existing) !== key
              )
            );
          }}
          onUpdateConnection={async (connection, description) => {
            await updateConnectionDescription(
              connection,
              description
            );

            const key = getConnectionKey(connection);

            setConnections((previousConnections) =>
              previousConnections.map((existing) =>
                getConnectionKey(existing) === key
                  ? {
                      ...existing,
                      description: description.trim(),
                    }
                  : existing
              )
            );
          }}
          availableThoughts={thoughts}
          onConnect={async (
            targetId,
            relationshipType,
            description,
            reverse
          ) => {
            const source = reverse
              ? targetId
              : selectedThought.id;

            const target = reverse
              ? selectedThought.id
              : targetId;

            const connection = await saveConnection(
              source,
              target,
              relationshipType,
              description
            );

            const key = getConnectionKey(connection);

            setConnections((previousConnections) => {
              const exists = previousConnections.some(
                (existing) => getConnectionKey(existing) === key
              );

              return exists
                ? previousConnections
                : [...previousConnections, connection];
            });
          }}
          onSave={async (updatedThought) => {
            if (hasDuplicateTitle(
              updatedThought.title,
              thoughts,
              updatedThought.id
            )) {
              throw new Error(
                "A thought with this title already exists."
              );
            }

            const updatedAt = await updateThought(updatedThought);
            setThoughts((previousThoughts) =>
              previousThoughts.map((existingThought) =>
                existingThought.id === updatedThought.id
                  ? {
                      ...existingThought,
                      title: updatedThought.title,
                      description: updatedThought.description,
                      updatedAt,
                    }
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
              onChange={(event) => {
                setNewThoughtTitle(event.target.value);
                setError(null);
              }}
              placeholder="An idea, question, memory..."
              autoFocus
              maxLength={120}
              disabled={isSaving}
              required
            />

            {error && (
              <p className="thought-validation-error" role="alert">
                {error}
              </p>
            )}

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
