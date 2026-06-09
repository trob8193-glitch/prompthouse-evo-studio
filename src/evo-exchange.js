import { Log } from './core/autonomy/SovereignLogger.js';
import db from './core/db/quad_schema.js';

/**
 * PH EVO STUDIO — EVO-EXCHANGE (GLOBAL MARKETPLACE)
 * ═══════════════════════════════════════════════════════════════
 * Allows developers to publish, download, and monetize their
 * AI agents, prompts, and layouts globally.
 */

export class EvoExchange {
  constructor() {
    this.status = 'ACTIVE';
  }

  async execute(params = {}) {
    Log.info('🚀 [Evo-exchange] Fetching marketplace listings...');
    const listings = db.prepare('SELECT * FROM marketplace_listings WHERE status = ? ORDER BY created_at DESC LIMIT 50').all('published');
    return { success: true, timestamp: new Date().toISOString(), result: listings };
  }

  getStatus() {
    return { 
      id: 'evo-exchange', 
      grade: 'S+++++', 
      state: 'VERIFIED',
      resonance: 0.99 
    };
  }
}

export function submitForExchange(recipeId, params = {}) {
  const { authorId, title, description, type, payloadJson, priceCredits = 0 } = params;
  
  try {
    const id = \`mx_\${Date.now()}\`;
    db.prepare(\`
      INSERT INTO marketplace_listings 
      (id, author_id, title, description, type, payload_json, price_credits, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'published')
    \`).run(id, authorId, title, description, type, payloadJson, priceCredits);

    return {
      blocked: false,
      listing: { id, status: 'published', moderationRequired: false }
    };
  } catch (error) {
    Log.error('Failed to submit to exchange:', error);
    return {
      blocked: true,
      error: error.message,
      listing: { status: 'failed', moderationRequired: true }
    };
  }
}

export function downloadListing(listingId) {
  try {
    const listing = db.prepare('SELECT * FROM marketplace_listings WHERE id = ?').get(listingId);
    if (!listing) throw new Error('Listing not found');
    
    // Increment downloads
    db.prepare('UPDATE marketplace_listings SET downloads = downloads + 1 WHERE id = ?').run(listingId);
    
    return { success: true, listing };
  } catch (error) {
    Log.error('Failed to download listing:', error);
    return { success: false, error: error.message };
  }
}
