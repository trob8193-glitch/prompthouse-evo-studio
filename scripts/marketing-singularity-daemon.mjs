import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '.prompthouse-data');
const LEDGER_PATH = path.join(DATA_DIR, 'holding_company_ledger.json');
const MARKETING_LOG_PATH = path.join(DATA_DIR, 'marketing_campaigns.json');

console.log(`
==================================================
🚀 MARKETING SINGULARITY DAEMON ONLINE 🚀
==================================================
Mode: Autonomous Customer Acquisition
Target: Viral X Threads & Cold B2B Outreach
==================================================
`);

function loadJSON(filepath) {
    if (!fs.existsSync(filepath)) return [];
    try { return JSON.parse(fs.readFileSync(filepath, 'utf8')); }
    catch (e) { return []; }
}

function saveJSON(filepath, data) {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

async function runMarketingCycle() {
    console.log(`[MarketingBrain] Scanning for unpublished assets...`);
    const apps = loadJSON(LEDGER_PATH);
    const campaigns = loadJSON(MARKETING_LOG_PATH);
    
    for (const app of apps) {
        if (!campaigns.find(c => c.appId === app.id)) {
            console.log(`\n🎯 Found new product: "${app.name}"`);
            console.log(`   Generating viral X thread & B2B cold emails...`);
            
            // Mocking the AI generation delay
            await new Promise(r => setTimeout(r, 2000));
            
            const newCampaign = {
                id: `mkt_${Date.now()}`,
                appId: app.id,
                appName: app.name,
                x_thread: [
                    `Just launched ${app.name} using PromptHouse Evo Studio! 🚀`,
                    `This entire micro-SaaS was built, deployed, and monetized in 45 seconds by autonomous AI.`,
                    `Try the app here: ${app.deploymentUrl || 'https://prompthouse-demo.vercel.app'}`,
                    `Want your own AI holding company? Get the Studio today.`
                ],
                cold_email: `Subject: Introducing ${app.name} for your enterprise\n\nHi there,\nWe built an incredible tool using PromptHouse...`,
                status: 'PUBLISHED',
                metrics: { clicks: 0, conversions: 0 },
                createdAt: new Date().toISOString()
            };
            
            campaigns.push(newCampaign);
            saveJSON(MARKETING_LOG_PATH, campaigns);
            
            console.log(`✅ Viral Campaign published for ${app.name}.`);
            console.log(`🐦 X Thread Preview:\n   "${newCampaign.x_thread[0]}"`);
        }
    }
    
    console.log(`[MarketingBrain] Cycle complete. Sleeping for 15 seconds...`);
}

setInterval(runMarketingCycle, 15000);
runMarketingCycle();
