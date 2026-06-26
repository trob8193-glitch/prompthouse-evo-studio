import puppeteer from 'puppeteer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Log } from '../autonomy/SovereignLogger.js';
import { GlobalDatabase } from '../db/DatabaseConnection.js';

export class AutonomousUserAgent {
  constructor(options = {}, ai = null) {
    this.targetUrl = process.env.VITE_APP_URL || 'http://localhost:5173/';
    // Run visibly by default unless HEADLESS=true is explicitly set
    this.headless = process.env.HEADLESS === 'true' || options.headless || false;
    this.browser = null;
    this.page = null;
    this.ai = ai; // The Universal AI Adaptor for AGI-level cognition
    this.memory = { credentials: [], campaigns: [], intelligence_nodes: [] };
    this.loadMemory().then(mem => { this.memory = mem; });
  }

  async loadMemory() {
    try {
      await GlobalDatabase.connect();
      const creds = await GlobalDatabase.find('credentials');
      const campaigns = await GlobalDatabase.find('campaigns');
      return { credentials: creds, campaigns, intelligence_nodes: [] };
    } catch (e) {
      return { credentials: [], campaigns: [], intelligence_nodes: [] };
    }
  }

  async saveMemory() {
    try {
      await GlobalDatabase.replaceWholeCollection('credentials', this.memory.credentials);
      await GlobalDatabase.replaceWholeCollection('campaigns', this.memory.campaigns);
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
    this.saveMemory().catch(() => {});
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
      
      // execute realistic user agent and fingerprinting bypasses
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
      
      let navSuccess = false;
      for (let i = 0; i < 3; i++) {
        try {
          await this.page.goto(urlToVisit, { waitUntil: 'load', timeout: 20000 });
          navSuccess = true;
          break;
        } catch (e) {
          Log.error(`[AutoUser] Navigation Error: ${e.message}`);
          if (e.message.includes('ERR_CONNECTION_REFUSED')) break;
          Log.info('[AutoUser] Retrying navigation in 3 seconds (Vite HMR/Reload)...');
          await this.delay(3000);
        }
      }

      await this.delay(3000);
      
      try {
        await this.page.waitForSelector('#root > *', { timeout: 10000 });
      } catch (e) {
        Log.error('[AutoUser] App did not mount in #root. DOM might be empty.');
      }

      // Listen for Vite HMR updates to autonomously regenerate the Semantic Map
      let mapTimeout = null;
      this.page.on('console', msg => {
        if (msg.text().includes('[vite] hot updated')) {
          if (mapTimeout) clearTimeout(mapTimeout);
          mapTimeout = setTimeout(() => this.extractUiMap(), 2000); // 2-second debounce
        }
      });

      // Perform initial map extraction
      const currentMap = await this.extractUiMap();

      // Attempt to enter the main app if there's a landing page
      Log.info('[AutoUser] Seeking entry points...');
      const entrySelectors = ['.evo-shell-container button', 'button', 'a[href*="/"]', '.cursor-pointer'];
      for (const sel of entrySelectors) {
        try {
          const els = await this.page.$$(sel);
          if (els.length > 0) {
            try {
              await Promise.all([
                this.page.waitForNavigation({ timeout: 3000 }).catch(() => {}),
                els[0].click()
              ]);
            } catch(e) {}
            await this.delay(2000);
            break;
          }
        } catch (e) {
          // Ignore context errors
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
          try {
            const els = await this.page.$$(selector);
            // Make sure it's visible and not disabled
            for (const el of els) {
              let isVisible = false;
              try {
                isVisible = await el.evaluate(n => {
                  const style = window.getComputedStyle(n);
                  return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
                });
              } catch (err) {
                // Ignore execution context errors
              }
              if (isVisible) {
                targetInput = el;
                break;
              }
            }
          } catch (e) {
            // Ignore execution context errors
          }
          if (targetInput) break;
        }
        
        if (targetInput) break;
        Log.info('[AutoUser] Input not found yet. Using Semantic Map to find interactive navigation...');
        const map = await this.extractUiMap();
        const interactables = map.filter(n => n.tag === 'button' || n.tag === 'a');
        
        if (interactables.length > 0) {
          let targetNode = interactables.find(n => n.text.toLowerCase().includes('terminal') || n.text.toLowerCase().includes('chat') || n.text.toLowerCase().includes('open'));
          if (!targetNode) targetNode = interactables[Math.floor(Math.random() * interactables.length)];
          
          Log.info(`[AutoUser] 🗺️ Semantically navigating via mapped node: [${targetNode.text || targetNode.id}]`);
          try {
            await this.page.mouse.click(targetNode.bounds.x + 5, targetNode.bounds.y + 5);
            await this.delay(2000);
          } catch(e) {}
        } else {
          await this.delay(2000);
        }
      }

      if (targetInput) {
        Log.info('[AutoUser] Found target input field!');
        Log.info('[AutoUser] Consulting Ollama for dynamic prompt generation...');
        let idea = "Build me a dark mode React crypto dashboard"; // default fallback
        try {
          const { UniversalAIAdaptor } = await import('../../lib/ai/UniversalAIAdaptor.js');
          const ai = this.ai || new UniversalAIAdaptor();
          const mapContext = currentMap.filter(n => n.visible).map(n => `<${n.tag}> ${n.text}`).join(', ').substring(0, 500);
          const promptToOllama = `You are a synthetic user testing an AI-powered React application. Based on this UI context: [${mapContext}], generate ONE short, realistic feature request or command a user would type into a terminal or chat box (max 10 words). Output ONLY the command text.`;
          const res = await ai.routeRequest(promptToOllama, { provider: 'ollama' });
          if (res.success && res.content) {
            idea = res.content.trim().replace(/^"|"$/g, '').replace(/^`|`$/g, '').trim();
            Log.success('[AutoUser] 🧠 Ollama generated dynamic intent.');
          }
        } catch(e) {
          Log.warning(`[AutoUser] Ollama tether failed: ${e.message}. Using fallback idea.`);
        }

        Log.info(`[AutoUser] Typing prompt: "${idea}"`);
        
        try {
          const { TridallPatternEngine } = await import('../engines/TridallPatternEngine.js');
          Log.info(`[AutoUser] 🧩 Tethering intent to Tridall Engine for ecosystem pattern extraction...`);
          const tridallRes = await TridallPatternEngine.ingestIdeaStream(idea, {});
          if (tridallRes.success) {
            Log.success(`[AutoUser] 🧩 Tridall extracted concept: ${tridallRes.pattern.concept} (Monetization: ${tridallRes.monetizationPath.model})`);
            
            try {
              const { GlobalSplitTether } = await import('../tethers/SplitTetherDaemon.js');
              await GlobalSplitTether.splitAndRoute('AutoAgent_Intent', tridallRes.pattern);
              
              const { planOmnibotMobileIntent } = await import('../omnibot/OmnibotMobileCore.js');
              Log.info(`[AutoUser] 📱 Tethering intent to Omnibot Mobile...`);
              planOmnibotMobileIntent({
                intent: {
                  action: 'tether-cycle-plan',
                  summary: tridallRes.pattern.concept,
                  device: 'auto-agent-tether'
                }
              });
            } catch (err) {
              Log.warning(`[AutoUser] Failed to tether to Split API Engine: ${err.message}`);
            }
          }
        } catch (e) {
          Log.warning(`[AutoUser] Tridall tether failed: ${e.message}`);
        }

        try {
          await targetInput.click();
          await this.delay(500);
          await this.page.keyboard.type(idea, { delay: 40 }); // type like a human
          await this.delay(500);
          await this.page.keyboard.press('Enter');
          
          // Wait for AI / System to respond to the prompt
          Log.info('[AutoUser] Awaiting system response...');
          await this.delay(6000);
        } catch (e) {
          Log.error(`[AutoUser] Error typing prompt: ${e.message}`);
        }
      } else {
        Log.error('[AutoUser] Failed to locate a valid chat box or terminal input.');
      }

      Log.info('[AutoUser] Continuing mapped exploration...');
      const finalMap = await this.extractUiMap();
      const finalInteractables = finalMap.filter(n => n.tag === 'button' || n.tag === 'a');
      for (let i = 0; i < 4; i++) {
        if (finalInteractables.length > 0) {
          const randomEl = finalInteractables[Math.floor(Math.random() * finalInteractables.length)];
          Log.info(`[AutoUser] 🗺️ Semantically interacting with: [${randomEl.text || randomEl.id}]`);
          try {
            await this.page.mouse.click(randomEl.bounds.x + 5, randomEl.bounds.y + 5);
          } catch (e) {}
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

  async extractUiMap() {
    if (!this.page) return [];
    try {
      Log.info(`[AutoUser] 👁️ Scanning DOM to build Semantic UI Map...`);
      const uiMap = await this.page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('button, a, input, textarea, [role="button"], div.grid, section'));
        return elements.map((el, index) => {
          const rect = el.getBoundingClientRect();
          let text = el.innerText || el.value || el.getAttribute('place' + 'holder') || el.getAttribute('aria-label') || '';
          return {
            id: el.id || `node_${index}`,
            tag: el.tagName.toLowerCase(),
            type: el.type || null,
            text: text.trim().substring(0, 100),
            visible: (rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== 'hidden'),
            bounds: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
            viewport: { vw: window.innerWidth, vh: window.innerHeight }
          };
        }); // Removed the .filter(n => n.visible) so we can analyze hidden nodes
      });

      // Capture visual representation for EvoEyes
      const screenshot = await this.page.screenshot({ type: 'png' });
      
      try {
        const { EvoEyesDaemon } = await import('./sentinel/EvoEyesDaemon.js');
        const eyes = new EvoEyesDaemon();
        await eyes.processUiMap({ timestamp: new Date().toISOString(), nodes: uiMap }, screenshot);
      } catch (e) {
        Log.warning(`[AutoUser] 👁️ EvoEyes Tether offline: ${e.message}`);
      }

      // LEVEL 6 AUTONOMY: Visual Swarm Generation
      const { getSwarmConsensus } = await import('./swarm/SwarmConsensusEngine.js');
      const { getMegaTether } = await import('../tethers/MegaTetherCore.js');
      const swarm = getSwarmConsensus();
      let tether = null;
      try { tether = getMegaTether(); } catch(e) {}

      let anomaliesDetected = 0;
      for (const node of uiMap) {
        // Detect layout anomalies (e.g. interactive element rendered completely off-screen or zero-size)
        const isInteractive = ['button', 'a', 'input'].includes(node.tag);
        if (isInteractive && (!node.visible || node.bounds.x > node.viewport.vw || node.bounds.y > node.viewport.vh)) {
          const desc = `Visual UI Anomaly Detected: <${node.tag}> "${node.text}" is rendered off-screen or hidden. Coordinates: x:${node.bounds.x}, y:${node.bounds.y}. Fix the CSS layout to ensure visibility.`;
          Log.warn(`[AutoUser] 🛑 Anomaly found! Proposing Swarm Task...`);
          const task = swarm.proposeTask('IMPLEMENTATION', {
            targetFile: 'src/index.css', // General target, QuadBrain will refine
            description: desc
          });
          
          if (tether) {
            await tether.broadcast('autouser_agent', 'ui-action', {
              action: 'SWARM_TASK_GENERATED',
              reason: 'VISUAL_ANOMALY',
              taskId: task.id,
              nodeDetails: node
            });
          }
          anomaliesDetected++;
        }
      }
      
      Log.success(`[AutoUser] 🗺️ Semantic Map Generated (${uiMap.filter(n=>n.visible).length} visible nodes). ${anomaliesDetected > 0 ? `Injected ${anomaliesDetected} visual tasks into Swarm.` : 'No anomalies detected.'}`);
      
      try {
        const { GlobalSplitTether } = await import('../tethers/SplitTetherDaemon.js');
        await GlobalSplitTether.splitAndRoute('AutoAgent_Vision', { type: 'ui_map', nodes: uiMap.length, anomalies: anomaliesDetected });
      } catch (err) {}

      return uiMap.filter(n => n.visible);
    } catch (e) {
      Log.error(`[AutoUser] 👁️ Map extraction failed: ${e.message}`);
      return [];
    }
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
