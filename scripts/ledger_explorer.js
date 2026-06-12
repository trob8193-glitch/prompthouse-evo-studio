import Database from 'better-sqlite3';
import path from 'path';

try {
  const DB_PATH = path.resolve('prompthouse.db');
  const db = new Database(DB_PATH, { fileMustExist: true });

  const count = db.prepare('SELECT COUNT(*) as cnt FROM sovereign_ledger').get().cnt;
  console.log('Total sovereign ledger entries:', count);

  const sumIq = db.prepare('SELECT SUM(iq_gain) as total FROM sovereign_ledger').get().total;
  console.log('Total IQ Gain:', sumIq);

  if (count > 0) {
    const first = db.prepare('SELECT * FROM sovereign_ledger ORDER BY timestamp ASC LIMIT 1').get();
    const last = db.prepare('SELECT * FROM sovereign_ledger ORDER BY timestamp DESC LIMIT 1').get();
    console.log('First ledger entry:', first);
    console.log('Last ledger entry:', last);
  }

  // Count by feature_id
  const features = db.prepare('SELECT feature_id, COUNT(*) as cnt, SUM(iq_gain) as total_iq FROM sovereign_ledger GROUP BY feature_id ORDER BY total_iq DESC').all();
  console.log('Metrics by Feature ID:');
  console.table(features);

} catch (err) {
  console.error('Error:', err.message);
}
