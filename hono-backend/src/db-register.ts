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