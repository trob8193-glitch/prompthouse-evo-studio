/**
 * EVO EYES — BACKGROUND SERVICE WORKER
 * ═══════════════════════════════════════════════════════════════
 * This is the autonomous synapse that connects the browser to the 
 * local PromptHouse Evo Studio. It intercepts data, orchestrates
 * autonomous scanning, and funnels training logs.
 */

const BRIDGE_URL = 'http://127.0.0.1:3001';

// Keep track of autonomous state
let isAutonomousModeActive = false;
let currentTargets = [];

// Initialize state
chrome.storage.local.get(['autonomousMode'], (result) => {
  if (result.autonomousMode) {
    isAutonomousModeActive = result.autonomousMode;
  }
});

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SET_AUTONOMOUS_MODE') {
    isAutonomousModeActive = request.value;
    chrome.storage.local.set({ autonomousMode: isAutonomousModeActive });
    
    // Broadcast to all tabs to activate/deactivate Evo Eyes
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { 
          action: 'TOGGLE_EVO_EYES', 
          value: isAutonomousModeActive 
        }).catch(err => {
          // Ignored for tabs that don't have the content script injected (e.g. chrome://)
        });
      });
    });
    
    sendResponse({ success: true, mode: isAutonomousModeActive });
    return true;
  }
  
  if (request.action === 'SEND_TRAINING_DATA') {
    // Funnel data to the Studio Bridge
    sendDataToStudio(request.payload)
      .then(res => sendResponse({ success: true, serverResponse: res }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // Keep the message channel open for async response
  }
});

/**
 * Transmits extracted DOM telemetry directly to the local studio
 * for memory storage and Evo LLM training.
 */
async function sendDataToStudio(payload) {
  try {
    const response = await fetch(`${BRIDGE_URL}/api/training/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        examples: [{
          input: `URL: ${payload.url}\nTitle: ${payload.title}\nDescription: A web page scan from Evo Eyes.`,
          output: payload.telemetry,
          systemPrompt: 'You are the Sovereign Brain. Digest this web page structure.',
          source: 'evo_eyes_extension'
        }]
      })
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to send data to Studio:', error);
    throw error;
  }
}

// Background alarm for autonomous crawling (checks every minute if active)
chrome.alarms.create("autonomousPulse", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "autonomousPulse" && isAutonomousModeActive) {
    // Log the heartbeat
    console.log('[Evo Eyes] Pulse check. Autonomous mode is ACTIVE.');
    // Future: In a full crawl mode, we could command the active tab to click links here.
  }
});
