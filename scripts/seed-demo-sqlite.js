/*
 * Seeds a demo user into data/auth.db for video recording.
 * Idempotent: re-running updates the password hash but does not duplicate rows.
 *
 * Usage:
 *   node scripts/seed-demo-sqlite.js
 *
 * Then sign in as demo@unfilter.app / DemoUser2026!
 */

const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const DEMO_EMAIL = "demo@unfilter.app";
const DEMO_USERNAME = "demo";
const DEMO_PASSWORD = "DemoUser2026!";
const BCRYPT_ROUNDS = 12;

const DB_PATH = path.join(process.cwd(), "data", "auth.db");
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email_verified INTEGER DEFAULT 0,
    verification_token TEXT,
    verification_expires INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
`);

const cols = ["failed_attempts INTEGER DEFAULT 0", "locked_until INTEGER DEFAULT 0", "reset_token TEXT", "reset_expires INTEGER", "token_version INTEGER DEFAULT 0", "oauth_provider TEXT", "oauth_provider_id TEXT"];
for (const c of cols) {
  try { db.exec(`ALTER TABLE users ADD COLUMN ${c}`); } catch (_) { /* exists */ }
}

const hash = bcrypt.hashSync(DEMO_PASSWORD, BCRYPT_ROUNDS);
const now = Date.now();

const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(DEMO_EMAIL);
if (existing) {
  db.prepare(
    `UPDATE users SET password_hash = ?, email_verified = 1, failed_attempts = 0, locked_until = 0, updated_at = ? WHERE id = ?`,
  ).run(hash, now, existing.id);
  console.log(`Updated existing demo user (id=${existing.id})`);
} else {
  const id = crypto.randomUUID();
  db.prepare(
    `INSERT INTO users (id, username, email, password_hash, email_verified, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)`,
  ).run(id, DEMO_USERNAME, DEMO_EMAIL, hash, now, now);
  console.log(`Created demo user (id=${id})`);
}

console.log(`\nLogin:`);
console.log(`  email:    ${DEMO_EMAIL}`);
console.log(`  password: ${DEMO_PASSWORD}`);
console.log(`\nNext: open the app, log in, then paste scripts/seed-demo-browser.js into DevTools console.`);
