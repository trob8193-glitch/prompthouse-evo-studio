import helmet from 'helmet';
import xss from 'xss';
import { Request, Response, NextFunction } from 'express';

/**
 * EVOGENAGE — SOVEREIGN GUARD (PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Hardens headers and sanitizes all incoming architectural data.
 */

// 1. Header Hardening
export const securityHeaders = helmet();

// 2. Recursive Input Sanitization
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') return xss(obj);
    if (Array.isArray(obj)) return obj.map(sanitize);
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        acc[key] = sanitize(obj[key]);
        return acc;
      }, {} as any);
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
};
