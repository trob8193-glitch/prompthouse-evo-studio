/**
 * EVOGENAGE — SOCIAL INTEROP BRIDGE (PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Allows Bots to post progress to external grids (X, Discord, Slack).
 */

export class SocialBridge {
  constructor(webhookUrl = process.env.SOCIAL_WEBHOOK_URL) {
    this.webhookUrl = webhookUrl;
  }

  /**
   * Post a broadcast from a specific bot.
   */
  async broadcast(botId, message) {
    const botStyles = {
      lion: '🦁 [Evo-Lion]: ',
      panther: '🐆 [Panther-Dev]: ',
      diffuser: '🌀 [Evo-Diffuser]: '
    };

    const formattedMessage = `${botStyles[botId] || '🤖 '}${message}`;
    console.log(`📢 [SocialBridge] Broadcasting: ${formattedMessage}`);

    if (this.webhookUrl) {
      // Physical Webhook Dispatch
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: formattedMessage })
      });
    }

    return true;
  }
}

export const SOCIAL_BRIDGE = new SocialBridge();
