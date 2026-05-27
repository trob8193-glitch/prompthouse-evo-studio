import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

import { registerEmulatorRoutes } from './server/routes/emulator.routes.js';
import registerEvoBridgeRoutes from './generated_apis/evo_bridge_routes.js';
import registerPlatformSentinelRoutes from './generated_apis/platform_sentinel_routes.js';
import registerAiModelRoutes from './generated_apis/ai_model_routes.js';
import registerEvoDiffuserRoutes from './generated_apis/evo_diffuser_routes.js';
import registerEvoTerminalRoutes from './generated_apis/evo_terminal_routes.js';
import registerEvoCapabilityRoutes from './generated_apis/evo_capability_routes.js';
import { createCapabilityManifest } from './src/core/capabilities/EvoCapabilityContract.js';

dotenv.config({ override: true });

const app = express();
const port = parseInt(process.env.BRIDGE_PORT || '3001', 10);
const DATA_DIR = join(process.cwd(), '.prompthouse-data');
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://127.0.0.1:5173,http://localhost:5173')
  .split(',')
  .map(item => item.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('chrome-extension://')) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS origin denied: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    service: 'PromptBridge Recovery Runtime',
    truthState: 'RECOVERY_BRIDGE_READY',
    capabilityManifest: createCapabilityManifest({ label: 'recovery_bridge_health' }),
    checkedAt: new Date().toISOString(),
  });
});

const registrars = [
  registerEmulatorRoutes,
  registerEvoBridgeRoutes,
  registerPlatformSentinelRoutes,
  registerAiModelRoutes,
  registerEvoDiffuserRoutes,
  registerEvoTerminalRoutes,
  registerEvoCapabilityRoutes,
];

for (const register of registrars) {
  try {
    register(app);
  } catch (error) {
    console.error(`[PromptBridgeRecovery] route registration failed: ${error.message}`);
  }
}

app.use((err, _req, res, _next) => {
  res.status(500).json({ success: false, error: err.message, truthState: 'RECOVERY_BRIDGE_ERROR' });
});

app.listen(port, '127.0.0.1', () => {
  console.log(`PromptBridge Recovery Runtime listening on http://127.0.0.1:${port}`);
});
