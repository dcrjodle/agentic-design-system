import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "..", "..", "..", "design-system.db");

export const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS components (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT DEFAULT 'general',
    description TEXT,
    code TEXT NOT NULL,
    usage TEXT,
    layout TEXT,
    tokens TEXT,
    props TEXT,
    figma_url TEXT,
    storybook_url TEXT,
    preview_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS components_fts USING fts5(
    name, category, description, usage, content=components, content_rowid=rowid
  );

  CREATE TRIGGER IF NOT EXISTS components_ai AFTER INSERT ON components BEGIN
    INSERT INTO components_fts(rowid, name, category, description, usage)
    VALUES (new.rowid, new.name, new.category, new.description, new.usage);
  END;

  CREATE TRIGGER IF NOT EXISTS components_ad AFTER DELETE ON components BEGIN
    INSERT INTO components_fts(components_fts, rowid, name, category, description, usage)
    VALUES ('delete', old.rowid, old.name, old.category, old.description, old.usage);
  END;

  CREATE TRIGGER IF NOT EXISTS components_au AFTER UPDATE ON components BEGIN
    INSERT INTO components_fts(components_fts, rowid, name, category, description, usage)
    VALUES ('delete', old.rowid, old.name, old.category, old.description, old.usage);
    INSERT INTO components_fts(rowid, name, category, description, usage)
    VALUES (new.rowid, new.name, new.category, new.description, new.usage);
  END;
`);

export default db;
