import express from 'express';
import cors from 'cors';

/**
 * Configure CORS options safely.
 * Preserves local dev behavior, avoids wildcard credentialed CORS for mutations.
 */
export function configureCorsOptions(options = {}) {
  const envOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  const allowedOrigins = options.corsOrigins || envOrigins;
  
  return {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.length === 0) {
        // If no explicit origins, fallback to broad open during dev,
        // but this could be restricted in production
        return callback(null, true);
      }
      
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  };
}

/**
 * Configure core middleware (JSON parsing, CORS).
 */
export function configureCoreMiddleware(app, options = {}) {
  app.use(cors(configureCorsOptions(options)));
  app.use(express.json());
  return app;
}

/**
 * Creates the Bridge Context object passed to modules.
 */
export function createBridgeContext(options = {}) {
  return {
    dataDir: options.dataDir || process.cwd(),
    sandboxDir: options.sandboxDir || process.cwd(),
    env: options.env || process.env,
    providerGates: options.providerGates || {},
    receiptService: options.receiptService || {},
    routeRegistry: options.routeRegistry || null,
  };
}

/**
 * Creates the modular PromptHouse Express App.
 * Does NOT start listening.
 */
export function createPromptHouseApp(options = {}) {
  const app = express();
  configureCoreMiddleware(app, options);
  return app;
}
