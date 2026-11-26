import sqlite3
import re
from pathlib import Path

rust_code = Path("src-tauri/src/lib.rs").read_text()

def get_migration(version):
    pattern = (
        rf'version:\s*{version},'
        r'\s*description:\s*"[^"]+",'
        r'\s*sql:\s*"([^"]+)"'
    )

    match = re.search(pattern, rust_code)

    assert match, f"Migration {version} not found"

    return match.group(1)

db = sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys = ON")

for version in range(1, 5):
    db.executescript(get_migration(version))

for thought_id in ["A", "B", "C"]:
    db.execute(
        """
        INSERT INTO thoughts (id, title, x, y, z, color)
        VALUES (?, ?, 0, 0, 0, '#a78bfa')
        """,
        (thought_id, thought_id)
    )

db.execute(
    """
    INSERT INTO connections (source, target, created_at)
    VALUES ('A', 'B', '2026-01-01 12:00:00')
    """
)

db.commit()

db.executescript(get_migration(5))

print("PASS: Migration 5 executed")

row = db.execute(
    """
    SELECT source, target, relationship_type,
           description, created_at
    FROM connections
    """
).fetchone()

assert row == (
    "A", "B", "related_to", "",
    "2026-01-01 12:00:00"
)

print("PASS: Existing relationship preserved")

assert db.execute(
    "SELECT COUNT(*) FROM thoughts"
).fetchone()[0] == 3

print("PASS: Existing thoughts preserved")

def insert(source, target, relationship_type):
    db.execute(
        """
        INSERT INTO connections
        (source, target, relationship_type)
        VALUES (?, ?, ?)
        """,
        (source, target, relationship_type)
    )

insert("A", "B", "explains")
insert("A", "B", "prerequisite_for")
insert("B", "A", "explains")

print("PASS: Multiple relationships supported")
print("PASS: Directional relationships preserved")

def expect_rejection(source, target, relationship_type):
    try:
        insert(source, target, relationship_type)
    except sqlite3.IntegrityError:
        return

    raise AssertionError(
        f"Invalid relationship accepted: "
        f"{source}, {target}, {relationship_type}"
    )

expect_rejection("A", "B", "explains")
print("PASS: Duplicate relationships rejected")

expect_rejection("B", "A", "related_to")
print("PASS: Symmetric ordering enforced")

expect_rejection("A", "A", "explains")
print("PASS: Self-connections rejected")

expect_rejection("A", "B", "invalid_type")
print("PASS: Invalid relationship types rejected")

expect_rejection("A", "missing", "explains")
print("PASS: Foreign key constraints enforced")

db.execute(
    """
    UPDATE connections
    SET description = 'Test explanation'
    WHERE source = 'A'
      AND target = 'B'
      AND relationship_type = 'explains'
    """
)

assert db.execute(
    """
    SELECT description FROM connections
    WHERE source = 'A'
      AND target = 'B'
      AND relationship_type = 'explains'
    """
).fetchone()[0] == "Test explanation"

print("PASS: Relationship explanation updated")

db.execute(
    """
    DELETE FROM connections
    WHERE source = 'A'
      AND target = 'B'
      AND relationship_type = 'explains'
    """
)

assert db.execute(
    "SELECT COUNT(*) FROM connections"
).fetchone()[0] == 3

print("PASS: Individual relationship deleted")

db.execute("DELETE FROM thoughts WHERE id = 'B'")

assert db.execute(
    "SELECT COUNT(*) FROM connections"
).fetchone()[0] == 0

print("PASS: Cascading relationship deletion")

assert db.execute(
    "PRAGMA integrity_check"
).fetchone()[0] == "ok"

assert db.execute(
    "PRAGMA foreign_key_check"
).fetchall() == []

print("PASS: Database integrity")

db.close()

print("\nAll migration tests passed.")
