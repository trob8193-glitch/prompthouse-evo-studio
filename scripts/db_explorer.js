import Database from 'better-sqlite3';
import path from 'path';

try {
  const DB_PATH = path.resolve('prompthouse.db');
  console.log('Opening database at:', DB_PATH);
  const db = new Database(DB_PATH, { fileMustExist: true });

  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('TABLES:', tables);

  for (const table of tables) {
    const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
    console.log(`Table: ${table.name}`);
    console.log('Columns:', columns.map(c => `${c.name} (${c.type})`));
    
    // Check if there are rows
    const count = db.prepare(`SELECT COUNT(*) as cnt FROM ${table.name}`).get().cnt;
    console.log(`Count: ${count}`);
    if (count > 0) {
      const sample = db.prepare(`SELECT * FROM ${table.name} LIMIT 3`).all();
      console.log('Sample:', JSON.stringify(sample, null, 2));
    }
    console.log('-------------------');
  }
} catch (err) {
  console.error('Failed:', err.message);
}
