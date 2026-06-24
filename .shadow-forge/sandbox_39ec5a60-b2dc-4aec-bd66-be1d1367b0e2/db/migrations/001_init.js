export function up(db) { db.exec('CREATE TABLE IF NOT EXISTS migrations (id TEXT PRIMARY KEY, run_at DATETIME DEFAULT CURRENT_TIMESTAMP)'); }
