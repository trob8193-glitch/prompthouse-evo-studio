/**
 * PH EVO STUDIO — Backend App Shell
 */

import express from 'express';
import cors from 'cors';
import { createRouteRegistry } from './route-registry.js';
import { registerCoreRoutes } from './routes/index.js';

export function configureCorsOptions(options = {}) {
  const allowedOrigins = options.corsOrigins || (process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : []);
  return {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  };
}

export function createBridgeContext(options = {}) {
  return {
    dataDir: options.dataDir || process.cwd(),
    sandboxDir: options.sandboxDir || process.cwd(),
    providerGates: options.providerGates || {},
    receiptService: options.receiptService || {},
    routeRegistry: options.routeRegistry !== undefined ? options.routeRegistry : null,
    ...options
  };
}

export function createPromptHouseApp() {
  const app = express();
  app.use(express.json());
  
  // Apply CORS if needed, or handled at top level
  app.use(cors(configureCorsOptions()));
  
  const context = createBridgeContext();
  
  // Register routes
  const summary = registerCoreRoutes(app, context);
  console.log(`[Bridge] Registered ${summary.registeredModules.length} core modules.`);

  return app;
}
