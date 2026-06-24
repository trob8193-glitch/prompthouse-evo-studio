import Database from 'better-sqlite3';
import path from 'path';

try {
  const DB_PATH = path.resolve('prompthouse.db');
  const db = new Database(DB_PATH, { fileMustExist: true });

  const listings = db.prepare('SELECT id, title, type, price_credits FROM marketplace_listings').all();
  console.log(`Found ${listings.length} listings in marketplace.`);

  const updateStmt = db.prepare('UPDATE marketplace_listings SET price_credits = ? WHERE id = ?');

  let updatedCount = 0;
  for (const listing of listings) {
    let price = 25; // default basic price
    
    const type = (listing.type || '').toLowerCase();
    const title = (listing.title || '').toLowerCase();

    if (type === 'recipe') {
      price = 49;
    } else if (type === 'capsule' || type === 'bot') {
      price = 99;
    } else if (type === 'manifest' || type === 'suite') {
      price = 149;
    }

    // Adjust based on title keyword
    if (title.includes('advanced') || title.includes('pro') || title.includes('core')) {
      price += 50;
    } else if (title.includes('test') || title.includes('simulated') || title.includes('bypassed')) {
      price = 5; // keep cheap testing items cheap
    }

    updateStmt.run(price, listing.id);
    updatedCount++;
    console.log(`Updated "${listing.title}" (${listing.type}) -> ${price} credits`);
  }

  console.log(`Successfully updated ${updatedCount} marketplace listings to premium non-zero credit values.`);

} catch (err) {
  console.error('Error:', err.message);
}
