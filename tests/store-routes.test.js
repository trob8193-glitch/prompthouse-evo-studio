import express from 'express';
import Database from 'better-sqlite3';
import { afterEach, describe, expect, it } from 'vitest';
import { registerStoreRoutes } from '../server/routes/store.routes.js';

const servers = [];
const dbs = [];
const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  while (servers.length) servers.pop().close();
  while (dbs.length) dbs.pop().close();
});

async function listen(app) {
  const server = await new Promise((resolve) => {
    const started = app.listen(0, '127.0.0.1', () => resolve(started));
  });
  servers.push(server);
  return `http://127.0.0.1:${server.address().port}`;
}

function createApp() {
  const app = express();
  app.use(express.json());
  return app;
}

describe('store routes', () => {
  it('serves a local product catalog and gates checkout without Stripe credentials', async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const db = new Database(':memory:');
    dbs.push(db);
    const app = createApp();
    registerStoreRoutes(app, { db });
    const baseUrl = await listen(app);

    const status = await fetch(`${baseUrl}/api/store/status`).then((res) => res.json());
    expect(status.truthState).toBe('STORE_LOCAL_READY');
    expect(status.checkoutTruthState).toBe('CHECKOUT_PROVIDER_GATED');

    const products = await fetch(`${baseUrl}/api/store/products`).then((res) => res.json());
    expect(products.truthState).toBe('STORE_PRODUCTS_READY');
    expect(products.products.length).toBeGreaterThanOrEqual(3);

    const checkoutResponse = await fetch(`${baseUrl}/api/store/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: products.products[0].id }),
    });
    const checkout = await checkoutResponse.json();

    expect(checkoutResponse.status).toBe(409);
    expect(checkout.truthState).toBe('STRIPE_SECRET_KEY_REQUIRED');
    expect(checkout.requiredEnvKey).toBe('STRIPE_SECRET_KEY');
  });

  it('saves a custom product locally', async () => {
    const db = new Database(':memory:');
    dbs.push(db);
    const app = createApp();
    registerStoreRoutes(app, { db });
    const baseUrl = await listen(app);

    const response = await fetch(`${baseUrl}/api/store/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'custom_pack',
        name: 'Custom Evo Pack',
        priceCents: 7500,
        metadata: { tier: 'custom' },
      }),
    });
    const body = await response.json();

    expect(body.truthState).toBe('STORE_PRODUCT_SAVED');
    expect(body.product.id).toBe('custom_pack');
    expect(body.product.priceCents).toBe(7500);
    expect(body.product.metadata.tier).toBe('custom');
  });
});
