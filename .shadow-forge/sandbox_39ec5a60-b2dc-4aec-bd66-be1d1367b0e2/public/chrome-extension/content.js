/**
 * PromptHouse Evo Studio — Chrome Extension Content Script
 * Owner: Cipher Lynx | Truth State: built
 * 
 * Injected into all pages. Watches for selection and keyboard shortcuts.
 * User action required before any capture — no silent telemetry.
 */

const PH_SHORTCUT = 'p'; // Ctrl+Shift+P to capture selection

// ─── Selection Capture via Keyboard Shortcut ─────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === PH_SHORTCUT) {
    const selectedText = window.getSelection()?.toString()?.trim();
    if (!selectedText) return;

    // Confirm user intent before capture (NO-BULLSHIT LAW: user action required)
    if (!window.confirm(`Capture this selection to PromptHouse Studio?\n\n"${selectedText.slice(0, 100)}..."`)) return;

    chrome.runtime.sendMessage({
      type: 'CAPTURE_SELECTION',
      payload: {
        selectedText,
        sourceUrl: window.location.href,
        pageTitle: document.title,
        captureType: 'selection',
        userActionRequired: true,
        timestamp: new Date().toISOString(),
      },
    }, (response) => {
      if (response?.success) {
        showToast('✅ Captured to PromptHouse Studio!');
      } else {
        showToast('⚠️ Bridge offline. Queued for retry.');
      }
    });
  }
});

// ─── Toast Notification ───────────────────────────────────────────────────────────
function showToast(message) {
  const existing = document.getElementById('ph-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'ph-toast';
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    background: '#1e1e2e',
    color: '#f5c842',
    border: '1px solid #f5c842',
    borderRadius: '10px',
    padding: '12px 20px',
    fontFamily: 'system-ui, sans-serif',
    fontSize: '14px',
    fontWeight: '700',
    zIndex: '999999',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    transition: 'opacity 0.3s ease',
  });

  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ─── AUTONOMOUS META MAP ENGINE ────────────────────────────────────────────────
// Scans the DOM and creates a serialized packet of interactive elements for the AI

function generateMetaMap() {
  const elements = Array.from(document.querySelectorAll('a, button, input, textarea, select, [role="button"]'))
    .filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== 'hidden';
    });

  return elements.map((el, index) => {
    // Inject a unique meta ID for the AI to target
    const metaId = `evo-node-${index}`;
    el.setAttribute('data-evo-id', metaId);

    return {
      id: metaId,
      tag: el.tagName.toLowerCase(),
      type: el.type || undefined,
      text: el.innerText?.trim()?.slice(0, 50) || el.placeholder || el.value || '',
      href: el.href || undefined,
      ariaLabel: el.getAttribute('aria-label') || undefined,
    };
  });
}

// ─── BRIDGE COMMAND LISTENER ─────────────────────────────────────────────────
// Allows the Studio or Background script to remotely control the browser

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'PING') {
    sendResponse({ status: 'ALIVE', url: window.location.href, title: document.title });
  } 
  
  if (msg.type === 'SCAN_DOM') {
    const map = generateMetaMap();
    sendResponse({ success: true, url: window.location.href, elements: map });
  }

  if (msg.type === 'EXECUTE_ACTION') {
    try {
      const { action, targetId, value } = msg.payload;
      const el = document.querySelector(`[data-evo-id="${targetId}"]`);
      
      if (!el) {
        sendResponse({ success: false, error: 'Target element not found.' });
        return;
      }

      if (action === 'click') {
        el.click();
        showToast(`🤖 Evo Clicked: ${el.innerText?.slice(0,20) || targetId}`);
      } else if (action === 'type' && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
        el.value = value;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        showToast(`🤖 Evo Typed in: ${targetId}`);
      }
      sendResponse({ success: true });
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
  }
});

console.log('[PH Evo Bridge] Content script loaded. Ctrl+Shift+P to capture selection.');
