import Database from 'better-sqlite3'

const db = new Database('register-db.db')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    username TEXT,
    password TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch())
  )  
`)
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

  try {
  db.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`)
} catch (e) {
  // stlpec uz existuje, ignoruj
}


export default db