import puppeteer from 'puppeteer';
import { Log } from '../../autonomy/SovereignLogger.js';

export class GlobalLeadHunter {
  constructor() {
    this.name = 'GlobalLeadHunter';
  }

  async huntRedditLeads(subreddit = 'SaaS') {
    Log.info(`[LeadHunter] 🔍 Initiating physical scrape of r/${subreddit} for potential leads...`);
    let browser;
    try {
      // Must use visible mode because Reddit blocks headless easily
      browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 800 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.goto(`https://old.reddit.com/r/${subreddit}/new/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      
      await new Promise(r => setTimeout(r, 4000)); // wait for DOM to settle

      // Extract usernames of authors who posted recently
      const leads = await page.evaluate(() => {
        const authors = document.querySelectorAll('.author');
        const uniqueNames = new Set();
        authors.forEach(a => {
          const name = a.innerText;
          if (name && name !== '[deleted]' && name !== 'AutoModerator') {
            uniqueNames.add(name);
          }
        });
        return Array.from(uniqueNames).slice(0, 5); // Limit to 5 for safety
      });

      if (leads.length > 0) {
        Log.success(`[LeadHunter] Acquired ${leads.length} organic global leads from Reddit: ${leads.join(', ')}`);
        return leads.map(l => ({ platform: 'reddit', handle: l }));
      } else {
        Log.info('[WARNING]', `[LeadHunter] No leads found on r/${subreddit}.`);
        return [];
      }

    } catch (e) {
      Log.error(`[LeadHunter] Lead acquisition failed: ${e.message}`);
      return [];
    } finally {
      if (browser) await browser.close();
    }
  }
}
