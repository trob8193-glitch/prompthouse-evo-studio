import fetch from 'node-fetch';
import { Log } from '../autonomy/SovereignLogger.js';

export class WebhookDispatcher {
  constructor(defaultUrl = process.env.WEBHOOK_DEFAULT_URL) {
    this.defaultUrl = defaultUrl || 'http://localhost:3000/webhook-demo-run';
  }

  async dispatch(payload, targetUrl = this.defaultUrl) {
    Log.info(`[WebhookDispatcher] Dispatching payload to ${targetUrl}`);
    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          data: payload
        }),
        timeout: 5000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      Log.success(`[WebhookDispatcher] Webhook delivered successfully.`);
      return true;
    } catch (e) {
      Log.warn(`[WebhookDispatcher] Failed to deliver webhook: ${e.message}`);
      return false;
    }
  }
}

export const GlobalWebhookDispatcher = new WebhookDispatcher();
