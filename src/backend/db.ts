import Database from "better-sqlite3";
import path from "path";
import crypto from "crypto";

/*  ================================================================
    AUTH DATABASE — Stores ONLY authentication credentials.
    No skin data. No photos. No journal entries. No routines.
    This is the only server-side storage in the entire app.
    ================================================================ */

const DB_PATH = path.join(process.cwd(), "data", "auth.db");

let db: Database.Database;

function getDb() {
  if (!db) {
    // Ensure data directory exists
    const fs = require("fs");
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    // Create tables
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

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_verification ON users(verification_token);
    `);

    // Add lockout columns (safe to run on existing DB — ignores if already exist)
    try {
      db.exec(`ALTER TABLE users ADD COLUMN failed_attempts INTEGER DEFAULT 0`);
    } catch { /* column already exists */ }
    try {
      db.exec(`ALTER TABLE users ADD COLUMN locked_until INTEGER DEFAULT 0`);
    } catch { /* column already exists */ }

    // Add password reset columns
    try {
      db.exec(`ALTER TABLE users ADD COLUMN reset_token TEXT`);
    } catch { /* column already exists */ }
    try {
      db.exec(`ALTER TABLE users ADD COLUMN reset_expires INTEGER`);
    } catch { /* column already exists */ }
    try {
      db.exec(`ALTER TABLE users ADD COLUMN token_version INTEGER DEFAULT 0`);
    } catch { /* column already exists */ }

    // Case-insensitive uniqueness on username. Wrapped in try/catch so an
    // existing DB with two same-letter usernames in different cases doesn't
    // crash startup — the constraint will simply not be added until the
    // collision is resolved manually.
    try {
      db.exec(
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_nocase
         ON users(username COLLATE NOCASE)`,
      );
    } catch (err) {
      console.warn(
        "[auth-db] Could not create case-insensitive username index:",
        (err as Error).message,
      );
    }

    db.exec(
      `CREATE INDEX IF NOT EXISTS idx_users_reset ON users(reset_token)`,
    );
  }
  return db;
}

/* ---- Types ---- */

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  email_verified: number;
  verification_token: string | null;
  verification_expires: number | null;
  failed_attempts: number;
  locked_until: number;
  reset_token: string | null;
  reset_expires: number | null;
  token_version: number;
  created_at: number;
  updated_at: number;
}

/* ---- Queries ---- */

export function createUser(
  username: string,
  email: string,
  passwordHash: string,
  verificationToken: string,
): User {
  const d = getDb();
  const id = crypto.randomUUID();
  const now = Date.now();
  const expires = now + 24 * 60 * 60 * 1000; // 24 hours

  d.prepare(`
    INSERT INTO users (id, username, email, password_hash, verification_token, verification_expires, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, username, email.toLowerCase(), passwordHash, verificationToken, expires, now, now);

  return findUserById(id)!;
}

export function findUserByEmail(email: string): User | null {
  const d = getDb();
  return d.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as User | null;
}

export function findUserByUsername(username: string): User | null {
  const d = getDb();
  return d
    .prepare("SELECT * FROM users WHERE username = ? COLLATE NOCASE")
    .get(username) as User | null;
}

export function findUserById(id: string): User | null {
  const d = getDb();
  return d.prepare("SELECT * FROM users WHERE id = ?").get(id) as User | null;
}

export function findUserByVerificationToken(token: string): User | null {
  const d = getDb();
  return d.prepare("SELECT * FROM users WHERE verification_token = ?").get(token) as User | null;
}

export function verifyUser(id: string): void {
  const d = getDb();
  d.prepare(`
    UPDATE users SET email_verified = 1, verification_token = NULL, verification_expires = NULL, updated_at = ?
    WHERE id = ?
  `).run(Date.now(), id);
}

export function updatePassword(id: string, passwordHash: string): void {
  const d = getDb();
  d.prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?").run(
    passwordHash,
    Date.now(),
    id,
  );
}

/* ---- Account Lockout ---- */

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/** Check if account is currently locked. Returns seconds remaining or 0. */
export function getAccountLockRemaining(user: User): number {
  if (user.failed_attempts < MAX_FAILED_ATTEMPTS) return 0;
  if (!user.locked_until) return 0;
  const remaining = user.locked_until - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

/** Record a failed login attempt. Locks account after MAX_FAILED_ATTEMPTS. */
export function recordFailedLogin(id: string): void {
  const d = getDb();
  const user = findUserById(id);
  if (!user) return;

  const attempts = (user.failed_attempts || 0) + 1;
  const lockedUntil = attempts >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCKOUT_DURATION_MS : 0;

  d.prepare(`
    UPDATE users SET failed_attempts = ?, locked_until = ?, updated_at = ? WHERE id = ?
  `).run(attempts, lockedUntil, Date.now(), id);
}

/** Reset failed attempts on successful login. */
export function resetFailedAttempts(id: string): void {
  const d = getDb();
  d.prepare(`
    UPDATE users SET failed_attempts = 0, locked_until = 0, updated_at = ? WHERE id = ?
  `).run(Date.now(), id);
}

/** Remove expired verification tokens (called periodically) */
export function cleanupExpiredTokens(): number {
  const d = getDb();
  const result = d.prepare(`
    UPDATE users
    SET verification_token = NULL, verification_expires = NULL, updated_at = ?
    WHERE verification_token IS NOT NULL
      AND verification_expires IS NOT NULL
      AND verification_expires < ?
  `).run(Date.now(), Date.now());
  return result.changes;
}

/** Generate a fresh verification token for an existing user */
export function resetVerificationToken(id: string, token: string): void {
  const d = getDb();
  const expires = Date.now() + 24 * 60 * 60 * 1000;
  d.prepare(`
    UPDATE users SET verification_token = ?, verification_expires = ?, updated_at = ?
    WHERE id = ?
  `).run(token, expires, Date.now(), id);
}

/* ---- Password reset ---- */

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

/** Set a password reset token for the user, valid for 1 hour. */
export function setResetToken(id: string, token: string): void {
  const d = getDb();
  const expires = Date.now() + RESET_TOKEN_TTL_MS;
  d.prepare(
    `UPDATE users SET reset_token = ?, reset_expires = ?, updated_at = ? WHERE id = ?`,
  ).run(token, expires, Date.now(), id);
}

export function findUserByResetToken(token: string): User | null {
  const d = getDb();
  return d
    .prepare("SELECT * FROM users WHERE reset_token = ?")
    .get(token) as User | null;
}

/**
 * Apply a new password after a successful reset. Clears the reset token,
 * resets failed-attempt counters, and bumps token_version so any existing
 * JWTs for this user are invalidated.
 */
export function applyPasswordReset(id: string, passwordHash: string): void {
  const d = getDb();
  d.prepare(
    `UPDATE users
     SET password_hash = ?,
         reset_token = NULL,
         reset_expires = NULL,
         failed_attempts = 0,
         locked_until = 0,
         token_version = COALESCE(token_version, 0) + 1,
         updated_at = ?
     WHERE id = ?`,
  ).run(passwordHash, Date.now(), id);
}

/** Remove expired reset tokens. */
export function cleanupExpiredResetTokens(): number {
  const d = getDb();
  const result = d
    .prepare(
      `UPDATE users
       SET reset_token = NULL, reset_expires = NULL, updated_at = ?
       WHERE reset_token IS NOT NULL
         AND reset_expires IS NOT NULL
         AND reset_expires < ?`,
    )
    .run(Date.now(), Date.now());
  return result.changes;
}
