import puppeteer from 'puppeteer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Log } from '../autonomy/SovereignLogger.js';

export class AutonomousUserAgent {
  constructor(options = {}, ai = null) {
    this.targetUrl = process.env.VITE_APP_URL || 'http://localhost:5173/';
    // Run visibly by default unless HEADLESS=true is explicitly set
    this.headless = process.env.HEADLESS === 'true' || options.headless || false;
    this.browser = null;
    this.page = null;
    this.ai = ai; // The Universal AI Adaptor for AGI-level cognition
    this.memoryPath = path.join(process.cwd(), '.prompthouse-data', 'autonomous_memory.json');
    this.memory = this.loadMemory();
  }

  loadMemory() {
    try {
      if (fs.existsSync(this.memoryPath)) {
        return JSON.parse(fs.readFileSync(this.memoryPath, 'utf8'));
      }
    } catch (e) {}
    return { credentials: [], campaigns: [], intelligence_nodes: [] };
  }

  saveMemory() {
    try {
      const dir = path.dirname(this.memoryPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.memoryPath, JSON.stringify(this.memory, null, 2));
    } catch (e) {}
  }

  generateRealCredentials() {
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const securePassword = crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '') + 'A1!';
    
    // We construct a realistic email alias to avoid basic spam filters
    const baseAlias = process.env.EVO_MASTER_EMAIL_ALIAS || 'evo.agent';
    const domain = process.env.EVO_MASTER_EMAIL_DOMAIN || 'gmail.com';
    
    // Example: evo.agent+a8b2c4@gmail.com
    const email = `${baseAlias}+${randomSuffix}@${domain}`;
    
    const username = `EvoNode_${randomSuffix}`;
    const firstName = 'Evo';
    const lastName = 'Node';

    const creds = { email, username, password: securePassword, firstName, lastName, created_at: new Date().toISOString() };
    
    Log.info(`[AutoUser] Generated Secure Reality Credentials:`);
    Log.info(`  -> Identity: ${firstName} ${lastName}`);
    Log.info(`  -> Email: ${email}`);
    Log.info(`  -> Password: [PROTECTED_IN_MEMORY]`);

    // In a full realization, these credentials would be stored in the Sovereign Ledger
    this.memory.credentials.push(creds);
    this.saveMemory();
    Log.info(`[AutoUser] Credentials stored persistently in AGI Memory.`);

