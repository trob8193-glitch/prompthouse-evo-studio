/**
 * EVO EYES — CONTENT SCRIPT
 * ═══════════════════════════════════════════════════════════════
 * Injected into all web pages to perform DOM telemetry, layout 
 * extraction, and visual structural mapping for the LLM.
 */

let isActive = false;
let pulseInterval = null;

// Listen for commands from the popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'TOGGLE_EVO_EYES') {
    isActive = request.value;
    if (isActive) {
      console.log('👁️ [Evo Eyes] Activated on this page.');
      startScanning();
    } else {
      console.log('👁️ [Evo Eyes] Deactivated.');
      stopScanning();
    }
  }
});

// Check initial state on load
chrome.storage.local.get(['autonomousMode'], (result) => {
  if (result.autonomousMode) {
    isActive = true;
    startScanning();
  }
});

function startScanning() {
  if (pulseInterval) return;
  
  // Do an initial deep scan
  performDeepScan();
  
  // Set up an interval to scan for dynamic changes or continuous reading
  // In a real scenario, MutationObservers are better, but interval is fine for a pulse
  pulseInterval = setInterval(() => {
    // Just a pulse to keep the connection alive or track reading progress
  }, 30000); // 30 seconds
}

function stopScanning() {
  if (pulseInterval) {
    clearInterval(pulseInterval);
    pulseInterval = null;
  }
}

function performDeepScan() {
  console.log('👁️ [Evo Eyes] Performing Deep DOM Scan...');
  
  // Extract essential text content (strip out massive scripts/styles)
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  let textNodes = [];
  let node;
  while ((node = walker.nextNode())) {
    if (node.parentElement && ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.parentElement.tagName)) continue;
    const text = node.nodeValue.trim();
    if (text.length > 0) textNodes.push(text);
  }
  
  // Extract Interactive Elements (Buttons, Links)
  const links = Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText.trim(), href: a.href })).filter(a => a.text);
  const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean);
  
  // Construct the telemetry packet
  const telemetryPacket = {
    url: window.location.href,
    title: document.title,
    interactive_elements: {
      linksCount: links.length,
      buttonsCount: buttons.length,
      topLinks: links.slice(0, 10)
    },
    content_snippet: textNodes.join(' ').substring(0, 2000) + '...', // Cap to prevent massive payloads
    timestamp: new Date().toISOString()
  };
  
  console.log('👁️ [Evo Eyes] Scan complete. Dispatching to Brain.', telemetryPacket);
  
  // Send back to background.js
  chrome.runtime.sendMessage({
    action: 'SEND_TRAINING_DATA',
    payload: {
      url: window.location.href,
      title: document.title,
      telemetry: JSON.stringify(telemetryPacket)
    }
  });
}
