/**
 * PromptHouse Studio Configuration
 * Phase 5: Deployment Configuration
 * 
 * Load with: 
 *   const config = await loadConfig();
 */

import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.agent' });
dotenv.config({ path: '.env.local' });

export const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost',
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV !== 'production',
  },

  // API Configuration
  api: {
    version: 'v1.0.0',
    prefix: '/api',
  },

  // Database Configuration
  database: {
    type: 'sqlite',
    path: process.env.DB_PATH || '.prompthouse-data/studio.db',
    verbose: process.env.DB_VERBOSE === 'true',
  },

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    agentId: process.env.AGENT_ID,
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
    timeout: parseInt(process.env.OPENAI_TIMEOUT || '30000', 10),
  },

  // Authentication
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Rate Limiting
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'text',
  },

  // CORS Configuration
  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(','),
    credentials: process.env.CORS_CREDENTIALS !== 'false',
  },

  // Feature Flags
  features: {
    enableDatabase: process.env.FEATURE_DB !== 'false',
    enableAgent: process.env.FEATURE_AGENT !== 'false',
    enableExecution: process.env.FEATURE_EXECUTION !== 'false',
    enableMobile: process.env.FEATURE_MOBILE !== 'false',
  },

  // Validation
  validation: {
    maxInputLength: 10000,
    maxBatchSize: 100,
  },
};

// Validate required configuration
export function validateConfig() {
  const errors = [];

  if (!config.openai.apiKey) {
    errors.push('OPENAI_API_KEY is required');
  }

  if (config.server.nodeEnv === 'production') {
    if (config.auth.jwtSecret === 'dev-secret-key-change-in-production') {
      errors.push('JWT_SECRET must be changed in production');
    }
  }

  if (errors.length > 0) {
    console.error('❌ Configuration Errors:');
    errors.forEach((err) => console.error(`  - ${err}`));
    return false;
  }

  return true;
}

// Print configuration summary
export function printConfigSummary() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         PromptHouse Studio Configuration Summary             ║
╚═══════════════════════════════════════════════════════════════╝

Server:
  - Port: ${config.server.port}
  - Environment: ${config.server.nodeEnv}

Database:
  - Type: ${config.database.type}
  - Path: ${config.database.path}

OpenAI:
  - Model: ${config.openai.model}
  - Agent ID: ${config.openai.agentId ? '✓ Configured' : '✗ Missing'}

Features:
  - Database: ${config.features.enableDatabase ? '✓' : '✗'}
  - Agent: ${config.features.enableAgent ? '✓' : '✗'}
  - Execution: ${config.features.enableExecution ? '✓' : '✗'}
  - Mobile: ${config.features.enableMobile ? '✓' : '✗'}

Rate Limiting:
  - Enabled: ${config.rateLimit.enabled ? '✓' : '✗'}
  - Max Requests: ${config.rateLimit.maxRequests} per ${config.rateLimit.windowMs}ms

  `);
}

export default config;
