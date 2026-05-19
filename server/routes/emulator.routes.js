/**
 * PH EVO STUDIO — Emulator & Simulator Routes
 */

import {
  listLocalDevices,
  bootLocalDevice,
  installAppOnDevice,
  fetchDeviceLogs,
  uploadToAppetize,
} from '../services/emulator-manager.js';
import { TRUTH_STATES } from '../services/truth-labels.js';

export function registerEmulatorRoutes(app, context = {}) {
  // Get all local and simulated devices
  app.get('/api/emulator/list', async (req, res) => {
    try {
      const list = await listLocalDevices();
      res.json({ ok: true, devices: list });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Boot an emulator
  app.post('/api/emulator/boot', async (req, res) => {
    try {
      const { platform, id } = req.body;
      if (!platform || !id) {
        return res.status(400).json({ ok: false, error: 'Platform and ID are required.' });
      }
      const result = await bootLocalDevice(platform, id);
      res.json({ ok: true, ...result });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Install build onto emulator
  app.post('/api/emulator/install', async (req, res) => {
    try {
      const { platform, deviceId, appPath } = req.body;
      if (!platform || !deviceId || !appPath) {
        return res.status(400).json({ ok: false, error: 'Platform, deviceId, and appPath are required.' });
      }
      const result = await installAppOnDevice(platform, deviceId, appPath);
      res.json({ ok: true, ...result });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Fetch device logs
  app.get('/api/emulator/logs', async (req, res) => {
    try {
      const { platform, deviceId } = req.query;
      if (!platform || !deviceId) {
        return res.status(400).json({ ok: false, error: 'Platform and deviceId parameters are required.' });
      }
      const result = await fetchDeviceLogs(platform, deviceId);
      res.json({ ok: true, ...result });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Upload built binary to Appetize.io Cloud Simulators
  app.post('/api/emulator/appetize-upload', async (req, res) => {
    try {
      const { appPath, token } = req.body;
      if (!appPath) {
        return res.status(400).json({ ok: false, error: 'appPath is required.' });
      }
      const result = await uploadToAppetize(appPath, token);
      res.json({ ok: true, ...result });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });
}
