import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { DatabaseSchema } from './schema.js';

// Ensure data directory exists
const dataDir = process.env.DATA_DIRECTORY || './data';
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`Created data directory: ${dataDir}`);
}

const databasePath = path.join(dataDir, 'database.sqlite');
console.log(`Database path: ${databasePath}`);

const sqliteDb = new Database(databasePath);

// Enable foreign keys
sqliteDb.pragma('foreign_keys = ON');

// Initialize tables if they don't exist
sqliteDb.exec(`
  CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    order_position INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS coffee_purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participant_id INTEGER NOT NULL,
    purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participant_id) REFERENCES participants(id)
  );
`);

// Check if we need to add order_position column (for existing databases)
try {
  const tableInfo = sqliteDb.prepare("PRAGMA table_info(participants)").all();
  const hasOrderPosition = tableInfo.some(col => col.name === 'order_position');
  
  if (!hasOrderPosition) {
    console.log('Adding order_position column to existing participants table');
    sqliteDb.exec('ALTER TABLE participants ADD COLUMN order_position INTEGER DEFAULT 0');
    sqliteDb.exec('UPDATE participants SET order_position = id WHERE order_position = 0');
  }
} catch (error) {
  console.log('Table schema check/update completed');
}

export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({
    database: sqliteDb,
  }),
  log: ['query', 'error']
});

console.log('Database connection established');
