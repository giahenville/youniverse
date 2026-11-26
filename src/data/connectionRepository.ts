import Database from "@tauri-apps/plugin-sql";
import type { ThoughtConnection } from "../types/thought";
import type { RelationshipType } from "../types/relationship";
import { normalizeConnection } from "../utils/relationships";

const DATABASE_URL = "sqlite:youniverse.db";

type ConnectionRow = {
  source: string;
  target: string;
  relationship_type: RelationshipType;
  description: string;
  created_at: string;
};

let databasePromise:
  ReturnType<typeof Database.load> | null = null;

function getDatabase() {
  if (!databasePromise) {
    databasePromise = Database.load(DATABASE_URL).catch(
      (error) => {
        databasePromise = null;
        throw error;
      }
    );
  }

  return databasePromise;
}

function mapConnection(
  row: ConnectionRow
): ThoughtConnection {
  return {
    source: row.source,
    target: row.target,
    relationshipType: row.relationship_type,
    description: row.description,
    createdAt: row.created_at,
  };
}

export async function loadConnections():
  Promise<ThoughtConnection[]> {
  const db = await getDatabase();

  const rows = await db.select<ConnectionRow[]>(
    `SELECT source, target, relationship_type,
            description, created_at
     FROM connections
     ORDER BY created_at, source, target,
              relationship_type`
  );

  return rows.map(mapConnection);
}

export async function saveConnection(
  source: string,
  target: string,
  relationshipType: RelationshipType = "related_to",
  description: string = ""
): Promise<ThoughtConnection> {
  const connection = normalizeConnection(
    source,
    target,
    relationshipType,
    description
  );

  const db = await getDatabase();

  await db.execute(
    `INSERT INTO connections (
       source, target, relationship_type, description
     )
     SELECT $1, $2, $3, $4
     WHERE EXISTS (
       SELECT 1 FROM thoughts WHERE id = $1
     )
     AND EXISTS (
       SELECT 1 FROM thoughts WHERE id = $2
     )
     ON CONFLICT (
       source, target, relationship_type
     ) DO NOTHING`,
    [
      connection.source,
      connection.target,
      relationshipType,
      connection.description ?? "",
    ]
  );

  const rows = await db.select<ConnectionRow[]>(
    `SELECT source, target, relationship_type,
            description, created_at
     FROM connections
     WHERE source = $1
       AND target = $2
       AND relationship_type = $3`,
    [
      connection.source,
      connection.target,
      relationshipType,
    ]
  );

  if (rows.length !== 1) {
    throw new Error(
      "Both thoughts must be saved before connecting them."
    );
  }

  return mapConnection(rows[0]);
}

export async function updateConnectionDescription(
  connection: ThoughtConnection,
  description: string
): Promise<void> {
  const normalized = normalizeConnection(
    connection.source,
    connection.target,
    connection.relationshipType,
    description
  );

  const db = await getDatabase();

  const result = await db.execute(
    `UPDATE connections
     SET description = $4
     WHERE source = $1
       AND target = $2
       AND relationship_type = $3`,
    [
      normalized.source,
      normalized.target,
      normalized.relationshipType ?? "related_to",
      normalized.description ?? "",
    ]
  );

  if (result.rowsAffected !== 1) {
    throw new Error("Relationship was not found.");
  }
}

export async function deleteConnection(
  source: string,
  target: string,
  relationshipType: RelationshipType = "related_to"
): Promise<void> {
  const connection = normalizeConnection(
    source,
    target,
    relationshipType
  );

  const db = await getDatabase();

  await db.execute(
    `DELETE FROM connections
     WHERE source = $1
       AND target = $2
       AND relationship_type = $3`,
    [
      connection.source,
      connection.target,
      relationshipType,
    ]
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
