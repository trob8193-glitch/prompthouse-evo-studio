/**
 * PH EVO STUDIO — Auth Service
 * JWT-based authentication with bcrypt password hashing.
 * Stores users in SQLite. Works without Clerk.
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(process.cwd(), '.prompthouse-data', 'users.db');
const JWT_SECRET = process.env.JWT_SECRET || 'ph-evo-studio-jwt-secret-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

let _db = null;

function getDb() {
  if (_db) return _db;
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  _db = new Database(DB_PATH);
  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      plan TEXT DEFAULT 'free',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      subscription_status TEXT DEFAULT 'inactive',
      created_at TEXT DEFAULT (datetime('now')),
      last_login TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);
  return _db;
}

function generateId() {
  return `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function registerUser(email, password) {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    throw new Error('An account with this email already exists.');
  }
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);
  const id = generateId();
  db.prepare(`
    INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)
  `).run(id, email.toLowerCase().trim(), hash);
  const user = db.prepare('SELECT id, email, plan, subscription_status, created_at FROM users WHERE id = ?').get(id);
  const token = signToken(user);
  return { user, token };
}

export async function loginUser(email, password) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!row) throw new Error('Invalid email or password.');
  const valid = await bcrypt.compare(password, row.password_hash);
  if (!valid) throw new Error('Invalid email or password.');
  db.prepare('UPDATE users SET last_login = datetime("now") WHERE id = ?').run(row.id);
  const user = { id: row.id, email: row.email, plan: row.plan, subscription_status: row.subscription_status };
  const token = signToken(user);
  return { user, token };
}

export function getUserById(id) {
  const db = getDb();
  return db.prepare('SELECT id, email, plan, subscription_status, stripe_customer_id FROM users WHERE id = ?').get(id);
}

export function getUserByEmail(email) {
  const db = getDb();
  return db.prepare('SELECT id, email, plan, subscription_status, stripe_customer_id FROM users WHERE email = ?').get(email.toLowerCase().trim());
}

export function updateUserSubscription(userId, { plan, stripeCustomerId, stripeSubscriptionId, subscriptionStatus }) {
  const db = getDb();
  db.prepare(`
    UPDATE users
    SET plan = COALESCE(?, plan),
        stripe_customer_id = COALESCE(?, stripe_customer_id),
        stripe_subscription_id = COALESCE(?, stripe_subscription_id),
        subscription_status = COALESCE(?, subscription_status)
    WHERE id = ?
  `).run(plan || null, stripeCustomerId || null, stripeSubscriptionId || null, subscriptionStatus || null, userId);
}

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, plan: user.plan },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
