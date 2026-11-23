import { useEffect, useState } from "react";
import type { Thought } from "../types/thought";

type ThoughtPanelProps = {
  thought: Thought;
  onClose: () => void;
  onSave: (thought: Thought) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isDemo: boolean;
};

export function ThoughtPanel({
  thought,
  onClose,
  onSave,
  onDelete,
  isDemo,
}: ThoughtPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(thought.title);
  const [description, setDescription] = useState(thought.description);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(thought.title);
    setDescription(thought.description);
    setIsEditing(false);
    setConfirmingDelete(false);
    setSaveError(null);
  }, [thought.id, thought.title, thought.description]);

  async function handleSave() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      await onSave({
        ...thought,
        title: trimmedTitle,
        description: description.trim(),
      });
      setIsEditing(false);
    } catch {
      setSaveError("Could not save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (isDeleting || isSaving || isDemo) return;

    setIsDeleting(true);
    setSaveError(null);

    try {
      await onDelete(thought.id);
    } catch (error) {
      console.error("Failed to delete thought:", error);
      setSaveError("Could not delete this thought. Please try again.");
      setIsDeleting(false);
    }
  }

  return (
    <aside className="thought-panel">
      <button
        className="close-button"
        onClick={onClose}
        disabled={isSaving || isDeleting}
        aria-label="Close thought panel"
      >
        ×
      </button>

      <span className="panel-eyebrow">THOUGHT</span>

      {isEditing ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSave();
          }}
        >
          <label htmlFor="edit-thought-title">Title</label>
          <input
            id="edit-thought-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            disabled={isSaving}
            required
          />

          <label htmlFor="edit-thought-description">
            Description
          </label>
          <textarea
            id="edit-thought-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={7}
            disabled={isSaving}
            placeholder="Explore your idea..."
          />

          {saveError && <p role="alert">{saveError}</p>}

          <div className="thought-edit-actions">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <>
          <h2>{thought.title}</h2>

          <p>
            {thought.description ||
              "No description yet. Add one to develop this idea."}
          </p>

          {isDemo ? (
            <p className="demo-notice">
              This is a sample thought. Create your own thought
              to edit and save it.
            </p>
          ) : (
            <>
              <button
                className="edit-thought-button"
                onClick={() => setIsEditing(true)}
              >
                Edit Thought
              </button>

              {!confirmingDelete ? (
                <button
                  className="delete-thought-button"
                  onClick={() => setConfirmingDelete(true)}
                >
                  Delete Thought
                </button>
              ) : (
                <div className="delete-confirmation">
                  <p>
                    Permanently delete this thought? This cannot be undone.
                  </p>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setConfirmingDelete(false)}
                  >
                    Keep Thought
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => void handleDelete()}
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete Permanently"}
                  </button>
                </div>
              )}

              {saveError && <p role="alert">{saveError}</p>}
            </>
          )}
        </>
      )}

      <div className="thought-meta">
        <span>Thought ID</span>
        <code>{thought.id}</code>
      </div>
    </aside>
  );
}
