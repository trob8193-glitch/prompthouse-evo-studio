import Database from 'better-sqlite3';
import path from 'path';

try {
  const DB_PATH = path.resolve('prompthouse.db');
  const db = new Database(DB_PATH, { fileMustExist: true });

  const orders = db.prepare('SELECT * FROM store_orders').all();
  console.log('ALL ORDERS:');
  console.log(JSON.stringify(orders, null, 2));

} catch (err) {
  console.error('Error:', err.message);
}
