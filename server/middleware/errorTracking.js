/**
 * PH EVO STUDIO — Error Tracking
 * Sentry initialization and Express error handler hook.
 */
import * as Sentry from '@sentry/node';
import { Log } from '../../src/core/autonomy/SovereignLogger.js';

let isSentryEnabled = false;

export function initErrorTracking(app) {
  if (!process.env.SENTRY_DSN) {
    Log.info('[Observability] Sentry DSN not provided, error tracking disabled.');
    return;
  }

  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 1.0,
    });
    isSentryEnabled = true;
    Log.info('[Observability] Sentry error tracking initialized.');
  } catch (err) {
    Log.warn(`[Observability] Failed to initialize Sentry: ${err.message}`);
  }
}

export function sentryErrorHandler(err, req, res, next) {
  if (isSentryEnabled) {
    Sentry.captureException(err);
  }
  
  Log.error(`[Unhandled Error] ${req.method} ${req.path} - ${err.message}`);
  
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    correlationId: req.correlationId || 'unknown'
  });
}
