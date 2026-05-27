import { Log } from '../autonomy/SovereignLogger.js';

/**
 * PH EVO STUDIO — AUTH (PRODUCTION GRADE)
 * ═══════════════════════════════════════════════════════════════
 * Handles client-side authentication interactions with the Bridge.
 */
export class Auth {
  constructor() {
    this.status = 'READY';
  }

  async checkSession() {
    if (typeof localStorage === 'undefined') return { success: false };
    const token = localStorage.getItem('ph_evo_token');
    if (!token) return { success: false };
    
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Session invalid');
      const data = await res.json();
      return { success: true, user: data.user };
    } catch (err) {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('ph_evo_token');
      }
      return { success: false, error: err.message };
    }
  }

  getStatus() {
    const hasToken = (typeof localStorage !== 'undefined') ? !!localStorage.getItem('ph_evo_token') : false;
    return { 
      id: 'auth', 
      grade: 'PRODUCTION', 
      state: hasToken ? 'AUTHENTICATED' : 'GATED',
      resonance: 1.0
    };
  }
}
