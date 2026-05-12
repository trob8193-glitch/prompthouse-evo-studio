import rateLimit from 'express-rate-limit';

/**
 * EVOGENAGE — NUCLEAR RATE LIMITER (PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Protects the foundry from API abuse and DDoS attacks.
 */

// 1. General API Limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    error: 'TOO_MANY_REQUESTS',
    message: 'The foundry is cooling down. Please wait before attempting more requests.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. Generation-Specific Limiter (Stricter)
export const generationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each user to 5 generations per minute
  message: {
    error: 'GENERATION_THROTTLED',
    message: 'Your latent synthesis throughput has reached the safety limit. Slow down.'
  },
  keyGenerator: (req) => req.user?.id || req.ip,
});
