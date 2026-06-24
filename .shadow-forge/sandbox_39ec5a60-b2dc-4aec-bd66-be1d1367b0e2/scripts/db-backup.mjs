#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const DB_PATH = path.join(process.cwd(), '.prompthouse-data', 'prompthouse.db');
const BACKUP_DIR = path.join(process.cwd(), '.prompthouse-data', 'backups');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(BACKUP_DIR, `db-backup-${timestamp}.sqlite`);

console.log(`Starting database backup of ${DB_PATH}...`);

try {
  // Use sqlite3 command-line tool if available to do safe backup
  try {
    execSync(`sqlite3 "${DB_PATH}" ".backup '${backupPath}'"`);
    console.log(`✅ Backup completed via sqlite3 tool: ${backupPath}`);
  } catch {
    // Fallback to simple copy if sqlite3 CLI isn't installed
    console.log(`sqlite3 CLI not found. Falling back to fs copy...`);
    fs.copyFileSync(DB_PATH, backupPath);
    console.log(`✅ Backup completed via file copy: ${backupPath}`);
  }

  // Prune old backups (keep last 7)
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('db-backup-') && f.endsWith('.sqlite'))
    .map(f => ({ name: f, path: path.join(BACKUP_DIR, f), time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime() }))
    .sort((a, b) => b.time - a.time);

  if (backups.length > 7) {
    console.log(`Pruning ${backups.length - 7} old backup(s)...`);
    for (let i = 7; i < backups.length; i++) {
      fs.unlinkSync(backups[i].path);
      console.log(`Deleted old backup: ${backups[i].name}`);
    }
  }

} catch (error) {
  console.error(`❌ Backup failed: ${error.message}`);
  process.exit(1);
}
