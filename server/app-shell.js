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
  // Validate critical environment variables
  const criticalEnvVars = ['STRIPE_SECRET_KEY', 'VITE_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY'];
  criticalEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      console.warn(`[WARNING] Critical environment variable missing: ${envVar}`);
    }
  });

  const app = express();
  
  // Request Logging Middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
    });
    next();
  });

  // Raw body for Stripe webhook signature verification (must come before express.json)
  app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
  app.use(express.json());
  
  // Apply CORS if needed, or handled at top level
  app.use(cors(configureCorsOptions()));
  
  const context = createBridgeContext();
  
  // Register routes
  const summary = registerCoreRoutes(app, context);
  console.log(`[Bridge] Registered ${summary.registeredModules.length} core modules.`);

  // Global Error Handling Middleware
  app.use((err, req, res, next) => {
    console.error(`[ERROR] Unhandled Exception on ${req.method} ${req.originalUrl}:`, err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  });

  return app;
}
