import Database from "@tauri-apps/plugin-sql";
import type { ThoughtConnection } from "../types/thought";

const DATABASE_URL = "sqlite:youniverse.db";

let databasePromise: ReturnType<typeof Database.load> | null = null;

function getDatabase() {
  if (!databasePromise) {
    databasePromise = Database.load(DATABASE_URL).catch((error) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
}

function normalizeConnection(
  source: string,
  target: string
): ThoughtConnection {
  if (source === target) {
    throw new Error("A thought cannot connect to itself.");
  }

  return source < target
    ? { source, target }
    : { source: target, target: source };
}

export async function loadConnections(): Promise<ThoughtConnection[]> {
  const db = await getDatabase();

  return db.select<ThoughtConnection[]>(
    "SELECT source, target FROM connections ORDER BY created_at, source, target"
  );
}

export async function saveConnection(
  source: string,
  target: string
): Promise<ThoughtConnection> {
  const connection = normalizeConnection(source, target);
  const db = await getDatabase();

  await db.execute(
    `INSERT OR IGNORE INTO connections (source, target)
     SELECT $1, $2
     WHERE EXISTS (SELECT 1 FROM thoughts WHERE id = $1)
       AND EXISTS (SELECT 1 FROM thoughts WHERE id = $2)`,
    [connection.source, connection.target]
  );

  const rows = await db.select<ThoughtConnection[]>(
    `SELECT source, target FROM connections
     WHERE source = $1 AND target = $2`,
    [connection.source, connection.target]
  );

  if (rows.length !== 1) {
    throw new Error("Both thoughts must be saved before connecting them.");
  }

  return connection;
}

export async function deleteConnection(
  source: string,
  target: string
): Promise<void> {
  const connection = normalizeConnection(source, target);
  const db = await getDatabase();

  await db.execute(
    `DELETE FROM connections
     WHERE source = $1 AND target = $2`,
    [connection.source, connection.target]
  );
}

export async function deleteConnectionsForThought(
  id: string
): Promise<void> {
  const db = await getDatabase();

  await db.execute(
    `DELETE FROM connections
     WHERE source = $1 OR target = $1`,
    [id]
  );
}
