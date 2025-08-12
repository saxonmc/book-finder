import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Create data directory if it doesn't exist
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'book_finder.db');
const db = new Database(dbPath);

console.log('Setting up database...');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at INTEGER,
    updated_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT UNIQUE,
    description TEXT,
    cover_image TEXT,
    published_date INTEGER,
    genre TEXT,
    page_count INTEGER,
    rating INTEGER,
    created_at INTEGER,
    updated_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS user_books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    book_id TEXT NOT NULL,
    title TEXT,
    author TEXT,
    cover_image TEXT,
    isbn TEXT,
    status TEXT NOT NULL DEFAULT 'want_to_read',
    rating INTEGER,
    notes TEXT,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    book_id TEXT NOT NULL,
    rating INTEGER NOT NULL,
    review TEXT,
    helpful_votes INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS review_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    is_helpful INTEGER NOT NULL,
    created_at INTEGER,
    FOREIGN KEY (review_id) REFERENCES reviews (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS user_memberships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    service TEXT NOT NULL,
    membership_type TEXT NOT NULL,
    price TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    start_date INTEGER,
    end_date INTEGER,
    notes TEXT,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

console.log('Database setup complete!');
console.log('Tables created: users, books, user_books, reviews, review_votes, user_memberships');

db.close(); 