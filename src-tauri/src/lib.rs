use tauri_plugin_sql::{Migration, MigrationKind};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_thoughts_table",
            sql: "
                CREATE TABLE IF NOT EXISTS thoughts (
                    id TEXT PRIMARY KEY NOT NULL,
                    title TEXT NOT NULL,
                    x REAL NOT NULL,
                    y REAL NOT NULL,
                    z REAL NOT NULL,
                    color TEXT NOT NULL,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "add_thought_description",
            sql: "
                ALTER TABLE thoughts
                ADD COLUMN description TEXT NOT NULL DEFAULT '';
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "create_connections_table",
            sql: "
                CREATE TABLE IF NOT EXISTS connections (
                    source TEXT NOT NULL,
                    target TEXT NOT NULL,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (source, target),
                    CHECK (source < target),
                    FOREIGN KEY (source) REFERENCES thoughts(id)
                        ON DELETE CASCADE,
                    FOREIGN KEY (target) REFERENCES thoughts(id)
                        ON DELETE CASCADE
                );
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "add_temporal_awareness",
            sql: "
                ALTER TABLE thoughts
                ADD COLUMN updated_at TEXT;

                ALTER TABLE thoughts
                ADD COLUMN last_engaged_at TEXT;

                ALTER TABLE thoughts
                ADD COLUMN engagement_count INTEGER
                NOT NULL DEFAULT 0;

                UPDATE thoughts
                SET updated_at = created_at;
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "add_semantic_relationships",
            sql: "
                CREATE TABLE connections_new (
                    source TEXT NOT NULL,
                    target TEXT NOT NULL,
                    relationship_type TEXT NOT NULL
                        DEFAULT 'related_to',
                    description TEXT NOT NULL DEFAULT '',
                    created_at TEXT NOT NULL
                        DEFAULT CURRENT_TIMESTAMP,

                    PRIMARY KEY (
                        source,
                        target,
                        relationship_type
                    ),

                    CHECK (source <> target),

                    CHECK (
                        relationship_type IN (
                            'related_to',
                            'prerequisite_for',
                            'part_of',
                            'applied_in',
                            'explains',
                            'contrasts_with',
                            'inspired'
                        )
                    ),

                    CHECK (
                        relationship_type NOT IN (
                            'related_to',
                            'contrasts_with'
                        )
                        OR source < target
                    ),

                    FOREIGN KEY (source)
                        REFERENCES thoughts(id)
                        ON DELETE CASCADE,

                    FOREIGN KEY (target)
                        REFERENCES thoughts(id)
                        ON DELETE CASCADE
                );

                INSERT INTO connections_new (
                    source,
                    target,
                    relationship_type,
                    description,
                    created_at
                )
                SELECT
                    source,
                    target,
                    'related_to',
                    '',
                    created_at
                FROM connections;

                DROP TABLE connections;

                ALTER TABLE connections_new
                RENAME TO connections;

                CREATE INDEX idx_connections_target
                ON connections(target);
            ",
            kind: MigrationKind::Up,
        }
    ];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations("sqlite:youniverse.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
