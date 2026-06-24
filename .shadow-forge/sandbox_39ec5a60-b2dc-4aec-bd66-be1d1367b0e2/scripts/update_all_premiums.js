import Database from 'better-sqlite3';
import path from 'path';

try {
  const DB_PATH = path.resolve('prompthouse.db');
  const db = new Database(DB_PATH, { fileMustExist: true });

  const timestamp = new Date().toISOString();

  // 1. Update store products (Stripe premium dollar products)
  const storeUpdates = [
    {
      id: 'ph_evo_studio_education',
      name: 'Evo Studio: Education License',
      description: 'The Student tier. Unlocks Sanctuary Mode and Canon Memory for guided, stress-free learning environments.',
      price_cents: 1900, // $19.00
    },
    {
      id: 'ph_evo_studio_freelance',
      name: 'Evo Studio: Freelancer License',
      description: 'The Solo tier. Unlocks Rapid Deploy and Client Handover tools to ship products lightning fast.',
      price_cents: 2900, // $29.00
    },
    {
      id: 'ph_evo_studio_prosumer',
      name: 'Evo Studio: Prosumer License',
      description: 'The 10x Founders tier. Unlocks Tridall Pattern Engine, Merge Court, and Command Deck for rapid MVP generation and monetization tracking.',
      price_cents: 4900, // $49.00
    },
    {
      id: 'ph_evo_studio_agency',
      name: 'Evo Studio: Agency License',
      description: 'The Creative tier. Unlocks Reality Synthesis and UI Evolution. Allows the studio to metamorphosize into branded design systems.',
      price_cents: 14900, // $149.00
    },
    {
      id: 'ph_evo_studio_gaming',
      name: 'Evo Studio: Game Developer License',
      description: 'The AAA Studio tier. Unlocks Spatial Architecture and Sovereign Physics to turn the IDE into a 3D computational node.',
      price_cents: 24900, // $249.00
    },
    {
      id: 'ph_evo_studio_enterprise',
      name: 'Evo Studio: Enterprise License',
      description: 'The SRE tier. Unlocks Local Fine Tuner, Mainframe Connector, and AutoRepair. The studio autonomously fixes its own exceptions.',
      price_cents: 49900, // $499.00
    },
    {
      id: 'ph_evo_studio_finance',
      name: 'Evo Studio: Quant Finance License',
      description: 'The Wall Street tier. Unlocks Memory Profiler and Latency Auditor for high-frequency trading logic optimization.',
      price_cents: 89900, // $899.00
    },
    {
      id: 'ph_evo_studio_healthcare',
      name: 'Evo Studio: BioTech & Healthcare License',
      description: 'The Medical tier. Unlocks HIPAA Compliance, Biometric Encryption, and Medical Data Scrubbing for strict patient data privacy.',
      price_cents: 149900, // $1,499.00
    },
    {
      id: 'ph_evo_studio_web3',
      name: 'Evo Studio: Web3 & Crypto License',
      description: 'The Blockchain tier. Unlocks Smart Contract Auditor and Zero Knowledge Proof Generation for bulletproof DeFi protocols.',
      price_cents: 39900, // $399.00
    },
    {
      id: 'ph_evo_studio_ecommerce',
      name: 'Evo Studio: E-Commerce & Retail License',
      description: 'The Retail tier. Unlocks Conversion Optimizer and Payment Gateway Synthesizer for high-throughput storefronts.',
      price_cents: 9900, // $99.00
    },
    {
      id: 'ph_evo_studio_hardware',
      name: 'Evo Studio: Hardware & IoT License',
      description: 'The IoT tier. Unlocks Firmware Compiler and Edge Device Sync for embedded systems and sensor arrays.',
      price_cents: 19900, // $199.00
    },
    {
      id: 'ph_evo_studio_automotive',
      name: 'Evo Studio: Autonomous Vehicles License',
      description: 'The Mobility tier. Unlocks Sensor Fusion Matrix and Real-time ROS Bridge for self-driving logic processing.',
      price_cents: 129900, // $1,299.00
    },
    {
      id: 'ph_evo_studio_legal',
      name: 'Evo Studio: LegalTech License',
      description: 'The Legal tier. Unlocks Contract Parser, Regulatory Auditor, and Immutable Audit Trail for compliance generation.',
      price_cents: 69900, // $699.00
    },
    {
      id: 'ph_evo_studio_seed',
      name: 'Evo Studio: Seed/Investor License',
      description: 'The VC tier. Unlocks Venture Pitch Deck Gen, Due Diligence Packager, and Investor Data Room to automate venture capital fundraising and secure term sheets.',
      price_cents: 999900, // $9,999.00
    },
    {
      id: 'ph_evo_studio_acquisition',
      name: 'Evo Studio: M&A Acquisition License',
      description: 'The Exit tier. Unlocks Codebase Valuator, Exit Strategy Simulator, and IP Transfer Protocol to prepare the entire architecture for a multi-million dollar buyout.',
      price_cents: 2499900, // $24,999.00
    },
    {
      id: 'ph_evo_studio_syndicate',
      name: 'Evo Studio: Syndicate & Hedge Fund License',
      description: 'The Whale tier. Unlocks B2B License Distributor, Hedge Fund Synthesizer, and Automated Wealth Gen for massive systemic distribution and monetization.',
      price_cents: 9999900, // $99,999.00
    },
    {
      id: 'ph_evo_studio_sovereign',
      name: 'Evo Studio: Sovereign License',
      description: 'The AI Labs tier. Unlocks Prompt Genome, Vector Memory, and Proof Vault for tracking elite developer trajectories and genetic drift.',
      price_cents: 199900, // $1,999.00
    },
    {
      id: 'ph_evo_studio_defense',
      name: 'Evo Studio: Defense & Aerospace License',
      description: 'The Airgapped tier. Unlocks Airgapped Firewall and Strict Compliance modules. No external network requests permitted.',
      price_cents: 499900, // $4,999.00
    }
  ];

  const updateStoreStmt = db.prepare(`
    INSERT INTO store_products (id, name, description, price_cents, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    description = excluded.description,
    price_cents = excluded.price_cents,
    updated_at = excluded.updated_at
  `);

  for (const prod of storeUpdates) {
    updateStoreStmt.run(prod.id, prod.name, prod.description, prod.price_cents, timestamp);
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
