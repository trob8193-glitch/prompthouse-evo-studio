import puppeteer from 'puppeteer';

(async () => {
  console.log("Launching headless browser...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', error => console.error('BROWSER_ERROR:', error.message));
  page.on('requestfailed', request => {
    console.error('REQUEST_FAILED:', request.url(), request.failure().errorText);
  });

  console.log("Navigating to http://127.0.0.1:5173/ ...");
  try {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log("Navigation complete.");
    
    const rootHtml = await page.$eval('#root', el => el.innerHTML);
    if (!rootHtml || rootHtml.trim() === '') {
      console.log("#root is empty!");
    } else {
      console.log("#root has content. Length:", rootHtml.length);
    }
  } catch (e) {
    console.error("Navigation failed:", e.message);
  } finally {
    await browser.close();
  }
})();
