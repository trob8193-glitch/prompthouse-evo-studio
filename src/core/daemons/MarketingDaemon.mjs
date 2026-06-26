import puppeteer from 'puppeteer';
import { Log } from '../autonomy/SovereignLogger.js';

export class MarketingDaemon {
  constructor() {
    this.name = 'MarketingDaemon';
    this.modelUrl = process.env.VITE_OLLAMA_URL || 'http://127.0.0.1:11434';
    this.modelName = process.env.VITE_OLLAMA_MODEL || 'qwen2.5-coder:7b';
    this.aggressiveMode = process.env.AGGRESSIVE_POST === 'true';
  }

  async generateMarketingCopy(featureContext) {
    Log.info('[MarketingDaemon] Generating value copy for social media...');
    try {
      const prompt = `Write a short, value-driven, 1-2 sentence Twitter post announcing that our autonomous AI studio just successfully built and deployed a new feature: ${featureContext}. Include emojis and relevant hashtags like #buildinpublic #AI. Do NOT use quotes around the text.`;
      
      const response = await fetch(`${this.modelUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          prompt: prompt,
          stream: false
        })
      });
      const data = await response.json();
      return data.response.trim();
    } catch (e) {
      Log.error(`[MarketingDaemon] Failed to generate copy: ${e.message}`);
      return "Our Autonomous AI Studio just shipped a massive new feature! 🚀 We are reaching Level 5 Autonomy. #buildinpublic #AI #Tech";
    }
  }

  async postToTwitter(text) {
    Log.info('[MarketingDaemon] 🐦 Spawning Phantom Chrome for Twitter/X...');
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: false, // Must be visible for twitter so we don't get instantly banned, and user can watch
        defaultViewport: { width: 1280, height: 800 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      
      // Navigate to Twitter Compose
      // Note: If the user is logged into Twitter in their default chrome profile, it would work better
      // but here we just navigate to the intent page.
      const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      Log.info(`[MarketingDaemon] Navigating to: ${intentUrl}`);
      
      // Use domcontentloaded instead of networkidle2 because heavy social media sites often keep network connections open
      await page.goto(intentUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await new Promise(r => setTimeout(r, 5000));

      if (this.aggressiveMode) {
        Log.warning('[MarketingDaemon] AGGRESSIVE MODE ON. Attempting to force-post...');
        const postButton = await page.$('div[data-testid="tweetButton"]');
        if (postButton) {
          await postButton.click();
          Log.success('[MarketingDaemon] Tweet successfully posted to the real world.');
        } else {
          Log.error('[MarketingDaemon] Could not find the Post button. You might not be logged in.');
        }
      } else {
        Log.success('[MarketingDaemon] SAFE MODE ON. Tweet drafted successfully. Stopping before physical post.');
        Log.info(`[MarketingDaemon] Drafted Text: "${text}"`);
      }

      await new Promise(r => setTimeout(r, 5000));

    } catch (e) {
      Log.error(`[MarketingDaemon] Twitter automation failed: ${e.message}`);
    } finally {
      if (browser) await browser.close();
    }
  }

  async runMarketingCycle(featureContext = 'A revolutionary new Autonomous Finance engine') {
    Log.info('═══════════════════════════════════════════════════════════════');
    Log.info('   [LEVEL 5] SELF-MARKETING ENGINE ACTIVATED');
    Log.info('═══════════════════════════════════════════════════════════════');

    const copy = await this.generateMarketingCopy(featureContext);
    await this.postToTwitter(copy);
  }
}

// Allow CLI execution for testing
if (process.argv[1] && process.argv[1].endsWith('MarketingDaemon.mjs')) {
  const md = new MarketingDaemon();
  md.runMarketingCycle().catch(console.error);
}
