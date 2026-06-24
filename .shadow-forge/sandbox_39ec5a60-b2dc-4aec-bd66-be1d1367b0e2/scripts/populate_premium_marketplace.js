import Database from 'better-sqlite3';
import path from 'path';

try {
  const DB_PATH = path.resolve('prompthouse.db');
  const db = new Database(DB_PATH, { fileMustExist: true });

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const premiumProducts = [
    {
      id: 'mx_evo_sentinel_pro',
      author_id: 'studio_owner',
      title: 'Evo Sentinel Pro (Runtime Watchdog)',
      description: 'Advanced real-time watchdogs for catching system drift, CSS regressions, and security tethers on self-evolution cycles.',
      type: 'recipe',
      payload_json: JSON.stringify({
        recipeId: 'evo_sentinel_pro',
        name: 'Evo Sentinel Pro',
        marketplacePolicyAccepted: true,
        candidateScore: 100,
        frictionScore: 0,
        tags: ['sentinel', 'watchdog', 'security']
      }),
      price_credits: 149,
      downloads: 12,
      status: 'published'
    },
    {
      id: 'mx_shadow_dome_gateway',
      author_id: 'studio_owner',
      title: 'Shadow-Dome API Gateway Router',
      description: 'A fully isolated backend wrapper that secures model context protocol connections and routes API keys under sandbox-safe protocols.',
      type: 'recipe',
      payload_json: JSON.stringify({
        recipeId: 'shadow_dome_gateway',
        name: 'Shadow-Dome API Gateway',
        marketplacePolicyAccepted: true,
        candidateScore: 100,
        frictionScore: 0,
        tags: ['gateway', 'security', 'sandbox']
      }),
      price_credits: 199,
      downloads: 8,
      status: 'published'
    },
    {
      id: 'mx_oracle_vector_connector',
      author_id: 'studio_owner',
      title: 'Oracle Vector Memory Connector',
      description: 'High-speed local vector memory client that syncs your Studio knowledge base with external databases.',
      type: 'recipe',
      payload_json: JSON.stringify({
        recipeId: 'oracle_vector_connector',
        name: 'Oracle Vector Memory Connector',
        marketplacePolicyAccepted: true,
        candidateScore: 100,
        frictionScore: 0,
        tags: ['memory', 'vector', 'database']
      }),
      price_credits: 99,
      downloads: 24,
      status: 'published'
    },
    {
      id: 'mx_crucible_optimizer',
      author_id: 'studio_owner',
      title: 'Crucible Memory & State Optimizer',
      description: 'Memory cleanup daemon that purges redundant temp tables, compresses JSON logs, and keeps your sqlite DB performant.',
      type: 'recipe',
      payload_json: JSON.stringify({
        recipeId: 'crucible_optimizer',
        name: 'Crucible Memory Optimizer',
        marketplacePolicyAccepted: true,
        candidateScore: 100,
        frictionScore: 0,
        tags: ['optimizer', 'crucible', 'db']
      }),
      price_credits: 79,
      downloads: 31,
      status: 'published'
    }
  ];

  const insertStmt = db.prepare(`
    INSERT INTO marketplace_listings (id, author_id, title, description, type, payload_json, price_credits, downloads, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      payload_json = excluded.payload_json,
      price_credits = excluded.price_credits,
      downloads = excluded.downloads,
      status = excluded.status
  `);

  for (const product of premiumProducts) {
    insertStmt.run(
      product.id,
      product.author_id,
      product.title,
      product.description,
      product.type,
      product.payload_json,
      product.price_credits,
      product.downloads,
      product.status,
      timestamp
    );
    console.log(`Inserted/Updated premium product: "${product.title}" -> ${product.price_credits} credits`);
  }

  console.log('Premium marketplace initialization complete.');

} catch (err) {
  console.error('Error:', err.message);
}
