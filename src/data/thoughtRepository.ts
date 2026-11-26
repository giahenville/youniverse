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
  created_at: string;
  updated_at: string | null;
  last_engaged_at: string | null;
  engagement_count: number;
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
    `SELECT id, title, description, x, y, z, color,
            created_at, updated_at, last_engaged_at,
            engagement_count
     FROM thoughts
     ORDER BY created_at, id`
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    position: [row.x, row.y, row.z],
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
    lastEngagedAt: row.last_engaged_at,
    engagementCount: row.engagement_count,
  }));
}

export async function saveThought(thought: Thought): Promise<Thought> {
  const db = await getDatabase();

  const timestamp = new Date().toISOString();

  await db.execute(
    `INSERT INTO thoughts
     (id, title, description, x, y, z, color, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
    [
      thought.id,
      thought.title,
      thought.description,
      ...thought.position,
      thought.color,
      timestamp,
    ]
  );

  return {
    ...thought,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastEngagedAt: null,
    engagementCount: 0,
  };
}

export async function updateThought(
  thought: Thought
): Promise<string> {
  const db = await getDatabase();

  const timestamp = new Date().toISOString();

  const result = await db.execute(
    `UPDATE thoughts
     SET title = $1, description = $2,
         updated_at = $4
     WHERE id = $3`,
    [thought.title, thought.description, thought.id, timestamp]
  );

  if (result.rowsAffected !== 1) {
    throw new Error("Thought was not found in the database.");
  }

  return timestamp;
}

export async function deleteThought(id: string): Promise<void> {
  const db = await getDatabase();

  const rows = await db.select<{ id: string }[]>(
    "SELECT id FROM thoughts WHERE id = $1",
    [id]
  );

  if (rows.length !== 1) {
    throw new Error("Thought was not found in the database.");
  }

  await db.execute(
    "DELETE FROM connections WHERE source = $1 OR target = $1",
    [id]
  );

  const result = await db.execute(
    "DELETE FROM thoughts WHERE id = $1",
    [id]
  );

  if (result.rowsAffected !== 1) {
    throw new Error("Thought could not be deleted.");
  }
}

export async function recordThoughtEngagement(
  id: string
): Promise<{
  lastEngagedAt: string;
  engagementCount: number;
}> {
  const db = await getDatabase();

  const timestamp = new Date().toISOString();

  const result = await db.execute(
    `UPDATE thoughts
     SET last_engaged_at = $1,
         engagement_count = engagement_count + 1
     WHERE id = $2`,
    [timestamp, id]
  );

  if (result.rowsAffected !== 1) {
    throw new Error("Thought was not found in the database.");
  }

  const rows = await db.select<{
    last_engaged_at: string;
    engagement_count: number;
  }[]>(
    `SELECT last_engaged_at, engagement_count
     FROM thoughts
     WHERE id = $1`,
    [id]
  );

  if (rows.length !== 1) {
    throw new Error("Could not retrieve thought engagement.");
  }

  return {
    lastEngagedAt: rows[0].last_engaged_at,
    engagementCount: rows[0].engagement_count,
  };
}
