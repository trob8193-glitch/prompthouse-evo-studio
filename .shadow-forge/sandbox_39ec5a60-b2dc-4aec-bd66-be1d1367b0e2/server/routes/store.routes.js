import crypto from 'crypto';
import Stripe from 'stripe';

function hasDatabase(db) {
  return Boolean(db?.prepare && db?.exec);
}

function now() {
  return new Date().toISOString();
}

function safeJson(value, fallback = {}) {
  if (!value) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

function getStripeClient(injectedStripe) {
  if (injectedStripe) return injectedStripe;
  const key = process.env.STRIPE_SECRET_KEY || '';
  return key ? new Stripe(key) : null;
}

function getStripeTruthState(injectedStripe) {
  const key = process.env.STRIPE_SECRET_KEY || '';
  if (key.startsWith('sk_live_')) return 'STRIPE_LIVE_PROVIDER_READY';
  if (key.startsWith('sk_test_')) return 'STRIPE_TEST_PROVIDER_READY';
  if (injectedStripe) return 'STRIPE_PROVIDER_READY';
  return 'STRIPE_SECRET_KEY_REQUIRED';
}

function getBaseUrl() {
  return (
    process.env.PUBLIC_APP_URL ||
    process.env.APP_BASE_URL ||
    process.env.VITE_PUBLIC_APP_URL ||
    'http://localhost:5173'
  ).replace(/\/+$/, '');
}

function normalizeProduct(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    priceCents: Number(row.price_cents || 0),
    currency: row.currency || 'usd',
    kind: row.kind || 'digital',
    status: row.status || 'active',
    metadata: safeJson(row.metadata),
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
}

export function ensureStoreSchema(db) {
  if (!hasDatabase(db)) return false;
  db.exec(`
    CREATE TABLE IF NOT EXISTS store_products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price_cents INTEGER NOT NULL DEFAULT 0,
      currency TEXT DEFAULT 'usd',
      kind TEXT DEFAULT 'digital',
      status TEXT DEFAULT 'active',
      metadata TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS store_orders (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      stripe_session_id TEXT,
      checkout_url TEXT,
      amount_cents INTEGER NOT NULL DEFAULT 0,
      currency TEXT DEFAULT 'usd',
      status TEXT DEFAULT 'created',
      truth_state TEXT DEFAULT 'LOCAL_ORDER_CREATED',
      metadata TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_store_products_status ON store_products(status);
    CREATE INDEX IF NOT EXISTS idx_store_orders_product ON store_orders(product_id);
    CREATE INDEX IF NOT EXISTS idx_store_orders_status ON store_orders(status);
  `);

  const count = db.prepare('SELECT COUNT(*) AS count FROM store_products').get().count;
  if (count === 0) {
    const seed = db.prepare(`
      INSERT INTO store_products (id, name, description, price_cents, currency, kind, status, metadata, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const timestamp = now();
    [
      {
        id: 'ph_evo_studio_license',
        name: 'PromptHouse Evo Studio License',
        description: 'Proof-gated local studio runtime with bridge, agent, and audit surfaces.',
        priceCents: 4900,
        kind: 'license',
        metadata: { includes: ['studio', 'promptbridge', 'local-audits'] },
      },
      {
        id: 'ph_promptshell_backend_pack',
        name: 'PromptShell Backend Pack',
        description: 'Flutter/Python-ready backend routes for manifests, connector handshakes, proofs, and artifacts.',
        priceCents: 9900,
        kind: 'backend_pack',
        metadata: { includes: ['flutter-contracts', 'python-contracts', 'proof-chain'] },
      },
      {
        id: 'ph_global_node_hub_pack',
        name: 'Evo Global Node Hub Pack',
        description: 'Global contribution-node protocol for signed training packets and hub submission gates.',
        priceCents: 14900,
        kind: 'node_pack',
        metadata: { includes: ['byok-training', 'global-node', 'signed-packets'] },
      },
    ].forEach((product) => {
      seed.run(
        product.id,
        product.name,
        product.description,
        product.priceCents,
        'usd',
        product.kind,
        'active',
        JSON.stringify(product.metadata),
        timestamp,
        timestamp
      );
    });
  }

  return true;
}

function listProducts(db) {
  if (!hasDatabase(db)) return [];
  return db.prepare(`
    SELECT * FROM store_products
    WHERE status != 'archived'
    ORDER BY price_cents ASC, created_at DESC
  `).all().map(normalizeProduct);
}

function getProduct(db, productId) {
  if (!hasDatabase(db)) return null;
  const row = db.prepare('SELECT * FROM store_products WHERE id = ? LIMIT 1').get(productId);
  return row ? normalizeProduct(row) : null;
}

function recordOrder(db, order) {
  if (!hasDatabase(db)) return null;
  db.prepare(`
    INSERT INTO store_orders (id, product_id, stripe_session_id, checkout_url, amount_cents, currency, status, truth_state, metadata, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    order.id,
    order.productId,
    order.stripeSessionId || null,
    order.checkoutUrl || null,
    order.amountCents,
    order.currency,
    order.status,
    order.truthState,
    JSON.stringify(order.metadata || {}),
    order.createdAt,
    order.updatedAt
  );
  return order;
}

export function registerStoreRoutes(app, { stripe, db } = {}) {
  const databaseReady = ensureStoreSchema(db);

  app.get('/api/store/status', (_req, res) => {
    const stripeTruthState = getStripeTruthState(stripe);
    res.json({
      success: true,
      truthState: databaseReady ? 'STORE_LOCAL_READY' : 'STORE_DATABASE_UNAVAILABLE',
      database: databaseReady ? 'ready' : 'unavailable',
      stripeTruthState,
      checkoutTruthState: stripeTruthState === 'STRIPE_SECRET_KEY_REQUIRED'
        ? 'CHECKOUT_PROVIDER_GATED'
        : 'CHECKOUT_PROVIDER_READY',
      routes: [
        'GET /api/store/status',
        'GET /api/store/products',
        'POST /api/store/products',
        'POST /api/store/checkout',
      ],
      timestamp: now(),
    });
  });

  app.get('/api/store/products', (_req, res) => {
    if (!databaseReady) {
      return res.status(503).json({ success: false, truthState: 'STORE_DATABASE_UNAVAILABLE' });
    }
    const products = listProducts(db);
    return res.json({
      success: true,
      truthState: 'STORE_PRODUCTS_READY',
      count: products.length,
      products,
    });
  });

  app.post('/api/store/products', (req, res) => {
    if (!databaseReady) {
      return res.status(503).json({ success: false, truthState: 'STORE_DATABASE_UNAVAILABLE' });
    }
    const { id, name, description = '', priceCents, currency = 'usd', kind = 'digital', metadata = {} } = req.body || {};
    if (!name || !Number.isFinite(Number(priceCents)) || Number(priceCents) < 50) {
      return res.status(400).json({
        success: false,
        truthState: 'STORE_PRODUCT_INPUT_INVALID',
        error: 'name and priceCents >= 50 are required.',
      });
    }

    const productId = id || `store_product_${crypto.randomUUID()}`;
    const timestamp = now();
    db.prepare(`
      INSERT INTO store_products (id, name, description, price_cents, currency, kind, status, metadata, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        price_cents = excluded.price_cents,
        currency = excluded.currency,
        kind = excluded.kind,
        metadata = excluded.metadata,
        updated_at = excluded.updated_at
    `).run(productId, name, description, Number(priceCents), currency, kind, JSON.stringify(metadata), timestamp, timestamp);

    return res.json({
      success: true,
      truthState: 'STORE_PRODUCT_SAVED',
      product: getProduct(db, productId),
    });
  });

  app.post('/api/store/checkout', async (req, res) => {
    if (!databaseReady) {
      return res.status(503).json({ success: false, truthState: 'STORE_DATABASE_UNAVAILABLE' });
    }

    const { productId, quantity = 1, customerEmail } = req.body || {};
    const product = getProduct(db, productId);
    if (!product || product.status !== 'active') {
      return res.status(404).json({
        success: false,
        truthState: 'STORE_PRODUCT_NOT_FOUND',
        error: 'An active productId is required.',
      });
    }

    const stripeClient = getStripeClient(stripe);
    if (!stripeClient) {
      return res.status(409).json({
        success: false,
        blocked: true,
        provider: 'stripe',
        truthState: 'STRIPE_SECRET_KEY_REQUIRED',
        requiredEnvKey: 'STRIPE_SECRET_KEY',
        product,
        error: 'Stripe checkout is gated until STRIPE_SECRET_KEY is configured.',
      });
    }

    const unitAmount = product.priceCents;
    const safeQuantity = Math.max(1, Math.min(99, Number.parseInt(quantity, 10) || 1));
    try {
      const baseUrl = getBaseUrl();
      const session = await stripeClient.checkout.sessions.create({
        mode: 'payment',
        customer_email: customerEmail || undefined,
        line_items: [{
          quantity: safeQuantity,
          price_data: {
            currency: product.currency,
            unit_amount: unitAmount,
            product_data: {
              name: product.name,
              description: product.description || undefined,
            },
          },
        }],
        success_url: `${baseUrl}/portfolio?storeCheckout=success&product=${encodeURIComponent(product.id)}`,
        cancel_url: `${baseUrl}/portfolio?storeCheckout=cancel&product=${encodeURIComponent(product.id)}`,
        metadata: {
          productId: product.id,
          source: 'prompthouse-store',
        },
      });

      const order = recordOrder(db, {
        id: `store_order_${crypto.randomUUID()}`,
        productId: product.id,
        stripeSessionId: session.id,
        checkoutUrl: session.url,
        amountCents: unitAmount * safeQuantity,
        currency: product.currency,
        status: 'checkout_created',
        truthState: getStripeTruthState(stripe),
        metadata: { quantity: safeQuantity },
        createdAt: now(),
        updatedAt: now(),
      });

      return res.json({
        success: true,
        truthState: order.truthState,
        product,
        order,
        checkoutUrl: session.url,
        sessionId: session.id,
      });
    } catch (error) {
      return res.status(502).json({
        success: false,
        truthState: 'STRIPE_CHECKOUT_FAILED',
        error: error.message,
      });
    }
  });
}