    return creds;
  }

  async runAccountCreationCampaign(targetSignupUrl) {
    Log.info(`[AutoUser] 🚀 Initiating Reality-Account Creation Campaign for: ${targetSignupUrl}`);
    const creds = this.generateRealCredentials();

    try {
      this.browser = await puppeteer.launch({
        headless: this.headless,
        defaultViewport: { width: 1440, height: 900 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      this.page = await this.browser.newPage();
      
      // Simulate realistic user agent and fingerprinting bypasses
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      Log.info(`[AutoUser] Navigating to target zone...`);
      await this.page.goto(targetSignupUrl, { waitUntil: 'networkidle2' });
      await this.delay(Math.random() * 2000 + 2000); // Human reaction time

      Log.info('[AutoUser] Hunting for identity forms (Email, Username, Password)...');
      
      // Attempt to find and fill an email field
      const emailSelectors = ['input[type="email"]', 'input[name="email"]', 'input[autocomplete="email"]'];
      for (const sel of emailSelectors) {
        const els = await this.page.$$(sel);
        if (els.length > 0) {
          await els[0].click();
          await this.delay(500);
          await this.page.keyboard.type(creds.email, { delay: 50 + Math.random() * 50 });
          break;
        }
      }

      // Attempt to find and fill a username / name field
      const nameSelectors = ['input[name="username"]', 'input[name="name"]', 'input[prompt_template*="Name"]'];
      for (const sel of nameSelectors) {
        const els = await this.page.$$(sel);
        if (els.length > 0) {
          await els[0].click();
          await this.delay(500);
          await this.page.keyboard.type(creds.username, { delay: 50 + Math.random() * 50 });
          break;
        }
      }

      // Attempt to find and fill a password field
      const passSelectors = ['input[type="password"]', 'input[name="password"]', 'input[name="new-password"]'];
      let typedPassword = false;
      for (const sel of passSelectors) {
        const els = await this.page.$$(sel);
        if (els.length > 0) {
          await els[0].click();
          await this.delay(500);
          await this.page.keyboard.type(creds.password, { delay: 50 + Math.random() * 50 });
          typedPassword = true;
          break;
        }
      }

      if (!typedPassword) {
        Log.warning(`[AutoUser] Could not locate a secure password input field on ${targetSignupUrl}. Form structure is alien.`);
      }

      // Attempt to submit
      Log.info('[AutoUser] Seeking submission triggers...');
      const submitSelectors = ['button[type="submit"]', 'input[type="submit"]', 'button:contains("Sign up")', 'button:contains("Create")'];
      let submitted = false;
      for (const sel of submitSelectors) {
        try {
          const els = await this.page.$$(sel);
          if (els.length > 0) {
            Log.info('[AutoUser] Triggering identity submission...');
            await els[0].click();
            submitted = true;
            break;
          }
        } catch(e) {}
      }

      if (submitted) {
        Log.success(`[AutoUser] Identity creation payload dispatched to ${targetSignupUrl}. Awaiting platform response...`);
        await this.delay(5000); // Wait for potential captcha or success page
      } else {
        Log.warning(`[AutoUser] No submission trigger found. Aborting creation on this target.`);
      }

    } catch (error) {
      Log.error(`[AutoUser] Creation Campaign Failed: ${error.message}`);
    } finally {
      if (this.browser) {
        await this.delay(3000);
        await this.browser.close();
      }
    }
  }

  async startSession() {
    Log.info(`[AutoUser] 👻 Spawning Phantom Chrome... (Headless: ${this.headless})`);
    
    this.browser = await puppeteer.launch({
      headless: this.headless,
      defaultViewport: { width: 1280, height: 800 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    
    try {
      const urlToVisit = this.targetUrl.replace('localhost', '127.0.0.1');
      Log.info(`[AutoUser] Navigating to studio at ${urlToVisit}`);
      
      await this.page.goto(urlToVisit, { waitUntil: 'load', timeout: 30000 }).catch(e => {
        Log.error(`[AutoUser] Navigation Error: ${e.message}`);
      });

      await this.delay(3000);

      // Attempt to enter the main app if there's a landing page
      Log.info('[AutoUser] Seeking entry points...');
      const entrySelectors = ['button', 'a[href*="/"]', '.cursor-pointer'];
      for (const sel of entrySelectors) {
        const els = await this.page.$$(sel);
        if (els.length > 0) {
          try { await els[0].click(); } catch(e) {}
          await this.delay(2000);
          break;
        }
      }

      // We define 3x enhanced precision selectors tailored for Evo Studio's React UI
      const inputSelectors = [
        'input[prompt_template*="Communicate"]',
        'input[prompt_template*="message"]',
        'input[prompt_template*="ENTER COMMAND"]',
        'input[prompt_template*="Enter command"]',
        'input[aria-label="Terminal command input"]',
        '.evo-input-glow input',
        'textarea.field-textarea',
        'input.field-input',
        'input[type="text"]' // Fallback
      ];

      Log.info('[AutoUser] Hunting for prompt input / terminal / chat box...');
      let targetInput = null;
      
      // Polling loop to wait for React to render the chat box
      for (let attempt = 0; attempt < 5; attempt++) {
        for (const selector of inputSelectors) {
          const els = await this.page.$$(selector);
          // Make sure it's visible and not disabled
          for (const el of els) {
            const isVisible = await el.evaluate(n => {
              const style = window.getComputedStyle(n);
              return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
            });
            if (isVisible) {
              targetInput = el;
              break;
            }
          }
          if (targetInput) break;
        }
        
        if (targetInput) break;
        Log.info('[AutoUser] Input not found yet, randomly exploring UI to open panels...');
        
        // Randomly click something to see if it opens a terminal or chat sidebar
        const clickables = await this.page.$$('button');
        if (clickables.length > 0) {
          const randomBtn = clickables[Math.floor(Math.random() * clickables.length)];
          try { await randomBtn.click(); } catch(e) {}
        }
        await this.delay(2000);
      }

      if (targetInput) {
        Log.info('[AutoUser] Found target input field!');
        const ideas = [
          "Build me a dark mode React crypto dashboard",
          "Create a mobile fitness tracking UI",
          "Generate a Stripe checkout integration panel",
          "evo:audit",
          "npm run ai:train"
        ];
        const idea = ideas[Math.floor(Math.random() * ideas.length)];

        Log.info(`[AutoUser] Typing prompt: "${idea}"`);
        await targetInput.click();
        await this.delay(500);
        await this.page.keyboard.type(idea, { delay: 40 }); // type like a human
        await this.delay(500);
        await this.page.keyboard.press('Enter');
        
        // Wait for AI / System to respond to the prompt
        Log.info('[AutoUser] Awaiting system response...');
        await this.delay(6000);
      } else {
        Log.error('[AutoUser] Failed to locate a valid chat box or terminal input.');
      }

      Log.info('[AutoUser] Continuing synthetic exploration...');
      for (let i = 0; i < 4; i++) {
        const clickables = await this.page.$$('button, a[href]');
        if (clickables.length > 0) {
          const randomEl = clickables[Math.floor(Math.random() * clickables.length)];
          try { await randomEl.click(); } catch (e) {}
          await this.delay(1000);
        }
      }

      Log.success('[AutoUser] Synthetic Session Complete.');

    } catch (e) {
      Log.error(`[AutoUser] Session failed: ${e.message}`);
    } finally {
      if (this.browser) {
        Log.info('[AutoUser] Terminating Phantom Chrome.');
        await this.browser.close();
      }
    }
  }

  delay(ms) {
    return new Promise(res => setTimeout(res, ms));
  }
}

// Allow running directly from CLI
if (process.argv[1] && process.argv[1].endsWith('AutonomousUserAgent.mjs')) {
  const bot = new AutonomousUserAgent();
  const target = process.argv[2];
  
  if (target === '--signup') {
    const signupUrl = process.argv[3] || 'https://news.ycombinator.com/login';
    bot.runAccountCreationCampaign(signupUrl).catch(console.error);
  } else {
    bot.startSession().catch(console.error);
  }
}
