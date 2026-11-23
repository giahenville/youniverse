import Database from "@tauri-apps/plugin-sql";
import type { Thought } from "../types/thought";

type ThoughtRow = {
  id: string;
  title: string;
  description: string;
  x: number;
  y: number;
  z: number;
  color: string;
};

let databasePromise: ReturnType<typeof Database.load> | null = null;

function getDatabase() {
  if (!databasePromise) {
    databasePromise = Database.load("sqlite:youniverse.db").catch(
      (error) => {
        databasePromise = null;
        throw error;
      }
    );
  }

  return databasePromise;
}

export async function loadThoughts(): Promise<Thought[]> {
  const db = await getDatabase();

  const rows = await db.select<ThoughtRow[]>(
    `SELECT id, title, description, x, y, z, color
     FROM thoughts
     ORDER BY created_at, id`
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    position: [row.x, row.y, row.z],
    color: row.color,
  }));
}

export async function saveThought(thought: Thought): Promise<void> {
  const db = await getDatabase();

  await db.execute(
    `INSERT INTO thoughts
     (id, title, description, x, y, z, color)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      thought.id,
      thought.title,
      thought.description,
      ...thought.position,
      thought.color,
    ]
  );
}

export async function updateThought(
  thought: Thought
): Promise<void> {
  const db = await getDatabase();

  const result = await db.execute(
    `UPDATE thoughts
     SET title = $1, description = $2
     WHERE id = $3`,
    [thought.title, thought.description, thought.id]
  );

  if (result.rowsAffected !== 1) {
    throw new Error("Thought was not found in the database.");
  }
}

export async function deleteThought(id: string): Promise<void> {
  const db = await getDatabase();

  const result = await db.execute(
    "DELETE FROM thoughts WHERE id = $1",
    [id]
  );

  if (result.rowsAffected !== 1) {
    throw new Error("Thought was not found in the database.");
  }
}
