import { useEffect, useState } from "react";
import type { Thought, ThoughtConnection } from "../types/thought";
import {
  RELATIONSHIP_TYPES,
  RELATIONSHIP_LABELS,
  isSymmetricRelationship,
  type RelationshipType,
} from "../types/relationship";
import { getConnectionKey } from "../utils/relationships";

type ThoughtPanelProps = {
  thought: Thought;
  onClose: () => void;
  onSave: (thought: Thought) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isDemo: boolean;
  availableThoughts: Thought[];
  onConnect: (
    targetId: string,
    relationshipType: RelationshipType,
    description: string,
    reverse: boolean
  ) => Promise<void>;
  connections: ThoughtConnection[];
  onDisconnect: (connection: ThoughtConnection) => Promise<void>;
  onUpdateConnection: (
    connection: ThoughtConnection,
    description: string
  ) => Promise<void>;
};

export function ThoughtPanel({
  thought,
  onClose,
  onSave,
  onDelete,
  isDemo,
  availableThoughts,
  onConnect,
  connections,
  onDisconnect,
  onUpdateConnection,
}: ThoughtPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(thought.title);
  const [description, setDescription] = useState(thought.description);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [targetId, setTargetId] = useState("");
  const [relationshipType, setRelationshipType] =
    useState<RelationshipType>("related_to");
  const [relationshipDescription, setRelationshipDescription] =
    useState("");
  const [reverse, setReverse] = useState(false);
  const [editingConnectionKey, setEditingConnectionKey] =
    useState<string | null>(null);
  const [editingDescription, setEditingDescription] =
    useState("");
  const [isUpdatingConnection, setIsUpdatingConnection] =
    useState(false);

  const targetThought = availableThoughts.find(
    (item) => item.id === targetId
  );

  const symmetric =
    isSymmetricRelationship(relationshipType);


  const [isConnecting, setIsConnecting] = useState(false);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const relationshipBusy =
    isConnecting || disconnectingId !== null ||
    isUpdatingConnection;

  useEffect(() => {
    setTitle(thought.title);
    setDescription(thought.description);
    setIsEditing(false);
    setConfirmingDelete(false);
    setTargetId("");
    setRelationshipType("related_to");
    setRelationshipDescription("");
    setReverse(false);
    setEditingConnectionKey(null);
    setEditingDescription("");
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
    } catch (error) {
      setSaveError(
        error instanceof Error &&
        error.message === "A thought with this title already exists."
          ? error.message
          : "Could not save changes. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConnect() {
    if (!targetId || relationshipBusy || isDemo) return;

    setIsConnecting(true);
    setSaveError(null);

    try {
      await onConnect(
        targetId,
        relationshipType,
        relationshipDescription,
        !symmetric && reverse
      );
      setTargetId("");
      setRelationshipDescription("");
      setReverse(false);
    } catch (error) {
      console.error("Failed to connect thoughts:", error);
      setSaveError("Could not connect these thoughts.");
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleDisconnect(connection: ThoughtConnection) {
    if (relationshipBusy || isDemo) return;

    setDisconnectingId(getConnectionKey(connection));
    setSaveError(null);

    try {
      await onDisconnect(connection);
    } catch (error) {
      console.error("Failed to disconnect thoughts:", error);
      setSaveError("Could not remove the connection.");
    } finally {
      setDisconnectingId(null);
    }
  }

  async function handleUpdateConnection(
    connection: ThoughtConnection
  ) {
    if (relationshipBusy || isDemo) return;

    setIsUpdatingConnection(true);
    setSaveError(null);

    try {
      await onUpdateConnection(
        connection,
        editingDescription
      );
      setEditingConnectionKey(null);
    } catch (error) {
      console.error("Failed to update relationship:", error);
      setSaveError("Could not update the relationship.");
    } finally {
      setIsUpdatingConnection(false);
    }
  }

  async function handleDelete() {
    if (isDeleting || isSaving || isDemo || relationshipBusy) return;

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

              <div className="thought-connect">
                <h3>Create relationship</h3>

                <label htmlFor="connection-target">
                  Connect to
                </label>

                <select
                  id="connection-target"
                  value={targetId}
                  onChange={(event) =>
                    setTargetId(event.target.value)
                  }
                  disabled={relationshipBusy}
                >
                  <option value="">Choose a thought...</option>

                  {availableThoughts
                    .filter((other) => other.id !== thought.id)
                    .map((other) => (
                      <option key={other.id} value={other.id}>
                        {other.title}
                      </option>
                    ))}
                </select>

                <label htmlFor="relationship-type">
                  Relationship type
                </label>

                <select
                  id="relationship-type"
                  value={relationshipType}
                  disabled={relationshipBusy}
                  onChange={(event) => {
                    setRelationshipType(
                      event.target.value as RelationshipType
                    );
                    setReverse(false);
                  }}
                >
                  {RELATIONSHIP_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {RELATIONSHIP_LABELS[type]}
                    </option>
                  ))}
                </select>

                {targetThought && (
                  <div className="relationship-preview">
                    <strong>
                      {reverse && !symmetric
                        ? targetThought.title
                        : thought.title}
                    </strong>

                    <span>
                      {RELATIONSHIP_LABELS[relationshipType]}
                    </span>

                    <strong>
                      {reverse && !symmetric
                        ? thought.title
                        : targetThought.title}
                    </strong>
                  </div>
                )}

                {!symmetric && targetThought && (
                  <button
                    type="button"
                    disabled={relationshipBusy}
                    onClick={() => setReverse(!reverse)}
                  >
                    Reverse direction
                  </button>
                )}

                <label htmlFor="relationship-description">
                  Why are these thoughts connected?
                </label>

                <textarea
                  id="relationship-description"
                  value={relationshipDescription}
                  onChange={(event) =>
                    setRelationshipDescription(event.target.value)
                  }
                  placeholder="Explain the relationship (optional)"
                  disabled={relationshipBusy}
                  rows={3}
                />

                <button
                  type="button"
                  disabled={!targetId || relationshipBusy}
                  onClick={() => void handleConnect()}
                >
                  {isConnecting
                    ? "Connecting..."
                    : "Connect Thoughts"}
                </button>
              </div>

              <div className="existing-connections">
                <h3>Relationships</h3>

                {connections
                  .filter(
                    (connection) =>
                      connection.source === thought.id ||
                      connection.target === thought.id
                  )
                  .map((connection) => {
                    const key = getConnectionKey(connection);

                    const source = availableThoughts.find(
                      (item) => item.id === connection.source
                    );

                    const target = availableThoughts.find(
                      (item) => item.id === connection.target
                    );

                    if (!source || !target) return null;

                    const type =
                      connection.relationshipType ?? "related_to";

                    return (
                      <div
                        className="relationship-card"
                        key={key}
                      >
                        <div className="relationship-statement">
                          <strong>{source.title}</strong>
                          <span>{RELATIONSHIP_LABELS[type]}</span>
                          <strong>{target.title}</strong>
                        </div>

                        {editingConnectionKey === key ? (
                          <>
                            <textarea
                              aria-label="Edit relationship explanation"
                              value={editingDescription}
                              onChange={(event) =>
                                setEditingDescription(
                                  event.target.value
                                )
                              }
                              rows={3}
                              disabled={relationshipBusy}
                            />

                            <div className="relationship-actions">
                              <button
                                type="button"
                                disabled={relationshipBusy}
                                onClick={() =>
                                  setEditingConnectionKey(null)
                                }
                              >
                                Cancel
                              </button>

                              <button
                                type="button"
                                disabled={relationshipBusy}
                                onClick={() =>
                                  void handleUpdateConnection(connection)
                                }
                              >
                                Save explanation
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p>
                              {connection.description ||
                                "No explanation yet."}
                            </p>

                            <div className="relationship-actions">
                              <button
                                type="button"
                                disabled={relationshipBusy}
                                onClick={() => {
                                  setEditingConnectionKey(key);
                                  setEditingDescription(
                                    connection.description ?? ""
                                  );
                                }}
                              >
                                Edit explanation
                              </button>

                              <button
                                type="button"
                                disabled={relationshipBusy}
                                onClick={() =>
                                  void handleDisconnect(connection)
                                }
                              >
                                {disconnectingId === key
                                  ? "Removing..."
                                  : "Disconnect"}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
              </div>

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
