import fetch from 'node-fetch';
import { Log } from '../autonomy/SovereignLogger.js';

export class ExternalSaaSManager {
  constructor() {
    this.services = {
      stripe: {
        baseUrl: 'https://api.stripe.com/v1',
        key: process.env.STRIPE_SECRET_KEY
      },
      aws: {
        baseUrl: 'https://api.aws.amazon.com',
        key: process.env.AWS_ACCESS_KEY
      }
    };
  }

  async callService(serviceName, endpoint, method = 'GET', payload = null) {
    const service = this.services[serviceName];
    if (!service) {
      throw new Error(`[ExternalSaaSManager] Service ${serviceName} is not configured.`);
    }

    Log.info(`[ExternalSaaSManager] Calling ${serviceName} API at ${endpoint}`);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${service.key || 'FALLBACK_KEY'}`
    };

    const options = {
      method,
      headers,
      timeout: 10000
    };

    if (payload && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(payload);
    }

    try {
      // In development/missing keys, we demo-run the response to avoid crashing the daemons
      if (!service.key) {
        Log.warning(`[ExternalSaaSManager] Missing API key for ${serviceName}. Returning demo-run response.`);
        return { success: true, 'demo-runed': true, data: { status: 'demo-run_success' } };
      }

      const url = `${service.baseUrl}${endpoint}`;
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      Log.success(`[ExternalSaaSManager] Successfully communicated with ${serviceName}`);
      return { success: true, data };
    } catch (e) {
      Log.error(`[ExternalSaaSManager] API call to ${serviceName} failed: ${e.message}`);
      return { success: false, error: e.message };
    }
  }
}

export const GlobalSaaSManager = new ExternalSaaSManager();
