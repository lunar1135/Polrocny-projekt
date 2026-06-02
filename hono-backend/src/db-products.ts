import Database from 'better-sqlite3'

const db = new Database('products-db.db')

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    image TEXT,
    stock INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch())
  )
`)

export default db