import { describe, it, expect } from 'vitest';
import { registerEmulatorRoutes } from '../server/routes/emulator.routes.js';

// Mock Express app
function createMockApp() {
  const routes = {};
  return {
    get(path, ...handlers) {
      routes[`GET:${path}`] = handlers;
    },
    post(path, ...handlers) {
      routes[`POST:${path}`] = handlers;
    },
    _routes: routes,
    _execute(method, path, req, res) {
      const handlers = routes[`${method}:${path}`];
      if (!handlers) throw new Error(`Route not found: ${method} ${path}`);
      // execute last handler (the actual route logic)
      return handlers[handlers.length - 1](req, res);
    }
  };
}

function createMockRes() {
  return {
    _status: 200,
    body: null,
    status(code) {
      this._status = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

describe('Emulator Routes & Discovery', () => {
  it('registers all emulator API endpoints', () => {
    const app = createMockApp();
    registerEmulatorRoutes(app);

    expect(app._routes['GET:/api/emulator/list']).toBeDefined();
    expect(app._routes['POST:/api/emulator/boot']).toBeDefined();
    expect(app._routes['POST:/api/emulator/install']).toBeDefined();
    expect(app._routes['GET:/api/emulator/logs']).toBeDefined();
    expect(app._routes['POST:/api/emulator/appetize-upload']).toBeDefined();
  });

  it('handles GET /api/emulator/list with a list of devices', async () => {
    const app = createMockApp();
    registerEmulatorRoutes(app);
    const res = createMockRes();

    await app._execute('GET', '/api/emulator/list', {}, res);

    if (res.body && !res.body.ok) {
      console.log('List devices failed with:', res.body.error);
    }

    expect(res.body).toBeDefined();
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.devices)).toBe(true);
  });

  it('validates boot parameters on POST /api/emulator/boot', async () => {
    const app = createMockApp();
    registerEmulatorRoutes(app);

    // 1. missing properties
    const res1 = createMockRes();
    await app._execute('POST', '/api/emulator/boot', { body: {} }, res1);

    expect(res1._status).toBe(400);
    expect(res1.body.error).toBeDefined();

    // 2. correct properties (Android)
    const res2 = createMockRes();
    await app._execute('POST', '/api/emulator/boot', { body: { platform: 'android', id: 'Pixel_8' } }, res2);

    if (res2.body && !res2.body.ok) {
      console.log('Boot device failed with:', res2.body.error);
    }

    expect(res2._status).toBe(200);
    expect(res2.body.ok).toBe(true);
  });

  it('validates installation parameters on POST /api/emulator/install', async () => {
    const app = createMockApp();
    registerEmulatorRoutes(app);

    // 1. missing platform / appPath
    const res1 = createMockRes();
    await app._execute('POST', '/api/emulator/install', { body: { platform: 'android' } }, res1);
    expect(res1._status).toBe(400);
    expect(res1.body.error).toBeDefined();

    // 2. successful parameters (Android)
    const res2 = createMockRes();
    await app._execute('POST', '/api/emulator/install', {
      body: { platform: 'android', deviceId: 'emulator-5554', appPath: 'build/app.apk' }
    }, res2);

    if (res2.body && !res2.body.ok) {
      console.log('Install app failed with:', res2.body.error);
    }

    expect(res2._status).toBe(200);
    expect(res2.body.ok).toBe(true);
  });

  it('handles GET /api/emulator/logs with fallback', async () => {
    const app = createMockApp();
    registerEmulatorRoutes(app);
    const res = createMockRes();

    await app._execute('GET', '/api/emulator/logs', { query: { platform: 'android', deviceId: 'emulator-5554' } }, res);

    if (res.body && !res.body.ok) {
      console.log('Fetch logs failed with:', res.body.error);
    }

    expect(res.body).toBeDefined();
    expect(res.body.ok).toBe(true);
    expect(res.body.logs).toBeDefined();
  });
});
