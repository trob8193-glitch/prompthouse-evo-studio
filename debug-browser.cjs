const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  let logs = [];
  
  page.on('console', msg => logs.push(`[CONSOLE] ${msg.type().toUpperCase()} ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[PAGE_ERROR] ${err.toString()}`));
  page.on('requestfailed', request => logs.push(`[REQUEST_FAILED] ${request.url()} - ${request.failure().errorText}`));

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 10000 });
  } catch (e) {
    logs.push(`[GOTO_ERROR] ${e.toString()}`);
  }

  // Wait an extra second just in case
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: 'debug_screenshot.png' });
  
  fs.writeFileSync('debug_browser_logs.txt', logs.join('\n'));
  
  await browser.close();
})();
