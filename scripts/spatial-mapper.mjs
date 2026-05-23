import puppeteer from 'puppeteer';
import fs from 'fs';

export async function generateSpatialMap(url = 'http://localhost:5173/') {
  console.log('🗺️  [SPATIAL] Mapping DOM layout and pixel coordinates...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 });
  } catch (e) {
    console.warn(`⚠️  [SPATIAL] Could not reach server: ${e.message}`);
  }

  // Wait a moment for dynamic rendering
  await new Promise(r => setTimeout(r, 2000));

  // Inject visual spatial mapping overlay
  const rects = await page.evaluate(() => {
    const elements = document.querySelectorAll('div, section, main, header, footer, button, nav');
    const data = [];
    
    let index = 0;
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) return; // Ignore tiny elements
      
      data.push({
        id: `node-${index}`,
        tag: el.tagName.toLowerCase(),
        classes: el.className,
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      });
      
      // Draw neon border directly on DOM
      el.style.border = '2px solid rgba(0, 255, 255, 0.7)';
      el.style.boxSizing = 'border-box';
      
      // Append ID label
      const label = document.createElement('div');
      label.innerText = `[${index}]`;
      label.style.position = 'absolute';
      label.style.top = '0';
      label.style.left = '0';
      label.style.background = 'rgba(0, 255, 255, 0.9)';
      label.style.color = '#000';
      label.style.fontSize = '10px';
      label.style.fontWeight = 'bold';
      label.style.padding = '1px 3px';
      label.style.zIndex = '99999';
      
      // Attempt to place label inside relative parent
      if (window.getComputedStyle(el).position === 'static') {
        el.style.position = 'relative';
      }
      el.appendChild(label);
      
      index++;
    });
    
    return data;
  });

  await page.screenshot({ path: 'spatial_screenshot.png', fullPage: true });
  fs.writeFileSync('spatial_data.json', JSON.stringify(rects, null, 2));
  
  await browser.close();
  console.log(`✅ [SPATIAL] Mapped ${rects.length} nodes to spatial_screenshot.png and spatial_data.json`);
  return rects;
}

if (process.argv[1] && process.argv[1].endsWith('spatial-mapper.mjs')) {
  generateSpatialMap().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
  });
}
