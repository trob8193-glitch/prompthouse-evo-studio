import Database from 'better-sqlite3';
import path from 'path';

try {
  const DB_PATH = path.resolve('./prompthouse.db');
  console.log('Opening database at:', DB_PATH);
  const db = new Database(DB_PATH, { fileMustExist: true });

  const ledgerStats = db.prepare('SELECT SUM(iq_gain) as total_gain, COUNT(*) as action_count FROM sovereign_ledger').get();
  console.log('LEDGER_STATS:', JSON.stringify(ledgerStats));

  const allRows = db.prepare('SELECT * FROM sovereign_ledger ORDER BY timestamp DESC LIMIT 10').all();
  console.log('LATEST_ROWS:', JSON.stringify(allRows, null, 2));

  // Let's also check total marketplace listings and users
  const listingsCount = db.prepare('SELECT COUNT(*) as count FROM marketplace_listings').get().count;
  const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  console.log('OTHER_METRICS:', JSON.stringify({ listingsCount, usersCount }));
} catch (err) {
  console.error('Database query failed:', err.message);
}
