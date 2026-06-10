/**
 * PromptBridge Error Handler & Middleware
 * Phase 5: Polish & Deployment - Central error handling
 */

import jwt from 'jsonwebtoken';

/**
 * Error Response Formatter
 */
export function formatErrorResponse(error, statusCode = 500) {
  return {
    success: false,
    error: {
      message: error.message || 'An error occurred',
      code: error.code || 'INTERNAL_ERROR',
      statusCode,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Validation Middleware
 */
export function validateRequired(requiredFields) {
  return (req, res, next) => {
    const missing = requiredFields.filter((field) => !req.body[field]);
    if (missing.length > 0) {
      return res.status(400).json(
        formatErrorResponse(
          new Error(`Missing required fields: ${missing.join(', ')}`),
          400
        )
      );
    }
    next();
  };
}

/**
 * Rate Limiter Middleware
 */
export class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  middleware() {
    return (req, res, next) => {
      const key = req.ip || req.connection.remoteAddress;
      const now = Date.now();

      if (!this.requests.has(key)) {
        this.requests.set(key, []);
      }

      const times = this.requests.get(key);
      const recentTimes = times.filter((t) => now - t < this.windowMs);

      if (recentTimes.length >= this.maxRequests) {
        return res.status(429).json(
          formatErrorResponse(new Error('Rate limit exceeded'), 429)
        );
      }

      recentTimes.push(now);
      this.requests.set(key, recentTimes);

      // Cleanup old entries
      if (this.requests.size > 1000) {
        const keys = Array.from(this.requests.keys());
        for (let i = 0; i < 100; i++) {
          this.requests.delete(keys[i]);
        }
      }

      next();
    };
  }
}

/**
 * Input Sanitizer
 */
export function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input
      .trim()
      .slice(0, 10000) // Limit length
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/[^\w\s\-.,!?'"()]/g, ''); // Remove suspicious chars
  }
  return input;
}

/**
 * Authentication Middleware
 */
export function authenticateToken(secret) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // If no token, continue (optional auth)
      return next();
    }

    try {
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json(formatErrorResponse(new Error('Invalid token'), 401));
    }
  };
}

/**
 * Request Logger
 */
export function createLogger(prefix = 'APP') {
  return (req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.send;

    res.send = function (data) {
      const duration = Date.now() - startTime;
      global.Log && global.Log.info(
        `[${prefix}] ${res.statusCode} ${req.method} ${req.path} ${duration}ms`
      );
      originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Global Error Handler
 */
export function globalErrorHandler(err, req, res, next) {
  global.Log && global.Log.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json(formatErrorResponse(err, statusCode));
}

/**
 * Async Route Wrapper
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
