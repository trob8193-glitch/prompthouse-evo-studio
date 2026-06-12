import Database from 'better-sqlite3';
import path from 'path';

try {
  const DB_PATH = path.resolve('prompthouse.db');
  const db = new Database(DB_PATH, { fileMustExist: true });

  const totalListings = db.prepare('SELECT COUNT(*) as cnt FROM marketplace_listings').get().cnt;
  const pricedListings = db.prepare('SELECT COUNT(*) as cnt FROM marketplace_listings WHERE price_credits > 0').get().cnt;
  const downloadedListings = db.prepare('SELECT COUNT(*) as cnt FROM marketplace_listings WHERE downloads > 0').get().cnt;
  const totalDownloads = db.prepare('SELECT SUM(downloads) as total FROM marketplace_listings').get().total || 0;

  console.log('Marketplace Stats:');
  console.log(`Total Listings: ${totalListings}`);
  console.log(`Priced Listings (>0 credits): ${pricedListings}`);
  console.log(`Downloaded Listings: ${downloadedListings}`);
  console.log(`Total Downloads: ${totalDownloads}`);

  if (pricedListings > 0) {
    const samples = db.prepare('SELECT id, title, price_credits, downloads FROM marketplace_listings WHERE price_credits > 0 LIMIT 5').all();
    console.log('Sample priced listings:', samples);
  }

} catch (err) {
  console.error('Error:', err.message);
}
