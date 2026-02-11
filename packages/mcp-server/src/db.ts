import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "..", "..", "..", "design-system.db");

const db = new Database(DB_PATH, { readonly: true });
db.pragma("journal_mode = WAL");

export default db;
