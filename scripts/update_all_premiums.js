import Database from 'better-sqlite3';
import path from 'path';

try {
  const DB_PATH = path.resolve('prompthouse.db');
  const db = new Database(DB_PATH, { fileMustExist: true });

  const timestamp = new Date().toISOString();

  // 1. Update store products (Stripe premium dollar products)
  const storeUpdates = [
    {
      id: 'ph_evo_studio_license',
      name: 'PromptHouse Evo Studio License (Pro)',
      description: 'Production-grade local studio runtime with advanced bridge routing, E2E playbooks, and full audit surfaces.',
      price_cents: 9900, // $99.00 (up from $49.00)
    },
    {
      id: 'ph_promptshell_backend_pack',
      name: 'PromptShell Backend Pack (Enterprise)',
      description: 'Production-ready SDK interfaces, SQLite tethers, context managers, and cryptographic proof chains for high-volume enterprise operations.',
      price_cents: 19900, // $199.00 (up from $99.00)
    },
    {
      id: 'ph_global_node_hub_pack',
      name: 'Evo Global Node Hub Pack (Sovereign)',
      description: 'Decentralized contribution-node cluster tethers with cryptographically signed evolutionary training streams and federated LLM telemetry.',
      price_cents: 29900, // $299.00 (up from $149.00)
    }
  ];

  const updateStoreStmt = db.prepare(`
    UPDATE store_products 
    SET name = ?, description = ?, price_cents = ?, updated_at = ? 
    WHERE id = ?
  `);

  for (const prod of storeUpdates) {
    updateStoreStmt.run(prod.name, prod.description, prod.price_cents, timestamp, prod.id);
    console.log(`Updated Store Product: "${prod.name}" -> $${(prod.price_cents / 100).toFixed(2)}`);
  }

  // 2. Update premium marketplace listings (Credits-based products)
  const marketplaceUpdates = [
    {
      id: 'mx_shadow_dome_gateway',
      title: 'Shadow-Dome API Gateway Router (Premium)',
      price_credits: 299 // up from 199
    },
    {
      id: 'mx_evo_sentinel_pro',
      title: 'Evo Sentinel Pro (Runtime Watchdog - Premium)',
      price_credits: 249 // up from 149
    },
    {
      id: 'mx_oracle_vector_connector',
      title: 'Oracle Vector Memory Connector (Premium)',
      price_credits: 149 // up from 99
    },
    {
      id: 'mx_crucible_optimizer',
      title: 'Crucible Memory & State Optimizer (Premium)',
      price_credits: 119 // up from 79
    }
  ];

  const updateMarketplaceStmt = db.prepare(`
    UPDATE marketplace_listings 
    SET title = ?, price_credits = ? 
    WHERE id = ?
  `);

  for (const item of marketplaceUpdates) {
    updateMarketplaceStmt.run(item.title, item.price_credits, item.id);
    console.log(`Updated Marketplace Premium: "${item.title}" -> ${item.price_credits} credits`);
  }

  console.log('Successfully completed premium updates.');

} catch (err) {
  console.error('Error:', err.message);
}
