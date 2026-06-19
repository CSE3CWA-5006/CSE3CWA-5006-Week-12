// database.js — opens the SQLite database with Node's built-in node:sqlite.
// No native build step and no database server: perfect for a teaching project.
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const DB_PATH = join(process.cwd(), 'data', 'careerloop.db');
mkdirSync(join(process.cwd(), 'data'), { recursive: true });

function open() {
  const connection = new DatabaseSync(DB_PATH);
  connection.exec('PRAGMA foreign_keys = ON;'); // enforce table relationships
  return connection;
}

// Reuse ONE connection across Next.js hot reloads in development.
export const db = globalThis.__careerloopDb ?? (globalThis.__careerloopDb = open());

// Re-create every table from schema.sql. Only the seed script calls this.
export function applySchema() {
  db.exec(readFileSync(join(process.cwd(), 'lib', 'db', 'schema.sql'), 'utf8'));
}
