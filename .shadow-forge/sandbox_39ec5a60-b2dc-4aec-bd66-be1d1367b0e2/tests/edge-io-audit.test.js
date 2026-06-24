import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { buildEdgeIoAudit } from '../src/core/edge-io/EdgeIoAudit.js';
import registerEdgeIoRoutes from '../generated_apis/edge_io_routes.js';

function tempRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ph-edge-io-'));
}

function createApp() {
  const routes = new Map();
  return {
    get(route, handler) { routes.set(`GET ${route}`, handler); },
    has(method, route) { return routes.has(`${method} ${route}`); },
    invoke(method, route) {
      const handler = routes.get(`${method} ${route}`);
      const res = {
        statusCode: 200,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(payload) { this.body = payload; return this; }
      };
      handler({}, res);
      return res.body;
    }
  };
}

describe('edge I/O audit', () => {
  const created = [];

  afterEach(() => {
    for (const dir of created.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
  });

  it('reports Wi-Fi Bluetooth barcode QR waves and I/O as real gated surfaces', () => {
    const rootDir = tempRoot();
    created.push(rootDir);

    const report = buildEdgeIoAudit({ rootDir, env: {} });
    const ids = report.surfaces.map((surface) => surface.id);

    expect(ids).toContain('wifi');
    expect(ids).toContain('bluetooth');
    expect(ids).toContain('barcode_qr');
    expect(ids).toContain('invisible_signals_waves');
    expect(ids).toContain('input_output');
    expect(ids).toContain('evo_api');
    expect(report.truthState).toBe('EDGE_IO_PERMISSION_OR_PROVIDER_GATED');
    expect(fs.existsSync(path.join(rootDir, '.prompthouse-data', 'edge_io_audit_report.json'))).toBe(true);
  });

  it('registers edge I/O API routes', () => {
    const app = createApp();
    registerEdgeIoRoutes(app);

    expect(app.has('GET', '/api/edge-io/audit')).toBe(true);
    expect(app.has('GET', '/api/edge-io/status')).toBe(true);

    const response = app.invoke('GET', '/api/edge-io/status');
    expect(response.success).toBe(true);
    expect(response.status.surfaces.length).toBeGreaterThan(0);
  });
});
